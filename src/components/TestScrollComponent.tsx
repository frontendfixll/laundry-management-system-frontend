import React from 'react';

export default function TestScrollComponent() {
  return (
    <div 
      style={{
        width: '250px',
        height: '400px',
        border: '2px solid red',
        overflowY: 'scroll',
        backgroundColor: 'white',
        position: 'fixed',
        top: '50px',
        left: '20px',
        zIndex: 9999,
        padding: '10px'
      }}
    >
      <h3 style={{ color: 'red', marginBottom: '10px' }}>TEST SCROLL COMPONENT</h3>
      {Array.from({ length: 50 }, (_, i) => (
        <div 
          key={i}
          style={{
            padding: '8px',
            marginBottom: '4px',
            backgroundColor: i % 2 === 0 ? '#f0f0f0' : '#e0e0e0',
            borderRadius: '4px'
          }}
        >
          Scroll Test Item {i + 1}
        </div>
      ))}
    </div>
  );
}