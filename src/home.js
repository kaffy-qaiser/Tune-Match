import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAccessToken } from './tokenUtils'; // Import the token utility

const Home = () => {
    const [prompt, setPrompt] = useState('');
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [recentSongs, setRecentSongs] = useState([]);

    const navigate = useNavigate();

    const goToRecentSongs = () => {
        navigate('/recent-songs');
    }

    const generatePlaylist = async () => {
        setIsLoading(true);
        setError('');
        const accessToken = getAccessToken();

        try {
            const response = await axios.get('http://localhost:3001/generate-playlist', {
                params: { prompt, access_token: accessToken },
            });
            setPlaylistUrl(response.data.playlistUrl);
        } catch (err) {
            setError('Failed to generate playlist. Please try again.');
            console.error('Error generating playlist:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchRecentSongs = async () => {
            const accessToken = getAccessToken();

            try {
                const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    },
                    params: {
                        limit: 3
                    }
                });
                setRecentSongs(response.data.items);
            } catch (err) {
                console.error('Error fetching recent songs:', err);
            }
        };

        fetchRecentSongs();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter playlist prompt"
                className="border p-2 mb-4"
            />
            <button onClick={generatePlaylist} disabled={isLoading} className="bg-green-500 text-white px-4 py-2 rounded">
                {isLoading ? 'Generating...' : 'Generate Playlist'}
            </button>
            {playlistUrl && (
                <a href={playlistUrl} target="_blank" rel="noopener noreferrer" className="mt-4 text-blue-500">
                    View Playlist
                </a>
            )}
            {error && (
                <p className="text-red-500 mt-2">{error}</p>
            )}
            <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Recently Listened Songs:</h2>
                <ul>
                    {recentSongs.map((song, index) => (
                        <li key={index} className="mb-2">
                            <p><strong>{song.track.name}</strong> by {song.track.artists.map(artist => artist.name).join(', ')}</p>
                        </li>
                    ))}
                </ul>
            </div>
            <button onClick={() => window.location.href = 'http://localhost:3001/logout'} className="mt-4 text-blue-500">Logout</button>
            <button onClick={goToRecentSongs} className="mt-4 text-blue-500">Recent Songs</button>
        </div>
    );
};

export default Home;

