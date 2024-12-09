import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import StudentAccessOnly from "../Components/StudentAccessOnly";
import "../App.css";

const MyGroup = ({ username, adminStatus, adminToggle }) => {
  const [group, setGroup] = useState(null); // Group details
  const [members, setMembers] = useState([]); // Group members
  const [pendingMembers, setPendingMembers] = useState([]); // Pending members in the group
  const [pendingInvites, setPendingInvites] = useState([]); // Pending invites
  const [newMemberNetID, setNewMemberNetID] = useState(""); // Input for adding a new member
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error message
  const [collapsedStates, setCollapsedStates] = useState({});
  const [remainingInvites, setRemainingInvites] = useState(0); // Track remaining invites
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Fetch user's group information
        const groupResponse = await fetch("/api/my_group");
        const groupData = await groupResponse.json();

        if (groupData.group_id) {
          setGroup(groupData.group_id);
          setMembers(groupData.members);
          setRemainingInvites(groupData.remaining_invites);

          try {
            // Fetch pending members for the group
            const pendingMembersResponse = await fetch(
              `/api/group_pending_members?group_id=${groupData.group_id}`
            );
            const pendingData = await pendingMembersResponse.json();

            if (pendingData.pending_members) {
              setPendingMembers(pendingData.pending_members);
            }
          } catch (error) {
            console.error("Error fetching pending members:", error);
          }
        } else {
          setGroup(null);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching group data:", error);
        setError("Failed to load group data. Please try again later.");
        setLoading(false);
      }
    };

    const fetchPendingInvites = async () => {
      try {
        // Fetch pending invites
        const invitesResponse = await fetch("/api/my_pending_invites");
        const invitesData = await invitesResponse.json();

        if (invitesData.invites) {
          setPendingInvites(invitesData.invites);

          // Initialize collapsed states: oldest invite expanded, others collapsed
          const initialCollapsedStates = invitesData.invites.reduce(
            (acc, invite, index) => {
              acc[invite.group_id] = index !== 0; // Expand only the oldest (index 0)
              return acc;
            },
            {}
          );
          setCollapsedStates(initialCollapsedStates);
        }
      } catch (error) {
        console.error("Error fetching pending invites:", error);
      }
    };

    // Execute both fetch functions
    fetchGroupData();
    fetchPendingInvites();
  }, []);

  const toggleCollapse = (groupId) => {
    setCollapsedStates((prevStates) => ({
      ...prevStates,
      [groupId]: !prevStates[groupId],
    }));
  };

  const expandAll = () => {
    setCollapsedStates((prevStates) =>
      Object.keys(prevStates).reduce((acc, key) => {
        acc[key] = false; // Expand all
        return acc;
      }, {})
    );
  };

  const collapseAll = () => {
    setCollapsedStates((prevStates) =>
      Object.keys(prevStates).reduce((acc, key) => {
        acc[key] = true; // Collapse all
        return acc;
      }, {})
    );
  };

  const handleAcceptInvite = (groupId) => {
    MySwal.fire({
      title: `Are you sure you want to join group ${groupId}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, join!",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (!result.isConfirmed) return;

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
            setPendingInvites((prevInvites) =>
              prevInvites.filter((invite) => invite.group_id !== groupId)
            ); // Remove the accepted invite

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
    });
  };

  const handleRemoveInvitation = (inviteeNetID) => {
    MySwal.fire({
      title: `Are you sure you want to remove the invitation for ${inviteeNetID}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (!result.isConfirmed) return;

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

          MySwal.fire({
            title: data.message,
            icon: "success",
          });

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
    });
  };

  const handleCreateGroup = () => {
    MySwal.fire({
      title: "Are you sure you want to create a group?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, create it!",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (!result.isConfirmed) return;

      setLoading(true);

      // Make the API call to create the group
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

            MySwal.fire({
              title: "Group created successfully!",
              icon: "success",
            });
          } else {
            // Other errors
            setError(
              data.error || "An error occurred while creating the group."
            );

            MySwal.fire({
              title: "Error!",
              text: data.error || "An error occurred while creating the group.",
              icon: "error",
            });
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error creating group:", error);
          setError("Failed to create group. Please try again later.");

          MySwal.fire({
            title: "Error!",
            text: "Failed to create group. Please try again later.",
            icon: "error",
          });
          setLoading(false);
        });
    });
  };

  const handleAddMember = () => {
    // Regular expression to match valid NetIDs
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
          MySwal.fire({
            title: data.message,
            icon: "success",
          });

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

          MySwal.fire({
            title: "Error!",
            text: data.error,
            icon: "error",
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error adding member:", error);
        setError("Failed to send invitation. Please try again later.");

        MySwal.fire({
          title: "Error!",
          text: "Failed to send invitation. Please try again later.",
          icon: "error",
        });

        setLoading(false);
      });
  };

  const handleLeaveGroup = () => {
    MySwal.fire({
      title: "Are you sure you want to leave this group?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, leave it!",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (!result.isConfirmed) return;

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
            MySwal.fire({
              title: data.message,
              icon: "success",
            });

            setGroup(null);
            setMembers([]);
            setPendingMembers([]);
            setError(""); // Clear error state

            fetch("/api/my_pending_invites")
              .then((response) => response.json())
              .then((invitesData) => {
                if (invitesData.invites) {
                  setPendingInvites(invitesData.invites);

                  const initialCollapsedStates = invitesData.invites.reduce(
                    (acc, invite, index) => {
                      acc[invite.group_id] = index !== 0; // Expand only the oldest (index 0)
                      return acc;
                    },
                    {}
                  );
                  setCollapsedStates(initialCollapsedStates);
                } else {
                  setPendingInvites([]); // No invites
                  setCollapsedStates({}); // Clear collapsed states
                }
              })
              .catch((error) => {
                console.error(
                  "Error fetching pending invites after leaving group:",
                  error
                );
              });
          } else if (data.error) {
            setError(data.error);
            MySwal.fire({
              title: "Error!",
              text: data.error,
              icon: "error",
            });
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error leaving group:", error);
          setError("Failed to leave group. Please try again later.");
          MySwal.fire({
            title: "Error!",
            text: "Failed to leave group. Please try again later.",
            icon: "error",
          });
          setLoading(false);
        });
    });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  // Show all invitations
  if (!group && pendingInvites.length > 0) {
    return (
      <div className="my-group">
        <h1>My Group</h1>
        <div className="create-group-container">
          <button className="create-group-button" onClick={handleCreateGroup}>
            Create Group
          </button>
        </div>
        <p>You have been invited to join the following groups:</p>
        <div className="controls">
          <button onClick={expandAll} className="expand-all-button">
            Expand All
          </button>
          <button onClick={collapseAll} className="collapse-all-button">
            Collapse All
          </button>
        </div>
        <div className="pending-invites-container">
          {pendingInvites.map((invite, index) => (
            <div key={index} className="invite-card">
              <h3
                className="invite-title"
                onClick={() => toggleCollapse(invite.group_id)}
                style={{ cursor: "pointer" }}
              >
                Group {invite.group_id}{" "}
                {collapsedStates[invite.group_id] ? "➕" : "➖"}
              </h3>
              {!collapsedStates[invite.group_id] && (
                <div className="invite-details">
                  <p>Current Members:</p>
                  <ul className="current-members">
                    {invite.members.map((member, idx) => (
                      <li key={idx} className="member-item">
                        {member}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="accept-button"
                    onClick={() => handleAcceptInvite(invite.group_id)}
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          ))}
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
