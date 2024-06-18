# Tune Match

[Download the demo video](./src/assets/tunematch_demo.mp4)

Tune Match is a dynamic AI powered web application designed to enhance your music experience by leveraging the power of React.js, Node.js, Spotify API, OpenAI API, Tailwind CSS, and MongoDB. It allows users to generate custom playlists, discover new songs with a swipe feature, and manage their liked songs efficiently.

## Table of Contents
- [Features](#features)
    - [Login Page](#login-page)
    - [Playlist Generator](#playlist-generator)
    - [Find Songs](#find-songs)
    - [Liked Songs Page](#liked-songs-page)
    - [Dashboard](#dashboard)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

### Login Page
- Users can log in using Spotify OAuth for a seamless and secure authentication experience.


### Playlist Generator
- Generates playlists using Spotify API and OpenAI API.
- Users can prompt the generator with commands like "Make me a summer playlist."
- The generated playlist is created on the user's Spotify account, and a link to the playlist is provided.

### Find Songs
- A Tinder-like feature that lets users discover new songs by swiping right to like or left to skip.
- Users can listen to song previews and save their liked songs.

### Liked Songs Page
- Displays all liked songs.
- Users can add all their liked songs to a new playlist on their Spotify account.

### Dashboard
- Shows recently listened to songs and top artists.
- Includes a web player for recent songs, providing an integrated music listening experience.

## Technologies Used
- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Spotify API](https://developer.spotify.com/documentation/web-api/)
- [OpenAI API](https://beta.openai.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/kaffy-qaiser/tune-match.git
   cd tune-match
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
    - Create a `.env` file in the root directory.
    - Add your Spotify API credentials, OpenAI API key, and MongoDB connection string.

4. Start the development server:
   ```bash
   npm start
   ```

## Usage
1. Open your browser and navigate to `http://localhost:3000`.
2. Log in using your Spotify account.
3. Explore the various features:
    - Generate custom playlists.
    - Discover new songs with the swipe feature.
    - Manage your liked songs and create playlists.
    - View your dashboard for recent activities.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Enjoy your enhanced music experience with Tune Match!