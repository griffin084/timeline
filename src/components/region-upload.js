import React, { useState, useEffect, useRef } from "react";

//import PopUp from "./pop-up"
import NavBarTop from "./navbar";
import axios from "axios";
import "./style/region-upload.css";
import L from "leaflet";
import {
    MapContainer,
    TileLayer,
    Rectangle,
    Marker
} from "react-leaflet";
import PopUp from "./pop-up";



/*
  Region Upload is the Region Creation page. Post requests are sent once the region is created, and 
  the region is stored onto the database, and can be viewed in the region selection.
*/
function RegionUpload({ user }) {

    // Coordinate fields
    const [latitude, setLatitude] = useState("38.8");
    const [longitude, setLongitude] = useState("-77.1");

    const [boxCoords, setBoxCoords] = useState({lat1: 0, lat2: 0, long1: 0, long2: 0});
    const [centerCoords, setCenterCoords] = useState({lat: 38.8, long: -77.1})

    // These state variables are for the pop up, to display the to region button
    const [regionId, setRegionId] = useState(1);
    const [regionName, setRegionName] = useState("No selection");
    const [regionload, setRegionLoading] = useState(true);
    const [message, setMessage] = useState("Upload a photo and fill out the fields.");
    const [success, setSuccess] = useState(false);
    const [show, setShow] = useState(false);

    // Height and Width fields
    const [width, setWidth] = useState(0.1);
    const [height, setHeight] = useState(0.1);
    const [mileWidth, setMileWidth] = useState(5);
    const [mileHeight, setMileHeight] = useState(5);

    // Region name
    const [name, setName] = useState("");

    const initialZoom = 3;

    const earthLongMiles = 24859.734;
    const earthLatMiles = 24901.461;

    const mapRef = useRef();
  
    // This is for the width text field update
    useEffect(() => {
      var tempWidth = 0;
      if (mileWidth < 0) {
        setMileWidth(0);
      } else {
        tempWidth = ((mileWidth / earthLatMiles) * 360)/2;
      }
      setWidth(tempWidth);
      setBoxCoords({...boxCoords, long1: centerCoords.long - tempWidth, long2: centerCoords.long + tempWidth});
    }, [mileWidth]);

    // This is for the height text field update
    useEffect(() => {
      var tempHeight = 0;
      if (mileHeight < 0) {
        setMileHeight(0);
      } else {
        tempHeight = ((mileHeight / earthLongMiles) * 360)/2;
      }
      setHeight(tempHeight);
      setBoxCoords({...boxCoords, lat1: centerCoords.lat - tempHeight, lat2: centerCoords.lat + tempHeight});
    }, [mileHeight]);

    // Latitude updates, updates all coordinates
    useEffect(() => {
      var val = parseFloat(latitude);
      if (!isNaN(val)) {
        setCenterCoords({...centerCoords, lat: val})
        setBoxCoords({...boxCoords, lat1: val - height, lat2: val + height});
      }
    }, [latitude]);

    // Longitude updates
    useEffect(() => {
      var val = parseFloat(longitude);
      if (!isNaN(val)) {
        setCenterCoords({...centerCoords, long: val})
        setBoxCoords({...boxCoords, long1: val - width, long2: val + width});
      }
    }, [longitude]);

    function showTooltip2(text) {
        var tooltip = document.getElementById("tooltip2");
        tooltip.innerHTML = text;
    }

    // This for when the user clicks on the map. Updates center
    const handleRectangleClick = (event) => {
      const { lat, lng } = event.latlng;
      setCenterCoords({lat: lat, long: lng});
      setLatitude(lat);
      setLongitude(lng);
      setBoxCoords({lat1: lat - height, lat2:lat + height, long1:lng - width, long2:lng + width})
    }

    /* Full post request for creating a region, accepts within 100 miles each side*/
    const handleRegionAdd = async (e) => {
      if (mileHeight > 100 || mileWidth > 100) {
        e.preventDefault();
        setMessage("Make sure the width and height are within 100 miles.");
        setSuccess(false);
        setRegionLoading(false);
        setShow(true);
      } else {
        e.preventDefault();
        setRegionLoading(true);
        const data = {
              name: name,
              lat1: boxCoords.lat1,
              lat2: boxCoords.lat2,
              long1: boxCoords.long1,
              long2: boxCoords.long2,
          };
        if (name !== "") {
          axios
            .post(`${process.env.REACT_APP_API_URL}/add-region`, data, {
                headers: {
                    Authorization: "Bearer " + user.token,
                },
            }).then((response) => {
              setRegionId(response.data.id);
              setRegionName(response.data.name);
              setSuccess(true);
              setMessage("Successfully Created Region.")
              setRegionLoading(false);
            })
            .catch((error) => {
                setSuccess(false);
                setRegionLoading(false);
                setMessage("Couldn't create region. Make sure the name is unique.");
            });
          setRegionLoading(false);
          setShow(true);
        } else {
          setSuccess(false);
          setRegionLoading(false);
          setMessage("Enter a unique name for the region.")
          setShow(true);
        }
      }
    };


    if (user.role === "moderator" || user.role === "general") {
        return (
            <div className="page-container gradient-background">
                <div className="region-upload-pop-up-container">
                    <PopUp open={show} message={message} onClose={() => setShow(false)} success={success} regionId={regionId} regionName={regionName} loading={regionload}/>
                </div>
                <NavBarTop user={user}/>
                <div className="title-region"><h2 style={{margin: 0}}>Create Region</h2></div>
                {/*This is the map component for placing the region box, it changes the center and bounds
                based on the changes in state for the coordinate variables.*/}
                <div className="region-creation-map">
                    <MapContainer
                      center={[centerCoords.lat, centerCoords.long]}
                      zoom={initialZoom}
                      ref={mapRef}
                      maxBounds={[[-180, -180], [180, 180]]}
                      style={{
                        height: "100%",
                      width: "100%",
                      borderRadius: "12px"}}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        minZoom="2"
                      />
                      <Rectangle
                        bounds={[
                          [boxCoords.lat1, boxCoords.long1],
                          [boxCoords.lat2, boxCoords.long2],
                        ]}
                        pathOptions={{
                          color: "green",
                          weight: 2,
                          opacity: 0.6,
                        }}/>
                      <Rectangle
                        bounds={[
                          [-180, -180],
                          [180, 180],
                        ]}
                        pathOptions={{
                          weight: 0,
                          opacity: 0,
                        }}
                        eventHandlers={{ click: handleRectangleClick }}
                      />


                      <Marker
                        position={[centerCoords.lat, centerCoords.long]}
                        icon={L.divIcon({
                          html:
                            `<svg fill="#000000" width="25px" height="25px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <title>map-marker</title>
                            <path d="M8.16 26.96c-0.88 0-1.64-0.4-2.040-1.080l-5.040-9c-0.68-1.16-1.080-2.52-1.080-3.92 0-4.36 3.68-7.92 8.16-7.92 4.52 0 8.16 3.56 8.16 7.92 0 1.4-0.4 2.76-1.12 3.96l-4.96 8.92c-0.44 0.72-1.2 1.12-2.080 1.12zM8.16 6.72c-3.56 0-6.48 2.8-6.48 6.24 0 1.080 0.28 2.16 0.88 3.12l5.040 8.96c0.080 0.16 0.32 0.24 0.6 0.24s0.52-0.12 0.6-0.28l5-8.92c0.56-0.96 0.88-2.040 0.88-3.12-0.040-3.44-2.92-6.24-6.52-6.24zM8.16 16.16c-1.64 0-2.96-1.36-2.96-2.96 0-1.64 1.32-2.96 2.96-2.96s2.96 1.32 2.96 2.96c0 1.6-1.32 2.96-2.96 2.96zM8.16 11.92c-0.72 0-1.28 0.56-1.28 1.28s0.56 1.28 1.28 1.28 1.28-0.56 1.28-1.28-0.56-1.28-1.28-1.28z"></path>
                            </svg>`,
                          iconAnchor: [6, 20],
                          popupAnchor: [10, 10],
                          className: "dummy"
                        })}
                      >

                      </Marker>

                    </MapContainer>
                  </div>
                <div className="region-creation">
                    <div className="background-box">
                        <div className="tooltip-container">
                            <div className="question-icon" onMouseOver={() => showTooltip2('Type in the degree coordinates of the corners of the region you want to create, or click on the map to place the center of the box.')}>
                                <b>?</b>
                            </div>
                            <div className="tooltip" id="tooltip2"></div>
                        </div>


                        {/*
            Type in the center for the box of the region you want to create.*/}
                        <div className="region-upload-form">
                            <form onSubmit={handleRegionAdd}>
                                <div className="center">
                                    <label>Region Name:</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="corner1-container">
                                <h5 style={{marginBottom:0}}>Enter latitude and longitude for the center of the region, or click on the map.</h5>
                                    <label>Latitude:</label>
                                    <input
                                        type="text"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        required
                                    />
                                    <label>Longitude:</label>
                                    <input
                                        type="text"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        required
                                    />
                                </div>
                                <h5 style={{marginBottom:0}}>Enter width and height for map region boundary creation. (Max 100 miles)</h5>
                                <div>
                                    <label>Width (mi):</label>
                                    <input
                                        type="number"
                                        value={mileWidth}
                                        onChange={(e) => setMileWidth(e.target.value)}
                                    />
                                    <label>Height (mi):</label>
                                    <input
                                        type="number"
                                        value={mileHeight}
                                        onChange={(e) => setMileHeight(e.target.value)}
                                    />
                                </div>
                                <div className="image-upload-button center">
                                    <button className="button-style" type="submit">
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default RegionUpload;