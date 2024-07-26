import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import ImageUploader from "../../pages/ImageUpload";

const Sidebar = ({ arr, onSelectYear }) => {
  return (
    <div className="bg-[#2d5a6c] text-white w-50 h-screen overflow-auto rounded-xl">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-[#F5F5DC]">Albums</h2>
        <ul>
          {arr.map((item, index) => (
            <li key={index} onClick={() => onSelectYear(item)}>
              <a
                href="#"
                className="block p-3 rounded-md text-[#F5F5DC] hover:bg-[#ADD8E6] hover:text-[#2d5a6c] transition-colors"
              >
                Year {item}
              </a>
            </li>
          ))}
          <Link to={"/upload"}>
            <li className="p-3 rounded-md text-[#F5F5DC] hover:bg-[#ADD8E6] hover:text-[#2d5a6c] transition-colors flex items-center justify-center">
              Add Image
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="#F5F5DC"
                viewBox="0 0 256 256"
              >
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
              </svg>
            </li>
          </Link>
        </ul>
      </div>
    </div>
  );
};

Sidebar.propTypes = {
  arr: PropTypes.array.isRequired,
  onSelectYear: PropTypes.func.isRequired,
};

export default Sidebar;
