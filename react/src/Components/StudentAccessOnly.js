import React from "react";
import "../App.css";

const StudentAccessOnly = () => {
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
        Not a student.
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
        You cannot participate in room draw.
      </p>
    </div>
  );
};

export default StudentAccessOnly;
