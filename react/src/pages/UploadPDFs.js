import React, { useState } from "react";
import image from "../img/misc/upload-file-svgrepo-com.svg";
import "../App.css";

const UploadPDFs = () => {
  const [fileName, setFileName] = useState("No file selected");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file ? file.name : "");
  };

  const handleDivClick = () => {
    document.getElementById("upload-pdf").click();
  };

  return (
    <>
      <div className="pdf-upload-page-cont">
        <h1 id="pdf-upload-text">
          Upload the latest PDF here! Our students will thank you!
        </h1>
        <div id="upload-pdfs-cont">
          <form id="pdf-form">
            <div id="file-upload" onClick={handleDivClick}>
              <label htmlFor="upload-pdf">
                <img src={image} alt="Upload" />
                <span className="pdf-text"> Drag &amp; Drop </span>
                <span className="pdf-text"> or browse</span>
              </label>
              <input
                type="file"
                id="upload-pdf"
                name="rooms-pdf"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <small>Supports: PDF</small>
              <div className="uploaded-file-name">
                <span>Uploaded file:</span>&nbsp;<span>{fileName}</span>
              </div>
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default UploadPDFs;
