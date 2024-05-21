// src/Callback.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
            // Store tokens in local storage or context
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);

            // Redirect to home page with tokens as parameters
            navigate(`/home?access_token=${accessToken}&refresh_token=${refreshToken}`);
        } else {
            console.log('Authorization failed')
            navigate('/');
        }
    }, [navigate]);

    return <div>Loading...</div>;
};

export default Callback;