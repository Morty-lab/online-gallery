import PropTypes from "prop-types";

const Sidebar = ({ arr, onSelectYear }) => {
  return (
    <div className="bg-gray-800 text-white w-36 h-screen overflow-auto">
      <div className="p-6">
        <h2 className="text-xl font-semibold">Menu</h2>
        <ul>
          {arr.map((item, index) => (
            <li key={index} onClick={() => onSelectYear(item)}>
              <a href="#" className="block p-2 hover:bg-gray-700">{item}</a>
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
