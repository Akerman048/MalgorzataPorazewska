// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"; // ⬅️ ОБОВ'ЯЗКОВО!
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

//   import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZzv1ch_ixnPEW3d5WaJMQfpE65aQPMXo",
  authDomain: "malgorzataporazewska.firebaseapp.com",
  projectId: "malgorzataporazewska",
  storageBucket: "malgorzataporazewska.firebasestorage.app",
  messagingSenderId: "707519712923",
  appId: "1:707519712923:web:7a6048d84d686a0752003e",
  measurementId: "G-22W3B28QND",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);





export { db, auth, provider, storage };
