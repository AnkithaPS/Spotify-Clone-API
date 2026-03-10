const statusCodes = require("http-status-codes");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const Song = require("../models/Song");
const Artist = require("../models/Artist");
const Album = require("../models/Album");

//Create new song
const createSong = async (req, res) => {
  try {
    if (!req.body) {
      res.status(statusCodes.NOT_FOUND);
      throw new Error("Request body is required");
    }
    const {
      title,
      artistId,
      albumId,
      duration,
      genre,
      lyrics,
      isExplicit,
      featuredArtists,
    } = req.body;
    const artist = await Artist.findById(artistId);
    //checking artistId
    if (!artist) {
      res.status(statusCodes.NOT_FOUND);
      throw new Error("Artist not found!");
    }
    //checking albumId
    const album = await Album.findById(albumId);
    if (!album) {
      res.status(statusCodes.NOT_FOUND);
      throw new Error("Album not found!");
    }
    let audiUrl;
    //upload audio files
    if (!req.files || !req.files.audio) {
      res.status(statusCodes.BAD_REQUEST);
      throw new Error("Audio file not found!");
    }
    const audioResult = await uploadToCloudinary(
      req.files.audio[0].path,
      "spotify/songs",
    );
    audiUrl = audioResult.secure_url;
    let imgUrl;
    //upload image files
    if (req.files && req.files.coverImage) {
      const coverImageResult = await uploadToCloudinary(
        req.files.coverImage[0].path,
        "spotify/covers",
      );
      imgUrl = coverImageResult.secure_url;
    }
    //Create Song
    const song = await Song.create({
      title,
      artist: artistId,
      album: albumId || null,
      duration,
      genre,
      lyrics,
      isExplicit: isExplicit === "true",
      featuredArtists: featuredArtists ? JSON.parse(featuredArtists) : [],
      coverImage: imgUrl,
      audioUrl: audiUrl,
    });
    //Add song to artist's songs
    artist.songs.push(song._id);
    await artist.save();
    //Add song to album's songs
    album.songs.push(song._id);
    await album.save();

    res.status(statusCodes.CREATED).json(song);
  } catch (error) {
    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

//Fetch All Song
const getSong = async (req, res) => {
  try {
    const { genre, search, page = 1, limit = 10 } = req.query;
    let filter = {};
    if (genre) {
      filter.genre = { $in: [genre] };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { genre: { $regex: search, $options: "i" } },
      ];
    }
    const count = await Song.countDocuments(filter);
    let skip = parseInt(page - 1) * parseInt(limit);
    const song = await Song.find(filter)
      .sort({ releaseDate: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate("artist", "name image")
      .populate("album", "title coverImage")
      .populate("featuredArtists", "name");
    res.status(statusCodes.OK).json({
      song,
      page: parseInt(page),
      pages: Math.ceil(count / parseInt(limit)),
      totalSongs: count,
    });
  } catch (error) {
    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

//Fetch Song by ID
const getSongById = async (req, res) => {
  try {
    if (!req.params.id) {
      res.status(statusCodes);
      throw new Error("Id is required");
    }
    const song = await Song.findById(req.params.id)
      .populate("artist", "name image bio")
      .populate("album", "title coverImage releaseDate")
      .populate("featuredArtists", "name image");
    if (song) {
      //Update play count
      song.plays += 1;
      await song.save();
    } else {
      res.status(statusCodes.NOT_FOUND);
      throw new Error("Song not found");
    }
    res.status(statusCodes.OK).json(song);
  } catch (error) {
    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

//Update Song By ID
const updateSong = async (req, res) => {
  try {
    const {
      title,
      artistId,
      albumId,
      duration,
      genre,
      lyrics,
      isExplicit,
      featuredArtists,
    } = req.body;
    const song = await Song.findById(req.params.id);
    if (song) {
      song.title = title || song.title;
      song.artist = artistId || song.artist;
      song.album = albumId || song.album;
      song.duration = duration || song.duration;
      song.lyrics = lyrics || song.lyrics;
      song.genre = genre ? JSON.parse(genre) : song.genre;
      song.isExplicit =
        isExplicit !== undefined ? isExplicit === "true" : song.isExplicit;
      song.featuredArtists = featuredArtists
        ? JSON.parse(featuredArtists)
        : song.featuredArtists;
      //update audio if available
      if (req.files && req.files.audio) {
        const result = await uploadToCloudinary(
          req.files.audio[0].path,
          "spotify/songs",
        );
        song.audioUrl = result.secure_url;
      }

      //update image if available
      if (req.files && req.files.coverImage) {
        const result = await uploadToCloudinary(
          req.files.coverImage[0].path,
          "spotify/covers",
        );
        song.coverImage = result.secure_url;
      }
      const updatedSong = await song.save();
      res.status(statusCodes.OK).json(updatedSong);
    } else {
      res.status(statusCodes.NOT_FOUND);
      throw new Error("Song Not Found");
    }
  } catch (error) {
    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

//Delete Song
const deleteAlbum = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      res.status(statusCodes.NOT_FOUND);
      throw new Error("Song Not Found");
    }
    //delete song from artist
    await Artist.updateOne(
      { _id: song.artist },
      { $pull: { songs: song._id } },
    );
    //delete song from album
    if (song.album) {
      await Album.updateOne(
        { _id: song.album },
        { $pull: { songs: song._id } },
      );
    }
    //delete Song
    await song.deleteOne();

    res.status(statusCodes.OK).json({ message: "Song removed" });
  } catch (error) {
    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

//Get top Songs
const getTopSong = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const song = await Song.find()
      .sort({ plays: -1 })
      .limit(parseInt(limit))
      .populate("artist", "name image")
      .populate("album", "title coverImage");
    if (song.length > 0) {
      res.status(statusCodes.OK).json(song);
    } else {
      res.status(statusCodes.NOT_FOUND);
      throw new Error("No song found for this Artist");
    }
  } catch (error) {
    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

//Get new released Songs
const getNewSong = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const song = await Song.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("artist", "name image")
      .populate("album", "title coverImage");
    if (song.length > 0) {
      res.status(statusCodes.OK).json(song);
    } else {
      res.status(statusCodes.NOT_FOUND);
      throw new Error("No song found for this Artist");
    }
  } catch (error) {
    res
      .status(statusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};
module.exports = {
  createSong,
  getSong,
  getSongById,
  updateSong,
  deleteAlbum,
  getTopSong,
  getNewSong,
};
