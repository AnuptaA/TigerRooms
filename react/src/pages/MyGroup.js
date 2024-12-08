import React, { useState, useEffect } from "react";
import StudentAccessOnly from "../Components/StudentAccessOnly";
import "../App.css";

const MyGroup = ({ username, adminStatus, adminToggle }) => {
  const [group, setGroup] = useState(null); // Group details
  const [members, setMembers] = useState([]); // Group members
  const [pendingMembers, setPendingMembers] = useState([]); // Pending members in the group
  const [pendingInvites, setPendingInvites] = useState([]); // Pending invites
  const [currentInviteIndex, setCurrentInviteIndex] = useState(0); // Index of the invite being shown
  const [newMemberNetID, setNewMemberNetID] = useState(""); // Input for adding a new member
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error message
  const [remainingInvites, setRemainingInvites] = useState(0); // Track remaining invites

  useEffect(() => {
    // Fetch user's group information and pending invites when the component mounts
    fetch("/api/my_group")
      .then((response) => response.json())
      .then((data) => {
        if (data.group_id) {
          setGroup(data.group_id);
          setMembers(data.members);

          // Set remaining invites from the API response
          setRemainingInvites(data.remaining_invites);

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
                setRemainingInvites(groupData.remaining_invites);

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
    setError(""); // Clear any existing error

    fetch("/api/remove_invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ group_id: group, invitee_netid: inviteeNetID }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        alert(data.message);
        // Fetch updated pending members
        fetch(`/api/group_pending_members?group_id=${group}`)
          .then((response) => response.json())
          .then((pendingData) => {
            if (pendingData.pending_members) {
              setPendingMembers(pendingData.pending_members);
            }
          })
          .catch((error) =>
            console.error("Error fetching updated pending members:", error)
          );

        // Fetch updated current members
        fetch(`/api/my_group`)
          .then((response) => response.json())
          .then((groupData) => {
            if (groupData.group_id) {
              setMembers(groupData.members);
              setRemainingInvites(groupData.remaining_invites);
            }
          })
          .catch((error) =>
            console.error("Error fetching updated group members:", error)
          );

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
      .then((response) =>
        response.json().then((data) => ({ status: response.status, data }))
      )
      .then(({ status, data }) => {
        if (status === 201) {
          // Successfully created a group
          setGroup(data.group_id);
          setMembers([username]); // Initialize the group with the creator
          setRemainingInvites(data.remaining_invites);
        } else if (status === 403) {
          // Pending invites prevent group creation
          setError(
            data.error ||
              "You cannot create a group while you have pending invitations. Please refresh the page."
          );
        } else {
          // Other errors
          setError(
            data.error || "An unknown error occurred while creating the group."
          );
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
    // Updated regular expression to match:
    // - 2-8 lowercase letters/numbers (original)
    // - or "cs-" followed by 2-8 lowercase letters/numbers
    const netIDRegex = /^(cs-)?[a-z0-9]{2,8}$/;

    if (remainingInvites === 0) {
      setError("No remaining invites available.");
      return;
    }

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
          alert(data.message); // Notify user of success

          // Fetch updated pending members
          fetch(`/api/group_pending_members?group_id=${group}`)
            .then((response) => response.json())
            .then((pendingData) => {
              if (pendingData.pending_members) {
                setPendingMembers(pendingData.pending_members);
              }
            })
            .catch((error) =>
              console.error("Error fetching updated pending members:", error)
            );

          // Fetch updated current members
          fetch(`/api/my_group`)
            .then((response) => response.json())
            .then((groupData) => {
              if (groupData.group_id) {
                setMembers(groupData.members);
                setRemainingInvites(groupData.remaining_invites);
              }
            })
            .catch((error) =>
              console.error("Error fetching updated group members:", error)
            );

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
          setError(""); // Clear error state
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
        <ul className="current-members">
          {currentInvite.members.map((member, index) => (
            <li key={index} className="member-item">
              {member}
            </li>
          ))}
        </ul>
        <div className="invite-actions">
          <button
            className="accept"
            onClick={() => handleAcceptInvite(currentInvite.group_id)}
          >
            Accept
          </button>
          <button className="decline" onClick={handleDeclineInvite}>
            Decline
          </button>
        </div>
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
        <div className="create-group-container">
          <button className="create-group-button" onClick={handleCreateGroup}>
            Create Group
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  // Show group details
  return !adminStatus || adminToggle ? (
    <div className="my-group">
      <h1>My Group</h1>
      <p>
        <strong>Group ID:</strong> {group}
      </p>
      <div className="members-section">
        <div className="members-column">
          <h2>Group Members</h2>
          <ul className="members-list">
            {members.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ul>
        </div>
        <div className="members-column">
          <h2>Pending Members</h2>
          <ul className="members-list">
            {pendingMembers.map((pendingMember, index) => (
              <li key={index} className="pending-member">
                {pendingMember}{" "}
                <span
                  onClick={() => handleRemoveInvitation(pendingMember)}
                  className="remove-x"
                >
                  ✖
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="add-member">
        <div className="add-member-row">
          <h2 className="add-member-label">Add Member</h2>
          <input
            type="text"
            placeholder="Enter NetID"
            value={newMemberNetID}
            onChange={(e) => setNewMemberNetID(e.target.value)}
            className="netid-input"
          />
          <button
            onClick={handleAddMember}
            disabled={remainingInvites === 0}
            className="send-invitation-button"
          >
            Send Invitation
          </button>
        </div>
        <div
          className={`remaining-invites ${
            remainingInvites === 0 ? "error" : ""
          }`}
        >
          Remaining Invites: {remainingInvites}
        </div>
      </div>
      <button className="leave-button" onClick={handleLeaveGroup}>
        Leave Group
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  ) : (
    <StudentAccessOnly />
  );
};

export default MyGroup;
