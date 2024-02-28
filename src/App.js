import React, { useEffect } from 'react';
import './App.css';
import MyMap from './components/my-map';
import LoginPage from './components/login';
import ImageUpload from './components/image-upload'
import RegionUpload from './components/region-upload'
import LocationList from './components/regions';
import ImageDisplay from './components/timelinescroller';
import RegisterPage from './components/register';
import AboutPage from './components/about';
import ModeratorsPage from './components/moderators';
import MultiUpload from './components/multi-image-upload';
import { CookiesProvider, useCookies } from "react-cookie";

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
  // Define a state variable to keep track of the user's login status
  // Setup cookies
  const [cookies, setCookie] = useCookies(["user"]);

  // For guests
  useEffect(() => {
    if (cookies.user === undefined) {
      const user = {
        username: '',
      }
      setCookie("user", user, {path: "/"})
    }
  }, [cookies.user, setCookie]);
  
  // Adds values to cookies
  function handleLogin(user) {
    if (user.role === 'guest') {
      user.username = 'GUEST'
    }
    setCookie("user", user, { path: "/" });
  }


  // Creates page linking pattern, all routes listed here

  return (
    <CookiesProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin}/>}/>
        <Route path="/register" element={<RegisterPage user={cookies.user} />}/>
        <Route path="/locations" element={<Navigate to = "/regions" user={cookies.user} />}/>
        <Route path="/regions" element={<LocationList user={cookies.user} />}/>
        <Route path="/imageupload" element={<ImageUpload user={cookies.user} />}/>
        <Route path="/regionupload" element={<RegionUpload user={cookies.user} />}/>
        <Route path="/moderator" element={<ModeratorsPage user={cookies.user} />}/>
        <Route path="/about" element={<AboutPage user={cookies.user} />}/>
        <Route path="/region/:regionId" element={<MyMap user={cookies.user} />}/>
        <Route path="/region/scroller/:regionId/:imageId/:dates" element={<ImageDisplay user={cookies.user} />}/>
        <Route path="/multiupload" element={<MultiUpload user={cookies.user} />}/>
        <Route path="*" element={<Navigate to ="/" />}/>
      </Routes>
    </Router>
    </CookiesProvider>
  )
}

export default App;
