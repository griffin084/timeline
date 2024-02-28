import React from 'react';
import "./style/global.css";
import { ThreeDots } from "react-loader-spinner";
import { useNavigate } from 'react-router-dom';

/* Pop Up component script, used in Image Upload, Multi Upload, region creation, and region list
  page.*/
const PopUp = ({ open, onClose, message, success, regionId, regionName, loading }) => {
    const navigate = useNavigate();
    // This wrap variable is for when I need to display responses from backend containing
    // new line characters, which the html tags cannot display, and need a textarea tag for
    var wrap = false;
    if (message.includes("\n")) wrap = true;
    if (!open) return null;
    else {
      return (
        <div className="pop-up-overlay">
          <div className="pop-up-modal-container">
            <p onClick={onClose} className="close-btn" style={{color: "black", fontFamily: "Calibri", cursor: "pointer", position: "absolute", top: "10px", right: "10px", margin: "0 auto"}}>
              X
            </p>
            <div className="pop-up-content">
                {wrap? (<textarea style={{height: "10vh"}}value={message}></textarea>) : message}
            {/*Spinner for loading animation*/}
            <div className="loading-spinner"
            style={{textAlign: "center"}}>
            <ThreeDots
              height={50}
              width={50}
              radius={9}
              color="#3498db"
              ariaLabel="three-dots-loading"
              visible={loading}
              style={{                
              }}
            />
          </div>
            
            </div>

            <div className="bottom-button" style={{ width: "100%", position: "absolute", bottom: "5px", left: "5px"}}>
              <button
                className="button-style"
                type="button"
                onClick={onClose}
              >
                Close
              </button>
            </div>
            {/*This is for when the page needs a "to region" button*/}
                {success && (
                  <button
                    className="button-style"
                    type="button"
                    style={{position: "absolute", right: "5px", bottom: "5px"}}
                    onClick={() => navigate(`/region/${regionId}`)}
                  >
                    To Region {regionName}
                  </button>
                )}
          </div>
        </div>
      )
    }
};
export default PopUp;