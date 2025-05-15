import { auth, provider } from "./firebase-config.js";
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

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