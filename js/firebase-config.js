// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"; // ⬅️ ОБОВ'ЯЗКОВО!
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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

document.getElementById("google-login").addEventListener("click", () => {
  const loginStatus = document.getElementById("admin__login-status");
  loginStatus.textContent = "Logging in...";

  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      alert(`Hello, ${user.displayName}! You are logged in as ${user.email}`);
      loginStatus.textContent = `✅ Hello, ${user.displayName}! You are logged in as ${user.email}`;
      loginStatus.style.color = "green";
    })
    .catch((error) => {
      console.log(error);
      alert("Login error: " + error.message);
      loginStatus.textContent = "❌ Login error: " + error.message;
      loginStatus.style.color = "red";
    });
});



export { db };
