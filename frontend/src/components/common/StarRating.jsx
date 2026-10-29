import React from "react";

/**
 * Interactive star rating component.
 *
 * Props:
 *   value     – current selected rating (number)
 *   onChange  – callback(newScore) when a star is clicked
 *   readonly  – if true, renders as display-only (no hover / click)
 *   size      – optional CSS font-size override (e.g. "1.2rem")
 */
const StarRating = ({ value = 0, onChange, readonly = false, size }) => {
  const [hovered, setHovered] = React.useState(0);

  const handleClick = (score) => {
    if (!readonly && onChange) onChange(score);
  };

  return (
    <div
      className="star-rating"
      role={readonly ? "img" : "group"}
      aria-label={`Rating: ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hovered || value) ? "filled" : ""} ${readonly ? "readonly" : ""}`}
          style={size ? { fontSize: size } : undefined}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          role={readonly ? undefined : "button"}
          tabIndex={readonly ? -1 : 0}
          onKeyDown={(e) => e.key === "Enter" && handleClick(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
