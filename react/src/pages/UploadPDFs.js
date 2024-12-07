import React, { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import image from "../img/misc/upload-file-svgrepo-com.svg";
import AdminAccessOnly from "../Components/AdminAccessOnly";
import "../App.css";

const UploadPDFs = ({ adminStatus, adminToggle }) => {
  // displayed pdf filename and file itself
  const [fileName, setFileName] = useState("No file selected");
  const [file, setFile] = useState(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const MySwal = withReactContent(Swal);

  // get uploaded file, set filename and file
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFileName(selectedFile ? selectedFile.name : "No file selected");
    setFile(selectedFile || null);
  };

  // make entire dashed box clickable
  const handleDivClick = () => {
    document.getElementById("upload-pdf").click();
  };

  const handleReset = async (event) => {
    event.preventDefault();

    // Show confirmation dialog
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, reset it!",
    }).then(async (result) => {
      // If confirmed, proceed with reset
      if (result.isConfirmed) {
        // Show loading message
        MySwal.fire({
          title: "Loading...",
          html: "Please wait a moment.",
          allowOutsideClick: false,
        });
        MySwal.showLoading();

        // Perform reset action
        const formData = new FormData();
        formData.append("request-type", 0); // request type for reset action

        try {
          const response = await fetch("/api/uploadpdf", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();

          // Hide loading message
          MySwal.hideLoading();

          if (response.ok) {
            MySwal.fire({
              title: "Reset Complete!",
              text: result.message,
              icon: "success",
            });
          } else {
            MySwal.fire({
              icon: "error",
              title: "Oops...",
              text: result.error,
            });
          }
        } catch (error) {
          MySwal.fire({
            icon: "error",
            title: "Oops...",
            text: "An error occurred while resetting the file.",
          });
        }
      }
    });
  };

  // wait for user to submit
  const handleSubmit = async (event) => {
    // prevent default and multiple submission
    event.preventDefault();
    if (!canSubmit) return;

    setCanSubmit(false);
    MySwal.fire({
      title: "Loading...",
      html: "Please wait a moment.",
      allowOutsideClick: false,
    });
    MySwal.showLoading();

    if (!file) {
      //   alert("Please select a file to upload.");
      MySwal.hideLoading();
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select a file to upload.",
      });
      setCanSubmit(true);
      return;
    }

    // store file into FormData object
    const formData = new FormData();
    formData.append("request-type", 1); // request type
    formData.append("rooms-pdf", file); // file

    // send POST request with file
    try {
      const response = await fetch("/api/uploadpdf", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      // display server response
      MySwal.hideLoading();
      if (response.ok) {
        MySwal.fire({
          title: "Thank you!",
          text: result.message,
          icon: "success",
        });
      } else {
        MySwal.fire({
          icon: "error",
          title: "Oops...",
          text: result.error,
        });
      }
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "An error occurred while uploading the file.",
      });
    }
    setCanSubmit(true);
  };

  return adminStatus && !adminToggle ? (
    <div className="pdf-upload-page-cont">
      <h1 id="pdf-upload-text">
        Upload the latest PDF here! Our students will thank you!
      </h1>
      <div id="file-links" style={{ marginTop: "2rem", textAlign: "center" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>
          Please refer to the following PDF format, generated from the sample
          Excel file:
        </h2>
        <ul style={{ listStyleType: "none", padding: "0" }}>
          <li style={{ marginBottom: "1rem" }}>
            <h3 style={{ margin: "0", textAlign: "center" }}>
              <a
                href={require("../img/misc/Excel_Sample.xlsx")}
                download="Excel_Sample.xlsx"
                style={{
                  textDecoration: "none",
                  color: "#007bff",
                }}
              >
                Excel_Sample.xlsx
              </a>
            </h3>
          </li>
          <li>
            <h3 style={{ margin: "0", textAlign: "center" }}>
              <a
                href={require("../img/misc/PDF_Sample.pdf")}
                download="PDF_Sample.pdf"
                style={{
                  textDecoration: "none",
                  color: "#007bff",
                }}
              >
                PDF_Sample.pdf
              </a>
            </h3>
          </li>
        </ul>
      </div>

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
      <div>
        <button id="reset-pdf-btn" onClick={handleReset}>
          Reset Database
        </button>
      </div>
    </div>
  ) : (
    <AdminAccessOnly />
  );
};

export default UploadPDFs;
