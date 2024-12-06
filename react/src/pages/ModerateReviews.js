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

  if (error) {
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
      <h1>Review Moderation</h1>
      {reviews.length === 0 ? (
        <p>No reviews available.</p>
      ) : (
        <table
          style={{
            width: "70%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  backgroundColor: "#f4f4f4",
                }}
              >
                NetID
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  backgroundColor: "#f4f4f4",
                }}
              >
                Room ID
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  backgroundColor: "#f4f4f4",
                }}
              >
                Rating
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  backgroundColor: "#f4f4f4",
                }}
              >
                Comments
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  backgroundColor: "#f4f4f4",
                }}
              >
                Review Date
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  border: "1px solid #ddd",
                  backgroundColor: "#f4f4f4",
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.room_id}>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {review.netid}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {review.room_id}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {review.rating}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {review.review_date}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {review.comments}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  <button
                    onClick={() => deleteReview(review.netid, review.room_id)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#ff4d4d",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                      borderRadius: "4px",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  ) : (
    <AdminAccessOnly />
  );
};

export default ModerateReviews;
