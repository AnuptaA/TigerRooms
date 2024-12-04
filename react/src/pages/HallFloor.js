import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../App.css";

const HallFloor = ({ username, adminStatus }) => {
  console.log("hallfloor route hit");
  // Retrieve query params from URL using useLocation
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const MySwal = withReactContent(Swal);

  // State for room information and expanded rows
  const [roomInfo, setRoomInfo] = useState([
    {
      name: "Room 101",
      isAvailable: "T", // T for available, F for unavailable
      size: "200 sqft",
      occupancy: "Single",
      total_saves: 10,
      isSaved: false,
    },
  ]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [debouncing, setDebouncing] = useState(false); // Debouncing state

  // Get query parameters, defaulting to empty string if not found
  const resCollege = searchParams.get("resco");
  const hall = searchParams.get("hall");
  const floor = searchParams.get("floor");

  const getCookie = (key) => {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.split("=");
      if (cookieKey === key) {
        return cookieValue || ""; // Decode in case of encoded values
      }
    }
    return ""; // Return empty string if the key isn't found
  };

  // Unpacking cookies
  const rescoFromCookie = getCookie("resco") || "";
  const hallFromCookie = getCookie("hall") || "";
  const floorFromCookie = getCookie("floor") || "";
  const occupancyFromCookie = getCookie("occupancy") || "";
  const minSquareFootageFromCookie = getCookie("minSquareFootage") || "";

  // Fetch room data along with saved status for the user from the backend
  useEffect(() => {
    fetch(
      `/api/floorplans/hallfloor?netid=${username}&hall=${hall}&floor=${floor}&occupancy=${occupancyFromCookie}&minSquareFootage=${minSquareFootageFromCookie}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setRoomInfo(data);
      })
      .catch((error) => console.error("Error fetching room data:", error));
  }, [floor, username]);

  let imageSrc;

  try {
    imageSrc = require(`../img/floorplans/${resCollege}_${hall}_${floor}.png`);

    console.log(imageSrc);
  } catch (error) {
    console.log("non-existent combination of resco, hall and floor");

    return (
      <div className="floor-plan-error-container">
        <h1 className="floor-plan-error-message">
          No results matched your parameters
        </h1>

        <h3 className="floor-plan-error-message">
          Click{" "}
          <a href="/" className="back-to-floorplans">
            here
          </a>{" "}
          to do another search
        </h3>
      </div>
    );
  }

  // Toggle row expansion
  const toggleExpandRow = (index) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((i) => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  // Handle Save/Unsave action with Debouncing
  const handleSaveToggle = (roomNumber, hall, isSaved) => {
    if (debouncing) return; // Prevent further actions if debouncing

    setDebouncing(true); // Start debouncing
    const url = `/api/${isSaved ? "unsave_room" : "save_room"}`;
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        netid: username,
        room_number: roomNumber,
        hall: hall,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the saved status and total saves in the roomInfo state
        setRoomInfo((prevRoomInfo) =>
          prevRoomInfo.map((room) => {
            if (room.name === `${hall} ${roomNumber}`) {
              // Prevent decreasing total_saves below 0
              if (isSaved && room.total_saves === 0) {
                return {
                  ...room,
                  isSaved: false, // Force the Save button to reappear
                };
              }
              return {
                ...room,
                isSaved: !isSaved,
                total_saves: isSaved
                  ? room.total_saves - 1
                  : room.total_saves + 1,
              };
            }
            return room;
          })
        );
      })
      .catch((error) => console.error("Error toggling save status:", error))
      .finally(() => {
        // End debouncing after a delay
        setTimeout(() => {
          setDebouncing(false);
        }, 500); // Adjust delay as needed
      });
  };

  // CREATED WITH THE HELP OF CHATGPT ****
  const handleReview = (roomNumber, username) => {
    MySwal.fire({
      title: "Submit a review!",
      html: `<label for="rating">Rating (1 to 5 stars):</label>
        <div id="rating" style="display: flex; justify-content: center; margin-bottom: 15px;">
          <input type="radio" name="star" value="1" id="star1" class="star" style="display:none;">
          <input type="radio" name="star" value="2" id="star2" class="star" style="display:none;">
          <input type="radio" name="star" value="3" id="star3" class="star" style="display:none;">
          <input type="radio" name="star" value="4" id="star4" class="star" style="display:none;">
          <input type="radio" name="star" value="5" id="star5" class="star" style="display:none;">
          <div class="rating" style="font-size: 2rem; cursor: pointer;">
            <span class="star-icon" data-value="1">★</span>
            <span class="star-icon" data-value="2">★</span>
            <span class="star-icon" data-value="3">★</span>
            <span class="star-icon" data-value="4">★</span>
            <span class="star-icon" data-value="5">★</span>
          </div>
        </div>
        <textarea id="review-comments" class="swal2-input" placeholder="Write your review here..." rows="6" style="padding: 7.5px; height: 50px; width: 300px;"></textarea>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Submit Review",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const rating = document.querySelector(
          'input[name="star"]:checked'
        )?.value;
        const comments = document.getElementById("review-comments").value;

        if (!rating || !comments) {
          MySwal.showValidationMessage(
            "Please select a rating and write a comment"
          );
          return false;
        }

        // Get the current date
        const reviewDate = new Date().toISOString();

        // Create the review object
        return {
          room_id: roomNumber,
          netid: username,
          rating: parseInt(rating),
          comments: comments,
          review_date: reviewDate,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { room_id, netid, rating, comments, review_date } = result.value;
        submitReviewToDatabase(room_id, netid, rating, comments, review_date);
      }
    });

    // Handle star rating click interaction
    const ratingStars = document.querySelectorAll(".star-icon");
    ratingStars.forEach((star) => {
      star.addEventListener("click", (e) => {
        const value = e.target.getAttribute("data-value");
        document.querySelector(
          `input[name="star"][value="${value}"]`
        ).checked = true;
        ratingStars.forEach((star) => (star.style.color = "gray")); // Reset color
        for (let i = 0; i < value; i++) {
          ratingStars[i].style.color = "gold"; // Highlight selected stars
        }
      });
    });
  };

  const submitReviewToDatabase = (
    room_id,
    netid,
    rating,
    comments,
    review_date
  ) => {

    fetch("/api/submit-review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_id,
        netid,
        rating,
        comments,
        review_date,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          MySwal.fire(
            "Thank you!",
            "Your review has been submitted successfully!",
            "success"
          );
        } else {
          MySwal.fire(
            "Error.",
            "Something went wrong while submitting your review. Please try again.",
            "error"
          );
        }
      })
      .catch((err) => {
        MySwal.fire(
          "Error.",
          "Something went wrong while submitting your review. Please try again.",
          "error"
        );
        console.error(err);
      });
  };

  const handleDisplayReview = () => { };

  const returnLink = `/floorplans?resco=${rescoFromCookie}&hall=${hallFromCookie}&floor=${floorFromCookie}&occupancy=${occupancyFromCookie}&minSquareFootage=${minSquareFootageFromCookie}`;

  return (
    <div className="floor-plan-flexbox">
      <div className="floor-plan-map">
        <h1 className="floor-plan-title">
          {resCollege + " College, " + hall + " Hall, Floor " + floor}
        </h1>
        <img src={imageSrc} alt="HallMap" className="floor-plan-image" />
        <h3 className="back-link">
          Click{" "}
          <a href={returnLink} className="back-to-floorplans">
            here
          </a>{" "}
          to return to floor plans list
        </h3>
      </div>
      <div className="available-rooms-table">
        <RoomInfoTable
          roomInfo={roomInfo}
          expandedRows={expandedRows}
          toggleExpandRow={toggleExpandRow}
          handleSaveToggle={handleSaveToggle}
          handleReview={handleReview}
          hallName={hall}
          adminStatus={!adminStatus}
          username={username}
        />
      </div>
    </div>
  );
};

// RoomInfoTable component
const RoomInfoTable = ({
  roomInfo,
  expandedRows,
  toggleExpandRow,
  handleSaveToggle,
  handleReview,
  hallName,
  adminStatus,
  username,
}) => {
  return (
    <table border="1" cellPadding="10" className="room-availability-table">
      <thead className="room-info-thead">
        <tr>
          <th className="availability-table-th">Availability Info</th>
        </tr>
      </thead>
      <tbody>
        {roomInfo.map((oneRoomInfo, index) => (
          <React.Fragment key={index}>
            <tr>
              <td
                className="availability-table-td"
                onClick={() => toggleExpandRow(index)}
              >
                <div className="availability">
                  <div
                    style={{
                      width: "1.4vh",
                      height: "1.4vh",
                      backgroundColor:
                        oneRoomInfo.isAvailable === "T" ? "green" : "red",
                      borderRadius:
                        oneRoomInfo.isAvailable === "T" ? "50%" : "0",
                      marginRight: "1.4vh",
                    }}
                  ></div>
                  <strong>{oneRoomInfo.name}</strong>{" "}
                </div>
                <div style={{ userSelect: "none" }}>
                  {expandedRows.includes(index) ? "➖" : "➕"}
                </div>
              </td>
            </tr>
            {expandedRows.includes(index) && (
              <tr>
                <td className="availability-table-td" colSpan="3">
                  <div style={{ padding: "10px", backgroundColor: "#f9f9f9" }}>
                    <strong>{oneRoomInfo.size}</strong> <br />
                    <strong>{oneRoomInfo.occupancy}</strong> <br />
                    <strong>Total Saves: {oneRoomInfo.total_saves}</strong>
                    <br />
                    <div>
                      <button
                        onClick={() =>
                          handleSaveToggle(
                            oneRoomInfo.name.split(" ")[1], // Extract room number from name
                            hallName,
                            oneRoomInfo.isSaved
                          )
                        }
                        style={{
                          marginTop: "10px",
                          padding: "5px 10px",
                          cursor: "pointer",
                        }}
                      >
                        {oneRoomInfo.isSaved ? "Unsave" : "Save"}
                      </button>
                      {adminStatus && (
                        <button
                          onClick={() =>
                            handleReview(
                              oneRoomInfo.name.split(" "[1]),
                              username
                            )
                          }
                          style={{
                            marginTop: "10px",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Create Review
                        </button>
                      )}
                      {adminStatus && (
                        <button
                          style={{
                            marginTop: "10px",
                            padding: "5px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Display Reviews
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td id="availability-key-td">
            <strong>Draw Availability Key</strong>
            <div style={{ display: "block", marginTop: "10px" }}>
              <div
                style={{
                  marginBottom: "5px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "green",
                    borderRadius: "50%",
                    marginRight: "5px",
                  }}
                ></div>
                <span>Available</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "red",
                    marginRight: "5px",
                  }}
                ></div>
                <span>Unavailable</span>
              </div>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

export default HallFloor;
