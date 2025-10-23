from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import List, Optional
from pydantic import BaseModel

# -------------------- FastAPI App --------------------
app = FastAPI(title="IndianMovieList")

# -------------------- Enable CORS --------------------
origins = [
    "https://randommelo-lang.github.io",  # Replace with your GitHub Pages URL
    "http://localhost:5500"        # Optional: for local frontend testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Excel Paths --------------------
MOVIES_CSV_URL = "https://raw.githubusercontent.com/randommelo-lang/indian-movie-tracker-data/refs/heads/main/Movie_%26_TV_Movies.csv"
TVSHOWS_CSV_URL = "https://raw.githubusercontent.com/randommelo-lang/indian-movie-tracker-data/refs/heads/main/Movie_%26_TV_TV_Shows.csv"

# -------------------- Models --------------------
class Movie(BaseModel):
    id: int
    title: str
    language: str
    release_year: int
    genre: str
    director: str
    ott_platform: str
    cover_image_url: str
    prequel_id: Optional[int]
    sequel_id: Optional[int]

class TVShow(BaseModel):
    id: int
    series_name: str
    season: Optional[int]
    title_full: str
    language: str
    release_year: Optional[int]
    ott_platform: str
    prequel_id: Optional[int]
    sequel_id: Optional[int]
    cover_image_url: Optional[str]

# -------------------- Helper Functions --------------------
def safe_int(value):
    try:
        if pd.isna(value):
            return None
        value = str(value).strip()
        return int(value) if value.isdigit() else None
    except (ValueError, TypeError):
        return None

def safe_str(value):
    if pd.isna(value):
        return None
    return str(value).strip()

# -------------------- Global Caches --------------------
_movies_cache: List[Movie] = []
_tvshows_cache: List[TVShow] = []

# -------------------- Data Loaders --------------------
def read_movies() -> List[Movie]:
    global _movies_cache
    try:
        df = pd.read_csv(MOVIES_CSV_URL)
        movies = []
        for _, row in df.iterrows():
            movies.append(Movie(
                id=safe_int(row.get("ID")),
                title=safe_str(row.get("Movies")),
                language=safe_str(row.get("Language")),
                release_year=safe_int(row.get("Release Year")) or 0,
                genre=safe_str(row.get("Genre")),
                director=safe_str(row.get("Director")),
                ott_platform=safe_str(row.get("OTT Platform")),
                cover_image_url=safe_str(row.get("Cover Image URL")) or "",
                prequel_id=safe_int(row.get("Prequel ID")),
                sequel_id=safe_int(row.get("Sequel ID")),
            ))
        _movies_cache = movies
        return movies
    except Exception as e:
        if _movies_cache:
            return _movies_cache
        else:
            raise HTTPException(status_code=503, detail=f"Unable to fetch movies data: {str(e)}")

def read_tvshows() -> List[TVShow]:
    global _tvshows_cache
    try:
        df = pd.read_csv(TVSHOWS_CSV_URL)
        tvshows = []
        for _, row in df.iterrows():
            tvshows.append(TVShow(
                id=safe_int(row.get("ID")),
                series_name=safe_str(row.get("Series Name")),
                season=safe_int(row.get("Season")),
                title_full=safe_str(row.get("Title (Full)")),
                language=safe_str(row.get("Language")),
                release_year=safe_int(row.get("Release Year")),
                ott_platform=safe_str(row.get("OTT Platform")),
                prequel_id=safe_int(row.get("Prequel ID")),
                sequel_id=safe_int(row.get("Sequel ID")),
                cover_image_url=safe_str(row.get("Cover Image URL")),
            ))
        _tvshows_cache = tvshows
        return tvshows
    except Exception as e:
        if _tvshows_cache:
            return _tvshows_cache
        else:
            raise HTTPException(status_code=503, detail=f"Unable to fetch TV shows data: {str(e)}")

# -------------------- API Endpoints --------------------
@app.get("/movies", response_model=List[Movie])
def get_movies():
    return read_movies()

@app.get("/movies/{movie_id}", response_model=Movie)
def get_movie_by_id(movie_id: int):
    for m in read_movies():
        if m.id == movie_id:
            return m
    raise HTTPException(status_code=404, detail="Movie not found")

@app.get("/tvshows", response_model=List[TVShow])
def get_tvshows():
    return read_tvshows()

@app.get("/tvshows/{tv_id}", response_model=TVShow)
def get_tvshow_by_id(tv_id: int):
    for tv in read_tvshows():
        if tv.id == tv_id:
            return tv
    raise HTTPException(status_code=404, detail="TV Show not found")

@app.get("/ping")
def ping():
    return {"status": "alive"}
