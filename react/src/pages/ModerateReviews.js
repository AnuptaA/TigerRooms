import React, { useState } from "react";
import "../App.css";

const ModerateReviews = ({ adminStatus }) => {
  // Check if the user is unauthorized
  if (!adminStatus) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
          backgroundColor: "#f4f4f4",
          padding: "0 5vw",
        }}
      >
        <h1
          style={{
            color: "red",
            fontSize: "8vw",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "2vh",
            textTransform: "uppercase",
            letterSpacing: "2px",
            wordWrap: "break-word",
          }}
        >
          Unauthorized Access
        </h1>
        <p
          style={{
            color: "darkred",
            fontSize: "4vw",
            fontWeight: "bold",
            textAlign: "center",
            marginTop: "1vh",
            wordWrap: "break-word",
          }}
        >
          You do not have permission to access this page. Please contact an
          admin.
        </p>
      </div>
    );
  }
};
