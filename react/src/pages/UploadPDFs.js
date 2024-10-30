import React, { useState } from "react";
import image from "../img/misc/upload-file-svgrepo-com.svg";
import "../App.css";

const UploadPDFs = () => {
  const [fileName, setFileName] = useState("No file selected");
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFileName(selectedFile ? selectedFile.name : "No file selected");
    setFile(selectedFile || null);
  };

  const handleDivClick = () => {
    document.getElementById("upload-pdf").click();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("rooms-pdf", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/uploadpdf", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      // debugging
      console.log("The file is " + file);
      alert("An error occurred while uploading the file.");
    }
  };

  return (
    <div className="pdf-upload-page-cont">
      <h1 id="pdf-upload-text">
        Upload the latest PDF here! Our students will thank you!
      </h1>
      <div id="upload-pdfs-cont">
        <form id="pdf-form" onSubmit={handleSubmit}>
          <div id="file-upload" onClick={handleDivClick}>
            <label htmlFor="upload-pdf">
              <img src={image} alt="Upload" />
              <span className="pdf-text"> Drag & Drop </span>
              <span className="pdf-text"> or browse</span>
            </label>
            <input
              type="file"
              id="upload-pdf"
              name="rooms-pdf"
              accept=".pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
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
  );
};

export default UploadPDFs;
