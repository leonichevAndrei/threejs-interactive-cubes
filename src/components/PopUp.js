import React from "react";
import "../styles/pop-up.css";

function PopUp({ selectedBox, onClose }) {
  const isTouchScreen = window.matchMedia('(pointer: coarse)').matches;
  return (
    <div className="popup-overlay" onClick={(e) => onClose(e, isTouchScreen)}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-close" onClick={(e) => onClose(e, isTouchScreen)}>
          Close
        </div>
        <div>You selected apartment number {selectedBox}</div>
      </div>
    </div>
  );
}

export default PopUp;
