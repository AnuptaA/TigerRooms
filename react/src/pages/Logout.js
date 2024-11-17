import React, { useState, useEffect } from "react";
import "../App.css";

const Logout = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [message, setMessage] = useState("Error, please try again");

  useEffect(() => {
    fetch(`/api/logoutcas`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        window.location.href = data.logout_url; // Redirect to logout URL
        setMessage(data.message);
      })
      .catch((err) => {
        console.error("Error during logout:", err);
        alert("Something went wrong. Please try again.");
      });
  }, [apiUrl]);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default Logout;
