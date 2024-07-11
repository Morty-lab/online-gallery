import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { firebaseDatabase } from "./config/firebase-config";
import AlbumCard from "./components/AlbumCard/AlbumCard.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";

function App() {
  const galleryRef = collection(firebaseDatabase, "photos");
  const [galleryData, setGalleryData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [yearData, setYearData] = useState([]);

  useEffect(() => {
    const getGallery = async () => {
      const data = await getDocs(galleryRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setGalleryData(filteredData);
    };

    

    getGallery();

    
  }, []);

  useEffect(() => {
    if (galleryData.length > 0) {
      // Extract unique years from the galleryData
      const years = galleryData.map(item => item.albumDate.toDate().getFullYear());
      const uniqueYears = [...new Set(years)];
      // Sort the years in descending order
      setYearData(uniqueYears.sort((a, b) => b - a));
    }

    const years = galleryData.map(item => item.albumDate.toDate().getFullYear());

    // Find the maximum year
    const maxYear = Math.max(...years);
    setSelectedYear(maxYear);
  }, [galleryData]);

  useEffect(() => {
    if (selectedYear) {
      const filteredByYear = galleryData.filter(item => item.albumDate.toDate().getFullYear() === parseInt(selectedYear));
      setFilteredItems(filteredByYear);
    } else {
      setFilteredItems(galleryData);
    }
  }, [selectedYear, galleryData]);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  console.log(filteredItems);

  return (
    <div className="flex h-screen">
      <Sidebar arr={yearData} onSelectYear={handleYearSelect} />
      <div className="flex-grow bg-blue-200 p-5 lg:px-32 lg:pt-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => (
            <AlbumCard
              key={index}
              image={item.photoURL}
              header="Album Name"
              content={item.photoURL}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
