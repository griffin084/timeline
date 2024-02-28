import React, { useState } from 'react';

const Tooltip = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  // display tooltip text
  const showTooltip = () => {
    setIsVisible(true);
  };

  // hide tooltip text
  const hideTooltip = () => {
    setIsVisible(false);
  };

  // display message text on mouse hover and hide otherwise
  return (
    <div className="tooltip-container">
      <div className="question-icon" onMouseOver={showTooltip} onMouseOut={hideTooltip}>
        <b>?</b>
      </div>
      {isVisible && (
        <div className="tooltip">
          {message}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
