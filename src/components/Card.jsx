import React from 'react';
import { getCardDisplay, getCardColor } from '../utils/gameLogic.js';

const Card = ({ card, onClick, isPlayable = false, isSelected = false }) => {
  if (!card) return null;
  
  const { rank, suit, color } = getCardDisplay(card);
  
  const cardStyle = {
    display: 'inline-block',
    padding: '10px 14px',
    margin: '4px',
    background: 'white',
    borderRadius: '6px',
    cursor: isPlayable ? 'pointer' : 'default',
    fontWeight: 'bold',
    color: color,
    border: isSelected ? '3px solid #FFD700' : '1px solid #ccc',
    transform: isSelected ? 'translateY(-2px)' : 'none',
    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    minWidth: '40px',
    textAlign: 'center',
    fontSize: '1.1rem'
  };
  
  const handleClick = () => {
    if (isPlayable && onClick) {
      onClick();
    }
  };
  
  return (
    <div 
      style={cardStyle} 
      onClick={handleClick}
      className={`card ${isPlayable ? 'playable' : ''} ${isSelected ? 'selected' : ''}`}
    >
      <div>{rank}</div>
      <div>{suit}</div>
    </div>
  );
};

export default Card;