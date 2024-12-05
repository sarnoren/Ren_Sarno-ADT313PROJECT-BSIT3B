import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Form.css";

const Form = () => {
  const [query, setQuery] = useState("");
  const [searchedMovieList, setSearchedMovieList] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    overview: "",
    popularity: "",
    releaseDate: "",
    voteAverage: "",
    videos: [], 
    cast: [], 
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [videos, setVideos] = useState([]);
  const [cast, setCast] = useState([]);

  const { movieId } = useParams();
  const navigate = useNavigate();

  const handleSearch = useCallback(() => {
    setError("");
    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsLoading(true);
    setSearchedMovieList([]);

    axios.get(`https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=${currentPage}`, {
      headers: {
        Accept: "application/json",
        Authorization:  'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YTdiNmUyNGJkNWRkNjhiNmE1ZWFjZjgyNWY3NGY5ZCIsIm5iZiI6MTcyOTI5NzI5Ny4wNzMzNTEsInN1YiI6IjY2MzhlZGM0MmZhZjRkMDEzMGM2NzM3NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ZIX4EF2yAKl6NwhcmhZucxSQi1rJDZiGG80tDd6_9XI',
      },
    })
      .then((response) => {
        if (response.data.results.length === 0) {
          setError("No movies found matching your search");
        } else {
          setSearchedMovieList(response.data.results);
          setTotalPages(response.data.total_pages);
        }
      })
      .catch(() => {
        setError("Unable to search movies at this time. Please try again later.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [query, currentPage]);

  useEffect(() => {
    if (currentPage > 1) {
      handleSearch();
    }
  }, [currentPage, handleSearch]);

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setFormData({
      title: movie.title,
      overview: movie.overview,
      popularity: movie.popularity,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
      videos: [],
      cast: [],
      posterPath: movie.poster_path,  
      backdropPath: movie.backdrop_path, 
    });
    setError("");
  
    // Fetch Videos
    axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/videos?language=en-US`, {
      headers: {
        Accept: "application/json",
        Authorization:  'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YTdiNmUyNGJkNWRkNjhiNmE1ZWFjZjgyNWY3NGY5ZCIsIm5iZiI6MTcyOTI5NzI5Ny4wNzMzNTEsInN1YiI6IjY2MzhlZGM0MmZhZjRkMDEzMGM2NzM3NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ZIX4EF2yAKl6NwhcmhZucxSQi1rJDZiGG80tDd6_9XI',
      },
    })
    .then(response => {
      setVideos(response.data.results);
      setFormData(prevData => ({
        ...prevData,
        videos: response.data.results,
      }));
    })
    .catch(() => {
      setError("Unable to load videos. Please try again later.");
    });
  
    // Fetch Cast
    axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/credits?language=en-US`, {
      headers: {
        Accept: "application/json",
        Authorization:  'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YTdiNmUyNGJkNWRkNjhiNmE1ZWFjZjgyNWY3NGY5ZCIsIm5iZiI6MTcyOTI5NzI5Ny4wNzMzNTEsInN1YiI6IjY2MzhlZGM0MmZhZjRkMDEzMGM2NzM3NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ZIX4EF2yAKl6NwhcmhZucxSQi1rJDZiGG80tDd6_9XI',
      },
    })
    .then(response => {
      setCast(response.data.cast);
      setFormData(prevData => ({
        ...prevData,
        cast: response.data.cast,
      }));
    })
    .catch(() => {
      setError("Unable to load cast information. Please try again later.");
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setCurrentPage(1);
 handleSearch();
    }
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.title) errors.push("Title is required");
    if (!formData.overview) errors.push("Overview is required");
    if (!formData.releaseDate) errors.push("Release date is required");
    if (!formData.popularity) errors.push("Popularity is required");
    if (!formData.voteAverage) errors.push("Vote average is required");
    if (!selectedMovie) errors.push("Please select a movie from search results");
    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }
  
    setIsLoading(true);
    setError("");
  
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setError("You must be logged in to perform this action");
      setIsLoading(false);
      return;
    }
  
    const data = {
      tmdbId: selectedMovie.id,
      title: formData.title,
      overview: formData.overview,
      popularity: parseFloat(formData.popularity),
      releaseDate: formData.releaseDate,
      voteAverage: parseFloat(formData.voteAverage),
      backdropPath: `https://image.tmdb.org/t/p/original/${formData.backdropPath}`,
      posterPath: `https://image.tmdb.org/t/p/original/${formData.posterPath}`,
      isFeatured: 0,
      // Save videos with the format https://www.youtube.com/embed/{video.key}
      videos: formData.videos.map(video => `https://www.youtube.com/embed/${video.key}`),
      // Save cast with the format https://image.tmdb.org/t/p/original/{profile_path}
      cast: formData.cast.map(member => `https://image.tmdb.org/t/p/original/${member.profile_path}`),
    };
  
    // Send the data to your backend to save in your database (make sure to update this with your actual saving logic)
    // Example:
    try {
      await axios.post('/save-movie', data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      });
      setIsLoading(false);
      alert("Movie saved successfully!");
    } catch (error) {
      setIsLoading(false);
      setError("Unable to save the movie. Please try again later.");
    }
  };
  
  const handleUpdate = handleSave;

  useEffect(() => {
    if (movieId) {
      setIsLoading(true);
      setError("");

      axios.get(`/movies/${movieId}`)
      .then((response) => {
        const movieData = response.data;
        setSelectedMovie({
          id: movieData.tmdbId,
          original_title: movieData.title,
          overview: movieData.overview,
          popularity: movieData.popularity,
          poster_path: movieData.posterPath.replace("https://image.tmdb.org/t/p/original/", ""),
          release_date: movieData.releaseDate,
          vote_average: movieData.voteAverage,
        });
        setFormData({
          title: movieData.title,
          overview: movieData.overview,
          popularity: movieData.popularity,
          releaseDate: movieData.releaseDate,
          voteAverage: movieData.voteAverage,
          videos: movieData.videos || [], // Load videos if available
          cast: movieData.cast || [], 
        });
      })
      .catch(() => {
        setError("Unable to load movie details. Please try again later.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  }, [movieId]);

  return (
    <>
      <h1>{movieId !== undefined ? "Edit" : "Create"} Movie</h1>

      {error && <div className="error-message">{error}</div>}
  {isLoading && <div className="loading-message">Loading...</div>}

  {movieId === undefined && (
    <>
      <div className="search-container">
        Search Movie:{" "}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError("");<div className="search-container">
  <label htmlFor="movie-search" className="search-label">Search Movie:</label>
  <div className="search-input-container">
    <input
      id="movie-search"
      type="text"
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        setError("");
      }}
      onKeyPress={handleKeyPress}
      placeholder="Enter movie title..."
      disabled={isLoading}
      className="search-input"
    />
    <button
      className="search-button"
      type="button"
      onClick={() => {
        setCurrentPage(1);
        handleSearch();
      }}
      disabled={isLoading || !query.trim()}
    >
      {isLoading ? "Searching..." : "Search"}
    </button>
  </div>
</div>
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter movie title..."
              disabled={isLoading}
            />
            <button className="search"
              type="button"
              onClick={() => {
                setCurrentPage(1);
                handleSearch();
              }}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
            <div className="searched-movie">
              {searchedMovieList.map((movie) => (
                <p
                  key={movie.id}
                  onClick={() => handleSelectMovie(movie)}
                  className={selectedMovie?.id === movie.id ? "selected" : ""}
                >
                  {movie.original_title}
                </p>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </button>
              </div>
            )}
          </div>
          <hr />
        </>
      )}

<div className="container">
    <form onSubmit={(e) => e.preventDefault()}>
    {selectedMovie && (
  <div className="movie-details">
    <img
      className="poster-image"
      src={`https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`}
      alt={formData.title}
    />
    <div className="form-fields">
      <div className="field">
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title}
          onChange={handleInputChange}
          disabled={isLoading}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="overview">Overview:</label>
        <textarea
          className="overview"
          rows={10}
          name="overview"
          id="overview"
          value={formData.overview}
          onChange={handleInputChange}
          disabled={isLoading}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="popularity">Popularity:</label>
        <input
          type="number"
          name="popularity"
          id="popularity"
          value={formData.popularity}
          onChange={handleInputChange}
          disabled={isLoading}
          step="0.1"
        />
      </div>
      <div className="field">
        <label htmlFor="releaseDate">Release Date:</label>
        <input
          type="date"
          name="releaseDate"
          id="releaseDate"
          value={formData.releaseDate}
          onChange={handleInputChange}
          disabled={isLoading}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="voteAverage">Vote Average:</label>
        <input
          type="number"
          name="voteAverage"
          id="voteAverage"
          value={formData.voteAverage}
          onChange={handleInputChange}
          disabled={isLoading}
          step="0.1"
        />
      </div>
      
    
      <div className="images-section">
        <h3>Photos:</h3>
        {selectedMovie.poster_path && (
          <img
            className="poster-image"
            src={`https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`}
            alt={`Poster of ${formData.title}`}
          />
        )}
        {selectedMovie.backdrop_path && (
          <img
            className="backdrop-image"
            src={`https://image.tmdb.org/t/p/original/${selectedMovie.backdrop_path}`}
            alt={`Backdrop of ${formData.title}`}
          />
        )}
      </div>
    </div>
  </div>
)}

      {selectedMovie && (
<>
    <h2>Videos</h2>
    <div className="videos">
        {videos.length > 0 ? (
            videos.map(video => (
                <div key={video.id} className="video-item">
                    <h3>{video.name}</h3>
                    <iframe
                        src={`https://www.youtube.com/embed/${video.key}`}
                        title={video.name}
                        frameBorder="0"
                        allowFullScreen
                    ></iframe>
                </div>
            ))
        ) : (
            <p>No videos available.</p>
        )}
    </div>

    <h2>Cast</h2>
    <div className="cast">
        {cast.length > 0 ? (
            cast.map(member => (
                <div key={member.id} className="cast-item">
                    <h3>{member.name}</h3>
                    <p>Character: {member.character}</p>
                    {member.profile_path && (
                        <img
                            src={`https://image.tmdb.org/t/p/w500/${member.profile_path}`}
                            alt={member.name}
                        />
                    )}
                </div>
            ))
        ) : (
            <p>No cast information available.</p>
        )}
    </div>
</>
      )}
          <div className="button-container">
            <button className="btn-save btn-primary"
              type="button"
              onClick={movieId ? handleUpdate : handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button className="cancel"
              type="button"
              onClick={() => navigate("/main/movies")}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </ form>
      </div>
    </>
  );
};

export default Form;