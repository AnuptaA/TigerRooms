import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import StudentAccessOnly from "../Components/StudentAccessOnly";
import "../App.css";

const Cart = ({ username, adminStatus, adminToggle }) => {
  const [savedRooms, setSavedRooms] = useState({});
  const [groupMembers, setGroupMembers] = useState([username]); // Start with the user only
  const [collapsedStates, setCollapsedStates] = useState({ [username]: false }); // User's section starts expanded
  const MySwal = withReactContent(Swal);

  // Fetch saved rooms for the user
  useEffect(() => {
    const fetchSavedRooms = async () => {
      try {
        // Fetch the user's saved rooms
        const response = await fetch(`/api/saved_rooms?user_id=${username}`);
        let sortedRooms = [];
        if (response.ok) {
          const data = await response.json();
          sortedRooms = data.saved_rooms.sort(
            (a, b) => b.availability - a.availability
          );
          setSavedRooms({ [username]: sortedRooms });
        } else {
          console.error(
            `Error fetching saved rooms for ${username}: ${response.statusText}`
          );
          setSavedRooms({ [username]: [] });
        }

        // Fetch group data
        const groupResponse = await fetch(`/api/my_group`);
        const groupData = await groupResponse.json();

        // If no group data or user is the only member
        if (!groupData.group_id || groupData.members.length <= 1) {
          setGroupMembers([username]); // Ensure user is the only member
          setCollapsedStates({ [username]: false }); // Expand user's section
        } else {
          // Populate group members and saved rooms
          setGroupMembers(groupData.members);
          const collapsedStatesInitial = groupData.members.reduce(
            (states, member) => {
              states[member] = member !== username; // Collapse others, expand the user
              return states;
            },
            {}
          );
          setCollapsedStates(collapsedStatesInitial);

          // Fetch saved rooms for group members
          const savedRoomsByUser = { [username]: sortedRooms };
          for (const member of groupData.members) {
            if (member !== username) {
              try {
                const memberResponse = await fetch(
                  `/api/saved_rooms?user_id=${member}`
                );
                if (memberResponse.ok) {
                  const memberData = await memberResponse.json();
                  const memberSortedRooms = memberData.saved_rooms.sort(
                    (a, b) => b.availability - a.availability
                  );
                  savedRoomsByUser[member] = memberSortedRooms;
                } else {
                  console.error(
                    `Error fetching saved rooms for ${member}: ${memberResponse.statusText}`
                  );
                  savedRoomsByUser[member] = []; // Default to empty array
                }
              } catch (error) {
                console.error(
                  `Error fetching saved rooms for ${member}:`,
                  error
                );
                savedRoomsByUser[member] = []; // Default to empty array
              }
            }
          }
          setSavedRooms(savedRoomsByUser);
        }
      } catch (error) {
        console.error("Error fetching saved room or group data:", error);
      }
    };

    fetchSavedRooms();
  }, [username]);

  // Toggle collapse/expand state
  const toggleCollapse = (user) => {
    setCollapsedStates((prevStates) => ({
      ...prevStates,
      [user]: !prevStates[user],
    }));
  };

  // Expand all tables
  const expandAll = () => {
    setCollapsedStates((prevStates) =>
      Object.keys(prevStates).reduce((acc, key) => {
        acc[key] = false; // Set all states to expanded
        return acc;
      }, {})
    );
  };

  // Collapse all tables
  const collapseAll = () => {
    setCollapsedStates((prevStates) =>
      Object.keys(prevStates).reduce((acc, key) => {
        acc[key] = true; // Set all states to collapsed
        return acc;
      }, {})
    );
  };

  // Handle room unsave
  const handleUnsaveRoom = (room_id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to remove this room from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "No, keep it",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("/api/unsave_room", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            netid: username,
            room_id: room_id,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to unsave room: ${response.statusText}`);
            }
            return response.json();
          })
          .then(() => {
            setSavedRooms((prevRooms) => ({
              ...prevRooms,
              [username]: prevRooms[username].filter(
                (room) => !(room.room_id === room_id)
              ),
            }));
          })
          .catch((error) => console.error("Error unsaving room:", error));
      }
    });
  };

  // Handle clearing all drawn rooms
  const handleClearDrawnRooms = () => {
    // Check if there are drawn rooms to clear
    const drawnRooms = savedRooms[username]?.filter(
      (room) => room.availability === false
    );

    if (!drawnRooms || drawnRooms.length === 0) {
      // If there are no drawn rooms, show a message and exit
      MySwal.fire({
        title: "No drawn rooms",
        text: "There are no drawn rooms to clear.",
        icon: "info",
        confirmButtonText: "Okay",
      });
      return;
    }

    // If there are drawn rooms, show confirmation dialog
    MySwal.fire({
      title: "Are you sure?",
      text: "You want to clear all drawn rooms from the cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, clear them!",
      cancelButtonText: "No, keep them",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("/api/clear_drawn_rooms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ netid: username }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(
                `Failed to clear drawn rooms: ${response.statusText}`
              );
            }
            return response.json();
          })
          .then(() => {
            // Update the savedRooms state after clearing
            setSavedRooms((prevRooms) => ({
              ...prevRooms,
              [username]: prevRooms[username].filter(
                (room) => room.availability === true
              ), // Assuming cleared rooms are now unavailable
            }));

            // Show success message after clearing
            MySwal.fire({
              title: "Success!",
              text: "All drawn rooms have been cleared from your cart.",
              icon: "success",
              confirmButtonText: "Great",
            });
          })
          .catch((error) => {
            console.error("Error clearing drawn rooms:", error);
            MySwal.fire({
              title: "Error",
              text: "There was an issue clearing the drawn rooms. Please try again.",
              icon: "error",
              confirmButtonText: "Okay",
            });
          });
      }
    });
  };

  return !adminStatus || adminToggle ? (
    <div className="cart-page">
      <h1 className="cart-title">Saved Rooms</h1>
      <div className="controls">
        <button onClick={expandAll} className="expand-button">
          Expand All
        </button>
        <button onClick={collapseAll} className="collapse-button">
          Collapse All
        </button>
      </div>
      {groupMembers.map((member) => (
        <div key={member} className="saved-rooms-section">
          <h2
            className="saved-rooms-title"
            onClick={() => toggleCollapse(member)}
            style={{ cursor: "pointer" }}
          >
            {member === username
              ? "Your Saved Rooms"
              : `Saved Rooms for ${member}`}{" "}
            {collapsedStates[member] ? "➕" : "➖"}
          </h2>
          {!collapsedStates[member] && (
            <>
              {savedRooms[member] && savedRooms[member].length > 0 ? (
                <table className="saved-rooms-table">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Total Saves</th>
                      <th>Availability</th>
                      {member === username && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {savedRooms[member].map((room, index) => (
                      <tr key={index}>
                        <td>{`${room.hall} ${room.room_number}`}</td>
                        <td>
                          {room.total_saves !== undefined
                            ? room.total_saves
                            : "N/A"}
                        </td>
                        <td>
                          <div
                            style={{
                              width: "1rem",
                              height: "1rem",
                              borderRadius: "0.2vw",
                              backgroundColor: room.availability
                                ? "green"
                                : "red",
                              margin: "0 auto",
                            }}
                          ></div>
                        </td>
                        {member === username && (
                          <td>
                            <button
                              className="trash-button"
                              onClick={() => handleUnsaveRoom(room.room_id)}
                            >
                              🗑️
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-saved-rooms">
                  {member === username
                    ? "You haven't saved any rooms yet."
                    : `${member} has no saved rooms.`}
                </p>
              )}
              {member === username && (
                <button
                  className="clear-drawn-rooms-button"
                  onClick={handleClearDrawnRooms}
                >
                  Clear All Unavailable (Drawn) Rooms From Cart
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  ) : (
    <StudentAccessOnly />
  );
};

export default Cart;
