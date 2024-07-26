import { useParams } from "react-router-dom";
import {
  query,
  getDocs,
  orderBy,
  startAt,
  endAt,
  collection,
  Timestamp,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { firebaseDatabase } from "../config/firebase-config";
import { useEffect, useState } from "react";

const Albumpage = () => {
  const { id } = useParams();
  const [month, year] = id.split("_");
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [albumData, setAlbumData] = useState([]);

  const handleClick = (id) => {
    if (selectedImageId === id) {
      setSelectedImageId(null); // Deselect if the same image is clicked again
    } else {
      setSelectedImageId(id);
    }
  };

  const setAsDedicatedImage = async (newImageId) => {
    try {
      // Find the current dedicated image
      const currentDedicatedImage = albumData.find(
        (photo) => photo.dedicatedImage === true
      );

      // Update the current dedicated image to false if it exists
      if (currentDedicatedImage) {
        const currentDocRef = doc(
          firebaseDatabase,
          "photos",
          currentDedicatedImage.id
        );
        await updateDoc(currentDocRef, { dedicatedImage: false });
      }

      // Set the new image as dedicated
      const newDocRef = doc(firebaseDatabase, "photos", newImageId);
      await updateDoc(newDocRef, { dedicatedImage: true });

      // Update local state
      setAlbumData((prevData) =>
        prevData.map((photo) =>
          photo.id === newImageId
            ? { ...photo, dedicatedImage: true }
            : {
                ...photo,
                dedicatedImage:
                  photo.id === (currentDedicatedImage?.id || null)
                    ? false
                    : photo.dedicatedImage,
              }
        )
      );
      alert("Image has been set as dedicated!");
    } catch (error) {
      console.error("Error setting image as dedicated:", error);
      alert("Failed to set image as dedicated.");
    }
  };

  const deleteImage = async (imageId) => {
    try {
      const docRef = doc(firebaseDatabase, "photos", imageId);
      await deleteDoc(docRef);
      setAlbumData((prevData) =>
        prevData.filter((photo) => photo.id !== imageId)
      );
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchDataForMonthAndYear = async (month, year) => {
      const startDateObject = new Date(year, month - 1);
      const endDateObject = new Date(year, month);

      const startOfCurrentMonth = Timestamp.fromDate(startDateObject);
      const endOfCurrentMonth = Timestamp.fromDate(endDateObject);

      const q = query(
        collection(firebaseDatabase, "photos"),
        orderBy("albumDate"),
        startAt(startOfCurrentMonth),
        endAt(endOfCurrentMonth)
      );

      const querySnapshot = await getDocs(q);
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });

      return docs;
    };

    fetchDataForMonthAndYear(month, year).then((data) => {
      setAlbumData(data);
      setIsLoading(false);
    });
  }, []);

  console.log(albumData);
  return (
    <div className="flex p-6 ms-28">
      <button
        onClick={() => window.history.back()}
        className="absolute top-0 left-0 m-4 bg-transparent  py-2 px-4 rounded"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="#000000"
          viewBox="0 0 256 256"
          className="hover:fill-[#2d5a6c]"
        >
          <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
        </svg>
      </button>
      <div className="grid grid-cols-3 gap-4">
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
          albumData.map((photo) => {
            return (
              <div key={photo.id}>
                <div
                  className="group bg-gray-400 rounded-xl w-auto h-auto  max-h-52 max-w-[22rem] py-3 px-4  flex flex-col justify-items-center"
                  onClick={() => handleClick(photo.id)}
                >
                  <img
                    src={photo.photoURL}
                    alt="Image"
                    className="max-w-80 w-auto h-auto  rounded-xl "
                  />
                <span className="bg-black bg-opacity-50 text-white py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {photo.albumDate.toDate().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span> 
                </div>
                
                {selectedImageId === photo.id && (
                  <>
                    <button
                      className="z-50 mt-2 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAsDedicatedImage(photo.id);
                      }}
                    >
                      Set as Dedicated Image
                    </button>
                    <button
                      className="z-50 mt-2 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(photo.id);
                      }}  
                    >
                      Delete Image
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Albumpage;
