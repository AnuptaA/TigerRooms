import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import AdminAccessOnly from "../Components/AdminAccessOnly";
import "../App.css";

const ModerateReviews = ({ username, adminStatus, adminToggle }) => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    // skip the first iteration on StrictMode
    if (!username) {
      return;
    }

    console.log("netid:", username);
    setError(null);

    // Fetch the reviews from the API
    fetch(`/api/reviews/get_all_reviews?netid=${username}`, {
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status}. Perhaps you are not an admin!`
          );
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setReviews(data.all_reviews);
        } else {
          setError(
            data.error || "An error occurred. Perhaps you are not an admin?"
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
        setError(error.message);
      });
  }, [username]);

  if (error && adminStatus && !adminToggle) {
    return <div>Error: {error}</div>;
  }

  const deleteReview = (netid, room_id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "Once deleted, the review cannot be recovered.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Show the loading spinner
        MySwal.fire({
          title: "Deleting review...",
          text: "Please wait while we remove the review.",
          allowOutsideClick: false,
          didOpen: () => {
            MySwal.showLoading();
          },
        });

        // Make the API call to delete the review
        fetch("/api/reviews/delete_review_of_user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            netid: netid,
            room_id: room_id,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Success message
              MySwal.fire({
                icon: "success",
                title: "Review Deleted!",
                text: "The review has been successfully removed.",
              });

              // Update the reviews state to reflect the removal of the specific review
              setReviews((prevReviews) =>
                prevReviews.filter(
                  (review) =>
                    !(review.room_id === room_id && review.netid === netid)
                )
              );
            } else {
              // Error message
              MySwal.fire({
                icon: "error",
                title: "Error",
                text:
                  data.error ||
                  "Something went wrong while deleting the review. Please try again.",
              });
            }
          })
          .catch((err) => {
            // General error message
            MySwal.fire({
              icon: "error",
              title: "Error",
              text: "Something went wrong while deleting the review. Please try again.",
            });
            console.error(err);
          });
      }
    });
  };

  return adminStatus && !adminToggle ? (
    <div
      style={{
        marginTop: "5vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "3rem" }}>Review Moderation</h1>
      {reviews.length === 0 ? (
        <p style={{ fontSize: "2rem" }}>No reviews available.</p>
      ) : (
        <div className="reviews-container">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>NetID</th>
                <th>Room ID</th>
                <th>Rating</th>
                <th>Comments</th>
                <th>Review Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.room_id}>
                  <td>{review.netid}</td>
                  <td>{review.room_id}</td>
                  <td>{review.rating}</td>
                  <td>{review.review_date}</td>
                  <td>{review.comments}</td>
                  <td>
                    <button
                      onClick={() => deleteReview(review.netid, review.room_id)}
                      style={{
                        padding: "0.5vw 1.5vw",
                        backgroundColor: "#ff4d4d",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1vw",
                        borderRadius: "0.5vw",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  ) : (
    <AdminAccessOnly />
  );
};

export default ModerateReviews;
