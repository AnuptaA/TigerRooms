import React, { useState, useEffect } from "react";
import "../App.css";

const Cart = ({ username }) => {
  const [savedRooms, setSavedRooms] = useState({});
  const [groupMembers, setGroupMembers] = useState([username]); // Start with the user only
  const [collapsedStates, setCollapsedStates] = useState({ [username]: false }); // User's section starts expanded

  // Fetch saved rooms for the user
  useEffect(() => {
    const fetchSavedRooms = async () => {
      try {
        // Fetch the user's saved rooms
        const response = await fetch(`/api/saved_rooms?user_id=${username}`);
        let sortedRooms = []; // Define sortedRooms here
        if (response.ok) {
          const data = await response.json();
          sortedRooms = data.saved_rooms.sort((a, b) => {
            return b.availability - a.availability;
          });
          setSavedRooms({ [username]: sortedRooms });
        } else {
          console.error(
            `Error fetching saved rooms for ${username}: ${response.statusText}`
          );
          setSavedRooms({ [username]: [] }); // Show an empty state if there's an error
        }

        // Optionally, fetch group data if the user is in a group
        const groupResponse = await fetch(`/api/my_group`);
        const groupData = await groupResponse.json();
        if (groupData.group_id && groupData.members.length > 1) {
          setGroupMembers(groupData.members);
          const collapsedStatesInitial = groupData.members.reduce(
            (states, member) => {
              states[member] = member !== username; // Collapse others, keep the user expanded
              return states;
            },
            {}
          );
          setCollapsedStates(collapsedStatesInitial);

          // Fetch saved rooms for group members
          const savedRoomsByUser = { [username]: sortedRooms }; // Use sortedRooms here
          for (const member of groupData.members) {
            if (member !== username) {
              try {
                const memberResponse = await fetch(
                  `/api/saved_rooms?user_id=${member}`
                );
                if (memberResponse.ok) {
                  const memberData = await memberResponse.json();
                  const memberSortedRooms = memberData.saved_rooms.sort(
                    (a, b) => {
                      return b.availability - a.availability;
                    }
                  );
                  savedRoomsByUser[member] = memberSortedRooms;
                } else {
                  console.error(
                    `Error fetching saved rooms for ${member}: ${memberResponse.statusText}`
                  );
                }
              } catch (error) {
                console.error(
                  `Error fetching saved rooms for ${member}:`,
                  error
                );
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

  // Handle room unsave
  const handleUnsaveRoom = (roomNumber, hall) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this room from your cart?"
    );
    if (!confirmed) return;

    fetch("/api/unsave_room", {
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
            (room) => !(room.room_number === roomNumber && room.hall === hall)
          ),
        }));
      })
      .catch((error) => console.error("Error unsaving room:", error));
  };

  // Handle clearing all drawn rooms
  const handleClearDrawnRooms = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all drawn rooms from the cart?"
    );
    if (!confirmed) return;

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
        setSavedRooms((prevRooms) => ({
          ...prevRooms,
          [username]: prevRooms[username].filter(
            (room) => room.availability === true
          ),
        }));
      })
      .catch((error) => console.error("Error clearing drawn rooms:", error));
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">Saved Rooms</h1>
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
                              width: "1vw",
                              height: "1vw",
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
                              onClick={() =>
                                handleUnsaveRoom(room.room_number, room.hall)
                              }
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
  );
};

export default Cart;
