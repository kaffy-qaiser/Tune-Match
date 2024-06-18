const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');


dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize Spotify API
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Define the schema and model for liked songs
const likedSongSchema = new mongoose.Schema({
    spotifyId: String,
    name: String,
    artist: String,
    cover: String,
});

const LikedSong = mongoose.model('LikedSong', likedSongSchema);

// Endpoint to save a liked song
app.post('/like-song', async (req, res) => {
    const { spotifyId, name, artist, cover } = req.body;
    try {
        const likedSong = new LikedSong({ spotifyId, name, artist, cover });
        await likedSong.save();
        res.status(200).send('Song liked successfully');
    } catch (error) {
        res.status(500).send('Error liking song');
    }
});

// Endpoint to retrieve all liked songs
app.get('/liked-songs', async (req, res) => {
    try {
        const likedSongs = await LikedSong.find();
        res.status(200).json(likedSongs);
    } catch (error) {
        res.status(500).send('Error retrieving liked songs');
    }
});

// Endpoint to delete a liked song
app.delete('/unlike-song/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await LikedSong.findByIdAndDelete(id);
        res.status(200).send('Song unliked successfully');
    } catch (error) {
        res.status(500).send('Error unliking song');
    }
});




// Save liked songs
const getTopTracks = async (spotifyApi) => {
    const response = await spotifyApi.getMyTopTracks({ limit: 10 });
    return response.body.items.map(track => ({
        name: track.name,
        artist: track.artists[0].name,
        cover: track.album.images[0].url,
    }));
};

const getRecentTracks = async (spotifyApi) => {
    const response = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 10 });
    return response.body.items.map(item => ({
        name: item.track.name,
        artist: item.track.artists[0].name,
        cover: item.track.album.images[0].url,
    }));
};

const getTopArtists = async (spotifyApi) => {
    const response = await spotifyApi.getMyTopArtists({ limit: 5 });
    return response.body.items.map(artist => artist.name);
};


// Spotify login route
app.get('/login', (req, res) => {
    const scopes = [
        'user-read-private',
        'user-read-recently-played',
        'playlist-modify-public',
        'playlist-modify-private',
        'playlist-read-private',
        'user-read-email',
        'user-top-read',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'user-library-read',
        'user-library-modify',
        'streaming',
    ];
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, 'state');
    res.redirect(authorizeURL);
});

// Spotify callback route
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        res.redirect(`http://localhost:3000/home?access_token=${access_token}&refresh_token=${refresh_token}`);
    } catch (err) {
        console.error('Error during Spotify authorization:', err);
        res.status(500).send('Authorization failed');
    }
});

// Helper function to create a playlist with retry logic
async function createPlaylistWithRetry(spotifyApi, playlistDetails, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const playlist = await spotifyApi.createPlaylist(playlistDetails.name, {
                description: playlistDetails.description,
                public: true
            });
            console.log("Playlist created:", playlist.body);
            return playlist;
        } catch (err) {
            if (attempt < retries - 1 && err.statusCode >= 500) {
                console.log(`Attempt ${attempt + 1} failed. Retrying...`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
            } else {
                console.error("Error creating playlist:", err);
                throw err;
            }
        }
    }
}

app.get('/generate-playlist', async (req, res) => {
    const { prompt, access_token, playlistDescription } = req.query;
    spotifyApi.setAccessToken(access_token);

    try {
        // Fetch the current user's profile to get their Spotify user ID
        const userData = await spotifyApi.getMe();
        const userId = userData.body.id;

        console.log('Generating playlist for prompt:', prompt);
        console.log('Access token:', access_token);

        // Generate song suggestions using OpenAI
        let songList;
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that creates Spotify playlists based on a given prompt. Provide a list of 20-40 songs in JSON format like: [{"song": "Song Name", "artist": "Artist Name"}, ...]'
                    },
                    {
                        role: 'user',
                        content: `Create a Spotify playlist for: ${prompt}`
                    }
                ],
            });

            const responseContent = response.choices[0].message.content.trim();
            if (responseContent) {
                songList = JSON.parse(responseContent);
            } else {
                throw new Error('Received empty response from OpenAI');
            }
        } catch (err) {
            console.error('Error generating songs:', err);
            throw err;
        }

        // Create a new playlist with the provided name (using prompt) and description
        let playlist;
        console.log('Generated songs:', songList);
        try {
            playlist = await createPlaylistWithRetry(spotifyApi, {
                name: prompt,
                description: playlistDescription || '',
            });
        } catch (err) {
            console.error('Error creating playlist:', err);
            throw err;
        }
        const playlistId = playlist.body.id;

        // Add songs to the playlist
        for (const song of songList) {
            try {
                const searchResults = await spotifyApi.searchTracks(`track:${song.song} artist:${song.artist}`);
                if (searchResults.body.tracks.items.length > 0) {
                    const track = searchResults.body.tracks.items[0];
                    await spotifyApi.addTracksToPlaylist(playlistId, [track.uri]);
                } else {
                    console.log(`Track not found: ${song.song} by ${song.artist}`);
                }
            } catch (err) {
                console.error(`Error adding track "${song.song}" by "${song.artist}" to playlist:`, err);
            }
        }

        res.json({
            playlistUrl: playlist.body.external_urls.spotify,
            playlistName: prompt
        });
    } catch (err) {
        console.error('Error generating playlist:', err);
        res.status(500).send('Failed to generate playlist');
    }
});

const getTrackDetails = async (spotifyApi, trackId) => {
    try {
        const response = await spotifyApi.getTrack(trackId);
        const track = response.body;
        const genresResponse = await spotifyApi.getArtist(track.artists[0].id);
        return {
            externalUrl: track.external_urls.spotify,
            genres: genresResponse.body.genres,
            isPlayable: track.is_playable,
            previewUrl: track.preview_url
        };
    } catch (err) {
        console.error(`Error fetching details for track ${trackId}:`, err);
        return { externalUrl: '', genres: [], isPlayable: false, previewUrl: '' };
    }
};


app.get('/get-songs', async (req, res) => {
    const { access_token } = req.query;
    spotifyApi.setAccessToken(access_token);

    try {
        const topTracks = await getTopTracks(spotifyApi);
        const recentTracks = await getRecentTracks(spotifyApi);
        const topArtists = await getTopArtists(spotifyApi);

        const prompt = `
            Create a playlist of recommended songs that a user with the following stats would like, do not use the same songs rather recommend songs they would like based on their listening habits
            Top Tracks: ${topTracks.map(track => `${track.name} by ${track.artist}`).join(', ')}
            Recent Tracks: ${recentTracks.map(track => `${track.name} by ${track.artist}`).join(', ')}
            Top Artists: ${topArtists.join(', ')}
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that creates Spotify playlists based on user data. Provide a list of 20-40 songs in JSON format like: [{"name": "Song Name", "artist": "Artist Name"}, ...]'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
        });

        const responseContent = response.choices[0].message.content.trim();
        console.log('OpenAI response:', responseContent);
        let songList;
        if (responseContent) {
            songList = JSON.parse(responseContent);
        } else {
            throw new Error('Received empty response from OpenAI');
        }

        // Fetch song covers and additional details from Spotify API
        const fetchSongDetails = async (song) => {
            try {
                const query = `${song.name} ${song.artist}`;
                const result = await spotifyApi.searchTracks(query, { limit: 1 });
                const track = result.body.tracks.items[0];
                if (track) {
                    const details = await getTrackDetails(spotifyApi, track.id);
                    return { ...song, cover: track.album.images[0].url, ...details };
                } else {
                    return { ...song, cover: '', externalUrl: '', genres: [] };
                }
            } catch (error) {
                console.error(`Error fetching details for song ${song.name} by ${song.artist}:`, error);
                return { ...song, cover: '', externalUrl: '', genres: [] };
            }
        };

        const songsWithDetails = await Promise.all(songList.map(fetchSongDetails));

        res.json({ songs: songsWithDetails });
    } catch (err) {
        console.error('Error fetching songs:', err);
        res.status(500).send('Failed to fetch songs');
    }
});

app.post('/create-playlist', async (req, res) => {
    const { accessToken, songUris, title, description } = req.body;
    spotifyApi.setAccessToken(accessToken);

    try {
        // Create a new playlist
        const playlist = await spotifyApi.createPlaylist(title, {
            description,
            public: false,
        });

        // Add songs to the playlist
        if (songUris.length > 0) {
            await spotifyApi.addTracksToPlaylist(playlist.body.id, songUris);
        }

        res.status(200).json({ playlistUrl: playlist.body.external_urls.spotify });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).send('Error creating playlist');
    }
});

app.post('/logout', (req, res) => {
    // Clear any session data here if applicable
    res.status(200).send('Logged out successfully');
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});



app.use('/spotify-sdk', express.static(path.join(__dirname, 'node_modules/spotify-web-playback-sdk')));