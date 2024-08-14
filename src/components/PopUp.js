import React from "react";
import "../styles/pop-up.css";

function PopUp({ selectedBox, onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-close" onClick={onClose}>
          Close
        </div>
        <div>You selected apartment number {selectedBox}</div>
      </div>
    </div>
  );
}

export default PopUp;
