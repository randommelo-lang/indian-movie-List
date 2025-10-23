const API_BASE = "https://indian-movie-list-1.onrender.com/movies"; // replace with your hosted API

async function fetchMovies() {
  const res = await fetch(`${API_BASE}/movies`);
  const movies = await res.json();
  const list = document.getElementById("movie-list");
  list.innerHTML = movies.map(m => `
    <div class="card">
      <img src="${m.cover_image_url}" alt="${m.title}">
      <h3>${m.title}</h3>
      <p>${m.language} • ${m.release_year}</p>
      <p><b>OTT:</b> ${m.ott_platform}</p>
    </div>
  `).join("");
}

async function fetchTVShows() {
  const res = await fetch(`${API_BASE}/tvshows`);
  const shows = await res.json();
  const list = document.getElementById("tvshow-list");
  list.innerHTML = shows.map(tv => `
    <div class="card">
      <img src="${tv.cover_image_url}" alt="${tv.title_full}">
      <h3>${tv.title_full}</h3>
      <p>${tv.language} • ${tv.release_year || "TBA"}</p>
      <p><b>OTT:</b> ${tv.ott_platform}</p>
    </div>
  `).join("");
}

fetchMovies();
fetchTVShows();
