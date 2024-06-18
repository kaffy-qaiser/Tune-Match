import React from 'react';
import SpotifyLogo from './assets/Spotify.png'; // adjust the path as needed

const Login = () => {
    return (
        <div className="relative flex flex-col items-center justify-center h-screen bg-gray-100 font-apple">
            <div className="absolute top-4 right-4 flex items-center space-x-2">
                <span className="text-gray-700 font-medium">made for</span>
                <img src={SpotifyLogo} alt="Spotify Logo" className="w-6 h-6"/>
                <span className="text-green-500 font-bold">Spotify</span>
            </div>
            <div className="flex flex-col items-center text-center mt-8 mb-8">
                <h1 className="text-6xl font-bold italic font-apple mb-2 text-black">tune-match</h1>
                <p className="text-3xl text-green-600">find and discover new tunes</p>
            </div>
            <img
                src="https://wallpapers.com/images/hd/frank-ocean-animated-art-jyesbcs33xc9ycta.jpg"
                alt="login-image"
                style={{ width: '970px', height: '450px' }}
                className="rounded-lg"
            />
            <a href="http://localhost:3001/login"
               className="bg-black font-bold text-white px-6 py-3 rounded-full hover:bg-green-600 transition duration-300 mt-8">
                Login with Spotify
            </a>
        </div>
    );
};

export default Login;


