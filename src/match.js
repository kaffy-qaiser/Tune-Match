import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { ReactComponent as HeartIcon } from './assets/heart.svg';
import { ReactComponent as XIcon } from './assets/x.svg';
import { getAccessToken, refreshAccessToken } from './tokenUtils';

const Match = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState(getAccessToken());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState(null);

    useEffect(() => {
        fetchSongs();
    }, [accessToken]);

    const fetchSongs = async () => {
        try {
            const response = await axios.get('http://localhost:3001/get-songs', {
                params: { access_token: accessToken },
            });
            setSongs(response.data.songs);
            setLoading(false);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    const newAccessToken = await refreshAccessToken();
                    setAccessToken(newAccessToken);
                    fetchSongs();
                } catch (refreshError) {
                    console.error('Error refreshing access token:', refreshError);
                }
            } else {
                console.error('Error fetching songs:', error);
                setLoading(false);
            }
        }
    };

    const handleSwipeLeft = () => {
        setSwipeDirection('left');
        setTimeout(() => {
            if (currentIndex < songs.length - 1) {
                setCurrentIndex(currentIndex + 1);
            }
            setSwipeDirection(null);
        }, 300); // Match transition duration
    };

    const handleSwipeRight = async () => {
        setSwipeDirection('right');
        const currentSong = songs[currentIndex];
        console.log(currentSong);
        try {
            await axios.post('http://localhost:3001/like-song', {
                spotifyId: currentSong.uri,
                name: currentSong.name,
                artist: currentSong.artist,
                cover: currentSong.cover,
            });
        } catch (error) {
            console.error('Error liking song:', error);
        }
        setTimeout(() => {
            if (currentIndex < songs.length - 1) {
                setCurrentIndex(currentIndex + 1);
            }
            setSwipeDirection(null);
        }, 300); // Match transition duration
    };



    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-apple">
            <Navbar className="absolute top-0 left-0 right-0" />
            <div className="flex flex-col items-center mt-20 w-full">
                <h1 className="text-2xl font-semibold mb-4">Discover New Music</h1>
                <div className="relative w-full max-w-md">
                    {loading ? (
                        <div className="flex justify-center items-center h-96">
                            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
                        </div>
                    ) : (
                        <div className="relative w-full h-96">
                            {songs.length > 0 && (
                                <div
                                    className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 font-apple shadow-lg rounded-lg p-4 bg-cover bg-center transition-transform duration-300 ${swipeDirection === 'left' ? '-translate-x-full' : ''} ${swipeDirection === 'right' ? 'translate-x-full' : ''}`}
                                >
                                    <div className="bg-black bg-opacity-50 p-4 rounded-lg text-center">
                                        <img src={songs[currentIndex].cover} alt={`${songs[currentIndex].name} cover`}
                                             className="w-32 h-32 rounded-lg mb-4"/>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">
                                        <a
                                            href={songs[currentIndex].externalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white hover:underline"
                                        >
                                            {songs[currentIndex].name}
                                        </a>
                                    </h3>
                                    <p className="text-md text-white">{songs[currentIndex].artist}</p>
                                    {songs[currentIndex].genres.length > 0 && (
                                        <div className="flex flex-wrap justify-center mt-2">
                                            {songs[currentIndex].genres.map((genre, index) => (
                                                <span key={index} className="text-xs bg-gray-200 text-gray-800 rounded-full px-2 py-1 mx-1">{genre}</span>
                                            ))}
                                        </div>
                                    )}
                                    {songs[currentIndex].previewUrl && (
                                        <div className="mt-2">
                                            <audio controls src={songs[currentIndex].previewUrl}>
                                                Your browser does not support the audio element.
                                            </audio>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    {!loading && songs.length > 0 && (
                        <div className="flex justify-between mt-4">
                            <button
                                className="text-white p-2 rounded-full hover:bg-black transition-colors duration-200"
                                onClick={handleSwipeLeft}
                            >
                                <XIcon className="w-8 h-8"/>
                            </button>
                            <button
                                className="text-white p-2 rounded-full  hover:bg-lime-500 transition-colors duration-200"
                                onClick={handleSwipeRight}
                            >
                                <HeartIcon className="w-8 h-8"/>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Match;



