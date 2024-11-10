import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import "../App.css";

const Logout = () => {
  const [message, setMessage] = useState("Error, please try again");

  useEffect(() => {
    fetch("http://localhost:4000/logoutcas", {
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
  }, []);

  //   useEffect(() => {
  //     try {
  //       const response = fetch("http://localhost:4000/logoutcas", {
  //         method: "GET",
  //         credentials: "include", // Include cookies for session management
  //       });

  //       const data = response.json();

  //       if (response.ok && data.status === "success") {
  //         console.log("reaches logout successfully");
  //         // Redirect to the CAS logout URL
  //         window.location.href = data.logout_url;
  //       } else {
  //         setMessage("Logout failed: " + data.message);
  //       }
  //     } catch (error) {
  //       setMessage("Error during logout: " + error.message);
  //     }
  //   }, []);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default Logout;
