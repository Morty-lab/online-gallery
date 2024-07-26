// ImageUploader.js
import { useState } from "react";
import { firebaseDatabase, firebaseStorage } from "../config/firebase-config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const ImageUploader = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleDateChange = (event) => {
    setSelectedDate(new Date(event.target.value));
  };

  const handleUpload = async () => {
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }

    setUploading(true);

    const uploadPromises = images.map(async (image) => {
      const storageRef = ref(firebaseStorage, `images/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const docRef = await addDoc(
              collection(firebaseDatabase, "photos"),
              {
                photoURL: downloadURL,
                dedicatedImage: false,
                albumDate: Timestamp.fromDate(new Date(selectedDate)),
              }
            );
            resolve(docRef);
          }
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
      alert("All images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploading(false);
      setImages([]);
    }
  };

  return (
    <>
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md">
          <input
            type="file"
            multiple
            onChange={handleImageChange}
            accept="image/*"
            className="mb-4 block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-[#2d5a6c] file:text-[#F5F5DC]
                   hover:file:bg-[#ADD8E6] hover:file:text-[#2d5a6c]"
          />
          <input
            type="date"
            onChange={handleDateChange}
            className="mb-4 block w-full px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2d5a6c] bg-white"
          />
          <div className="flex flex-wrap gap-4 mb-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Selected ${index}`}
                  className="w-36 h-36 object-cover rounded-md border border-gray-200"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full px-4 py-2 text-white hover:text-[#2d5a6c] rounded-md focus:outline-none ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#2d5a6c] hover:bg-[#ADD8E6]"
            }`}
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ImageUploader;
