const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());

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

// Spotify login route
app.get('/login', (req, res) => {
    const scopes = ['user-read-private', 'user-read-recently-played', 'playlist-modify-public', 'playlist-modify-private', 'playlist-read-private'];
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
// Helper function to create a playlist with retry logic
async function createPlaylistWithRetry(spotifyApi, userId, playlistName, retries = 3) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const playlist = await spotifyApi.createPlaylist(playlistName, { 'public': true });
            console.log("Playlist created:", playlist);
            return playlist;
        } catch (err) {
            if (attempt < retries - 1 && err.statusCode >= 500) {
                console.log(`Attempt ${attempt + 1} failed. Retrying...`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
            } else {
                console.error("Error details:", err);
                throw err;
            }
        }
    }
}


// Generate playlist route
// Generate playlist route
// Generate playlist route
app.get('/generate-playlist', async (req, res) => {
    const { prompt, access_token, playlistName, playlistDescription } = req.query;
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
                        content: 'You are a helpful assistant that creates Spotify playlists based on a given prompt. Provide a list of 20 songs in JSON format like: [{"song": "Song Name", "artist": "Artist Name"}, ...]'
                    },
                    {
                        role: 'user',
                        content: `Create a Spotify playlist for: ${prompt}`
                    }
                ],
            });

            songList = JSON.parse(response.choices[0].message.content.trim());
        } catch (err) {
            console.error('Error generating songs:', err);
            throw err;
        }

        // Create a new playlist with the provided name and description
        let playlist;
        try {
            playlist = await createPlaylistWithRetry(spotifyApi, userId, {
                name: playlistName,
                description: playlistDescription,
                public: true,
            });
            if (!playlist || !playlist.body) {
                throw new Error('Failed to create playlist with no playlist or body');
            }
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
            playlistName: playlistName
        });
    } catch (err) {
        console.error('Error generating playlist:', err);
        res.status(500).send('Failed to generate playlist');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
