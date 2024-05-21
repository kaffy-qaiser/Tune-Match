import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './login';
import Home from './home';
import Callback from './callback';
import RecentSongs from "./RecentSongs";

const App = () => {
  return (
      <Router>
          <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/recent-songs" element={<RecentSongs />} />
              <Route path="/" element={<Login />} />
          </Routes>
      </Router>
  );
};

export default App;