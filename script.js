const API_BASE = "https://indian-movie-list.onrender.com";

const elements = {
  trending: document.getElementById("trending-list"),
  popularYear: document.getElementById("popular-year-list"),
  upcoming: document.getElementById("upcoming-list"),
  allTime: document.getElementById("alltime-list"),
  darkToggle: document.getElementById("darkModeToggle")
};

// Dark Mode Setup
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("iml_darkmode");
  if (savedTheme === "true" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.body.classList.add("darkmode");
    elements.darkToggle.querySelector(".toggle-icon").textContent = "☀️";
  }
});
elements.darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("darkmode");
  const dark = document.body.classList.contains("darkmode");
  localStorage.setItem("iml_darkmode", dark);
  elements.darkToggle.querySelector(".toggle-icon").textContent = dark ? "☀️" : "🌙";
});

// Fetch and Display Data
async function fetchContent(endpoint, container, label) {
  try {
    container.innerHTML = `<div class="loading">Loading ${label}...</div>`;
    const res = await fetch(`${API_BASE}/${endpoint}`);
    if (!res.ok) throw new Error(`${label} data unavailable.`);
    const items = await res.json();

    container.innerHTML = items.map(item => `
      <article class="card" tabindex="0" role="article" aria-label="${item.title}">
        <img src="${item.cover_image_url}" alt="${item.title} poster" loading="lazy">
        <h3>${item.title}</h3>
        <p>${item.language} • ${item.release_year || "TBA"}</p>
        <p><b>OTT:</b> ${item.ott_platform || "N/A"}</p>
      </article>`).join("");

    container.style.animation = "fadein 1s ease";
  } catch (err) {
    container.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

// Dynamic Fetch Calls
fetchContent("movies", elements.trending, "Trending Movies & TV Shows");
fetchContent("movies/popular", elements.popularYear, "Popular This Year");
fetchContent("upcoming", elements.upcoming, "Upcoming Releases");
fetchContent("movies/alltime", elements.allTime, "All Time Popular");

// Personalized Section Memory
["homeBtn", "moviesBtn", "tvshowsBtn"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", () => localStorage.setItem("last_section", id));
});
document.addEventListener("DOMContentLoaded", () => {
  const last = localStorage.getItem("last_section");
  if (last && document.getElementById(last)) document.getElementById(last).focus();
});

// Intersection Observer for Storytelling Animation
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.style.animation = "fadein 1.2s ease forwards";
  });
}, { threshold: 0.2 });
document.querySelectorAll(".category-section").forEach(sec => observer.observe(sec));
