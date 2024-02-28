import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "./style/multi-image-upload.css";
import "./style/global.css";
import PopUp from "./pop-up";
import { useNavigate } from 'react-router-dom';
import NavBarTop from './navbar';
import Select from "react-select";

/*Mass File Upload Component*/
const MultiUpload = ({ user }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [regions, setRegions] = useState([]);

  // For Pop Up
  const [message, setMessage] = useState("Upload an image first (format PNG or JPG).");
  const [show, setShow] = useState(false);
  const [regionId, setRegionId] = useState(-1);
  const [regionName, setRegionName] = useState("");
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

  const hiddenFileInput = useRef(null);

  const handleClick = event => {
    hiddenFileInput.current.click();
  };

  // For file upload and file change, handling file selection and removal
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };

  const handleSelectionChange = (selectedOptions) => {
    if (selectedOptions.length > 0) {
      setRegionId(selectedOptions[0].id);
      setRegionName(selectedOptions[0].name);
      setSelectedOptions(selectedOptions);
    } else {
      setRegionId(-1);
      setRegionName();
      setSelectedOptions([]);
    }
  };

  // Get request for getting the region list for drop down
  useEffect(() => {
    if (user.username === "") {
      navigate("/");
    }
    axios
      .get(`${process.env.REACT_APP_API_URL}/get-regions`, {})
      .then((response) => {
        setRegions(response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  // Form Submit post request for uploading all photos. Returns a valid and invalid list in the
  // pop up message
  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      try {
        let postregions = "";
        // Formatting region selection
        if (selectedOptions.length > 0) {
          const selectedRegions = [];
          for (let i = 0; i < selectedOptions.length; i++) {
            selectedRegions.push(selectedOptions[i].id);
          }
          postregions = selectedRegions.toString().replace("[", "").replace("]", "");
          console.log(postregions);
        } else {
          postregions = "-1";
        }
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });

        formData.append('region_ids', postregions);

        setLoading(true);
        axios
          .post(
            `${process.env.REACT_APP_API_URL}/upload-multi-photo`,
            formData, {
            headers: {
              Authorization: "Bearer " + user.token,
            },
          },
          ).then((response) => {
            console.log(response.data.valid_uploads)
            setMessage(`Successful Uploads:\n${response.data.valid_uploads.join("\n")}\n\nInvalid Uploads: \n${response.data.invalid_uploads.join("\n")}`);
            setShow(true);
          });
        // Add uploaded files to the list
        // setUploadedFiles([...uploadedFiles, ...response.data]);
        // Clear selected files
        setSelectedFiles([]);
        setSelectedOptions([]);
        setLoading(false);
      } catch (error) {
        console.error('Error uploading files', error);
        setMessage(`Error uploading files:${error}`);
        setShow(true);
      }
    } else {
      setShow(true);
    }
  };

  return (
    <div className="multi-upload-page-container gradient-background">
      <NavBarTop user={user} />
      <div className="pop-up-container">
        <PopUp open={show} onClose={() => { setShow(false); setMessage("Upload an image first (format PNG or JPG)."); }} message={message} success={false} regionId={regionId} regionName={regionName} loading={loading} />
      </div>
      <h2 style={{ margin: 0, paddingTop: "50px" }}>Mass Upload</h2>
      <div className="center-input">
        <button className="button-style" onClick={handleClick}>Choose Files</button>
        <input style={{ display: "none" }} className="input-multiple" type="file" ref={hiddenFileInput} multiple onChange={handleFileChange} />
      </div>
      {/*Select Drop Down*/}
      <div style={{ width: "80%", paddingLeft: "10%" }}>
        <Select className="selectbar"
          options={regions}
          isMulti
          value={selectedOptions}
          onChange={handleSelectionChange}
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.id}
          placeholder="Pick Region(s), leave blank to upload to all regions"
          required
        />
        <div className="center-input">
          <button className="button-style" onClick={handleUpload}>Upload</button>
        </div>
      </div>
      {/*Image Table, has previews and remove buttons for each.*/}
      <div style={{ width: "80%", marginLeft: "10%", paddingBottom: "5%" }}>
        <table className="moderator-sizing background-box">
          <thead>
            <tr>
              <th className="mod-spacing">File Name</th>
              <th className="mod-spacing">Image</th>
              <th className="mod-spacing">Remove?</th>
            </tr>
          </thead>
          <tbody>
            {selectedFiles.map((file, index) => (
              <tr key={index} className="image-preview">
                <td className="mod-spacing">{file.name}</td>
                <td className="mod-spacing">{<img
                  src={URL.createObjectURL(file)}
                  alt={`Preview-${index}`}
                  className="preview-image"
                />}</td>
                <td className="mod-spacing">{<button className="button-style" onClick={() => handleRemoveFile(index)}>Remove</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MultiUpload;