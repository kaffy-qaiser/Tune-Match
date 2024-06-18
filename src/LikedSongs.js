import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { ReactComponent as TrashIcon } from './assets/trash.svg'; // Assume you have a trash icon
import { ReactComponent as AddIcon } from './assets/add.svg'; // Assume you have an add icon
import { ReactComponent as RemoveIcon } from './assets/trash.svg'; // Assume you have a remove icon
import { getAccessToken } from './tokenUtils'; // Ensure you have a function to get the access token

const Likedsongs = () => {
    const [likedSongs, setLikedSongs] = useState([]);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [playlistTitle, setPlaylistTitle] = useState('');
    const [playlistDescription, setPlaylistDescription] = useState('');
    const [playlistUrl, setPlaylistUrl] = useState('');
    const accessToken = getAccessToken();

    useEffect(() => {
        fetchLikedSongs();
    }, []);

    const fetchLikedSongs = async () => {
        try {
            const response = await axios.get('http://localhost:3001/liked-songs');
            setLikedSongs(response.data);
        } catch (error) {
            console.error('Error fetching liked songs:', error);
        }
    };

    const handleUnlike = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/unlike-song/${id}`);
            setLikedSongs(likedSongs.filter(song => song._id !== id));
        } catch (error) {
            console.error('Error unliking song:', error);
        }
    };

    const handleAddToPlaylist = (song) => {
        setPlaylistSongs([...playlistSongs, song]);
        setLikedSongs(likedSongs.filter(likedSong => likedSong._id !== song._id));
    };

    const handleRemoveFromPlaylist = (song) => {
        setLikedSongs([...likedSongs, song]);
        setPlaylistSongs(playlistSongs.filter(playlistSong => playlistSong._id !== song._id));
    };

    const searchSongs = async (songs, accessToken) => {
        const songUris = [];
        for (const song of songs) {
            try {
                const response = await axios.get('https://api.spotify.com/v1/search', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        q: `${song.name} ${song.artist}`,
                        type: 'track',
                        limit: 1,
                    },
                });
                if (response.data.tracks.items.length > 0) {
                    songUris.push(`spotify:track:${response.data.tracks.items[0].id}`);
                } else {
                    console.warn(`No results found for ${song.name} by ${song.artist}`);
                }
            } catch (error) {
                console.error(`Error searching for song ${song.name} by ${song.artist}:`, error);
            }
        }
        return songUris;
    };

    const handleCreatePlaylist = async () => {
        try {
            const songUris = await searchSongs(playlistSongs, accessToken);
            if (songUris.length === 0) {
                console.warn('No valid songs found for the playlist.');
                return;
            }

            const response = await axios.post('http://localhost:3001/create-playlist', {
                accessToken,
                songUris,
                title: playlistTitle,
                description: playlistDescription,
            });
            setPlaylistUrl(response.data.playlistUrl);
            setPlaylistSongs([]);
            setPlaylistTitle('');
            setPlaylistDescription('');
        } catch (error) {
            console.error('Error creating playlist:', error);
        }
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-apple">
            <Navbar className="absolute top-0 left-0 right-0" />
            <div className="flex flex-col items-center mt-20 w-full">
                <h1 className="text-2xl font-semibold mb-4">Liked Songs</h1>
                <div className="w-full max-w-md">
                    {likedSongs.length > 0 ? (
                        likedSongs.map((song, index) => (
                            <div key={index} className="bg-white shadow-lg rounded-lg p-4 mb-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    <img src={song.cover} alt={`${song.name} cover`} className="w-16 h-16 rounded-lg mr-4" />
                                    <div>
                                        <h3 className="text-lg font-bold">{song.name}</h3>
                                        <p className="text-md">{song.artist}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        className="text-green-500 hover:text-green-700 transition-colors duration-200"
                                        onClick={() => handleAddToPlaylist(song)}
                                    >
                                        <AddIcon className="w-6 h-6"/>
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-700 transition-colors duration-200 mr-2"
                                        onClick={() => handleUnlike(song._id)}
                                    >
                                        <TrashIcon className="w-6 h-6"/>
                                    </button>

                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No liked songs yet.</p>
                    )}
                </div>

                <h2 className="text-2xl font-semibold mb-4 mt-8">Create Playlist</h2>
                <div className="w-full max-w-md">
                    {playlistSongs.length > 0 ? (
                        playlistSongs.map((song, index) => (
                            <div key={index} className="bg-white shadow-lg rounded-lg p-4 mb-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    <img src={song.cover} alt={`${song.name} cover`} className="w-16 h-16 rounded-lg mr-4" />
                                    <div>
                                        <h3 className="text-lg font-bold">{song.name}</h3>
                                        <p className="text-md">{song.artist}</p>
                                    </div>
                                </div>
                                <button
                                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                    onClick={() => handleRemoveFromPlaylist(song)}
                                >
                                    <RemoveIcon className="w-6 h-6" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No songs in playlist yet.</p>
                    )}
                </div>

                <div className="w-full max-w-md mt-4">
                    <input
                        type="text"
                        placeholder="Playlist Title"
                        value={playlistTitle}
                        onChange={(e) => setPlaylistTitle(e.target.value)}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                    />
                    <textarea
                        placeholder="Playlist Description"
                        value={playlistDescription}
                        onChange={(e) => setPlaylistDescription(e.target.value)}
                        className="w-full p-2 mb-2 border border-gray-300 rounded"
                    ></textarea>
                    <button
                        onClick={handleCreatePlaylist}
                        className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
                    >
                        Create Playlist
                    </button>
                    {playlistUrl && (
                        <div className="mt-4">
                            <p>Playlist created! You can view it <a href={playlistUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">here</a>.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Likedsongs;



