import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FloorPlans from "./pages/FloorPlans"; // The page listing all floor plans
import FilterComponent from "./pages/FilterComponent";
import WendellB3rdFloor from "./pages/WendellB3rdFloor"; // The detailed view of Wendell B 3rd floor
import HallFloor from "./pages/HallFloor"; // The detailed view of Hall floor
import Logout from "./pages/Logout";
import UploadPDFs from "./pages/UploadPDFs";
import Footer from "./Components/Footer";
import NavBar from "./Components/NavBar";
import Cart from "./pages/Cart";
import "./App.css";

const App = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [username, setUsername] = React.useState(null);

  // Function to fetch user data
  const fetchUserData = async () => {
    const redirectToLogin = () => {
      window.location.href = `${apiUrl}/`;
    };

    try {
      const response = await fetch(`${apiUrl}/api/user`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        console.log("Fetched user data successfully");
        const data = await response.json().catch((e) => {
          console.error("Error parsing JSON:", e);
          redirectToLogin();
        });

        if (data && data.status === "success") {
          console.log(
            "Fetching data was successful, setting username:",
            data.username
          );
          setUsername(data.username); // Set username if authenticated
        } else {
          console.error("User not authenticated or username not available");
          redirectToLogin();
        }
      } else if (response.status === 401) {
        console.error("User not authenticated (401 status)");
        redirectToLogin();
      } else {
        console.error(
          `Unexpected response status: ${response.status}`,
          response
        );
        redirectToLogin();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      redirectToLogin();
    }
  };

  React.useEffect(() => {
    if (username) {
      console.log("Username is already present");
      return;
    }
    fetchUserData();
  }, []); // Only run effect when apiUrl or username changes

  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/floorplans" element={<FloorPlans />} />
        <Route path="/" element={<FilterComponent />} />
        <Route
          path="/floorplans/wendell-b-3rd-floor"
          element={<WendellB3rdFloor />}
        />
        <Route path="/floorplans/hallfloor" element={<HallFloor />} />
        {<Route path="/logout" element={<Logout />}></Route>}
        <Route path="/upload-pdfs" element={<UploadPDFs />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;
