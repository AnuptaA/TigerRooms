import React, { useState, useEffect } from "react";
import "../App.css";

const ModerateReviews = (username, adminStatus) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch reviews from the server
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reviews/get_all_reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ netid: username }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      if (data.success) {
        setReviews(data.all_reviews);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a review
  const deleteReview = async (netid, roomId) => {
    try {
      const response = await fetch("/api/reviews/delete_review_of_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ netid, room_id: roomId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      const data = await response.json();
      if (data.success) {
        alert(data.success);
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.room_id !== roomId)
        );
      } else {
        alert("Failed to delete review");
      }
    } catch (err) {
      alert("Error deleting review");
    }
  };

  // Fetch reviews on component load
  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>User Reviews</h1>
      <table>
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
              <td>{review.comments}</td>
              <td>{review.review_date}</td>
              <td>
                <button
                  onClick={() => deleteReview(review.netid, review.room_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModerateReviews;