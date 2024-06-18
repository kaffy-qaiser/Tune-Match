import axios from 'axios';

export const getAccessToken = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let accessToken = urlParams.get('access_token');

    if (!accessToken) {
        accessToken = localStorage.getItem('access_token');
    } else {
        localStorage.setItem('access_token', accessToken);
    }

    return accessToken;
};

export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: process.env.SPOTIFY_CLIENT_ID,  // Ensure these are set in your environment
            client_secret: process.env.SPOTIFY_CLIENT_SECRET,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
            localStorage.setItem('refresh_token', refresh_token);
        }

        return access_token;
    } catch (error) {
        console.error('Error refreshing access token', error);
        throw error;
    }
};

