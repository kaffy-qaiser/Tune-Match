// src/Navbar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import axios from 'axios';

const Navbar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const goToHome = () => {
        navigate('/home');
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:3001/logout');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            console.log(localStorage.getItem('access_token'));
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <nav className="navbar">
            <a onClick={goToHome} className="nav-logo cursor-pointer">
                tune-match
            </a>
            <div className="nav-menu">
                <button onClick={() => navigate('/playlist-generator')} className="nav-button">
                    playlist generator
                </button>
                <button onClick={() => navigate('/match')} className="nav-button">
                    match
                </button>
                <button onClick={() => navigate('/liked')} className="nav-button">
                    liked songs
                </button>
                <button onClick={() => navigate('/recent-songs')} className="nav-button">
                    tune stats
                </button>
                <button onClick={handleLogout} className="nav-button">
                    logout
                </button>
                <button
                    data-collapse-toggle="navbar-sticky"
                    type="button"
                    className="nav-button md:hidden"
                    aria-controls="navbar-sticky"
                    aria-expanded="false"
                    onClick={toggleMenu}
                >
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                         viewBox="0 0 17 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M1 1h15M1 7h15M1 13h15"/>
                    </svg>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;



