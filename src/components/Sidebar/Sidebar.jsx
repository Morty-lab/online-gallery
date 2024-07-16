import PropTypes from "prop-types";

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
