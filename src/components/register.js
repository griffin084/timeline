import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PopUp from "./pop-up";
import './style/register.css';

/*
  Very simple registration page. Calls API with username and password, and if accepted a new user 
  is created.
*/
function Register({ user }) {
  const [username, setUsername] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [registered, setRegistered] = useState('');
    
  // API call for register, simple post request, always creates a general user. 
  const handleRegister = async (e) => {
    e.preventDefault();
    if (password1 === password2 && username !== '' && password1 !== '') {
        const data = {
        'username': username,
        'password': password1,
        'role': 'general'
        }

        const register_response = await axios
            .post(`${process.env.REACT_APP_API_URL}/add-user`, data)
            .catch((error) => {
            console.error('Error:', error);
            });

            if (register_response === undefined) {
              setMessage('Username not available');
            } else {
              setMessage(`Successfully added new user ${username}.`);
              setShow(true);
              setRegistered(true);
            }
    } else {
        setMessage("Passwords do not match.");
    }
    setShow(true);
  };

  // Simple html form for registry
  return (
    <div className="register-center gradient-background">
      <div className="login-pop-up-container">
        <PopUp open={show} message={message} onClose={registered ? (() => navigate('/')) : (() => setShow(false))} loading={false}/>
      </div>
      <h2 style={{position: "relative", margin: 0, top: "30px"}}>Register User</h2>
      <div className="box">
        <div className="background-box">
      <form onSubmit={handleRegister}>
        <div>
          <label className='register-label'>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className='register-label'>Password:</label>
          <input
            type="password"
            value={password1}
            onChange={(e) => setPassword1(e.target.value)}
          />
        </div>
        <div>
          <label className='register-label'>Retype Password:</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
        </div>
        <div>
          <button className="button-style" type="submit">Register</button>
        </div>
        </form>
        </div>
        </div>
    </div>
  );
};

export default Register;