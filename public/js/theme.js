import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

export const applyThemeSettings = async () => {
  const themeRef = doc(db, "siteSettings", "theme");
  const snap = await getDoc(themeRef);

  if (snap.exists()) {
    const data = snap.data(); // 🟢 Додано
    const { bodyColor, headingColor, headingFont, bodyFont } = data;

    // ✅ Apply background colors
    if (data.backgroundColor) {
      document.body.style.backgroundColor = data.backgroundColor;
    }

    if (data.footerBackgroundColor) {
      const footer = document.querySelector("footer");
      if (footer) footer.style.backgroundColor = data.footerBackgroundColor;
    }

    // ✅ Apply theme colors
    if (bodyColor) document.body.style.color = bodyColor;
    if (headingColor)
      document.documentElement.style.setProperty(
        "--heading-color",
        headingColor
      );

    if (data.contactModalBackgroundColor) {
      const contactModals = document.getElementsByClassName("contact-modal");
      for (let el of contactModals) {
        el.style.backgroundColor = data.contactModalBackgroundColor;
      }
    }

    // ✅ Apply fonts
    if (bodyFont) {
      loadGoogleFont(bodyFont);
      document.body.style.fontFamily = `${bodyFont}, sans-serif`;
    }

    if (headingFont) {
      loadGoogleFont(headingFont);
      document.querySelectorAll("h1, h2, h3, h4, h5, .accent").forEach((el) => {
        el.style.fontFamily = `${headingFont}, sans-serif`;
        el.style.color = headingColor;
      });
    }

    if (data.headerNameFont) {
      loadGoogleFont(data.headerNameFont);
      document
        .querySelectorAll(".header__name a, .header__name--mobile a")
        .forEach((el) => {
          el.style.fontFamily = `${data.headerNameFont}, sans-serif`;
        });
    }

    // ✅ Update selects if they exist (admin mode)
    const headingSelect = document.getElementById("headingFontSelect");
    const bodySelect = document.getElementById("bodyFontSelect");
    const headerNameSelect = document.getElementById("headerNameFontSelect");

    if (headerNameSelect) {
      const match = [...headerNameSelect.options].find(
        (opt) => opt.textContent === data.headerNameFont?.replace(/['"]/g, "")
      );
      if (match) headerNameSelect.value = match.value;
    }

    if (headingSelect) {
      const match = [...headingSelect.options].find(
        (opt) => opt.textContent === headingFont.replace(/['"]/g, "")
      );
      if (match) headingSelect.value = match.value;
    }

    if (bodySelect) {
      const match = [...bodySelect.options].find(
        (opt) => opt.textContent === bodyFont.replace(/['"]/g, "")
      );
      if (match) bodySelect.value = match.value;
    }
    console.log("🔥 Theme data from Firestore:", data);

    // ✅ Apply custom cursor if exists
    if (data.cursorSVG) {
      console.log("🎯 Applying cursor:", data.cursorSVG);

      const existing = document.getElementById("dynamic-cursor-style");
      if (existing) existing.remove();

      const styleTag = document.createElement("style");
      styleTag.id = "dynamic-cursor-style";
      styleTag.innerHTML = `
        body, * {
          cursor: ${data.cursorSVG} !important;
        }
        a, button, [role="button"], input[type="submit"], label, select {
          cursor: ${data.cursorSVG.replace(
            " 4 4, auto",
            " 6 6, pointer"
          )} !important;
        }
      `;
      document.head.appendChild(styleTag);
    }
  }
};

function loadGoogleFont(fontFamily) {
  const formatted = fontFamily.replace(/['"]/g, "").replace(/ /g, "+");
  const linkId = `google-font-${formatted}`;

  if (document.getElementById(linkId)) return; // Avoid duplicates

  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${formatted}&display=swap`;
  document.head.appendChild(link);
}

const saveCursorBtn = document.getElementById("save-cursor");
if (saveCursorBtn) {
  saveCursorBtn.addEventListener("click", async () => {
    const cursorColor = document.getElementById("cursorColor").value;

    const cursorSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="7" cy="7" r="7" fill="${cursorColor}"/></svg>`;
    const svgDataUrl = `url('data:image/svg+xml;utf8,${encodeURIComponent(
      cursorSVG
    )}') 4 4, auto`;

    await setDoc(
      doc(db, "siteSettings", "theme"),
      {
        cursorSVG: svgDataUrl,
      },
      { merge: true }
    );

    alert("🎉 Cursor saved!");
    applyThemeSettings();
  });
}

const saveBackgroundBtn = document.getElementById("save-backgroundColors");
if (saveBackgroundBtn) {
  saveBackgroundBtn.addEventListener("click", async () => {
    const mainBackground = document.getElementById("mainBackGroundColor").value;
    const footerBackground = document.getElementById(
      "accentBackGroundColor"
    ).value;

    try {
      await setDoc(
        doc(db, "siteSettings", "theme"),
        {
          backgroundColor: mainBackground,
          footerBackgroundColor: footerBackground,
        },
        { merge: true }
      );
      alert("🎉 Background colors saved!");
      applyThemeSettings();
    } catch (err) {
      console.error("❌ Error saving background colors:", err);
      alert("❌ Failed to save background colors");
    }
  });
}

const saveContactModalBtn = document.getElementById("saveContactModalColor");
if (saveContactModalBtn) {
  saveContactModalBtn.addEventListener("click", async () => {
    const color = document.getElementById("contactModalColor").value;

    try {
      await setDoc(
        doc(db, "siteSettings", "theme"),
        {
          contactModalBackgroundColor: color,
        },
        { merge: true }
      );
      alert("🎉 Contact modal background color saved!");
      applyThemeSettings(); // Перезастосувати тему
    } catch (err) {
      console.error("❌ Error saving contact modal color:", err);
      alert("❌ Failed to save contact modal color");
    }
  });
}

// Call on load
if (document.readyState !== "loading") {
  applyThemeSettings();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    applyThemeSettings();
  });
}
