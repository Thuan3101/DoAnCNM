// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getDatabase } from "firebase/database";
// import { get, child, ref } from 'firebase/database';
import { getAuth, } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
//import  firebase  from '@firebase/app';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // process.env.REACT_APP_API_KEY
  apiKey:"AIzaSyAkTWTUcA5mlxqZn7Q5bDySigdpQ3fr_uI",
  authDomain: "chat-abe2f.firebaseapp.com",
  databaseURL: "https://chat-abe2f-default-rtdb.firebaseio.com",
  projectId: "chat-abe2f",
  storageBucket: "chat-abe2f.appspot.com",
  messagingSenderId: "414031745346",
  appId: "1:414031745346:web:31eff44dfde3f5aa6c38db",
  measurementId: "G-BMQH0NN8KD"
};


// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);

initializeApp(firebaseConfig);
export const auth = getAuth();
export const firestore = getFirestore();