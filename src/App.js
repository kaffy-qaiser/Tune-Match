import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './login';
import Generate from './generate';
import Callback from './callback';
import RecentSongs from "./StatsPage";
import Homepage from "./Homepage";
import Match from "./match";
import LikedSongs from "./LikedSongs";

const App = () => {
  return (
      <Router>
          <Routes>
              <Route path="/playlist-generator" element={<Generate />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/recent-songs" element={<RecentSongs />} />
              <Route path="/" element={<Login />} />
              <Route path="/home" element={<Homepage />} />
              <Route path="/match" element={<Match />} />
              <Route path="/liked" element={<LikedSongs />} />
          </Routes>
      </Router>
  );
};

export default App;