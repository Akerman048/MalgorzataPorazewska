import { auth, provider, db } from "./firebase-config.js";
import {
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { applyThemeSettings } from "./theme.js"; // reuse shared theme logic

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
onAuthStateChanged(auth, async (user) => {
  const loginStatus = document.getElementById("admin__login-status");

  if (user) {
    loginStatus.textContent = `✅ Welcome back, ${user.displayName}!`;
    loginStatus.style.color = "green";

    document.getElementById("color-settings").style.display = "block";
    document.getElementById("font-settings").style.display = "block";
    document.getElementById("cursor-settings").style.display = "block";
    document.getElementById("backgroungColor-settings").style.display = "block";
    document.getElementById("contactModalColorControls").style.display = "block";

    await loadAllGoogleFonts();
    await loadAdminSettings();
  } else {
    loginStatus.textContent = "You are not logged in.";
    loginStatus.style.color = "gray";

    document.getElementById("color-settings").style.display = "none";
    document.getElementById("font-settings").style.display = "none";
    document.getElementById("cursor-settings").style.display = "none";
    document.getElementById("backgroungColor-settings").style.display = "none";
    document.getElementById("contactModalColorControls").style.display = "none";
  }
});


const loadAllGoogleFonts = async () => {
  const apiKey = "AIzaSyDJ_J7GpMa2nj0dZBgaj8W_NZ99gnha-FY"; // use your real API key
  const headingSelect = document.getElementById("headingFontSelect");
  const bodySelect = document.getElementById("bodyFontSelect");
  const headerNameSelect = document.getElementById("headerNameFontSelect");

  try {
    const res = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`
    );
    const data = await res.json();

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("Missing font list from API.");
    }

    headingSelect.innerHTML = "";
    bodySelect.innerHTML = "";
    headerNameSelect.innerHTML = "";

    data.items.forEach((font) => {
      const option1 = document.createElement("option");
      const option2 = document.createElement("option");
      const option3 = document.createElement("option");

      const value = `'${font.family}'`;

      option1.value = value;
      option1.textContent = font.family;

      option2.value = value;
      option2.textContent = font.family;

      option3.value = value;
      option3.textContent = font.family;

      headingSelect.appendChild(option1);
      bodySelect.appendChild(option2);
      headerNameSelect.appendChild(option3);
    });
  } catch (err) {
    console.error("❌ Font loading error:", err);
    headingSelect.innerHTML = "<option disabled>Error loading fonts</option>";
    bodySelect.innerHTML = "<option disabled>Error loading fonts</option>";
    headerNameSelect.innerHTML = "<option disabled>Error loading fonts</option>";
  }
};


document.getElementById("google-login").addEventListener("click", () => {
  const loginStatus = document.getElementById("admin__login-status");
  loginStatus.textContent = "Logging in...";

  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      loginStatus.textContent = `✅ Hello, ${user.displayName}!`;
      loginStatus.style.color = "green";

      document.getElementById("color-settings").style.display = "block";
      document.getElementById("font-settings").style.display = "block";

      loadAllGoogleFonts();
    })
    .catch((error) => {
      loginStatus.textContent = "❌ Login error: " + error.message;
      loginStatus.style.color = "red";
    });
});

document.getElementById("logout").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("👋 You have been logged out.");
      document.getElementById("admin__login-status").textContent =
        "You have logged out.";
    })
    .catch((error) => {
      alert("❌ Logout error: " + error.message);
    });
});

async function loadAdminSettings() {
  try {
    const docSnap = await getDoc(doc(db, "siteSettings", "theme"));

    if (!docSnap.exists()) return;

    const data = docSnap.data();

    const bodyColor = document.getElementById("bodyColor");
    const headingColor = document.getElementById("headingColor");
    const headingFontSelect = document.getElementById("headingFontSelect");
    const bodyFontSelect = document.getElementById("bodyFontSelect");
    const headerNameFontSelect = document.getElementById("headerNameFontSelect");
    const cursorColor = document.getElementById("cursorColor");
    const mainBackGroundColor = document.getElementById("mainBackGroundColor");
    const accentBackGroundColor = document.getElementById("accentBackGroundColor");
    const contactModalColor = document.getElementById("contactModalColor");

    if (bodyColor && data.bodyColor) bodyColor.value = data.bodyColor;
    if (headingColor && data.headingColor) headingColor.value = data.headingColor;

    if (headingFontSelect && data.headingFont) headingFontSelect.value = data.headingFont;
    if (bodyFontSelect && data.bodyFont) bodyFontSelect.value = data.bodyFont;
    if (headerNameFontSelect && data.headerNameFont) headerNameFontSelect.value = data.headerNameFont;

    if (cursorColor && data.cursorColor) cursorColor.value = data.cursorColor;
    if (mainBackGroundColor && data.mainBackGroundColor) {
      mainBackGroundColor.value = data.mainBackGroundColor;
    }
    if (accentBackGroundColor && data.accentBackGroundColor) {
      accentBackGroundColor.value = data.accentBackGroundColor;
    }
    if (contactModalColor && data.contactModalColor) {
      contactModalColor.value = data.contactModalColor;
    }
  } catch (err) {
    console.error("❌ Failed to load admin settings:", err);
  }
}

document.getElementById("save-cursor").addEventListener("click", async () => {
  const cursorColor = document.getElementById("cursorColor").value;

  await setDoc(
    doc(db, "siteSettings", "theme"),
    { cursorColor },
    { merge: true }
  );

  alert("✅ Cursor color saved!");
});

document.getElementById("save-backgroundColors").addEventListener("click", async () => {
  const mainBackGroundColor = document.getElementById("mainBackGroundColor").value;
  const accentBackGroundColor = document.getElementById("accentBackGroundColor").value;

  await setDoc(
    doc(db, "siteSettings", "theme"),
    {
      mainBackGroundColor,
      accentBackGroundColor,
    },
    { merge: true }
  );

  alert("✅ Background colors saved!");
});

document.getElementById("saveContactModalColor").addEventListener("click", async () => {
  const contactModalColor = document.getElementById("contactModalColor").value;

  await setDoc(
    doc(db, "siteSettings", "theme"),
    { contactModalColor },
    { merge: true }
  );

  alert("✅ Contact modal color saved!");
});

document.getElementById("save-colors").addEventListener("click", async () => {
  const bodyColor = document.getElementById("bodyColor").value;
  const headingColor = document.getElementById("headingColor").value;

  await setDoc(
    doc(db, "siteSettings", "theme"),
    {
      bodyColor,
      headingColor,
    },
    { merge: true }
  ); // ✅ Prevents overwriting fonts

  alert("🎉 Colors saved!");
  applyThemeSettings();
});

document.getElementById("save-fonts").addEventListener("click", async () => {
  const headingFont = document.getElementById("headingFontSelect").value;
const bodyFont = document.getElementById("bodyFontSelect").value;
const headerNameFont = document.getElementById("headerNameFontSelect").value;

await setDoc(
  doc(db, "siteSettings", "theme"),
  {
    headingFont,
    bodyFont,
    headerNameFont,
  },
  { merge: true }
);


  alert("🎉 Fonts saved!");
  applyThemeSettings();
});
