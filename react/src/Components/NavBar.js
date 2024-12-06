import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const NavBar = ({ adminStatus, adminToggle, setAdminToggle }) => {
  const navigator = useNavigate();
  const handleClick = () => {
    setAdminToggle((prevStatus) => !prevStatus);
  };
  return (
    <nav>
      <div class="logo-cont">
        <img id="logo" src="/misc/princeton-logo.png" alt="Princeton" />
      </div>
      <ul id="nav-options">
        <li>
          <ul id="left-options">
            {(!adminStatus || adminToggle) && (
              <li>
                <a href="/">Home</a>
              </li>
            )}
            {(!adminStatus || adminToggle) && (
              <li>
                <a href="/mygroup">My Group</a>
              </li>
            )}
            {(!adminStatus || adminToggle) && (
              <li>
                <a href="/floorplans">Floor Plans</a>
              </li>
            )}
            {adminStatus && !adminToggle && (
              <li>
                <a href="/upload-pdfs">Upload PDFs</a>
              </li>
            )}
            {adminStatus && !adminToggle && (
              <li>
                <a href="/moderate-reviews">Moderate Reviews</a>
              </li>
            )}
          </ul>
        </li>
        <li>
          <ul id="right-options">
            <li>
              <a href="/logout">Log Out</a>
            </li>
            {(!adminStatus || adminToggle) && (
              <li>
                <button
                  id="cart-btn"
                  onClick={() => {
                    navigator("/cart");
                  }}
                >
                  <img id="cart-svg" src="/misc/cart.svg" alt="View Cart" />
                </button>
              </li>
            )}
            {adminStatus && (
              <label class="switch">
                <input
                  type="checkbox"
                  checked={adminToggle}
                  onChange={handleClick}
                />
                <span class="slider round">
                  {adminToggle ? "Student" : "Admin"}
                </span>
              </label>
            )}
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
