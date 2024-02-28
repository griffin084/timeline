import React, { useState, useEffect, useRef } from 'react';
import Slider from '@mui/material/Slider';
import './style/timeline-scroller.css';
import './style/global.css';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Rectangle,
  Circle,
} from "react-leaflet";
import axios from "axios";
import NavBarTop from "./navbar";
import L, { map } from "leaflet";
import { useNavigate } from 'react-router-dom';
import "leaflet/dist/leaflet.css";
import leftArrow from './images/left-arrow.svg';
import rightArrow from './images/right-arrow-svgrepo-com.svg'
import { Link, useParams } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";


function ImageDisplay({ user }) {
  const [images, setImages] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const params = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [region, setRegion] = useState([]);
  const [centerPoint, setCenterPoint] = useState([38, -76]);
  const regionId = params.regionId;
  //const [markers, setMarkers] = useState([]);
  const [tempSliderValue, setTempSliderValue] = useState(1);
  const [mapOn, setMapOn] = useState(false);

  const [imageBlobs, setImageBlobs] = useState([]);
  const [justLoaded, setJustLoaded] = useState(true);

  const initialZoom = 16;

  const mapRef = useRef();

  const navigate = useNavigate();

  const [rectangleOptions] = useState({
    color: "blue",
    weight: 2,
    opacity: 0.8,
  });


  // Getting region info for getting image info
  useEffect(() => {
    if (user.username === '') {
      navigate('/');
    }

    fetch(`${process.env.REACT_APP_API_URL}/get-single-region/${regionId}`)
      .then((res) => res.json())
      .then((response) => {
        setRegion(response);
        console.log(
          `${process.env.REACT_APP_API_URL}/get-single-region/${regionId}`
        );
      })
      .catch((error) => console.log(error));
  }, [regionId, user, navigate]);

  const date = params.dates;

  // All images get request sorted by date, with a date parameter for the filtering
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/get-photos-sorted-date-filtered/${params.regionId}/${date}`)
      .then((response) => {
        setImages(response.data);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  }, [params.regionId, date]);

  // Sets the marker clicked on originally as the intial slide appearance
  useEffect(() => {
    for (let i = 0; i < images.length; i++) {
      if (images[i].id === parseInt(params.imageId)) {
        handleImageShift(i);
      }
    }
  }, [images]);

  // Getting each image and making imageblobs and setting into a react state. 
  useEffect(() => {
    const setSingleImage = async (imageId, index) => {
      await fetch(`${process.env.REACT_APP_API_URL}/get-single-photo/${imageId}`)
      .then(async (res) => {
        if (res.ok) {
          const blob = await res.blob();
          setImageBlobs(arr => [...arr, {id: index, 
                                          blob: URL.createObjectURL(blob)}]);
          }
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
      });
      console.log("IMAGE ID: ", imageId);
    };

    for (let i=0; i<images.length; i++) {
      setSingleImage(images[i].id, i);
    }
  }, [isLoading]);

  // Map toggle
  const onMapShowHide = () => {
    setMapOn(!mapOn);
    console.log("start");
    if (mapOn) {
      setCenterPoint([images[currentImageIndex].lat,images[currentImageIndex].long]);
      mapRef.current.setView([images[currentImageIndex].lat,images[currentImageIndex].long], initialZoom);
    }
  }

  // Centers map around the current marker/image being displayed
  const handleMapCenter = (marker_index) => {
    setCenterPoint([images[marker_index].lat, images[marker_index].long]);
    if (mapOn) {
      mapRef.current.setView([images[marker_index].lat, images[marker_index].long], initialZoom);
    }
  }

  // Slider change on the image display
  const handleSliderChange = async (event, index) => {
    handleImageShift(index-1);
  };

  // Shifts every component including the slider, the image, the map marker, and the date
  const handleImageShift = (index) => {
    setTempSliderValue(index+1); // Update the temporary value
    setCurrentImageIndex(index);
    handleMapCenter(index);
  }


  function valuetext(value) {
    return `${value}`;
  }


  // Slide shifting 
  const rightSlide = () => {
    if (currentImageIndex < imageBlobs.length - 1) {
      handleImageShift(currentImageIndex+1);
    }
  };

  const leftSlide = () => {
    if (currentImageIndex > 0) {
      handleImageShift(currentImageIndex-1);
    }
  };
 
  // This is for sorting the blobs, since they come in the wrong order
  function sortBlobs() {
    if (justLoaded) {
      setImageBlobs(imageBlobs.sort(function(first, second) {
        return first.id - second.id;
      }));
      setJustLoaded(false);
    }
    return imageBlobs;
  };

  // This function is for creating the image slides. They are stacked on top of one another, and
  // are invisible until their index is reached. 
  function ImageSliderDisplay(blobs) {
    blobs = blobs.blobs;
    return (
      <> 
        {blobs.map((blob, index) => {
          return (
          <div key={blob.id} className={currentImageIndex === index ? "slide active-anim" : "slide"}>
            <img
              src={blob.blob}
              
            />
          </div>)})}
        <button className="next btn-slide" onClick={rightSlide} >
          <img src={rightArrow} />
        </button>
        <button className="prev btn-slide" onClick={leftSlide}>
          <img src={leftArrow} />
        </button>
      </>
    )
  }

  
  return (
    <div className="page-container gradient-background">
      <NavBarTop user={user}/>
      {/*The title and text under it*/}
      <div className="image-display-title">
        <h2 style={{display: "block", padding: 0, margin: 0}}>{region.name} Images</h2>
        <h4 style={{padding: 0, margin: 0}}>Displaying images within date range below.</h4>
        <p style={{padding: 0, margin:0}}>{params.dates.replaceAll("-", "/").replace("_", " - ")}</p>
      </div>
      {/*Spinner for loading the images*/}
      <div className="container-slider">
      {(isLoading || imageBlobs.length < images.length) ? ( 
       <div
       style={{
         background: "#bbbbbb",
         display: "flex",
         justifyContent: "center",
         alignItems: "center",
         borderRadius: "20px"
       }}
     >
       <ThreeDots
         height={80}
         width={80}
         radius={9}
         color="#3498db"
         ariaLabel="three-dots-loading"
         visible={isLoading}
       />
     </div>) : 
      (<ImageSliderDisplay blobs={sortBlobs()}/>)
      } 
      </div>
      {/*For when the map is toggled*/}
      {mapOn && (<div className="mini-map-container">
        {region && region.lat1 && region.lat2 && region.long1 && region.long2 && (
          <MapContainer
            //region.lat1, region.lat3, region.long1, region.long3
            center={centerPoint}
            zoom={initialZoom}
            ref={mapRef}
            style={{ height: "40vh", width: "16vw", display: "flex", borderRadius: "15px"}}
            maxBounds={[[-180, -180], [180, 180]]}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Add a rectangle to the map for the region */}
            <Rectangle
              bounds={[
                [region.lat2, region.long1],
                [region.lat1, region.long2],
              ]}
              pathOptions={rectangleOptions}
            />
              <Marker
                key={currentImageIndex}
                position={[images[currentImageIndex].lat, images[currentImageIndex].long]}
                icon={L.divIcon({
                  html: `
                  <svg version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                  width="30px" height="60px" transform="rotate(${images[currentImageIndex].direction})" viewBox="0 0 100 100" enable-background="new 0 0 64 64" xml:space="preserve">
               <path fill="#231F20" d="M55.639,46.344L35.641,2.342c-0.648-1.426-2.07-2.344-3.642-2.344c-1.57,0-2.992,0.918-3.641,2.344
                 l-20,44.001c-0.562,1.238-0.457,2.68,0.277,3.82C9.374,51.309,10.64,52,11.999,52h16v8c0,2.211,1.789,4,4,4
                 C34.211,64,36,62.211,36,60v-8h15.998c1.359,0,2.625-0.691,3.367-1.836C56.1,49.023,56.201,47.582,55.639,46.344z"/>
               </svg>
              `,
                  className: "direction-icon",
                  iconAnchor: [12, 40],
                })}
                eventHandlers={{
                  click: () => handleImageShift(currentImageIndex)
                }}
              >

              </Marker>
            

          </MapContainer>
        )}
      </div>)}

    {/*The slider bar component, uses @mui/Slider*/}
    <div className="slider-bar-container">
      {images.length > 1 && ( <Slider
        aria-label="Picture Slider"
        sx={{
          width: '60%',
          color: '#1f1f4f',
          '& .MuiSlider-mark':  {
            backgroundColor: '#afafaf',
            height: 20,
            width: 3,
          },
        }}
        value={tempSliderValue}
        min={1}
        max={images.length}
        step={1}
        onChange={handleSliderChange}
        getAriaValueText={valuetext}
        valueLabelDisplay='auto'
        marks={true}
      />  )}
    </div>
    {/*This is for disaplying the date, kind of scuffed but it works and displays properly*/}
      {!isLoading && (
      <p>
        {currentImageIndex+1}/{images.length}, {images[currentImageIndex].time.replace("T", ", ")}
      </p>
      )}
      <h5>
        <button className="button-style" onClick={onMapShowHide}>Show/Hide Map</button>
        <Link to={`/region/${params.regionId}`} className="button-style">Back to region</Link>
      </h5>
    </div>
    
  );
}

export default ImageDisplay;