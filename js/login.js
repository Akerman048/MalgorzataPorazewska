import { auth, provider } from "./firebase-config.js";
import {
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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

document.getElementById("logout").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("👋 You have been logged out.");

      const loginStatus = document.getElementById("admin__login-status");
      loginStatus.textContent = "You have logged out.";
      loginStatus.style.color = "black";
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("❌ Logout error: " + error.message);
    });
});
