import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FloorPlans from "./pages/FloorPlans"; // The page listing all floor plans
import FilterComponent from "./pages/FilterComponent";
import WendellB3rdFloor from "./pages/WendellB3rdFloor"; // The detailed view of Wendell B 3rd floor
import UploadPDFs from "./pages/UploadPDFs";
import "./App.css";

const App = () => {
  // const [username, setUsername] = React.useState(null);

  // React.useEffect(() => {
  //   async function fetchUserData() {
  //     try {
  //       const response = await fetch("http://localhost:2000/api/user", {
  //         method: "GET",
  //         credentials: "include",
  //       });

  //       if (response.status === 200) {
  //         const data = await response.json();
  //         if (data.status === "success") {
  //           setUsername(data.username);
  //         } else {
  //           console.error("User not authenticated");
  //           window.location.href = "http://localhost:2000";
  //         }
  //       } else if (response.status === 401) {
  //         console.error("User not authenticated (401 status)");
  //         window.location.href = "http://localhost:2000"; // Redirect to start CAS login
  //       } else {
  //         console.error("Unexpected response", response);
  //         window.location.href = "http://localhost:2000";
  //       }
  //     } catch (error) {
  //       console.error("Fetch error:", error);
  //       window.location.href = "http://localhost:2000";
  //     }
  //   }

  //   // Fetch user data on initial load
  //   fetchUserData();
  // }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/floorplans" element={<FloorPlans />} />
        <Route path="/" element={<FilterComponent />} />
        <Route
          path="/floorplans/wendell-b-3rd-floor"
          element={<WendellB3rdFloor />}
        />
        <Route path="/upload-pdfs" element={<UploadPDFs />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
