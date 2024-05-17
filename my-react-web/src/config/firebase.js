// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
//import firebase from "firebase/app";

// Your web app's Firebase configuration

const firebaseConfig = {
  // apiKey: "AIzaSyAPNXQ8EAzz0pL-6FFNW5zeW9t1Eb7XNZA",
  // authDomain: "webchat-ad52f.firebaseapp.com",
  // projectId: "webchat-ad52f",
  // storageBucket: "webchat-ad52f.appspot.com",
  // messagingSenderId: "112935621456",
  // appId: "1:112935621456:web:b3f8719e8a1c75f366d255",
  // measurementId: "G-VC7PQ395M2"

  // apiKey: "AIzaSyDK00IwTDsOSbLT3ft7quJW_4flJCytqmo",
  // authDomain: "chatweb-e77e4.firebaseapp.com",
  // databaseURL: "https://chatweb-e77e4-default-rtdb.firebaseio.com",
  // projectId: "chatweb-e77e4",
  // storageBucket: "chatweb-e77e4.appspot.com",
  // messagingSenderId: "808582636966",
  // appId: "1:808582636966:web:715f15c561668008afdb67",
  // measurementId: "G-603N2359E5"

  apiKey: "AIzaSyDorN7VW7pVaKCoIg7IBtkdfIPgbc8R0W0",
  authDomain: "appchat-71caa.firebaseapp.com",
  projectId: "appchat-71caa",
  storageBucket: "appchat-71caa.appspot.com",
  messagingSenderId: "837991435480",
  appId: "1:837991435480:web:680a5c7a4f489c8e0d1bad",
  measurementId: "G-NKG5XR7D17"
  };

// Initialize Firebase
initializeApp(firebaseConfig); 
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

export { auth, db,storage };
