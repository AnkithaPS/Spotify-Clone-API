# Spotify Clone API

A RESTful API for a music streaming platform similar to Spotify, built with Express, MongoDB, JWT, and Cloudinary.

# Overview

This API provides endpoints for managing users, songs, artists, albums, and playlists in a music streaming service. It includes authentication, file uploads for audio and images, and relationship management between various entities.

# Features

- **User Management**
  - Registration and authentication with JWT
  - Profile management with profile picture upload
  - Like songs, follow artists, and follow playlists

- **Songs**
  - Upload songs with metadata (title, artist, album, duration, etc.)
  - Audio file storage in Cloudinary
  - Categorize songs by genre
  - Track play count and likes
  - Lyrics storage and retrieval

- **Artists**
  - Artist profiles with images and bio
  - Catalog of songs and albums
  - Artist verification status
  - Track follower count

- **Albums**
  - Create and manage albums with cover images
  - Associate songs with albums
  - Album metadata (release date, genre, description)
  - Track likes

- **Playlists**
  - Create public and private playlists
  - Collaborative playlists with multiple users
  - Add/remove songs
  - Custom playlist cover images
  - Track follower count

- **Media Uploads**
  - Image uploads for profile pictures, artist images, album covers, and playlist covers
  - Audio file uploads for songs
  - Secure storage in Cloudinary

# Tech Stack

- **Backend Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer (local) + Cloudinary (cloud storage)
- **Status Codes**: HTTP Status Codes package for standardized responses
- **Error Handling**: Express Async Handler for clean error management

# Database Association Diagram

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│   User  │─────────│  Song   │─────────│  Artist │
└─────────┘         └─────────┘         └─────────┘
     │                   │                    │
     │                   │                    │
     │               ┌─────────┐              │
     └───────────────│  Album  │──────────────┘
                     └─────────┘
                         │
                         │
                     ┌─────────┐
                     │ Playlist│
                     └─────────┘
```

# Association Details

1. **User**
   - Has many liked songs (Song)
   - Has many liked albums (Album)
   - Has many followed artists (Artist)
   - Has many followed playlists (Playlist)
   - Can create many playlists (Playlist)
   - Can collaborate on many playlists (Playlist)

2. **Song**
   - Belongs to one artist (Artist)
   - Can belong to one album (Album)
   - Can have many featured artists (Artist)
   - Can be in many playlists (Playlist)
   - Can be liked by many users (User)

3. **Artist**
   - Has many songs (Song)
   - Has many albums (Album)
   - Can be featured on many songs (Song)
   - Can be followed by many users (User)

4. **Album**
   - Belongs to one artist (Artist)
   - Has many songs (Song)
   - Can be liked by many users (User)

5. **Playlist**
   - Belongs to one creator (User)
   - Can have many collaborators (User)
   - Contains many songs (Song)
   - Can be followed by many users (User)

# Application Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│   Client    │◄────┤    API      │◄────┤  Database   │
│  (Frontend) │     │  (Express)  │     │ (MongoDB)   │
│             │────►│             │────►│             │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          │
                    ┌─────▼─────┐
                    │           │
                    │ Cloudinary│
                    │ (Storage) │
                    │           │
                    └───────────┘
```

# Data Flow Description

1. **Client-API Interaction**:
   - Client sends HTTP requests to the API endpoints
   - API validates requests and authenticates users via JWT
   - API returns appropriate responses with status codes

2. **API-Database Interaction**:
   - API uses Mongoose schemas to structure data
   - Performs CRUD operations on MongoDB collections
   - Handles relationships between collections through references

3. **Media Management Flow**:
   - Client uploads media (images/audio) through the API
   - API processes files with Multer
   - Files are uploaded to Cloudinary
   - Cloudinary URLs are stored in the database

4. **Authentication Flow**:
   - User registers/logs in via API
   - API validates credentials
   - JWT token generated and returned to client
   - Client includes token in subsequent requests
   - Token is verified for protected routes

# API Routes

# Authentication & User Routes

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get token
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)
- `PUT /api/users/like-song/:id` - Like/unlike a song (authenticated)
- `PUT /api/users/follow-artist/:id` - Follow/unfollow an artist (authenticated)
- `PUT /api/users/follow-playlist/:id` - Follow/unfollow a playlist (authenticated)

# Song Routes

- `GET /api/songs` - Get all songs (with filtering and pagination)
- `GET /api/songs/top` - Get top songs by plays
- `GET /api/songs/new-releases` - Get recently added songs
- `GET /api/songs/:id` - Get song details
- `POST /api/songs` - Upload a new song (admin only)
- `PUT /api/songs/:id` - Update song details (admin only)
- `DELETE /api/songs/:id` - Delete a song (admin only)

# Artist Routes

- `GET /api/artists` - Get all artists (with filtering and pagination)
- `GET /api/artists/top` - Get top artists by followers
- `GET /api/artists/:id` - Get artist details
- `GET /api/artists/:id/top-songs` - Get artist's top songs
- `POST /api/artists` - Create a new artist (admin only)
- `PUT /api/artists/:id` - Update artist details (admin only)
- `DELETE /api/artists/:id` - Delete an artist (admin only)

# Album Routes

- `GET /api/albums` - Get all albums (with filtering and pagination)
- `GET /api/albums/new-releases` - Get recently released albums
- `GET /api/albums/:id` - Get album details
- `POST /api/albums` - Create a new album (admin only)
- `PUT /api/albums/:id` - Update album details (admin only)
- `DELETE /api/albums/:id` - Delete an album (admin only)
- `PUT /api/albums/:id/add-songs` - Add songs to album (admin only)
- `PUT /api/albums/:id/remove-song/:songId` - Remove song from album (admin only)

# Playlist Routes

- `GET /api/playlists` - Get all public playlists
- `GET /api/playlists/featured` - Get featured playlists
- `GET /api/playlists/:id` - Get playlist details
- `GET /api/playlists/user/me` - Get user's playlists (authenticated)
- `POST /api/playlists` - Create a new playlist (authenticated)
- `PUT /api/playlists/:id` - Update playlist details (authenticated)
- `DELETE /api/playlists/:id` - Delete a playlist (authenticated)
- `PUT /api/playlists/:id/add-songs` - Add songs to playlist (authenticated)
- `PUT /api/playlists/:id/remove-song/:songId` - Remove song from playlist (authenticated)
- `PUT /api/playlists/:id/add-collaborator` - Add collaborator to playlist (authenticated)
- `PUT /api/playlists/:id/remove-collaborator` - Remove collaborator from playlist (authenticated)

# API Samples

# Authentication & User Routes

# Register User

POST /api/users/register
Content-Type: application/json

{
"name": "John Doe",
"email": "john@example.com",
"password": "password123"
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5e",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "profilePicture": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

# Login User

POST /api/users/login
Content-Type: application/json

{
"email": "john@example.com",
"password": "password123"
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5e",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "profilePicture": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

# Get User Profile

GET /api/users/profile
Authorization: Bearer {token}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5e",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "profilePicture": "",
  "likedSongs": [],
  "likedAlbums": [],
  "followedArtists": [],
  "followedPlaylists": []
}
```

# Update User Profile

PUT /api/users/profile
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
"name": "Updated Name",
"email": "updated@example.com",
"password": "newpassword123",
"profilePicture": [file]
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5e",
  "name": "Updated Name",
  "email": "updated@example.com",
  "isAdmin": false,
  "profilePicture": "https://cloudinary.com/...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

# Like/Unlike Song

PUT /api/users/like-song/60d5ecb8b5c9c62b3c3c1b61
Authorization: Bearer {token}

Response:

```json
{
  "likedSongs": ["60d5ecb8b5c9c62b3c3c1b61"],
  "message": "Song added to liked songs"
}
```

# Follow/Unfollow Artist

PUT /api/users/follow-artist/60d5ecb8b5c9c62b3c3c1b5f
Authorization: Bearer {token}

Response:

```json
{
  "followedArtists": ["60d5ecb8b5c9c62b3c3c1b5f"],
  "message": "Artist followed"
}
```

# Follow/Unfollow Playlist

PUT /api/users/follow-playlist/60d5ecb8b5c9c62b3c3c1b62
Authorization: Bearer {token}

Response:

```json
{
  "followedPlaylists": ["60d5ecb8b5c9c62b3c3c1b62"],
  "message": "Playlist followed"
}
```

# Get Top Songs

GET /api/songs/top?limit=5

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b61",
    "title": "Amazing Song",
    "artist": {
      "_id": "60d5ecb8b5c9c62b3c3c1b5f",
      "name": "Artist Name",
      "image": "https://cloudinary.com/..."
    },
    "album": {
      "_id": "60d5ecb8b5c9c62b3c3c1b60",
      "title": "Album Title",
      "coverImage": "https://cloudinary.com/..."
    },
    "plays": 1000
  }
]
```

# Get New Song Releases

GET /api/songs/new-releases?limit=5

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b61",
    "title": "New Release",
    "artist": {
      "_id": "60d5ecb8b5c9c62b3c3c1b5f",
      "name": "Artist Name",
      "image": "https://cloudinary.com/..."
    },
    "album": {
      "_id": "60d5ecb8b5c9c62b3c3c1b60",
      "title": "Album Title",
      "coverImage": "https://cloudinary.com/..."
    },
    "createdAt": "2024-03-20T00:00:00.000Z"
  }
]
```

# Update Song

PUT /api/songs/60d5ecb8b5c9c62b3c3c1b61
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
"title": "Updated Song Title",
"genre": "Rock",
"lyrics": "Updated lyrics...",
"isExplicit": "true",
"featuredArtists": "[\"60d5ecb8b5c9c62b3c3c1b5f\"]",
"audio": [file],
"cover": [file]
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b61",
  "title": "Updated Song Title",
  "genre": "Rock",
  "lyrics": "Updated lyrics...",
  "isExplicit": true,
  "featuredArtists": ["60d5ecb8b5c9c62b3c3c1b5f"],
  "audioUrl": "https://cloudinary.com/...",
  "coverImage": "https://cloudinary.com/..."
}
```

# Get Top Artists

GET /api/artists/top?limit=5

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b5f",
    "name": "Artist Name",
    "image": "https://cloudinary.com/...",
    "followers": 10000
  }
]
```

# Get Artist's Top Songs

GET /api/artists/60d5ecb8b5c9c62b3c3c1b5f/top-songs?limit=5

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b61",
    "title": "Popular Song",
    "duration": "3:45",
    "audioUrl": "https://cloudinary.com/...",
    "coverImage": "https://cloudinary.com/...",
    "plays": 5000,
    "album": {
      "title": "Album Title",
      "coverImage": "https://cloudinary.com/..."
    }
  }
]
```

# Update Album

PUT /api/albums/60d5ecb8b5c9c62b3c3c1b60
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
"title": "Updated Album Title",
"releaseDate": "2024-03-21",
"genre": "Rock",
"description": "Updated description...",
"isExplicit": "true",
"cover": [file]
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b60",
  "title": "Updated Album Title",
  "releaseDate": "2024-03-21T00:00:00.000Z",
  "genre": "Rock",
  "description": "Updated description...",
  "isExplicit": true,
  "coverImage": "https://cloudinary.com/..."
}
```

# Get New Album Releases

GET /api/albums/new-releases?limit=5

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b60",
    "title": "New Album",
    "artist": {
      "_id": "60d5ecb8b5c9c62b3c3c1b5f",
      "name": "Artist Name",
      "image": "https://cloudinary.com/..."
    },
    "releaseDate": "2024-03-20T00:00:00.000Z",
    "coverImage": "https://cloudinary.com/..."
  }
]
```

# Update Playlist

PUT /api/playlists/60d5ecb8b5c9c62b3c3c1b62
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
"name": "Updated Playlist Name",
"description": "Updated playlist description",
"isPublic": "false",
"cover": [file]
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b62",
  "name": "Updated Playlist Name",
  "description": "Updated playlist description",
  "isPublic": false,
  "coverImage": "https://cloudinary.com/..."
}
```

# Get Featured Playlists

GET /api/playlists/featured?limit=5

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b62",
    "name": "Featured Playlist",
    "creator": {
      "_id": "60d5ecb8b5c9c62b3c3c1b5e",
      "name": "John Doe",
      "profilePicture": "https://cloudinary.com/..."
    },
    "coverImage": "https://cloudinary.com/...",
    "followers": 5000
  }
]
```

# Remove Song from Playlist

PUT /api/playlists/60d5ecb8b5c9c62b3c3c1b62/remove-song/60d5ecb8b5c9c62b3c3c1b61
Authorization: Bearer {token}

Response:

```json
{
  "message": "Song removed from playlist"
}
```

# Remove Collaborator from Playlist

PUT /api/playlists/60d5ecb8b5c9c62b3c3c1b62/remove-collaborator
Content-Type: application/json
Authorization: Bearer {token}

{
"userId": "60d5ecb8b5c9c62b3c3c1b63"
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b62",
  "name": "My Awesome Playlist",
  "collaborators": []
}
```

# Get User's Playlists

GET /api/playlists/user
Authorization: Bearer {token}

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b62",
    "name": "My Awesome Playlist",
    "creator": {
      "_id": "60d5ecb8b5c9c62b3c3c1b5e",
      "name": "John Doe",
      "profilePicture": "https://cloudinary.com/..."
    },
    "coverImage": "https://cloudinary.com/...",
    "isPublic": true,
    "createdAt": "2024-03-20T00:00:00.000Z"
  }
]
```

# Delete Playlist

DELETE /api/playlists/60d5ecb8b5c9c62b3c3c1b62
Authorization: Bearer {token}

Response:

```json
{
  "message": "Playlist removed"
}
```

# Add Songs to Playlist

PUT /api/playlists/60d5ecb8b5c9c62b3c3c1b62/add-songs
Content-Type: application/json
Authorization: Bearer {token}

{
"songIds": ["60d5ecb8b5c9c62b3c3c1b61", "60d5ecb8b5c9c62b3c3c1b64"]
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b62",
  "name": "My Awesome Playlist",
  "songs": ["60d5ecb8b5c9c62b3c3c1b61", "60d5ecb8b5c9c62b3c3c1b64"],
  "collaborators": [],
  "followers": 0
}
```

# Add Collaborator to Playlist

PUT /api/playlists/60d5ecb8b5c9c62b3c3c1b62/add-collaborator
Content-Type: application/json
Authorization: Bearer {token}

{
"userId": "60d5ecb8b5c9c62b3c3c1b63"
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b62",
  "name": "My Awesome Playlist",
  "collaborators": ["60d5ecb8b5c9c62b3c3c1b63"],
  "songs": ["60d5ecb8b5c9c62b3c3c1b61", "60d5ecb8b5c9c62b3c3c1b64"]
}
```

# Get All Public Playlists

GET /api/playlists?page=1&limit=10&search=awesome

Response:

```json
{
  "playlists": [
    {
      "_id": "60d5ecb8b5c9c62b3c3c1b62",
      "name": "My Awesome Playlist",
      "creator": {
        "_id": "60d5ecb8b5c9c62b3c3c1b5e",
        "name": "John Doe",
        "profilePicture": "https://cloudinary.com/..."
      },
      "coverImage": "https://cloudinary.com/...",
      "isPublic": true
    }
  ],
  "page": 1,
  "pages": 1,
  "totalPlaylists": 1
}
```

# Get Playlist by ID

GET /api/playlists/60d5ecb8b5c9c62b3c3c1b62

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b62",
  "name": "My Awesome Playlist",
  "description": "A collection of my favorite songs",
  "creator": {
    "_id": "60d5ecb8b5c9c62b3c3c1b5e",
    "name": "John Doe",
    "profilePicture": "https://cloudinary.com/..."
  },
  "coverImage": "https://cloudinary.com/...",
  "isPublic": true,
  "songs": [
    {
      "_id": "60d5ecb8b5c9c62b3c3c1b61",
      "title": "Amazing Song",
      "artist": {
        "_id": "60d5ecb8b5c9c62b3c3c1b5f",
        "name": "Artist Name"
      },
      "duration": "3:45",
      "audioUrl": "https://cloudinary.com/...",
      "coverImage": "https://cloudinary.com/..."
    }
  ],
  "collaborators": [
    {
      "_id": "60d5ecb8b5c9c62b3c3c1b63",
      "name": "Collaborator Name",
      "profilePicture": "https://cloudinary.com/..."
    }
  ],
  "followers": 10
}
```

# Get All Users (Admin Only)

GET /api/users
Authorization: Bearer {token}

Response:

```json
[
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b5e",
    "name": "John Doe",
    "email": "john@example.com",
    "isAdmin": false,
    "profilePicture": "https://cloudinary.com/..."
  },
  {
    "_id": "60d5ecb8b5c9c62b3c3c1b63",
    "name": "Admin User",
    "email": "admin@example.com",
    "isAdmin": true,
    "profilePicture": "https://cloudinary.com/..."
  }
]
```

# Delete Song

DELETE /api/songs/60d5ecb8b5c9c62b3c3c1b61
Authorization: Bearer {token}

Response:

```json
{
  "message": "Song removed"
}
```

# Delete Artist

DELETE /api/artists/60d5ecb8b5c9c62b3c3c1b5f
Authorization: Bearer {token}

Response:

```json
{
  "message": "Artist removed"
}
```

# Delete Album

DELETE /api/albums/60d5ecb8b5c9c62b3c3c1b60
Authorization: Bearer {token}

Response:

```json
{
  "message": "Album removed"
}
```

# Add Songs to Album

PUT /api/albums/60d5ecb8b5c9c62b3c3c1b60/add-songs
Content-Type: application/json
Authorization: Bearer {token}

{
"songIds": ["60d5ecb8b5c9c62b3c3c1b61", "60d5ecb8b5c9c62b3c3c1b64"]
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b60",
  "title": "Album Title",
  "songs": ["60d5ecb8b5c9c62b3c3c1b61", "60d5ecb8b5c9c62b3c3c1b64"]
}
```

# Remove Song from Album

PUT /api/albums/60d5ecb8b5c9c62b3c3c1b60/remove-song/60d5ecb8b5c9c62b3c3c1b61
Authorization: Bearer {token}

Response:

```json
{
  "message": "Song removed from album"
}
```

# Create Song

POST /api/songs
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
"title": "Amazing Song",
"artistId": "60d5ecb8b5c9c62b3c3c1b5f",
"albumId": "60d5ecb8b5c9c62b3c3c1b60",
"duration": "3:45",
"genre": "Pop",
"lyrics": "Song lyrics here...",
"isExplicit": "false",
"featuredArtists": "[]"
}
Files:

- audio: [file] (required)
- cover: [file] (optional)

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b61",
  "title": "Amazing Song",
  "artist": "60d5ecb8b5c9c62b3c3c1b5f",
  "album": "60d5ecb8b5c9c62b3c3c1b60",
  "duration": "3:45",
  "audioUrl": "https://cloudinary.com/...",
  "coverImage": "https://cloudinary.com/...",
  "genre": "Pop",
  "lyrics": "Song lyrics here...",
  "isExplicit": false,
  "featuredArtists": [],
  "plays": 0
}
```

# Get Song by ID

GET /api/songs/60d5ecb8b5c9c62b3c3c1b61

Response:
{
"\_id": "60d5ecb8b5c9c62b3c3c1b61",
"title": "Amazing Song",
"artist": {
"\_id": "60d5ecb8b5c9c62b3c3c1b5f",
"name": "Artist Name",
"image": "https://cloudinary.com/..."
},
"album": {
"\_id": "60d5ecb8b5c9c62b3c3c1b60",
"title": "Album Title",
"coverImage": "https://cloudinary.com/..."
},
"duration": "3:45",
"audioUrl": "https://cloudinary.com/...",
"coverImage": "https://cloudinary.com/...",
"genre": "Pop",
"lyrics": "Song lyrics here...",
"isExplicit": false,
"plays": 1
}

# Get Songs with Filtering

GET /api/songs?page=1&limit=10&genre=Pop&search=amazing

Response:

```json
{
  "songs": [
    {
      "_id": "60d5ecb8b5c9c62b3c3c1b61",
      "title": "Amazing Song",
      "artist": {
        "_id": "60d5ecb8b5c9c62b3c3c1b5f",
        "name": "Artist Name",
        "image": "https://cloudinary.com/..."
      },
      "album": {
        "_id": "60d5ecb8b5c9c62b3c3c1b60",
        "title": "Album Title",
        "coverImage": "https://cloudinary.com/..."
      }
    }
  ],
  "page": 1,
  "pages": 1,
  "totalSongs": 1
}
```

# Create Artist

POST /api/artists
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
"name": "Artist Name",
"bio": "Artist biography...",
"genres": "[\"Pop\", \"Rock\"]",
"isVerified": "true",
"image": [file]
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5f",
  "name": "Artist Name",
  "bio": "Artist biography...",
  "image": "https://cloudinary.com/...",
  "genres": ["Pop", "Rock"],
  "isVerified": true,
  "followers": 0,
  "songs": [],
  "albums": []
}
```

# Get Artists with Filtering

GET /api/artists?page=1&limit=10&genre=Pop&search=artist

Response:

```json
{
  "artists": [
    {
      "_id": "60d5ecb8b5c9c62b3c3c1b5f",
      "name": "Artist Name",
      "bio": "Artist biography...",
      "image": "https://cloudinary.com/...",
      "genres": ["Pop", "Rock"],
      "isVerified": true,
      "followers": 0
    }
  ],
  "page": 1,
  "pages": 1,
  "totalArtists": 1
}
```

# Update Artist

PUT /api/artists/60d5ecb8b5c9c62b3c3c1b5f
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
"name": "Updated Artist Name",
"bio": "Updated artist biography",
"genres": "[\"Rock\", \"Blues\"]",
"isVerified": "true",
"image": [file]
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b5f",
  "name": "Updated Artist Name",
  "bio": "Updated artist biography",
  "image": "https://cloudinary.com/...",
  "genres": ["Rock", "Blues"],
  "isVerified": true
}
```

# Create Album

POST /api/albums
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
"title": "Album Title",
"artistId": "60d5ecb8b5c9c62b3c3c1b5f",
"releaseDate": "2024-03-20",
"genre": "Pop",
"description": "Album description...",
"isExplicit": "false",
"cover": [file]
}

Response:

```json
{
  "_id": "60d5ecb8b5c9c62b3c3c1b60",
  "title": "Album Title",
  "artist": "60d5ecb8b5c9c62b3c3c1b5f",
  "releaseDate": "2024-03-20T00:00:00.000Z",
  "coverImage": "https://cloudinary.com/...",
  "genre": "Pop",
  "description": "Album description...",
  "isExplicit": false,
  "songs": []
}
```

# Get Albums with Filtering

GET /api/albums?page=1&limit=10&genre=Pop&search=album

Response:
{
"albums": [
{
"_id": "60d5ecb8b5c9c62b3c3c1b60",
"title": "Album Title",
"artist": {
"_id": "60d5ecb8b5c9c62b3c3c1b5f",
"name": "Artist Name",
"image": "https://cloudinary.com/..."
},
"releaseDate": "2024-03-20T00:00:00.000Z",
"coverImage": "https://cloudinary.com/...",
"genre": "Pop"
}
],
"page": 1,
"pages": 1,
"totalAlbums": 1
}

# Create Playlist

POST /api/playlists
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
"name": "My Awesome Playlist",
"description": "A collection of my favorite songs",
"isPublic": "true",
"cover": [file]
}

Response:

{
"\_id": "60d5ecb8b5c9c62b3c3c1b62",
"name": "My Awesome Playlist",
"description": "A collection of my favorite songs",
"creator": "60d5ecb8b5c9c62b3c3c1b5e",
"coverImage": "https://cloudinary.com/...",
"isPublic": true,
"songs": [],
"collaborators": [],
"followers": 0
}
