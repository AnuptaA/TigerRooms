import React, { useState, useEffect } from "react";
import "../App.css";

const Footer = () => {
  const [date, setDate] = useState(""); // State to store the updated time
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Fetch the updated time when the component mounts
    const fetchDate = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/getupdatedtime`, {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          setDate(data.timestamp); // Assuming the API returns a timestamp field
        } else {
          console.error("Error fetching date:", response.status);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchDate();
  }, [apiUrl]); // Run effect when the component mounts or when apiUrl changes

  return (
    <footer>
      <img id="lockup" src="/misc/PU_lockup.png" alt="lockup" />
      <div id="middle-text-cont">
        <ul>
          <li id="update-text">
            Last Updated:{" "}
            <span id="timestamp">{date ? date : "Loading..."}</span>
          </li>
          <li>Website created by TigerRooms group (COS333 Fall '24 Project)</li>
        </ul>
      </div>
      <div className="right-text-cont">
        <p>TigerRooms</p>
        <p>© 2024 The Trustees of Princeton University</p>
        <p>
          <a href="https://www.princeton.edu/content/copyright-infringement">
            Copyright Infringement{" "}
          </a>{" "}
          |
          <a href="https://www.princeton.edu/privacy-notice">
            {" "}
            Privacy Notice{" "}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
