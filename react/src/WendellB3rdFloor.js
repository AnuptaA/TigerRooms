// src/WendellB3rdFloor.js
import React, { useState } from 'react';
import './App.css';
import image from './img/floorplans/Wendell_B_Hall_Floor_3.png';

const WendellB3rdFloor = () => {
  // Initial state for roomInfo
  const [roomInfo] = useState([
    { name: 'Wendell B308', size: 'Size: 152 sqft', occupancy: 'Occupancy: Single', isAvailable: 'T' },
    { name: 'Wendell B309', size: 'Size: 300 sqft', occupancy: 'Occupancy: Double', isAvailable: 'F' },
    { name: 'Wendell B310', size: 'Size: 432 sqft', occupancy: 'Occupancy: Quad', isAvailable: 'T' },
    { name: 'Wendell B311', size: 'Size: 500 sqft', occupancy: 'Occupancy: Triple', isAvailable: 'F' },
    { name: 'Wendell B312', size: 'Size: 3000 sqft', occupancy: 'Occupancy: Single', isAvailable: 'T' },
    { name: 'Wendell B313', size: 'Size: 4 sqft', occupancy: 'Occupancy: Quad', isAvailable: 'F' },
    { name: 'Wendell B314', size: 'Size: 152 sqft', occupancy: 'Occupancy: Single', isAvailable: 'T' },
    { name: 'Wendell B315', size: 'Size: 300 sqft', occupancy: 'Occupancy: Double', isAvailable: 'F' },
    { name: 'Wendell B316', size: 'Size: 432 sqft', occupancy: 'Occupancy: Quad', isAvailable: 'T' },
    { name: 'Wendell B317', size: 'Size: 500 sqft', occupancy: 'Occupancy: Triple', isAvailable: 'F' },
    { name: 'Wendell B318', size: 'Size: 3000 sqft', occupancy: 'Occupancy: Single', isAvailable: 'T' },
    { name: 'Wendell B320', size: 'Size: 4 sqft', occupancy: 'Occupancy: Quad', isAvailable: 'F' }
  ]);

  // State to track which rows are expanded
  const [expandedRows, setExpandedRows] = useState([]);

  // Function to handle row expansion
  const toggleExpandRow = (index) => {
    if (expandedRows.includes(index)) {
      setExpandedRows(expandedRows.filter((i) => i !== index));
    } else {
      setExpandedRows([...expandedRows, index]);
    }
  };

  return (
    <div>
      <h1 className='floor-plan-title'>Whitman College, Wendell Hall, Floor 3</h1>
      <img src={image} alt="HallMap" className="image" />
      <RoomInfoTable
        roomInfo={roomInfo}
        expandedRows={expandedRows}
        toggleExpandRow={toggleExpandRow}
      />
      <h3 style={{ marginLeft: '400px', color: 'orange' }}>
        <a href="/floorplans" style={{ textDecoration: 'none', color: 'orange' }}>Click here to return to floor plans list</a>
      </h3>
    </div>
  );
};

// Table component
const RoomInfoTable = ({ roomInfo, expandedRows, toggleExpandRow }) => {
  return (
    <table border="1" cellPadding="10">
      <thead>
        <tr>
          <th>Availabilty Info</th>
        </tr>
      </thead>
      <tbody>
        {roomInfo.map((oneRoomInfo, index) => (
          <React.Fragment key={index}>
            <tr>
              <td onClick={() => toggleExpandRow(index)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: oneRoomInfo.isAvailable === 'T' ? 'green' : 'red',
                      borderRadius: oneRoomInfo.isAvailable === 'T' ? '50%' : '0',
                      marginRight: '10px'
                    }}
                  ></div>
                  <strong>{oneRoomInfo.name}</strong> {expandedRows.includes(index) ? '➖' : '➕'}
                </div>
              </td>
            </tr>
            {expandedRows.includes(index) && (
              <tr>
                <td colSpan="3">
                  <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
                    <strong>{oneRoomInfo.size}</strong> <br /> <strong>{oneRoomInfo.occupancy}</strong>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>
            <strong>Draw Availability Key</strong><br />
            <div style={{ display: 'block', marginTop: '10px' }}>
              <div style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'green',
                    borderRadius: '50%',
                    marginRight: '5px'
                  }}
                ></div>
                <span>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'red',
                    marginRight: '5px'
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

export default WendellB3rdFloor;
