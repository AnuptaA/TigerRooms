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
import MyGroup from "./pages/MyGroup";
import ModerateReviews from "./pages/ModerateReviews";
import AllGroups from "./pages/AllGroups";
import "./App.css";

const App = () => {
  const [username, setUsername] = React.useState("");
  const [adminStatus, setAdminStatus] = React.useState(false);
  // initial status of the admin toggle is false
  const [adminToggle, setAdminToggle] = React.useState(() => {
    const savedToggle = localStorage.getItem("adminToggle");
    console.log(savedToggle);
    return savedToggle === "true";
  });
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

  React.useEffect(() => {
    localStorage.setItem("adminToggle", adminToggle);
  }, [adminToggle]);

  return (
    <BrowserRouter>
      <NavBar
        adminStatus={adminStatus}
        adminToggle={adminToggle}
        setAdminToggle={setAdminToggle}
      />

      <Routes>
        <Route
          path="/floorplans"
          element={
            <FloorPlans adminStatus={adminStatus} adminToggle={adminToggle} />
          }
        />
        <Route
          path="/"
          element={
            <FilterComponent
              username={username}
              adminStatus={adminStatus}
              adminToggle={adminToggle}
            />
          }
        />
        <Route
          path="/floorplans/hallfloor"
          element={
            <HallFloor
              username={username}
              adminStatus={adminStatus}
              adminToggle={adminToggle}
            />
          }
        />
        {<Route path="/logout" element={<Logout />}></Route>}
        <Route
          path="/upload-pdfs"
          element={
            <UploadPDFs adminStatus={adminStatus} adminToggle={adminToggle} />
          }
        />
        <Route
          path="/cart"
          element={
            <Cart
              username={username}
              adminStatus={adminStatus}
              adminToggle={adminToggle}
            />
          }
        />
        <Route path="*" element={<InvalidRoute />} />
        {/* TODO: this should be unavailable to admins */}
        <Route
          path="/mygroup"
          element={
            <MyGroup
              username={username}
              adminStatus={adminStatus}
              adminToggle={adminToggle}
            />
          }
        />
        <Route
          path="/moderate-reviews"
          element={
            <ModerateReviews
              username={username}
              adminStatus={adminStatus}
              adminToggle={adminToggle}
            />
          }
        />
        <Route
          path="/all-groups"
          element={
            <AllGroups
              username={username}
              adminStatus={adminStatus}
              adminToggle={adminToggle}
            />
          }
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App;
