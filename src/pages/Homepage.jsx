import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { firebaseDatabase } from "../config/firebase-config";
import AlbumCard from "../components/AlbumCard/AlbumCard.jsx";
import Sidebar from "../components/Sidebar/Sidebar.jsx";

const Homepage = () => {
  const galleryRef = collection(firebaseDatabase, "photos");
  const [galleryData, setGalleryData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [months, setMonths] = useState([
    { name: "January", number: 1 },
    { name: "February", number: 2 },
    { name: "March", number: 3 },
    { name: "April", number: 4 },
    { name: "May", number: 5 },
    { name: "June", number: 6 },
    { name: "July", number: 7 },
    { name: "August", number: 8 },
    { name: "September", number: 9 },
    { name: "October", number: 10 },
    { name: "November", number: 11 },
    { name: "December", number: 12 },
  ]);

  //useEffect to fetch data
  useEffect(() => {
    const getGallery = async () => {
      setIsLoading(true);
      const data = await getDocs(galleryRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setGalleryData(filteredData);
      setIsLoading(false);
    };

    getGallery();
  }, []);

  //useEffect to get years
  useEffect(() => {
    if (galleryData.length > 0) {
      const years = galleryData.map((item) =>
        item.albumDate.toDate().getFullYear()
      );
      const uniqueYears = [...new Set(years)];
      // Sort the years in descending order
      setYearData(uniqueYears.sort((a, b) => b - a));
    }

    const years = galleryData.map((item) =>
      item.albumDate.toDate().getFullYear()
    );

    // Find the maximum year
    const maxYear = Math.max(...years);
    setSelectedYear(maxYear);
  }, [galleryData]);

  //useEffect to filter data by years
  useEffect(() => {
    if (selectedYear) {
      const filteredByYear = galleryData.filter(
        (item) =>
          item.albumDate.toDate().getFullYear() === parseInt(selectedYear)
      );
      setFilteredItems(filteredByYear);
    } else {
      setFilteredItems(galleryData);
    }
  }, [selectedYear, galleryData]);

  // useEffect to push data to months
  useEffect(() => {
    if (selectedYear) {
      const filteredByYear = galleryData.filter(
        (item) =>
          item.albumDate.toDate().getFullYear() === parseInt(selectedYear)
      );
      // Map through the filteredByYear array
      filteredByYear.forEach((item) => {
        // Get the month number from the item's date
        const albumDate = item.albumDate.toDate();
        const monthNumber = albumDate.getMonth();

        

        // Find the corresponding month object in the monthsWithDetails array
        const monthObject = months.find(
          (month) => month.number === monthNumber + 1
        );

        // If the month object exists and has dedicatedImage: true, add confirmed: true
        if (monthObject && item.dedicatedImage == true) {
          monthObject.dedicatedImage = item.photoURL;
        }
      });
    }
  }, [selectedYear]);

  //select year function
  const handleYearSelect = (year) => {
    setSelectedYear(year);

    setMonths([
      { name: "January", number: 1 },
      { name: "February", number: 2 },
      { name: "March", number: 3 },
      { name: "April", number: 4 },
      { name: "May", number: 5 },
      { name: "June", number: 6 },
      { name: "July", number: 7 },
      { name: "August", number: 8 },
      { name: "September", number: 9 },
      { name: "October", number: 10 },
      { name: "November", number: 11 },
      { name: "December", number: 12 },
    ]);
  };

  // console.log(filteredItems);
  console.log(months);
  return (
    <div className="flex">
      <div className="py-5 px-2">
        <Sidebar arr={yearData} onSelectYear={handleYearSelect} />
      </div>

      <div className="flex-grow bg-gray-200 p-5 lg:px-32 lg:pt-12 ">
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            {/* Wrapper div for the Lottie player */}
            <dotlottie-player
              src="https://lottie.host/042f279f-8a73-4849-ae2f-76c4b1932560/tIxxIJ5lRU.json"
              background="transparent"
              speed="1"
              style={{ width: "500px", height: "500px" }}
              loop
              autoplay
            ></dotlottie-player>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
            {months.map((item, index) => (
              <AlbumCard
                key={index}
                id={item.number +'_'+selectedYear}
                image={item.dedicatedImage || "assets/defaultImage.png"}
                header={item.name}
                content={item.photoURL}
                // openAlbum={() => openAlbum(item.number)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
