// import "leaflet/dist/leaflet.css";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import './style/moderator.css';
import NavBarTop from "./navbar";
import {
  MapContainer,
  TileLayer,
  Rectangle,
} from "react-leaflet";
import { CookiesProvider, useCookies } from "react-cookie";


// This page allows moderators to view requested images and regions uploaded by general users.
// The region it's requested to get added to, latitude, longitude, regionID, time, and direction
// are displayed for the image metadata.
//The region name, regionID, and 2 corner (latitude, longitude) points are displayed for 
// region metadata.
function ModeratorPage({ user }) {
  let params = useParams();
  const [photoRequests, setPhotoRequests] = useState([]);
  const [regionRequests, setRegionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageIndex, setUploadedImageIndex] = useState(-1);
  const [uploadedRegion, setUploadedRegion] = useState(null);
  const [centerPoint, setCenterPoint] = useState([]);
  const [uploadedRegionIndex, setUploadedRegionIndex] = useState(null);
  const [regions, setRegions] = useState([]);
  const initialZoom = 10;

  //used to center the map on the region
  const mapRef = useRef();

  // used to create the rectangle for the region
  const [rectangleOptions] = useState({
    color: "blue",
    weight: 2,
    opacity: 0.8,
  });

  // GET API: gets the unverified photos and stores it in photoRequests
  useEffect(() => {
    const apiUrl = `${process.env.REACT_APP_API_URL}/get-unverified-photos`;
    axios
      .get(apiUrl, {
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      }).then((response) => {
        setPhotoRequests(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching photos:", error);
        setLoading(false);
      });
  }, []);

  // GET API: gets the unverified regions and stores it in regionRequests
  useEffect(() => {
    const apiUrl = `${process.env.REACT_APP_API_URL}/get-unverified-regions`;
    axios
      .get(apiUrl, {
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      }).then((response) => {
        setRegionRequests(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching photos:", error);
        setLoading(false);
      });
  }, []);

  // GET API: gets all regions and stores it in regions
  useEffect(() => {
    const apiUrl = `${process.env.REACT_APP_API_URL}/get-regions`;
    axios
      .get(apiUrl)
      .then((response) => {
        setRegions(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching regions:", error);
        setLoading(false);
      });
  }, []);

  // Handles photo verification
  // Given a photo, it will do a GET API call, setting verified to true
  const HandlePhotoVerify = async (photo) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/verify-photo/${photo.id}`, {
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      }).then((response) => {
        console.log("Verify request");
      })
      .catch((error) => {
        console.error("Verify failed");
      });
    window.location.reload();
  };

  // Handles photo deletion
  // Given a photo, does a DELETE API call, removing photo from database
  const HandlePhotoDeny = async (photo) => {
    await axios
      .delete(`${process.env.REACT_APP_API_URL}/delete-photo/${photo.id}`, {
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      }).then((response) => {
        console.log("DELETE request");
      })
      .catch((error) => {
        console.error("DELETE failed");
      });
    window.location.reload();
  };

  // Handles region verification
  // Given a region, it will do a GET API call, setting verified to true
  const HandleRegionVerify = async (region) => {
    await axios
      .get(`${process.env.REACT_APP_API_URL}/verify-region/${region.id}`, {
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      }).then((response) => {
        console.log("Verify request");
      })
      .catch((error) => {
        console.error("Verify failed");
      });
    window.location.reload();
  };

  // Handles region deletion
  // Given a region, does a DELETE API call, removing photo from database
  const HandleRegionDeny = async (region) => {
    await axios
      .delete(`${process.env.REACT_APP_API_URL}/delete-region/${region.id}`, {
        headers: {
          'Authorization': 'Bearer ' + user.token
        }
      }).then((response) => {
        console.log("DELETE request");
      })
      .catch((error) => {
        console.error("DELETE failed");
      });
    window.location.reload();
  };

  //API GET call to display specific image
  const ShowImage = async (photo) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/get-single-photo/${photo.id}`
      );
      if (res.ok) {
        const blob = await res.blob();
        setUploadedImage(URL.createObjectURL(blob));
        setUploadedImageIndex(photo.id);
      }
    } catch (error) {
      console.error(`No photo found with ID:${photo.id}`);
    }
  };

  // calculates the center of the map based on the 2 corner lat/long points
  const calculateCenter = (la1, la3, lo1, lo3) => {
    const center = [(la1 + la3) / 2, (lo1 + lo3) / 2];
    return center;
  };

  // API get call to show region
  const ShowRegion = async (region) => {
    console.log(region.id);
    const apiUrl = `${process.env.REACT_APP_API_URL}/get-single-region/${region.id}`;
    axios
      .get(apiUrl)
      .then((response) => {
        setUploadedRegion(response.data);
        setUploadedRegionIndex(response.data.id);
        setCenterPoint(calculateCenter(response.data.lat1, response.data.lat2, response.data.long1, response.data.long2));
        const center = calculateCenter(response.data.lat1, response.data.lat2, response.data.long1, response.data.long2);
        mapRef.current.setView(center, initialZoom);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Markers:", error);
        setLoading(false);
      });
  };

  // gets the name of the region for photo requests
  const getRegionName = (id) => {
    for (let i = 0; i < regions.length; i++) {
      if (regions[i].id === id) {
        return regions[i].name;
      }
    }
  };

  // Moderator Page
  return (
    <div id="main-mod-div" className="gradient-background">
      <div>
        <div className="image-container">
          <NavBarTop user={user} />
          <div className="blank-space"></div>
          <h2>Moderator Page </h2>
        </div>
        <div className="split">
          <h3 className="mod-title">Photo Requests</h3>
          {photoRequests.length === 0 ? (
            <p className="mod-title">No Photo Requests!</p>
          ) : (
            <div className="background-box">
              {/* table for the image upload requests */}
              <table className="moderator-sizing">
                <thead>
                  <tr>
                    <th className="mod-spacing">Region Name</th>
                    <th className="mod-spacing">Latitude</th>
                    <th className="mod-spacing">Longitude</th>
                    <th className="mod-spacing">RegionID</th>
                    <th className="mod-spacing">Time</th>
                    <th className="mod-spacing">Direction</th>
                    <th className="mod-spacing">Actions</th>
                    <th className="mod-spacing">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {photoRequests.map((photo) => (
                    <tr key={photo.id}>
                      <td className="mod-spacing">{getRegionName(photo.region_id)}</td>
                      <td className="mod-spacing">{photo.lat.toFixed(4)}</td>
                      <td className="mod-spacing">{photo.long.toFixed(4)}</td>
                      <td className="mod-spacing">{photo.region_id}</td>
                      <td className="mod-spacing">{photo.time.replace('T', ' ')}</td>
                      <td className="mod-spacing">{photo.direction}</td>
                      <div className="mod-spacing">
                        <td className="button-stack expand-box">
                          <button className="button-style" onClick={() => HandlePhotoVerify(photo)}>Verify</button>
                          <button className="button-style" onClick={() => HandlePhotoDeny(photo)}>Delete/Deny</button>
                          <button className="button-style" onClick={() => ShowImage(photo)}>View Image</button>
                        </td>
                      </div>
                        <td className="mod-spacing">
                          {uploadedImage && uploadedImageIndex === photo.id && (
                            <div className="uploadedImage">
                              <img className="mod-uploadedImage"
                                src={uploadedImage}
                                alt=""

                              />
                            </div>
                          )}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="mod-title">Region Requests</h3>
          {regionRequests.length === 0 ? (
            <p className="mod-title">No Region Requests!</p>
          ) : (
            <div className="background-box">
              {/* table for the region upload requests */}
              <table>
                <thead>
                  <tr>
                    <th className="mod-spacing">Region Name</th>
                    <th className="mod-spacing">RegionID </th>
                    <th className="mod-spacing">Corner 1 Latitude</th>
                    <th className="mod-spacing">Corner 1 Longitude</th>
                    <th className="mod-spacing">Corner 2 Latitude</th>
                    <th className="mod-spacing">Corner 2 Longitude</th>
                    <th className="mod-spacing">Actions</th>
                    <th className="mod-spacing">Region</th>
                  </tr>
                </thead>
                <tbody>
                  {regionRequests.map((region) => (
                    <tr key={region.id}>
                      <td className="mod-spacing">{region.name}</td>
                      <td className="mod-spacing">{region.id}</td>
                      <td className="mod-spacing">{region.lat1.toFixed(4)}</td>
                      <td className="mod-spacing">{region.long1.toFixed(4)}</td>
                      <td className="mod-spacing">{region.lat2.toFixed(4)}</td>
                      <td className="mod-spacing">{region.long2.toFixed(4)}</td>
                      <div className="mod-spacing">
                      <td className="button-stack expand-box">
                          <button className="button-style" onClick={() => HandleRegionVerify(region)}>Verify</button>
                          <button className="button-style" onClick={() => HandleRegionDeny(region)}>Delete/Deny</button>
                          <button className="button-style" onClick={() => ShowRegion(region)}>View Region</button>
                        </td>
                      </div>
                        <td className="mod-spacing">
                          <div className="mod-map-spacing">
                            {uploadedRegion && uploadedRegionIndex === region.id && uploadedRegion.lat1 && uploadedRegion.lat2 && uploadedRegion.long1 && uploadedRegion.long2 && (
                              <MapContainer
                                center={calculateCenter(uploadedRegion.lat1, uploadedRegion.lat2, uploadedRegion.long1, uploadedRegion.long2)}
                                zoom={initialZoom}
                                ref={mapRef}
                                style={{ height: "27vh", width: "27vh" }}
                              >
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {/* Add a rectangle to the map */}
                                <Rectangle
                                  bounds={[
                                    [uploadedRegion.lat2, uploadedRegion.long1],
                                    [uploadedRegion.lat1, uploadedRegion.long2],
                                  ]}
                                  pathOptions={rectangleOptions}
                                />
                              </MapContainer>)}
                          </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeratorPage;
