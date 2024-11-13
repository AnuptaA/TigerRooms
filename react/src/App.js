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
      async function fetchUserData() {
        try {
          const response = await fetch(`${apiUrl}/api/user`, {
            method: "GET",
            credentials: "include",
          });

          if (response.status === 200) {
            const data = await response.json();
            if (data.status === "success") {
              setUsername(data.username);
            } else {
              console.error("User not authenticated");
              window.location.href = `${apiUrl}`;
            }
          } else if (response.status === 401) {
            console.error("User not authenticated (401 status)");
            window.location.href = `${apiUrl}`; // Redirect to start CAS login
          } else {
            console.error("Unexpected response", response);
            window.location.href = `${apiUrl}`;
          }
        } catch (error) {
          console.error("Fetch error:", error);
          window.location.href = `${apiUrl}`;
        }
      }

      // Fetch user data on initial load
      fetchUserData();
    }, [apiUrl]);

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
