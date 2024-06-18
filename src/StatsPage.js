import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAccessToken } from './tokenUtils'; // Import the token utility
import Navbar from "./Navbar";
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register the necessary components with Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const StatsPage = () => {
    const [recentSongs, setRecentSongs] = useState([]);
    const [favoriteSongs, setFavoriteSongs] = useState([]);
    const [favoriteArtists, setFavoriteArtists] = useState([]);
    const [genreData, setGenreData] = useState({ labels: [], datasets: [] });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const accessToken = getAccessToken();

            if (!accessToken) {
                setError('Access token is missing');
                return;
            }

            try {
                const [recentResponse, favoriteSongsResponse, favoriteArtistsResponse] = await Promise.all([
                    axios.get('https://api.spotify.com/v1/me/player/recently-played', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        params: {
                            limit: 24
                        }
                    }),
                    axios.get('https://api.spotify.com/v1/me/top/tracks', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        params: {
                            limit: 50
                        }
                    }),
                    axios.get('https://api.spotify.com/v1/me/top/artists', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        params: {
                            limit: 50
                        }
                    })
                ]);

                console.log('Recent Songs Response:', recentResponse.data.items);
                console.log('Favorite Songs Response:', favoriteSongsResponse.data.items);
                console.log('Favorite Artists Response:', favoriteArtistsResponse.data.items);

                setRecentSongs(recentResponse.data.items);
                setFavoriteSongs(favoriteSongsResponse.data.items);
                setFavoriteArtists(favoriteArtistsResponse.data.items);

                // Extract genres and prepare data for the chart
                const genres = favoriteArtistsResponse.data.items.flatMap(artist => artist.genres);
                const genreCounts = genres.reduce((acc, genre) => {
                    acc[genre] = (acc[genre] || 0) + 1;
                    return acc;
                }, {});

                setGenreData({
                    labels: Object.keys(genreCounts),
                    datasets: [{
                        label: 'Genre Distribution',
                        data: Object.values(genreCounts),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                });

            } catch (err) {
                console.error('Error fetching data:', err);
                if (err.response && err.response.status === 401) {
                    setError('Unauthorized: Access token is invalid or expired');
                } else {
                    setError('Error fetching data');
                }
            }
        };

        fetchData();
    }, []);

    const renderCards = (items, type) => {
        return items.map((item, index) => {
            let imageUrl, name, description;

            if (type === 'song') {
                imageUrl = item.track ? item.track.album.images[0]?.url : item.album.images[0]?.url;
                name = item.track ? item.track.name : item.name;
                description = item.track ? item.track.artists.map(artist => artist.name).join(', ') : item.artists.map(artist => artist.name).join(', ');
            } else {
                imageUrl = item.images[0]?.url;
                name = item.name;
                description = item.genres.join(', ');
            }

            if (!imageUrl || !name) return null; // Skip rendering if essential data is missing

            return (
                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
                    <div className="h-48 w-full">
                        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                        <h5 className="text-lg font-semibold text-gray-800 truncate">{name}</h5>
                        <p className="text-gray-600 truncate">{description}</p>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="pt-16 p-4">
            <Navbar className="fixed top-0 left-0 right-0"/>
            {error && <p className="text-red-500">{error}</p>}
            <div className="my-8">
                <h2 className="text-2xl font-bold mb-4">Recently Played Songs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {renderCards(recentSongs, 'song')}
                </div>
            </div>
            <div className="my-8">
                <h2 className="text-2xl font-bold mb-4">Top 50 Favorite Songs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {renderCards(favoriteSongs, 'song')}
                </div>
            </div>
            <div className="my-8">
                <h2 className="text-2xl font-bold mb-4">Top 50 Favorite Artists</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {renderCards(favoriteArtists, 'artist')}
                </div>
            </div>
            <div className="my-8">
                <h2 className="text-2xl font-bold mb-4">Genre Distribution</h2>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <Bar data={genreData} options={{ maintainAspectRatio: false }} height={400} />
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
