import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../App.css";
import StudentAccessOnly from "../Components/StudentAccessOnly";
import DOMPurify from "dompurify";

const HallFloor = ({ username, adminStatus, adminToggle }) => {
  console.log("hallfloor route hit");
  // Retrieve query params from URL using useLocation
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const MySwal = withReactContent(Swal);

  // State for room information and expanded rows
  const [roomInfo, setRoomInfo] = useState([
    {
      name: "Loading...",
      isAvailable: "T", // T for available, F for unavailable
      size: "200 sqft",
      occupancy: "Single",
      total_saves: 10,
      isSaved: false,
      has_reviewed: false,
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
  }, [floor, username, hall, occupancyFromCookie, minSquareFootageFromCookie]);

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
  const handleSaveToggle = (room_id, isSaved) => {
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
        room_id: room_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the saved status and total saves in the roomInfo state
        setRoomInfo((prevRoomInfo) =>
          prevRoomInfo.map((room) => {
            if (room.room_id === room_id) {
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
  const handleCreateReview = (room_id, username) => {
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
        <textarea id="review-comments" class="swal2-input" placeholder="Write your review here (max 200 characters)..." rows="6" style="padding: 7.5px; height: 50px; width: 300px;" maxlength="200"></textarea>
        <div id="char-count" style="font-size: 0.9rem; color: gray; margin-top: 5px;">200 characters remaining</div>`,
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

        // Sanitize the input and check for XSS
        const sanitizedComments = DOMPurify.sanitize(comments).trim();
        if (sanitizedComments !== comments.trim()) {
          // If the sanitized input differs from the original, it indicates a potential XSS attempt
          MySwal.showValidationMessage(
            "Nice try with the attempted XSS attack ;)"
          );
          return false;
        }

        // Get the current date and time
        const currentDate = new Date();
        const formattedDate = new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: "America/New_York",
        }).format(currentDate);

        const formattedTime = new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZone: "America/New_York",
        }).format(currentDate);

        const reviewDate = `${formattedDate} ${formattedTime}`;

        // Create the review object
        return {
          room_id: room_id,
          netid: username,
          rating: parseInt(rating),
          comments: sanitizedComments,
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

    // Update the character count as the user types in the textarea
    const reviewTextarea = document.getElementById("review-comments");
    const charCountDisplay = document.getElementById("char-count");

    reviewTextarea.addEventListener("input", () => {
      const remainingChars = 200 - reviewTextarea.value.length;
      charCountDisplay.textContent = `${remainingChars} characters remaining`;

      // Change color of character count if it's getting low
      if (remainingChars <= 20) {
        charCountDisplay.style.color = "red";
      } else {
        charCountDisplay.style.color = "gray";
      }
    });
  };

  const handleModifyReview = (room_id, username) => {
    // Fetch the existing review
    fetch("/api/reviews/get_review_of_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ netid: username, room_id: room_id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.review.comments) {
          const initialReview = data.review.comments;
          const initialCharCount = 200 - initialReview.length; // Calculate remaining characters based on existing review

          // Open SweetAlert to modify the review
          MySwal.fire({
            title: "Modify your review.",
            html: `
              <label for="rating">Rating (1 to 5 stars):</label>
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
              <textarea id="review-comments" class="swal2-input" placeholder="Write your review here..." rows="6" style="padding: 7.5px; height: 50px; width: 300px;" maxlength="200">${initialReview}</textarea>
              <div id="char-count" style="font-size: 0.9rem; color: gray; margin-top: 5px;">${initialCharCount} characters remaining</div>
              <br />
              <button id="remove-review" class="swal2-confirm swal2-styled" style="background-color: red; color: white; margin-top: 15px;">Remove Review</button>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Modify Review",
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

              // Sanitize the input and check for XSS
              const sanitizedComments = DOMPurify.sanitize(comments);
              if (sanitizedComments !== comments.trim()) {
                // If the sanitized input differs from the original, it indicates a potential XSS attempt
                MySwal.showValidationMessage(
                  "Nice try with the attempted XSS attack ;)"
                );
                return false;
              }

              const currentDate = new Date();
              const formattedDate = new Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                timeZone: "America/New_York",
              }).format(currentDate);

              const formattedTime = new Intl.DateTimeFormat("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZone: "America/New_York",
              }).format(currentDate);

              const reviewDate = `${formattedDate} ${formattedTime}`;

              return {
                room_id: room_id,
                netid: username,
                rating: parseInt(rating),
                comments: sanitizedComments,
                review_date: reviewDate,
              };
            },
          }).then((result) => {
            if (result.isConfirmed) {
              const { room_id, netid, rating, comments, review_date } =
                result.value;

              // First, remove the existing review before submitting the new one
              removeReviewFromDatabase(room_id, username).then(() => {
                // Now submit the new review after the old one is removed
                submitReviewToDatabase(
                  room_id,
                  netid,
                  rating,
                  comments,
                  review_date
                );
              });
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
              ratingStars.forEach((star) => (star.style.color = "gray"));
              for (let i = 0; i < value; i++) {
                ratingStars[i].style.color = "gold";
              }
            });
          });

          // Set the stars to match the current review rating
          const selectedStar = data.review.rating;
          for (let i = 0; i < selectedStar; i++) {
            ratingStars[i].style.color = "gold";
          }

          // Set the corresponding radio button to checked
          document.querySelector(
            `input[name="star"][value="${selectedStar}"]`
          ).checked = true;

          // Add the event listener for removing the review
          document
            .getElementById("remove-review")
            .addEventListener("click", () => {
              MySwal.fire({
                title: "Are you sure?",
                text: "Do you really want to remove your review?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, remove it!",
                cancelButtonText: "No, keep it",
              }).then((removeResult) => {
                if (removeResult.isConfirmed) {
                  removeReviewFromDatabase(room_id, username).then(() => {
                    MySwal.fire(
                      "Review Removed!",
                      "Your review has been successfully removed.",
                      "success"
                    );
                  });

                  // Update the roomInfo state to reflect that the review has been removed
                  setRoomInfo((prevRoomInfo) =>
                    prevRoomInfo.map((room) =>
                      room.room_id === room_id
                        ? { ...room, has_reviewed: false }
                        : room
                    )
                  );
                }
              });
            });

          // Update the character count as the user types in the textarea
          const reviewTextarea = document.getElementById("review-comments");
          const charCountDisplay = document.getElementById("char-count");

          reviewTextarea.addEventListener("input", () => {
            const remainingChars = 200 - reviewTextarea.value.length;
            charCountDisplay.textContent = `${remainingChars} characters remaining`;

            // Change color of character count if it's getting low
            if (remainingChars <= 20) {
              charCountDisplay.style.color = "red";
            } else {
              charCountDisplay.style.color = "gray";
            }
          });
        } else {
          MySwal.fire(
            "Error",
            "No review found for this room. Please try refreshing.",
            "error"
          );
        }
      })
      .catch((err) => {
        MySwal.fire(
          "Error",
          "Something went wrong while fetching your review.",
          "error"
        );
        console.error(err);
      });
  };

  const submitReviewToDatabase = (
    room_id,
    netid,
    rating,
    comments,
    review_date
  ) => {
    fetch("/api/reviews/submit_review", {
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

          // Update the roomInfo state to reflect that the room has been reviewed
          setRoomInfo((prevRoomInfo) =>
            prevRoomInfo.map((room) =>
              room.room_id === room_id ? { ...room, has_reviewed: true } : room
            )
          );
        } else if (data.error) {
          MySwal.fire(
            "Error.",
            data.error ||
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

  // Function to remove the review from the database
  const removeReviewFromDatabase = (room_id, username) => {
    return fetch("/api/reviews/delete_review_of_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        netid: username,
        room_id: room_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) {
          MySwal.fire(
            "Error",
            data.error ||
              "Something went wrong while removing your review. Please try again.",
            "error"
          );
        }
        return data.success;
      })
      .catch((err) => {
        MySwal.fire(
          "Error",
          "Something went wrong while removing your review. Please try again.",
          "error"
        );
        console.error(err);
        return false;
      });
  };

  const handleDisplayReview = (room_id, name) => {
    fetch("/api/reviews/get_all_reviews_for_room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        netid: username,
        room_id: room_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          if (data.review && data.review.length > 0) {
            // Construct the reviews HTML
            const reviewsHTML = data.review
              .map((review) => {
                const { netid, rating, comments, review_date } = review;
                console.log("comments =", comments);
                const sanitizedComments = DOMPurify.sanitize(comments).trim();
                console.log("sanitizedComments =", sanitizedComments);

                return `
                  <div class="review" style="margin-bottom: 15px;">
                    <p style="margin: 5px 0;"><strong>User:</strong> ${netid}
                    <span style="margin-left: 10px;"><strong>Rating:</strong> ${"★".repeat(
                      rating
                    )}${"☆".repeat(5 - rating)}</span></p>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${review_date}</p>
                    <p style="margin: 5px 0;"><strong>Review:</strong> ${sanitizedComments}</p>
                    <hr style="margin-top: 10px;"/>
                  </div>
                `;
              })
              .join("");

            // Display reviews in a larger modal
            MySwal.fire({
              title: `Room ${name} Reviews`,
              html: `<div style="max-height: 500px; width: 600px; overflow-y: auto; padding: 20px; text-align: left;">${reviewsHTML}</div>`,
              width: "800px",
              showCancelButton: true,
              cancelButtonText: "Close",
              confirmButtonText: "Okay",
              customClass: {
                popup: "larger-modal",
              },
            });
          } else {
            // If no reviews are found
            MySwal.fire({
              title: "No Reviews Found",
              text: `There are no reviews for Room ${name} yet.`,
              icon: "info",
              confirmButtonText: "Okay",
            });
          }
        } else {
          MySwal.fire("Error", "Failed to fetch reviews.", "error");
        }
      })
      .catch((err) => {
        MySwal.fire(
          "Error",
          "Something went wrong while fetching the reviews.",
          "error"
        );
        console.error(err);
      });
  };

  const returnLink = `/floorplans?resco=${rescoFromCookie}&hall=${hallFromCookie}&floor=${floorFromCookie}&occupancy=${occupancyFromCookie}&minSquareFootage=${minSquareFootageFromCookie}`;

  return !adminStatus || adminToggle ? (
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
          handleCreateReview={handleCreateReview}
          handleModifyReview={handleModifyReview}
          handleDisplayReview={handleDisplayReview}
          hallName={hall}
          username={username}
        />
      </div>
    </div>
  ) : (
    <StudentAccessOnly />
  );
};

// RoomInfoTable component
const RoomInfoTable = ({
  roomInfo,
  expandedRows,
  toggleExpandRow,
  handleSaveToggle,
  handleCreateReview,
  handleModifyReview,
  handleDisplayReview,
  hallName,
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
                      marginRight: "1vw",
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
                <td className="expanded-row-td" colSpan="3">
                  <div
                    className="expanded-content"
                    style={{ backgroundColor: "#f9f9f9" }}
                  >
                    <strong>{oneRoomInfo.size}</strong> <br />
                    <strong>{oneRoomInfo.occupancy}</strong> <br />
                    <strong>Total Saves: {oneRoomInfo.total_saves}</strong>
                    <br />
                    <div className="buttons-box">
                      <button
                        onClick={() =>
                          oneRoomInfo.has_reviewed
                            ? handleModifyReview(oneRoomInfo.room_id, username)
                            : handleCreateReview(oneRoomInfo.room_id, username)
                        }
                      >
                        {oneRoomInfo.has_reviewed
                          ? "Modify Review"
                          : "Write Review"}
                      </button>

                      <button
                        onClick={() =>
                          handleDisplayReview(
                            oneRoomInfo.room_id,
                            oneRoomInfo.name
                          )
                        }
                      >
                        Display Reviews
                      </button>
                    </div>
                    <div>
                      {oneRoomInfo.isAvailable === "T" && (
                        <button
                          onClick={() =>
                            handleSaveToggle(
                              oneRoomInfo.room_id,
                              oneRoomInfo.isSaved
                            )
                          }
                          style={{
                            width: "20%",
                            marginTop: "1vh",
                            padding: "0.25vh",
                            cursor: "pointer",
                          }}
                        >
                          {oneRoomInfo.isSaved ? "Unsave" : "Save"}
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
                    width: "1vh",
                    height: "1vh",
                    backgroundColor: "green",
                    borderRadius: "50%",
                    marginRight: "0.5vh",
                  }}
                ></div>
                <span>Available</span>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: "1vh",
                    height: "1vh",
                    backgroundColor: "red",
                    marginRight: "0.5vh",
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
