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
