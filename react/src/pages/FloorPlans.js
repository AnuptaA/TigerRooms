// src/FloorPlans.js
import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import '../App.css';

const FloorPlans = () => {
    console.log("hello");
    const [availabilityInfo] = useState([
      {hall: '1981 Hall', floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor']},
      {hall: 'Wendell B Hall', floors: ['2nd Floor', '3rd Floor', '4th Floor']},
      {hall: 'Wendell C Hall', floors: ['2nd Floor', '3rd Floor', '4th Floor']},
      {hall: 'Fisher Hall', floors: ['1st Floor', '2nd Floor', '3rd Floor']},
      {hall: 'Hargadon Hall', floors: ['2nd Floor', '3rd Floor', '4th Floor']},
      {hall: 'Lauritzen Hall', floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor']},
      {hall: 'Baker E Hall', floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor']},
      {hall: 'Baker S Hall', floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor']},
      {hall: 'Murley-Pivirotto', floors: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor']}
    ]);
    
    // const [availabilityInfo] = useState([
    //   {hall: 'Wendell B Hall', floors: ['3rd Floor']}
    // ]);

  return (
    <div>
      <h1 className='results-page-title'>Showing results for "singles"</h1>
      <h1 className='res-college-title'>Whitman College</h1>
      <AvailabilityTable
        availabilityInfo={availabilityInfo}
      />
    </div>
  );
};

const AvailabilityTable = ({availabilityInfo}) => {
  // Determine the maximum number of floors to set the number of rows
  const maxFloors = Math.max(...availabilityInfo.map(info => info.floors.length));

  // Helper function to generate URL-friendly links
  const generateLink = (hall, floor) => {
    let hallPrefix = hall.toLowerCase().replace(/\s+/g, '-');
    if (hallPrefix.endsWith('-hall')) {
      hallPrefix = hallPrefix.replace(/-hall$/, ''); // Remove "-hall" suffix
    }
    const floorPrefix = floor.toLowerCase().replace(/\s+/g, '-');
    return `../floorplans/${hallPrefix}-${floorPrefix}`;
  };

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          {availabilityInfo.map((info, index) => (
            <th key={index} style={{ border: 'none', padding: '8px', textAlign: 'left' }}>
              {info.hall}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(maxFloors)].map((_, rowIndex) => (
          <tr key={rowIndex}>
            {availabilityInfo.map((info, colIndex) => (
              <td key={colIndex} style={{ border: 'none', padding: '8px', textAlign: 'left' }}>
                {info.floors[rowIndex] ? (
                  <a href={generateLink(info.hall, info.floors[rowIndex])}>
                    {info.floors[rowIndex]}
                  </a>
                ) : (
                  ''
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FloorPlans;
