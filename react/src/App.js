import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FloorPlans from "./pages/FloorPlans"; // The page listing all floor plans
import FilterComponent from "./pages/FilterComponent";
import HallFloor from "./pages/HallFloor"; // The detailed view of Hall floor
import Logout from "./pages/Logout";
import UploadPDFs from "./pages/UploadPDFs";
import Footer from "./Components/Footer";
import NavBar from "./Components/NavBar";
import Cart from "./pages/Cart";
import "./App.css";

const App = () => {
  const [username, setUsername] = React.useState("");

  React.useEffect(() => {
    const auth = async () => {
      try {
        const response = await fetch("/api/user");
        const data = await response.json();
        if (data.username) {
          setUsername(data.username);
        } else {
          console.alert("NetID is not set, retrying...");
          setTimeout(auth, 2000);
        }
      } catch (error) {
        console.error("An error occurred: ", error);
      }
    };

    auth();
  }, []);

  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/floorplans" element={<FloorPlans />} />
        <Route path="/" element={<FilterComponent />} />
        <Route path="/floorplans/hallfloor" element={<HallFloor username={username}/>} />
        {<Route path="/logout" element={<Logout />}></Route>}
        <Route path="/upload-pdfs" element={<UploadPDFs />} />
        <Route path="/cart" element={<Cart username={username}/>} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;
