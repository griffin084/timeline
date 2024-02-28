import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/login.css';
import './style/global.css';
import PopUp from "./pop-up";
import axios from 'axios';
import { Link, useParams } from "react-router-dom";

function LoginPage({ onLogin }) {
  // Used to set and retrieve the username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Logic for showing the pop-up when user input is invalid
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  // Navigates to other pages
  const navigate = useNavigate();

  // Handles the user login upon clicking 'Login'
  const handleLogin = async (e) => {
    e.preventDefault();

    // Stores data for cookies
    var role;
    var token;

    // Appends the username and password to formData
    const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      // API call to grab token for logged in user if password is correct
      const token_response = await axios
      .post(`${process.env.REACT_APP_API_URL}/token`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }).catch((error) => {
        // Shows pop-up upon user error
        setMessage('Incorrect username or password.');
        setShow(true);
      });

      // Checks if a token associated with the username is found
      if (token_response !== undefined) {
        token = token_response.data['access_token'];
        const user_response = await fetch(`${process.env.REACT_APP_API_URL}/users/me`, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }).then((res) => res.json())
        .catch((error) => {
          // Shows pop-up upon user error
          setMessage('Incorrect username or password.');
          setShow(true);
        });

        // Assigns the role to cookies based on the found user
        role = user_response['role'];

        // Passes login information to App.js for cookies
        onLogin({username, role, token});

        // Navigates to home page
        navigate('/regions');
      }
    }

  // Navigates to home page as Guest if not logged in
  const handleContinue = (e) => {
    e.preventDefault();
    const role = 'guest';
    const token = '';
    setUsername('GUEST');
    onLogin({username, role, token});
    navigate("/locations");
  }

  // Navigates to register page
  const handleRegister = (e) => {
    navigate("/register");
  }
  
  // Returns the html for the page
  return (
    <div className="login-container gradient-background">
      {/* Container for pop-ups */}
      <div className="login-pop-up-container">
      <PopUp open={show} message={message} onClose={() => setShow(false)} loading={false}/>
    </div>
      <h1 className="timeline-title">TIMELINE</h1>
      <div className="login-content background-box">
          <div className="login-center">
            <form style= {{top: '10%'}}>
              <label className='login-label'>Username:</label>
              {/* Sets the username */}
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              /> <br />
              <label className='login-label'>Password:</label>
              {/* Sets the password */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              /> <br />
              <input type="submit" className="button-style" onClick={handleLogin} value="Login" />
            </form>
          {/* Buttons for navigating to next page */}
          <div className="login-other-buttons"> 
            <button className="button-style" onClick={handleContinue}>Continue as Guest</button> &ensp;
            <button className="button-style" onClick={handleRegister}>Register</button>
          </div>
          </div>
      
      </div>
    <div className="footer">
      <div className="footer-links">
        <p className="footer-link"><Link to={"/about"}> About</Link></p>
      </div>
    </div>



    </div>
  );
};

export default LoginPage;