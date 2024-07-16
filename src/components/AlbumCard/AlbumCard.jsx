import "./AlbumCard.css";
import PropTypes from "prop-types";
const AlbumCard = ({ image, header, content }) => {
 

  // Style object with conditional backgroundSize
  const cardStyle = {
    backgroundImage: `url('${image}')`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
    backgroundSize: "auto 80%", 
  };

  return (
    <div className="card" style={cardStyle}>
      <div className="card__content">
        <p className="card__title">{header}</p>
        <p className="card__description">{content}</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6v6z"></path>
          <polyline points="18 7 10 9 18 13"></polyline>
        </svg>
      </div>
    </div>
  );
};

AlbumCard.propTypes = {
  image: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

export default AlbumCard;
