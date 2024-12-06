import React, { useState, useEffect } from "react";
import AdminAccessOnly from "../Components/AdminAccessOnly";
import "../App.css";

const AllGroups = ({ username, adminStatus, adminToggle }) => {
    const [groups, setGroups] = useState([]);
    // const [groupMembers, setGroupMembers] = useState([]); // Start with the user only
    const [collapsedStates, setCollapsedStates] = useState([]);
    const [error, setError] = useState(null);


    useEffect(() => {
        // skip the first iteration on StrictMode
        if (!username) {
            return;
        }

        console.log("netid:", username);
        setError(null);

        // Fetch the reviews from the API
        fetch(`/api/get_all_groups?netid=${username}`, {
            method: "GET",
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
                    setGroups(data.all_groups);

                    // Initialize collapsedStates with all group numbers as collapsed (true)
                    const initialStates = Object.keys(data.all_groups).reduce((acc, key) => {
                        acc[key] = true;
                        return acc;
                    }, {});
                    setCollapsedStates(initialStates);
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

    // if (error) {
    //     return <div>Error: {error}</div>;
    // }

    // Toggle collapse/expand state for a single group
    const toggleCollapse = (group) => {
        setCollapsedStates((prevStates) => ({
            ...prevStates,
            [group]: !prevStates[group],
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





    return adminStatus && !adminToggle ? (
        <div className="all-groups-page">
            <h1 className="all-groups-title">All Groups</h1>
            {Object.keys(groups).length > 0 && ( // Render controls only if there are groups
                <div className="controls">
                    <button onClick={expandAll} className="expand-button">
                        Expand All
                    </button>
                    <button onClick={collapseAll} className="collapse-button">
                        Collapse All
                    </button>
                </div>
            )}
            {Object.keys(groups).length === 0 ? ( // Check if there are no groups
                <p className="no-groups-message">No groups formed yet</p>
            ) : (
                Object.entries(groups).map(([groupNumber, members]) => (
                    <div key={groupNumber} className="saved-rooms-section">
                        <h2
                            className="saved-rooms-title"
                            onClick={() => toggleCollapse(groupNumber)}
                            style={{ cursor: "pointer" }}
                        >
                            {`Group ${groupNumber}`}{" "}
                            {collapsedStates[groupNumber] ? "➕" : "➖"}
                        </h2>
                        {!collapsedStates[groupNumber] && (
                            <table className="group-members-table">
                                <thead>
                                    <tr>
                                        <th>Members</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member, index) => (
                                        <tr key={index}>
                                            <td>{member}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ))
            )}
        </div>
    ) : (
        <AdminAccessOnly />
    );
};

export default AllGroups;
