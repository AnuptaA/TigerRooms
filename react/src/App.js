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
import InvalidRoute from "./pages/InvalidRoute";
import "./App.css";

const App = () => {
  const [username, setUsername] = React.useState("");
  const [adminStatus, setAdminStatus] = React.useState(false);

  React.useEffect(() => {
    const auth = async () => {
      try {
        const response = await fetch("/api/user");
        const data = await response.json();
        if (data.username) {
          setUsername(data.username);
          setAdminStatus(data.admin_status);
          console.log(`my username is ${data.username}`);
          console.log(`my admin status is ${data.admin_status}`);
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
      <NavBar adminStatus={adminStatus} />

      <Routes>
        <Route path="/floorplans" element={<FloorPlans />} />
        <Route path="/" element={<FilterComponent username={username} />} />
        <Route
          path="/floorplans/hallfloor"
          element={<HallFloor username={username} adminStatus={adminStatus} />}
        />
        {<Route path="/logout" element={<Logout />}></Route>}
        <Route
          path="/upload-pdfs"
          element={<UploadPDFs adminStatus={adminStatus} />}
        />
        <Route path="/cart" element={<Cart username={username} />} />
        <Route path="*" element={<InvalidRoute />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;
