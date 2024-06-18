import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAccessToken } from './tokenUtils';
import Navbar from "./Navbar";
import Slider from "react-slick";
import SpotifyPlayer from 'react-spotify-web-playback';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomePage = () => {
    const [userName, setUserName] = useState('User');
    const [userImage, setUserImage] = useState('');
    const [recentSongs, setRecentSongs] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks] = useState([]);
    const [playlistCount, setPlaylistCount] = useState(0);
    const [followers, setFollowers] = useState(0);
    const [following, setFollowing] = useState(0);
    const [accessToken, setAccessToken] = useState(getAccessToken());

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setUserName(response.data.display_name);
                setFollowers(response.data.followers.total);
                if (response.data.images.length > 0) {
                    setUserImage(response.data.images[0].url);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        const fetchFollowing = async () => {
            try {
                const response = await axios.get('https://api.spotify.com/v1/me/following', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    params: {
                        type: 'artist'
                    }
                });
                setFollowing(response.data.artists.total);
            } catch (error) {
                console.error('Error fetching following count:', error);
            }
        };

        const fetchRecentSongs = async () => {
            try {
                const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    params: {
                        limit: 20
                    }
                });
                const uniqueSongs = Array.from(new Set(response.data.items.map(item => item.track.id)))
                    .map(id => response.data.items.find(item => item.track.id === id));
                setRecentSongs(uniqueSongs);
            } catch (error) {
                console.error('Error fetching recent songs:', error);
            }
        };

        const fetchTopArtists = async () => {
            try {
                const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    params: {
                        limit: 3
                    }
                });
                setTopArtists(response.data.items);
            } catch (error) {
                console.error('Error fetching top artists:', error);
            }
        };

        const fetchTopTracks = async () => {
            try {
                const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    params: {
                        limit: 3
                    }
                });
                setTopTracks(response.data.items);
            } catch (error) {
                console.error('Error fetching top tracks:', error);
            }
        };

        const fetchPlaylistCount = async () => {
            try {
                const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                setPlaylistCount(response.data.total);
            } catch (error) {
                console.error('Error fetching playlist count:', error);
            }
        };

        fetchUserProfile();
        fetchFollowing();
        fetchRecentSongs();
        fetchTopArtists();
        fetchTopTracks();
        fetchPlaylistCount();
    }, [accessToken]);

    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white font-apple">
            <Navbar className="absolute top-0 left-0 right-0"/>
            <div className="flex flex-col items-center mt-20">
                <div className="flex items-center space-x-4">
                    {userImage && <img src={userImage} alt={userName} className="w-32 h-32 rounded-full mb-4"/>}
                    <div>
                        <h1 className="text-6xl font-bold italic mb-2 text-black">Hello, {userName}!</h1>
                        <div className="flex space-x-4 text-xl">
                            <p>{followers} Followers</p>
                            <p>{following} Following</p>
                            <p>{playlistCount} Playlists</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-12 w-full bg-white p-6 rounded-lg">
                <Slider {...settings}>
                    {recentSongs.map((song, index) => (
                        <div key={index} className="p-2">
                            <img src={song.track.album.images[0].url} alt={song.track.name} className="carousel-image rounded-lg"/>
                        </div>
                    ))}
                </Slider>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-100 p-6 rounded-lg shadow-md shadow-t-lg">
                    <h2 className="text-2xl font-bold mb-4">Recently Listened Songs</h2>
                    <ul className="space-y-3">
                        {recentSongs.slice(0, 3).map((song, index) => (
                            <li key={index} className="flex items-center bg-gray-200 p-4 rounded-lg shadow">
                                <img src={song.track.album.images[0].url} alt={song.track.name} className="w-16 h-16 rounded mr-4"/>
                                <div>
                                    <p className="text-lg font-semibold">{song.track.name}</p>
                                    <p className="text-gray-700">{song.track.artists.map(artist => artist.name).join(', ')}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg shadow-md shadow-t-lg">
                    <h2 className="text-2xl font-bold mb-4">Top Artists</h2>
                    <ul className="space-y-3">
                        {topArtists.map((artist, index) => (
                            <li key={index} className="flex items-center bg-gray-200 p-4 rounded-lg shadow">
                                <img src={artist.images[0].url} alt={artist.name} className="w-16 h-16 rounded-full mr-4"/>
                                <div>
                                    <p className="text-lg font-semibold">{artist.name}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-gray-100 p-6 rounded-lg shadow-md shadow-t-lg">
                    <h2 className="text-2xl font-bold mb-4">Top Tracks</h2>
                    <ul className="space-y-3">
                        {topTracks.map((track, index) => (
                            <li key={index} className="flex items-center bg-gray-200 p-4 rounded-lg shadow">
                                <img src={track.album.images[0].url} alt={track.name} className="w-16 h-16 rounded mr-4"/>
                                <div>
                                    <p className="text-lg font-semibold">{track.name}</p>
                                    <p className="text-gray-700">{track.artists.map(artist => artist.name).join(', ')}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <SpotifyPlayer
                token={accessToken}
                showSaveIcon
                uris={recentSongs.map(song => song.track.uri)}
                autoPlay
            />
        </div>
    );
};

export default HomePage;


