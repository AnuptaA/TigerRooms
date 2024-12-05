import React, { useState, useEffect } from "react";
import "../App.css";

const MyGroup = ({ username, adminStatus }) => {
  const [group, setGroup] = useState(null); // Group details
  const [members, setMembers] = useState([]); // Group members
  const [pendingMembers, setPendingMembers] = useState([]); // Pending members in the group
  const [pendingInvites, setPendingInvites] = useState([]); // Pending invites
  const [currentInviteIndex, setCurrentInviteIndex] = useState(0); // Index of the invite being shown
  const [newMemberNetID, setNewMemberNetID] = useState(""); // Input for adding a new member
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error message

  useEffect(() => {
    // Fetch user's group information and pending invites when the component mounts
    fetch("/api/my_group")
      .then((response) => response.json())
      .then((data) => {
        if (data.group_id) {
          setGroup(data.group_id);
          setMembers(data.members);

          // Fetch pending members for the group
          fetch(`/api/group_pending_members?group_id=${data.group_id}`)
            .then((response) => response.json())
            .then((pendingData) => {
              if (pendingData.pending_members) {
                setPendingMembers(pendingData.pending_members);
              }
            })
            .catch((error) => {
              console.error("Error fetching pending members:", error);
            });
        } else {
          setGroup(null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching group data:", error);
        setError("Failed to load group data. Please try again later.");
        setLoading(false);
      });

    fetch("/api/my_pending_invites")
      .then((response) => response.json())
      .then((data) => {
        if (data.invites) {
          setPendingInvites(data.invites);
        }
      })
      .catch((error) => {
        console.error("Error fetching pending invites:", error);
      });
  }, []);

  if (adminStatus) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
          backgroundColor: "#f4f4f4",
          padding: "0 5vw",
        }}
      >
        <h1
          style={{
            color: "red",
            fontSize: "8vw",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "2vh",
            textTransform: "uppercase",
            letterSpacing: "2px",
            wordWrap: "break-word",
          }}
        >
          Not a student.
        </h1>
        <p
          style={{
            color: "darkred",
            fontSize: "4vw",
            fontWeight: "bold",
            textAlign: "center",
            marginTop: "1vh",
            wordWrap: "break-word",
          }}
        >
          You cannot participate in room draw.
        </p>
      </div>
    );
  }

  const handleAcceptInvite = (groupId) => {
    setLoading(true);
    fetch("/api/accept_invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ group_id: groupId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          setGroup(data.group_id); // Update the group state
          setPendingInvites([]); // Clear all pending invites since the user joined a group

          // Fetch updated group data and members
          fetch(`/api/my_group`)
            .then((response) => response.json())
            .then((groupData) => {
              if (groupData.group_id) {
                setGroup(groupData.group_id);
                setMembers(groupData.members);

                // Fetch updated pending members for the group
                fetch(
                  `/api/group_pending_members?group_id=${groupData.group_id}`
                )
                  .then((response) => response.json())
                  .then((pendingData) => {
                    if (pendingData.pending_members) {
                      setPendingMembers(pendingData.pending_members);
                    }
                    setLoading(false);
                  })
                  .catch((error) => {
                    console.error("Error fetching pending members:", error);
                    setLoading(false);
                  });
              } else {
                setLoading(false);
              }
            })
            .catch((error) => {
              console.error("Error fetching group data:", error);
              setError("Failed to fetch updated group data.");
              setLoading(false);
            });
        } else if (data.error) {
          setError(data.error);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error accepting invite:", error);
        setError("Failed to accept invite. Please try again later.");
        setLoading(false);
      });
  };

  const handleDeclineInvite = () => {
    const currentInvite = pendingInvites[currentInviteIndex];

    setLoading(true);
    fetch("/api/decline_invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ group_id: currentInvite.group_id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          // Update the pending invites and reset the index
          setPendingInvites((prev) => {
            const updatedInvites = prev.filter(
              (_, index) => index !== currentInviteIndex
            );
            // Adjust the index if it's the last item in the list
            if (currentInviteIndex >= updatedInvites.length) {
              setCurrentInviteIndex(0);
            }
            return updatedInvites;
          });
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error declining invite:", error);
        setError("Failed to decline invite. Please try again later.");
        setLoading(false);
      });
  };

  const handleRemoveInvitation = (inviteeNetID) => {
    setLoading(true);
    fetch("/api/remove_invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ group_id: group, invitee_netid: inviteeNetID }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message); // Notify user of success

          // Update the pendingMembers state
          setPendingMembers((prev) =>
            prev.filter((member) => member !== inviteeNetID)
          );
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error removing invitation:", error);
        setError("Failed to remove invitation. Please try again later.");
        setLoading(false);
      });
  };

  const handleCreateGroup = () => {
    setLoading(true);
    fetch("/api/create_group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ netid: username }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.group_id) {
          setGroup(data.group_id);
          setMembers([username]); // Initialize the group with the creator
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error creating group:", error);
        setError("Failed to create group. Please try again later.");
        setLoading(false);
      });
  };

  const handleAddMember = () => {
    // Regular expression to match 2-8 lowercase letters and numbers
    const netIDRegex = /^[a-z0-9]{2,8}$/;

    if (!newMemberNetID) {
      setError("Please enter a NetID.");
      return;
    }

    if (!netIDRegex.test(newMemberNetID)) {
      setError("Invalid NetID. Please try again.");
      return;
    }

    setError(""); // Clear any previous error messages
    setLoading(true);

    fetch("/api/add_member", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invitee: newMemberNetID }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message); // Notify user of success or failure

          // Update the pendingMembers state immediately
          setPendingMembers((prev) => [...prev, newMemberNetID]);

          // Clear the input field
          setNewMemberNetID("");
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error adding member:", error);
        setError("Failed to send invitation. Please try again later.");
        setLoading(false);
      });
  };

  const handleLeaveGroup = () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this group?"
    );
    if (!confirmed) return;

    setLoading(true);
    fetch("/api/leave_group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert(data.message); // Notify user of success

          // Reset state to initial state for "create group" screen
          setGroup(null);
          setMembers([]);
          setPendingMembers([]);
          setPendingInvites([]);
          setCurrentInviteIndex(0);
        } else if (data.error) {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error leaving group:", error);
        setError("Failed to leave group. Please try again later.");
        setLoading(false);
      });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  // Show invitations one by one
  if (
    !group &&
    pendingInvites.length > 0 &&
    currentInviteIndex < pendingInvites.length
  ) {
    const currentInvite = pendingInvites[currentInviteIndex];
    return (
      <div className="my-group">
        <h1>My Group</h1>
        <p>
          You have been invited to join group{" "}
          <strong>{currentInvite.group_id}</strong>.
        </p>
        <p>
          <strong>Current Members:</strong>
        </p>
        <ul>
          {currentInvite.members.map((member, index) => (
            <li key={index}>{member}</li>
          ))}
        </ul>
        <button onClick={() => handleAcceptInvite(currentInvite.group_id)}>
          Accept
        </button>
        <button onClick={handleDeclineInvite}>Decline</button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  // Show "Create Group" option if no pending invites and not in a group
  if (!group && pendingInvites.length === 0) {
    return (
      <div className="my-group">
        <h1>My Group</h1>
        <p>You are not currently in a group.</p>
        <button onClick={handleCreateGroup}>Create Group</button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  // Show group details
  return (
    <div className="my-group">
      <h1>My Group</h1>
      <p>
        <strong>Group ID:</strong> {group}
      </p>
      <p>
        <strong>Group Members:</strong>
      </p>
      <ul>
        {members.map((member, index) => (
          <li key={index}>{member}</li>
        ))}
      </ul>
      <p>
        <strong>Pending Members:</strong>
      </p>
      <ul>
        {pendingMembers.map((pendingMember, index) => (
          <li key={index}>
            {pendingMember}{" "}
            <button
              onClick={() => handleRemoveInvitation(pendingMember)}
              className="remove-invitation"
            >
              Remove Invitation
            </button>
          </li>
        ))}
      </ul>
      <div className="add-member">
        <h2>Add Member</h2>
        <input
          type="text"
          placeholder="Enter NetID"
          value={newMemberNetID}
          onChange={(e) => setNewMemberNetID(e.target.value)}
        />
        <button onClick={handleAddMember}>Send Invitation</button>
      </div>
      <button onClick={handleLeaveGroup}>Leave Group</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default MyGroup;
