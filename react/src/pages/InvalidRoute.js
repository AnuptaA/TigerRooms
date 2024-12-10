import React from "react";
import "../App.css";

const InvalidRoute = () => {
    return (
        <div className="invalid-route-error-container">
            <h1 className="invalid-route-error-message">
                ERROR 404: Page Not Found
            </h1>

            <h3 className="invalid-route-error-message">
                Click{" "}
                <a href="/" className="back-to-floorplans">
                    here
                </a>{" "}
                to go to the home page
            </h3>
        </div>
    );
}

export default InvalidRoute