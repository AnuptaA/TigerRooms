import React from "react";
import "../App.css";

const NavBar = () => {
  return (
    <nav>
      <div class="logo-cont">
        <img id="logo" src="/misc/princeton-logo.png" />
      </div>
      <ul id="nav-options">
        <li>
          <ul id="left-options">
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/floorplans">Floor Plans</a>
            </li>
            <li>
              <a href="/upload-pdfs">Upload PDFs</a>
            </li>
          </ul>
        </li>
        <li>
          <ul id="right-options">
            <li>
              <a href="/logout">Log Out</a>
            </li>
            <li>
              <button id="cart-btn" onclick="location.href='/cart'">
                <img id="cart-svg" src="/misc/cart.svg" alt="View Cart" />
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
