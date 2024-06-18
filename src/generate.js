import React, { useState } from 'react';
import axios from 'axios';
import { getAccessToken } from './tokenUtils';
import Navbar from "./Navbar";
import { FaSpinner } from 'react-icons/fa';

const Generate = () => {
    const [prompt, setPrompt] = useState('');
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const generatePlaylist = async () => {
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        const accessToken = getAccessToken();

        try {
            const response = await axios.get('http://localhost:3001/generate-playlist', {
                params: { prompt, access_token: accessToken },
            });
            setPlaylistUrl(response.data.playlistUrl);
            setSuccessMessage('Playlist generated successfully!');
        } catch (err) {
            setError('Failed to generate playlist. Please try again.');
            console.error('Error generating playlist:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500 font-apple">
            <Navbar className="absolute top-0 left-0 right-0" />
            <div className="flex flex-col items-center mt-20 p-8 bg-white rounded-lg shadow-lg">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter playlist prompt"
                    className="border p-4 mb-4 w-80 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isLoading}
                />
                <button
                    onClick={generatePlaylist}
                    disabled={isLoading}
                    className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition duration-300 flex items-center justify-center"
                >
                    {isLoading ? <FaSpinner className="animate-spin" /> : 'Generate Playlist'}
                </button>
                {playlistUrl && (
                    <a href={playlistUrl} target="_blank" rel="noopener noreferrer" className="mt-4 text-blue-500">
                        View Playlist
                    </a>
                )}
                {error && (
                    <p className="text-red-500 mt-2">{error}</p>
                )}
                {successMessage && (
                    <p className="text-green-500 mt-2">{successMessage}</p>
                )}
            </div>
        </div>
    );
};

export default Generate;


