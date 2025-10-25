const API_BASE = "https://indian-movie-list.onrender.com"; // replace with your hosted API

// ======= DOM ELEMENTS =======
const trending = document.getElementById("trending-list");
const popularYear = document.getElementById("popular-year-list");
const upcoming = document.getElementById("upcoming-list");
const allTime = document.getElementById("alltime-list");
const darkToggle = document.getElementById("darkModeToggle");

// ======= DARK MODE TOGGLE =======
document.addEventListener("DOMContentLoaded", () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("iml_darkmode");
  
  if (savedTheme === "true" || (!savedTheme && prefersDark)) {
    document.body.classList.add("darkmode");
  }
});

darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("darkmode");
  const isDark = document.body.classList.contains("darkmode");
  localStorage.setItem("iml_darkmode", isDark);
  darkToggle.querySelector(".toggle-icon").textContent = isDark ? "☀️" : "🌙";
});

// ======= LOADING STATE HANDLER =======
function showLoading(target) {
  target.innerHTML = `<div class="loading">Loading...</div>`;
}

// ======= FETCH FUNCTIONS =======
async function fetchContent(endpoint, container, label) {
  try {
    showLoading(container);
    const res = await fetch(`${API_BASE}/${endpoint}`);
    if (!res.ok) throw new Error(`Failed to fetch ${label}`);
    const items = await res.json();

    container.innerHTML = items.map(item => `
      <article class="card" tabindex="0" role="article" aria-label="${item.title}">
        <img src="${item.cover_image_url}" alt="Poster of ${item.title}" loading="lazy">
        <h3>${item.title}</h3>
        <p>${item.language} • ${item.release_year || "TBA"}</p>
        <p><b>OTT:</b> ${item.ott_platform || "Unknown"}</p>
      </article>
    `).join("");

    // Animate when loaded
    container.style.animation = "fadein 1.4s ease";
  } catch (err) {
    container.innerHTML = `<p class="error">⚠️ ${err.message}</p>`;
  }
}

// ======= INITIAL FETCH CALLS =======
fetchContent("movies", trending, "trending movies");
fetchContent("movies/popular", popularYear, "popular this year");
fetchContent("upcoming", upcoming, "upcoming movies and TV shows");
fetchContent("movies/alltime", allTime, "all-time popular movies");

// ======= PERSONALIZATION: REMEMBER LAST VIEWED SECTION =======
const navButtons = {
  homeBtn: document.getElementById("homeBtn"),
  moviesBtn: document.getElementById("moviesBtn"),
  tvshowsBtn: document.getElementById("tvshowsBtn")
};

Object.entries(navButtons).forEach(([key, btn]) => {
  if (!btn) return;
  btn.addEventListener("click", () => {
    localStorage.setItem("last_section", key);
  });
});

// Restore user’s last section on reload (example personalization)
document.addEventListener("DOMContentLoaded", () => {
  const lastSection = localStorage.getItem("last_section");
  if (lastSection && navButtons[lastSection]) {
    navButtons[lastSection].focus();
  }
});

// ======= SIMPLE INTERACTIVE STORYTELLING EFFECT (On scroll) =======
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = "fadein 1s ease forwards";
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll(".category-section").forEach(section => {
  observer.observe(section);
});
