import React, { useState, useEffect, useRef } from "react";
import { Link, BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './style/regions.css';
import './style/global.css';
import PopUp from './pop-up';
import ToolTip from "./tooltip";
import NavBarTop from "./navbar";

// Home Page for website
function LocationList({ user }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  const regionsList = getRegions();
  const listRef = useRef();

  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  // API GET: gets regions to populate for viewing
  useEffect(() => {
    if (user.username === '') {
      navigate('/');
    console.log(user.username, user.role);
  }

    fetch(`${process.env.REACT_APP_API_URL}/get-regions`, {})
      .then((res) => res.json())
      .then((response) => {
        setData(response);
        setIsLoading(false);
      })
      .catch((error) => console.log(error));
  }, [user, navigate]);

  // gets the regions and puts it into array
  function getRegions() {
    const regions = [];
    for (let r = 0; r < data.length; r++) {
      regions.push(data[r])
    }
    return regions;
  }

  // creates array of all region names
  function createRegionNameList() {
    var regionNameList = [];
    regionsList.forEach((region, index) => {
      regionNameList.push(<option value={region.name} />);
    });
    return regionNameList;
  }

  // used to navigate to map for specified region
  function navigateRegion() {
    if (listRef.current.value === '') {
      setMessage("Set a region to continue.");
      setShow(true);
    } else {
      const regionId = regionsList.find((element) => element.name === listRef.current.value);
      if (regionId === undefined) {
        setMessage("Region does not exist, clear your selection and pick from the drop down.");
        setShow(true);
      } else {
        navigate(`/region/${regionId.id}`);
      }
    }
  }

  // API DELETE: deleting specified region
  async function deleteRegion() {
    if (listRef.current.value === '') {
      setMessage("Set a region to continue.");
      setShow(true);
    } else {
      const regionId = regionsList.find((element) => element.name === listRef.current.value).id;
      await axios.delete(`${process.env.REACT_APP_API_URL}/delete-region/${regionId}`, {
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      });
      window.location.reload();
    }
  }

  // if user is general/moderator, shows specified buttons
  function uploadCheck() {
    if (user.role === "general" || user.role === "moderator") {
      return (
        <div className="split">
          <div className="background-box">
           <br/>
            <div className="tooltip2-container">
              <h5 className="inline">
                <Link to={"/imageupload"} className="button-style" id="image-button">Upload Single Image</Link>
              </h5>
              <h5 className="inline">
                <Link to={"/multiupload"} className="button-style" id="image-button">Upload Multiple Images</Link>
              </h5>

              <h5 className="inline">
                <Link to={"/regionupload"} className="button-style">Create Region</Link>
              </h5>
              <ToolTip message="Want to upload images or create a region? Click below to submit a request"/>
            </div>
          </div>
        </div>
      )
    }
  }

  // if user is moderator, shows moderator page
  function moderatorCheck() {
    if (user.role === "moderator") {
      return (
        <div className="split">
          <div className="background-box">
            <br /> 
            <div className="tooltip3-container">  
              <h5 className="inline">
                <Link to={"/moderator"} className="button-style">Moderator Page</Link>
              </h5>
              <ToolTip message="Approve or deny unverified images and delete regions"/>
            </div>
          </div>
        </div>
      )
    }
  }


  // Timeline Page
  // ToRegion section, upload section, and moderator page
  return (
    <>
      <div className="regions-pop-up-container">
        <PopUp open={show} message={message} onClose={() => setShow(false)} loading={false}/>
      </div>
      <div className="region-list-container gradient-background">
        <NavBarTop user={user}/>
        <div className="regions-title">
          <h2 className="center">TIMELINE</h2>
        </div>
        <div className="split">
          <div className="background-box">
            <div className="dropdown">
              <input list="browsers" name="browser" ref={listRef} className="region-form"/>
              <datalist id="browsers">
                {createRegionNameList()}
              </datalist>           
              <ToolTip message="Select a region to visit the map."/>
              <br /> <br />
            <button className="button-style" onClick={navigateRegion}><b>To Region</b></button> &ensp;
            {(user.role === 'moderator') && <button className="button-style" onClick={deleteRegion}><b>Delete Region</b></button>}
            </div>
          </div>     
        </div>
        <br />
        {uploadCheck()}
        {moderatorCheck()}

      </div>
    </>
  );
};
export default LocationList;