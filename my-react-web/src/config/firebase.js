// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyAkTWTUcA5mlxqZn7Q5bDySigdpQ3fr_uI",
  authDomain: "chat-abe2f.firebaseapp.com",
  databaseURL: "https://chat-abe2f-default-rtdb.firebaseio.com",
  projectId: "chat-abe2f",
  storageBucket: "chat-abe2f.appspot.com",
  messagingSenderId: "414031745346",
  appId: "1:414031745346:web:31eff44dfde3f5aa6c38db",
  measurementId: "G-BMQH0NN8KD"
};

// Initialize Firebase
initializeApp(firebaseConfig); 
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

export { auth, db,storage };
