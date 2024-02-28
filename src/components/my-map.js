import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Rectangle,
} from "react-leaflet";
import NavBarTop from "./navbar";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./style/my-map.css";
import "./style/global.css";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

/* This page is for dynamically displaying each region, a parameter is passed in the url for the 
  corresponding region id. Markers representing each image are displayed on the map, and are
  clickable to go to the image display. */
function MyMap({ user }) {
  let params = useParams();
  const [region, setRegion] = useState([]);

  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState([]);
  const [dates, setDates] = useState([
    new Date("2002-01-01"),
    new Date("2023-12-31"),
  ]);
  const [maxDate, setMaxDate] = useState("");
  const [minDate, setMinDate] = useState("");
  const initialZoom = 14;

  const mapRef = useRef();
  const markerRef = useRef();
  const [loadingMap, setLoadingMap] = useState(true);

  const navigate = useNavigate();

  const dateToValue = (date) => date.getTime();

  const valueToDate = (value) => new Date(value);  

  const calculateCenter = (la1, la3, lo1, lo3) => {
    const center = [(la1 + la3) / 2, (lo1 + lo3) / 2];
    return center;
  };

  const handleMarkerClick = (markerId) => {
    const localDates = dates.map(date => date.toLocaleDateString());
    const datesFiltered = localDates.join("_").replace(/\//g, '-');
    navigate(`/region/scroller/${params.regionId}/${markerId}/${datesFiltered}`);
    //navigate(`/region/${params.regionId}/slider`);
  };

  /*Get region information for the single region*/
  useEffect(() => {
    if (user.username === "") {
      navigate("/");
    }

    fetch(`${process.env.REACT_APP_API_URL}/get-single-region/${params.regionId}`, {})
      .then((res) => res.json())
      .then((response) => {
        setRegion(response);
        setLoading(false);
        setLoadingMap(false);
      })
      .catch((error) => console.log(error));
      setLoadingMap(false);
  }, [params.regionId, user, navigate]);

  /*API Call for getting all the markers*/
  useEffect(() => {
    const apiUrl = `${process.env.REACT_APP_API_URL}/get-photos-sorted-date/${params.regionId}`;
    axios
      .get(apiUrl)
      .then((response) => {
        setMarkers(response.data);
        setMinDate(response.data[0].time);
        setMaxDate(response.data[response.data.length - 1].time);
        setLoading(false);
        setLoadingMap(false);
      })
      .catch((error) => {
        console.error("Error fetching Markers:", error);
        setLoading(false);
        setLoadingMap(false);
      });
  }, [params.regionId]);

  /* Slider time filtering implemented here */
  const lowerTime = new Date(dates[0]).getTime();
  const upperTime = new Date(dates[1]).getTime();
  const filtered = markers.filter((marker) => {
    const markerTime = new Date(marker.time).getTime();
    return markerTime >= lowerTime && markerTime <= upperTime;
  });

  const handleSliderChange = (event, newVal) => {
    const newDateRange = newVal.map((value) => valueToDate(value));
    setDates(newDateRange);
  };

  const incrementedMaxDate = new Date(maxDate);
  incrementedMaxDate.setDate(incrementedMaxDate.getDate() + 2);
  const incrementedMinDate = new Date(minDate);
  incrementedMinDate.setDate(incrementedMinDate.getDate() - 1);

  /* Map centering button onClick */
  function handleMapCenter() {
    var center = calculateCenter(
      region.lat1,
      region.lat2,
      region.long1,
      region.long2
    );
    mapRef.current.setView(center, initialZoom);
  }

  /* Markers displayed on map */
  const marks = markers.map((marker) => ({
    value: new Date(marker.time).getTime(),
    label: '',
  }));


  return (
    <div className="my-map gradient-background">
      <NavBarTop user={user}/>
      <div className="map-region-title">
        <h2 className="center">Region: {region.name}</h2>
      </div>
      <div className="map-and-buttons-body">
        {/*Leaflet map componenet*/}
        <div className="full-map-container">
          {region && region.lat1 && region.lat2 && region.long1 && region.long2 && (
            <MapContainer
              center={calculateCenter(
                region.lat1,
                region.lat2,
                region.long1,
                region.long2
              )}
              zoom={initialZoom}
              ref={mapRef}
              maxBounds={[[-180, -180], [180, 180]]}
              style={{ height: "100%", width: "100%", borderRadius: "12px"}}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

                    <Rectangle
                      bounds={[
                        [region.lat2, region.long1],
                        [region.lat1, region.long2],
                      ]}
                      pathOptions={{
                        color: "blue",
                        weight: 2,
                        opacity: 0.8,
                      }}
                    />

                    {filtered.map((marker) => (
                      <Marker
                        ref={markerRef}
                        key={marker.id}
                        position={[marker.lat, marker.long]}
                        icon={L.divIcon({
                          html: `
                        <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                        width="30px" height="60px" transform="rotate(${marker.direction})" viewBox="0 0 100 100" enable-background="new 0 0 64 64" xml:space="preserve">
                    <path fill="#231F20" d="M55.639,46.344L35.641,2.342c-0.648-1.426-2.07-2.344-3.642-2.344c-1.57,0-2.992,0.918-3.641,2.344
                      l-20,44.001c-0.562,1.238-0.457,2.68,0.277,3.82C9.374,51.309,10.64,52,11.999,52h16v8c0,2.211,1.789,4,4,4
                      C34.211,64,36,62.211,36,60v-8h15.998c1.359,0,2.625-0.691,3.367-1.836C56.1,49.023,56.201,47.582,55.639,46.344z"/>
                    </svg>
                    `,
                          className: "direction-icon",
                          iconAnchor: [15, 30],
                          popupAnchor: [0, -30],
                        })}
                        eventHandlers={{
                          click: () => handleMarkerClick(marker.id),
                          mouseover: () => {
                            if (markerRef) markerRef.current.openPopup();
                          },
                          mouseout: () => {
                            if (markerRef) markerRef.current.closePopup();
                          },
                        }}
                      >
                    </Marker>
                  ))}
                </MapContainer>
              )}
          </div>
          {/*Time slider, only appears if the region has markers*/}
          <div className="time-slider">
            {markers.length > 1 && (
                <Box sx ={{ width: "100%"}}>
                  <Slider
                    size= "small"
                    height= "4"
                    
                    getAriaLabel={() => "Image Range"}
                    sx={{
                      color: "#1f1f4f",
                      '& .MuiSlider-mark':  {
                        backgroundColor: '#afafaf',
                        height: 20,
                        width: 3,
                      },
                      '& .MuiSlider-valueLabel': {
                        fontSize: 12,
                      },
                    }}
                    
                    value={dates.map(dateToValue)}
                    onChange={handleSliderChange}
                    valueLabelFormat={(value) =>
                      new Date(value).toLocaleDateString()
                    }
                    min={incrementedMinDate.getTime()}
                    max={incrementedMaxDate.getTime()}
                    valueLabelDisplay="on"
                    marks={marks}
                    disableSwap
                  />
                </Box>
            )}
          </div>
          <div className="center-button">
            <button className="button-style" onClick={handleMapCenter}>
              Center Map
            </button>{" "}
            <br />
            <Link to="/regions" className="button-style">
              Back to Homepage
            </Link>
          </div>
        </div>
    </div>
  );
}
export default MyMap;
