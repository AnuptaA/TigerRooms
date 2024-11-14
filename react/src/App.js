import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FloorPlans from "./pages/FloorPlans"; // The page listing all floor plans
import FilterComponent from "./pages/FilterComponent";
import WendellB3rdFloor from "./pages/WendellB3rdFloor"; // The detailed view of Wendell B 3rd floor
import Logout from "./pages/Logout";
import UploadPDFs from "./pages/UploadPDFs";
import Footer from "./Components/Footer";
import NavBar from "./Components/NavBar";
import Cart from "./pages/Cart";
import "./App.css";

const App = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [username, setUsername] = React.useState(null);

  React.useEffect(() => {
    if (username) {
      console.log("Username is already present");
      return;
    }

    // Function to fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/user`, {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 200) {
          console.log("Fetched user data successfully");
          const data = await response.json();

          if (data.status === "success" && data.username) {
            console.log("User authenticated, setting username:", data.username);
            setUsername(data.username); // Set username if authenticated
          } else {
            console.error("User not authenticated or username not available");
            window.location.href = `${apiUrl}`; // Redirect to login page
          }
        } else if (response.status === 401) {
          console.error("User not authenticated (401 status)");
          window.location.href = `${apiUrl}`; // Redirect to login page
        } else {
          console.error("Unexpected response:", response);
          window.location.href = `${apiUrl}`; // Redirect to login page
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        window.location.href(
          "https://www.cs.princeton.edu/courses/archive/fall24/cos333/"
        );
        // window.location.href = `${apiUrl}`; // Redirect to login page
      }
    };

    fetchUserData();
  }, [apiUrl, username]); // Only run effect when apiUrl or username changes

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
        {<Route path="/logout" element={<Logout />}></Route>}
        <Route path="/upload-pdfs" element={<UploadPDFs />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;
