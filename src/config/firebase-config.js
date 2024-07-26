// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIZf1mycqTu7fw9BJ9d2d1MamLLUjH0lk",
  authDomain: "online-gallery-c0a32.firebaseapp.com",
  projectId: "online-gallery-c0a32",
  storageBucket: "online-gallery-c0a32.appspot.com",
  messagingSenderId: "722251899339",
  appId: "1:722251899339:web:52c8306d939cc85238164e",
  measurementId: "G-5S64JTK6T8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firebaseStorage = getStorage(app);
const firebaseDatabase = getFirestore(app);


export {firebaseDatabase, firebaseStorage};

