import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from 'react-leaflet';
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";

import NavBarTop from "./navbar";
import PopUp from "./pop-up";

import axios from "axios";
import "./style/image-upload.css";
import "./style/global.css";

import Select from "react-select";
import { ThreeDots } from "react-loader-spinner";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Rectangle,
  Marker
} from "react-leaflet";
import { useCookies } from "react-cookie";

function ImageUpload({ user }) {
  // variables for uploaded image data
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [latitude, setLatitude] = useState(0.0);
  const [longitude, setLongitude] = useState(0.0);
  const [direction, setDirection] = useState(0);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagefile, setImageFile] = useState(null);
  const [imageUploaded, setImageUploaded] = useState(false);


  // variables for MapContainer
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapCenter, setMapCenter] = useState([0.0, 0.0]);
  const [forceRerender, setForceRerender] = useState(0);

  // variables for Select bar
  const [regionId, setRegionId] = useState(1);
  const [regionName, setRegionName] = useState("No selection");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [options, setOptions] = useState([]);

  // API call
  const [isLoading, setIsLoading] = useState(false);

  // Popup
  const [message, setMessage] = useState("Upload a photo and fill out the fields.");
  const [success, setSuccess] = useState(false);

  // Toggling regions
  const [toggleRegions, setToggleRegions] = useState(true);
  const [toggleMode, setToggleMode] = useState("On");

  // User cookies
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);

  // Tooltip
  const [show, setShow] = useState(false);

  // Map Display
  const mapRef = useRef();

  // Navigating to other pages
  const navigate = useNavigate();

  // Adding marker on click to region
  const handleRectangleClick = (event) => {
    const { lat, lng } = event.latlng;
    setLatitude(lat);
    setLongitude(lng);
  }

  // tool tips functions
  const hideShow = () => {
    setShow(false);
  };

  function showTooltip(text) {
    var tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = text;
  }

  function hideTooltip() {
    var tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = ""; // Clear the tooltip content
  }

  function showTooltip2(text) {
    var tooltip = document.getElementById("tooltip2");
    tooltip.innerHTML = text;
  }

  function hideTooltip2() {
    var tooltip = document.getElementById("tooltip2");
    tooltip.innerHTML = ""; // Clear the tooltip content
  }

  // Given the 2 lats and 2 longs, it will calculate the center point of the region
  const calculateCenter = (lat1, lat2, long1, long2) => {
    const center = [(lat1 + lat2) / 2, (long1 + long2) / 2];
    return center;
  };

  // Toggles the button name based on user clicks, toggles all regions showing
  const toggleRegionModeButton = () => {
    setToggleRegions(!toggleRegions);
    if (toggleMode === "On") {
      setToggleMode("Off");
    } else {
      setToggleMode("On");
    }
  }

  // API POST: Inserts metadata into the fields 
  // If there's no metadata, fields not change values
  // If there's metadata, fields auto-populate
  const insertMetaData = (file) => {
    const metadata = new FormData();
    metadata.append("file", file);
    axios
      .post(`${process.env.REACT_APP_API_URL}/upload-file`, metadata)
      .then((response) => {

        if (response.data.long !== null) {
          setLongitude(response.data.long);
        }

        if (response.data.lat !== null) {
          setLatitude(response.data.lat);
        }

        if (response.data.direction !== null) {
          setDirection(response.data.direction);
        }

        if (response.data.time !== null) {
          const splitDate = response.data.time.split(" ");
          setDate(splitDate[0]);
          setTime(splitDate[1]);
        }

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching metadata:", error);
        setIsLoading(false);
      });
    setIsLoading(false);
  };

  // Allows you to drop images into area, will preview image
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setUploadedImage(URL.createObjectURL(file));
    setImageUploaded(true);
    setImageFile(file); // Put post request in here
    insertMetaData(file);
  };

  // Accepts images
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  // Checks to make sure all information is uploaded
  // API POST: uploads image and information to backend
  const OnUploadSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!imageUploaded) {
      setSuccess(false);
      setMessage("Upload an image first.");
      setIsLoading(false);
    } else if (latitude === 0 || longitude === 0) {
      setSuccess(false);
      setMessage("Fill out latitude and longitude by clicking on a region on the map.");
      setIsLoading(false);
      setShow(true);
    } else {

      const idArray = selectedOptions.map((region) => region.id);
      const csa = idArray.join(",");

      const formData = new FormData();
      formData.append("file", imagefile);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("direction", direction);
      formData.append("region_ids", csa);

      axios.post(`${process.env.REACT_APP_API_URL}/upload-photo`, formData,
        {
          headers: {
            Authorization: "Bearer " + user.token,
          },
        })
        .then((response) => {
          setMessage(`Successful Uploads:\n${response.data.valid_uploads.join("\n")}\n\nInvalid Uploads: \n${response.data.invalid_uploads.join("\n")}`);
          setSuccess(true);
          setShow(true);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setMessage(
            "Upload Unsuccessful, make sure the image is contained within the requested region, and is of the correct file type (PNG, JPG)"
          );

          setSuccess(false);
          setShow(true);
          setIsLoading(false);
        });
    }
  };

  // API GET: gets the coordinates, names, and IDs for all regions
  useEffect(() => {
    if (user.username === "") {
      navigate("/");
    }

    fetch(`${process.env.REACT_APP_API_URL}/get-regions-coords`, {})
      .then((res) => res.json())
      .then((response) => {
        setOptions(response);
      })
      .catch((error) => console.log(error));
  }, []);

  // Select bar changes to add/remove regions, works in joint with map
  const handleSelectionChange = (selectedOptions) => {
    if (selectedOptions.length > 0) {
      setRegionId(selectedOptions[0].id);
      setRegionName(selectedOptions[0].name);
      setSelectedOptions(selectedOptions);
      setZoomLevel(12);
    } else {
      setRegionId();
      setRegionName();
      setSelectedOptions([]);
      setZoomLevel(1);
    }
  };

  // Clear image button
  const clearImage = () => {
    setImageUploaded(false);
    setImageFile(null);
    setUploadedImage(null);
  }

  // Clear fields button
  const clearFields = () => {
    setSelectedOptions([]);
    setTime("");
    setDate("");
    setLatitude(0.0);
    setLongitude(0.0);
    setDirection(0);
    setZoomLevel(0);
  }

  // Filters for feasible regions for placed marker
  // If no options selected, all regions are available
  const pickRegions = (regions, lat, long) => {
    if (selectedOptions.length !== 0 || (lat !== 0.0 && long !== 0.0)) {
      const possibleRegions = [];
      for (let r = 0; r < regions.length; r++) {
        const r_lat1 = regions[r].lat1;
        const r_lat2 = regions[r].lat2;
        const r_long1 = regions[r].long1;
        const r_long2 = regions[r].long2;
        if (
          ((r_lat1 < lat && lat < r_lat2) || (r_lat2 < lat && lat < r_lat1)) &&
          ((r_long1 < long && long < r_long2) ||
            (r_long2 < long && long < r_long1))
        ) {
          possibleRegions.push(regions[r]);
        }
      }
      return possibleRegions;
    } else {
      return regions;
    }
  };

  // For displaying the rectangle of first region chosen
  const regionMap = () => {
    if (selectedOptions.length !== 0) {
      return ([selectedOptions[0].lat1, selectedOptions[0].lat2, selectedOptions[0].long1, selectedOptions[0].long2]);
    } else {
      return [0.0, 0.0, 0.0, 0.0];
    }

  }

  // Calls pickRegions for the list of possible options
  const regionsList = pickRegions(options, latitude, longitude);
  // Calls regionMap for creating rectangle
  const regionsMap = regionMap();

  // useEffect to change the zoom and map center when user changes value
  useEffect(() => {
    // for center
    if (latitude === 0.0 && longitude === 0.0) {
      const center = calculateCenter(
        regionsMap[0],
        regionsMap[1],
        regionsMap[2],
        regionsMap[3]);
      setMapCenter(center);
    } else {
      setMapCenter([latitude, longitude]);
    }

    // for zoom level
    if (selectedOptions.length === 0) {
      setZoomLevel(1);
    } else if (selectedOptions.length == 1) {
      setZoomLevel(8);
    }
    // forces a rerender of map
    setForceRerender(prev => prev + 1);
  }, [selectedOptions]);

  // display Image Upload Page
  return (
    <div className="gradient-background">
      <div className="image-upload-pop-up-container">
        {/* PopUp */}
        <PopUp open={show} onClose={() => setShow(false)} message={message} success={success} regionId={regionId} regionName={regionName} loading={isLoading} id="pop-up-elem" />
      </div>
      {/* NavBar */}
      <NavBarTop user={user} />
      <div className="center1">
        <div className="everything1">
          {/* Form for uploading image + metadata information */}
          <form onSubmit={OnUploadSubmit}>
            <div>
              <h2 className="image-upload-titles">Image Upload</h2>

              <div className="tooltip-container">
                <div className="question-icon" onMouseOver={() => showTooltip('Use <a href="https://www.gps-coordinates.net/" target="_blank">this link</a> to pinpoint coordinates')}>
                  <b>?</b>
                </div>
                <div class="tooltip" id="tooltip">
                </div>
              </div>
              <div className="image-upload-left">
                {/* Uploading Image */}
                {!imageUploaded && (
                  <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? "active" : ""}`}
                  >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p className="image-drop">Drop the image here...</p>
                    ) : (
                      <p className="image-drop">
                        Drag &amp; drop an image here, or click to select one
                      </p>
                    )}
                  </div>)}
                {uploadedImage && (
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    style={{ width: "400px", height: "300px" }}
                  />
                )}
              </div>
            </div>
            {/* Metadata Information Fields */}
            <div className="image-upload-fields">
              <label className="image-upload-text">Select Regions:</label>
              <Select
                options={regionsList}
                isMulti
                value={selectedOptions}
                onChange={handleSelectionChange}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                placeholder="Select Region(s)"
                required
              />

              <label className="image-upload-text">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={!imageUploaded}
                required
              />

              <label className="image-upload-text">Time:</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={!imageUploaded}
                required
              />

              <label className="image-upload-text">Latitude:</label>
              <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                disabled={!imageUploaded}
                required
              />

              <label className="image-upload-text">Longitude:</label>
              <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                disabled={!imageUploaded}
                required
              />

              <label className="image-upload-text">Direction:</label>
              <input
                type="number"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                disabled={!imageUploaded}
                required
              />
            </div>

            {/* Clear Buttons, Image and Fields */}
            <div className="upload-image-clear-buttons">
              <button className="button-style" onClick={() => clearImage()}>Clear Image</button>
              <button className="button-style" onClick={() => clearFields()}>Clear Fields</button>
            </div>

            {/* Submit Button */}
            <button
              className="button-style upload-image-submit-button"
              type="submit"
            >
              Submit
            </button>

          </form>

          {/* Toggle Button */}
          <div className="toggle-regions">
            <button className="button-style" onClick={() => toggleRegionModeButton()}>
              Toggle Regions: {toggleMode}
            </button>
          </div>

        </div>

        {/* MapContainer */}
        <div className="image-upload-map">
          <div>
            {/* Crates MapContainer */}
            {mapCenter && zoomLevel && (<MapContainer
              key={forceRerender}
              center={mapCenter}
              zoom={zoomLevel}
              ref={mapRef}
              maxBounds={[[-180, -180], [180, 180]]}
              style={{
                height: "50vh",
                width: "50vw",
                maxHeight: "450px",
                maxWidth: "400px",
                minHeight: "200px",
                minWidth: "200px",
                borderRadius: "12px"
              }}

            >
              {/* OpenStreetMap */}
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                minZoom="1"
              />
              {/* Adding All Regions Rectangles if toggle is on */}
              {toggleRegions && (
                options.map((option) => (
                  <Rectangle
                    bounds={[
                      [option.lat1, option.long1],
                      [option.lat2, option.long2],
                    ]}
                    pathOptions={{
                      color: "blue",
                      weight: 2,
                      opacity: 0.8,
                    }}
                    eventHandlers={{ click: handleRectangleClick }}
                  />
                ))
              )}

              {/* Adding rectangle for first specified region if toggle is off */}
              {!toggleRegions && (
                <Rectangle
                  bounds={[
                    [regionsMap[0], regionsMap[2]],
                    [regionsMap[1], regionsMap[3]],
                  ]}
                  pathOptions={{
                    color: "blue",
                    weight: 2,
                    opacity: 0.8,
                  }}
                  eventHandlers={{ click: handleRectangleClick }}
                />
              )}
              {latitude !== 0.0 && longitude !== 0.0 && (<Marker
                position={[latitude, longitude]}
                icon={L.divIcon({
                  html:
                    `
              <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
              width="30px" height="60px" transform="rotate(${direction})" viewBox="0 0 100 100" enable-background="new 0 0 64 64" xml:space="preserve">
            <path fill="#231F20" d="M55.639,46.344L35.641,2.342c-0.648-1.426-2.07-2.344-3.642-2.344c-1.57,0-2.992,0.918-3.641,2.344
              l-20,44.001c-0.562,1.238-0.457,2.68,0.277,3.82C9.374,51.309,10.64,52,11.999,52h16v8c0,2.211,1.789,4,4,4
              C34.211,64,36,62.211,36,60v-8h15.998c1.359,0,2.625-0.691,3.367-1.836C56.1,49.023,56.201,47.582,55.639,46.344z"/>
            </svg>
          `,
                  iconAnchor: [15, 30],
                  popupAnchor: [0, -30],
                  className: "dummy"
                })}
              >
              </Marker>)}

              {/* Adding marker for each region when toggle is on */}
              {toggleRegions && (
                options.map((option) => (
                  <Marker
                    position={calculateCenter(option.lat1, option.lat2, option.long1, option.long2)}
                    icon={L.divIcon({
                      html:
                        `<svg fill="#000000" width="25px" height="25px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <title>map-marker</title>
                        <path d="M8.16 26.96c-0.88 0-1.64-0.4-2.040-1.080l-5.040-9c-0.68-1.16-1.080-2.52-1.080-3.92 0-4.36 3.68-7.92 8.16-7.92 4.52 0 8.16 3.56 8.16 7.92 0 1.4-0.4 2.76-1.12 3.96l-4.96 8.92c-0.44 0.72-1.2 1.12-2.080 1.12zM8.16 6.72c-3.56 0-6.48 2.8-6.48 6.24 0 1.080 0.28 2.16 0.88 3.12l5.040 8.96c0.080 0.16 0.32 0.24 0.6 0.24s0.52-0.12 0.6-0.28l5-8.92c0.56-0.96 0.88-2.040 0.88-3.12-0.040-3.44-2.92-6.24-6.52-6.24zM8.16 16.16c-1.64 0-2.96-1.36-2.96-2.96 0-1.64 1.32-2.96 2.96-2.96s2.96 1.32 2.96 2.96c0 1.6-1.32 2.96-2.96 2.96zM8.16 11.92c-0.72 0-1.28 0.56-1.28 1.28s0.56 1.28 1.28 1.28 1.28-0.56 1.28-1.28-0.56-1.28-1.28-1.28z"></path>
                        </svg>`,
                      iconAnchor: [6, 20],
                      popupAnchor: [10, 10],
                      className: "dummy",
                      tooltip: `${option.name}`
                    })}
                  >
                    <Tooltip>{option.name}</Tooltip>
                  </Marker>
                ))
              )}
            </MapContainer>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageUpload;