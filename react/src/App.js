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
  const [username, setUsername] = React.useState("");

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/login`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (data.username) {
          setUsername(data.username);
        } else {
          // Retry or prompt login if net_id is missing
          console.warn("Net ID is not set, retrying...");
          setTimeout(authenticateUser, 2000); // Retry after a delay
        }
      } catch (error) {
        console.error("Error during authentication: ", error);
      }
    };
    authenticateUser();
  }, []);

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
