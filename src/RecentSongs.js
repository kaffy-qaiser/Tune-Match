import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAccessToken } from './tokenUtils'; // Import the token utility

const RecentSongs = () => {
    const [recentSongs, setRecentSongs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentSongs = async () => {
            const accessToken = getAccessToken();

            console.log('Access Token:', accessToken); // Log the access token to check if it's being retrieved

            if (!accessToken) {
                setError('Access token is missing');
                return;
            }

            try {
                const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    },
                    params: {
                        limit: 24
                    }
                });
                setRecentSongs(response.data.items);
            } catch (err) {
                console.error('Error fetching recent songs:', err);
                if (err.response && err.response.status === 401) {
                    setError('Unauthorized: Access token is invalid or expired');
                } else {
                    setError('Error fetching recent songs');
                }
            }
        };

        fetchRecentSongs();
    }, []);

    return (
        <div className="p-4">
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recentSongs.map((song, index) => (
                    <div key={index}
                         className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
                        <div className="h-48 w-full">
                            <img src={song.track.album.images[0].url} alt={song.track.name}
                                 className="w-full h-full object-cover"/>
                        </div>
                        <div className="p-4">
                            <h5 className="text-lg font-semibold text-gray-800 truncate">{song.track.name}</h5>
                            <p className="text-gray-600 truncate">{song.track.artists.map(artist => artist.name).join(', ')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentSongs;

