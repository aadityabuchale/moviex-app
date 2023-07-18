const moviesList = document.getElementById("movies-list");

const APIKEY = "f531333d637d0c44abc85b3e74db2186";
let movies = [];

let currentPage = 1,
  totalPages = 1;

function getFavMoviesFromLocalStorage() {
  const favMovies = JSON.parse(localStorage.getItem("favouriteMovie"));
  return favMovies === null ? [] : favMovies;
}

function addMovieInfoInLocalStorage(mInfo) {
  const localStorageMovies = getFavMoviesFromLocalStorage();

  console.log(localStorageMovies);

  localStorage.setItem(
    "favouriteMovie",
    JSON.stringify([...localStorageMovies, mInfo])
  );
}

function removeMovieInfoFromLocalStorage(mInfo) {
  let localStorageMovies = getFavMoviesFromLocalStorage();



  let filteredMovies = localStorageMovies.filter((eMovie) => {
    return eMovie.title != mInfo.title;
  });

  if( filteredMovies.length == 0 ) {
    document.querySelector("#favourite-page").style.display = "flex";
  }
  else{
    document.querySelector("#favourite-page").style.display = "none";
  }

  localStorage.setItem("favouriteMovie", JSON.stringify(filteredMovies));
}

showLoader();


function renderMovies(movies) {
  let favMovies = getFavMoviesFromLocalStorage();

  moviesList.innerHTML = "";

  movies.map((eMovie) => {
    const { poster_path, title, vote_average, vote_count } = eMovie;

    let listItem = document.createElement("li");
    listItem.className = "card";

    let imageUrl = poster_path
      ? `https://image.tmdb.org/t/p/original${poster_path}`
      : "";

    let mInfo = {
      title,
      poster_path,
      vote_average,
      vote_count,
    };

    const rs = favMovies.find((eFavMovie) => eFavMovie.title == title);

    listItem.innerHTML = `
            <img class="poster" src="${imageUrl}" alt="${title}">
            <p class="title">${title}</p>
            <section class="vote-fav">
                <section>
                    <p>Votes: ${vote_count}</p>
                    <p>Rating: ${vote_average}</p>
                </section>
                <i id='${JSON.stringify( mInfo )}' class="fa-regular fa-heart fa-2xl fav-icon ${ 
                  rs && "fa-solid"
            } "></i>
            </section>
        `;

    const favIconBtn = listItem.querySelector(".fav-icon");

    favIconBtn.addEventListener("click", (event) => {
      console.log(event.target);
      const { id } = event.target;
      console.log(id);
      const mInfo = JSON.parse(id);
      if (favIconBtn.classList.contains("fa-solid")) {
        // unmark it
        // 1) remove the fa-solid from the facIconBtn
        favIconBtn.classList.remove("fa-solid");
        // 2) remove the info of this movie from the localstroge
        removeMovieInfoFromLocalStorage(mInfo);
      } else {
        // mark it
        // 1) add the fa-solid class to the favIconBtn button
        favIconBtn.classList.add("fa-solid");
        // 2) add the info of this movie to the localstorage
        addMovieInfoInLocalStorage(mInfo);
      }
    });

    moviesList.appendChild(listItem);
  });
}

async function fetchMovies() {
  try {
    const resp = await fetch(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${APIKEY}&language=en-US&page=${currentPage}`
    );
    let data = await resp.json();

    hideLoader();

    movies = data.results;
    totalPages = data.total_pages;
    tPage.innerText = totalPages;
    renderMovies(movies);
  } catch (error) {
    console.log(error);
  }
}

fetchMovies();



  // ----------------- loader --------------------------//


  function showLoader() {
    document.querySelector('.movies-list-pagination').style.display = 'none';
    document.querySelector("#loader").style.display = "flex";
  }

  function hideLoader() {
    document.querySelector('.movies-list-pagination').style.display = 'block';
    document.querySelector("#loader").style.display = "none";

  }



async function searchMovies() {
  const searchText = searchInput.value;
  
  if( searchText !== ""){
    const resp = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${searchText}&api_key=${APIKEY}&include_adult=false&language=en-US&page=${currentPage}`
    );
  
    const data = await resp.json();
    totalPages = data.total_pages;
    tPage.innerText = totalPages;
    movies = data.results;
    renderMovies(movies);
  }

}

const searchBtn = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");

searchBtn.addEventListener("click", searchMovies);

function getPreviousPageFunc() {
  currentPage--;
  currPage.innerText = currentPage;

  fetchMovies();

  if (currentPage == 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }

  if (currentPage >= totalPages) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

function getNextPageFunc() {
  currentPage++;
  currPage.innerText = currentPage;

  fetchMovies();

  if (currentPage == 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }

  if (currentPage >= totalPages) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

const prevBtn = document.getElementById("prev-button");
prevBtn.disabled = true;
const nextBtn = document.getElementById("next-button");
const currPage = document.getElementById("currPage");
const tPage = document.getElementById("totalPage");

prevBtn.addEventListener("click", getPreviousPageFunc);
nextBtn.addEventListener("click", getNextPageFunc);

let sortByDateFlag = 0; // 0: ASC   // 1: DESC

function sortByDate() {
  if (sortByDateFlag) {
    // desc
    movies.sort((m1, m2) => {
      return new Date(m2.release_date) - new Date(m1.release_date);
    });

    renderMovies(movies);

    sortByDateFlag = !sortByDateFlag;

    sortByDateBtn.innerText = "Sort by date (oldest to latest)";
  } else {
    // asc
    movies.sort((m1, m2) => {
      return new Date(m1.release_date) - new Date(m2.release_date);
    });

    renderMovies(movies);

    sortByDateFlag = !sortByDateFlag;

    sortByDateBtn.innerText = "Sort by date (latest to oldest)";
  }
}

let sortByRatingFlag = 0; // 0: INC   1: DESC

function sortByRatingFunc() {
  if (sortByRatingFlag) {
    // DESC
    movies.sort((m1, m2) => {
      return m2.vote_average - m1.vote_average;
    });

    renderMovies(movies);

    sortByRatingFlag = !sortByRatingFlag;

    sortByRating.innerText = "Sort by rating (least to most)";
  } else {
    // INC
    movies.sort((m1, m2) => {
      return m1.vote_average - m2.vote_average;
    });

    renderMovies(movies);

    sortByRatingFlag = !sortByRatingFlag;

    sortByRating.innerText = "Sort by rating (most to least)";
  }
}

const sortByDateBtn = document.getElementById("sort-by-date");

sortByDateBtn.addEventListener("click", sortByDate);

const sortByRating = document.getElementById("sort-by-rating");

sortByRating.addEventListener("click", sortByRatingFunc);

function onSearchChange(event) {
  console.log("ADnhmm 2 secs done!");
  let val = event.target.value;

  if (val) {
    searchMovies();
  } else {
    fetchMovies();
  }
}

let timer;

function debounce(event) {
  if (timer) clearTimeout(timer);

  timer = setTimeout(() => {
    onSearchChange(event);
  }, 2000);
}

searchInput.addEventListener("input", (event) => {
  debounce(event);
});

function renderFavMovies() {
  moviesList.innerHTML = "";

  const favMovies = getFavMoviesFromLocalStorage();

  if( favTab.classList.contains("active-tab") && getFavMoviesFromLocalStorage().length == 0 ) {
    document.querySelector("#favourite-page").style.display = "flex";
  }
  else{
    document.querySelector("#favourite-page").style.display = "none";
  }

  favMovies.map((eFavMovie) => {
    let listItem = document.createElement("li");
    listItem.className = "card";

    const { poster_path, title, vote_average, vote_count } = eFavMovie;

    let imageUrl = poster_path
      ? `https://image.tmdb.org/t/p/original${poster_path}`
      : "";

    let mInfo = {
      title,
      poster_path,
      vote_average,
      vote_count,
    };

    listItem.innerHTML = `
  
            <img class="poster" src="${imageUrl}" alt="${title}">
            <p class="title">${title}</p>
            <section class="vote-fav">
                <section>
                    <p>Votes: ${vote_count}</p>
                    <p>Rating: ${vote_average}</p>
                </section>
                <i id='${JSON.stringify(
                  mInfo
                )}' class="fa-regular fa-heart fa-2xl fav-icon fa-solid"></i>
            </section>
        `;

    const favIconBtn = listItem.querySelector(".fav-icon");

    favIconBtn.addEventListener("click", (event) => {
      // this will remove the card info from the local storage
      const { id } = event.target;
      const mInfo = JSON.parse(id);
      console.log(mInfo);
      removeMovieInfoFromLocalStorage(mInfo);

      // this will remove the card from the ui
      event.target.parentElement.parentElement.remove();
    });

    moviesList.append(listItem);
  });
}


function displayMovies() {
  if (allTab.classList.contains("active-tab")) {
    // all button, show all general movies
    renderMovies(movies);
  } else {
    // fav button, show all fav movies
    renderFavMovies();
  }
}

function switchTab(event) {
  // remove the active tab class from both tabs
  allTab.classList.remove("active-tab");
  favTab.classList.remove("active-tab");

  event.target.classList.add("active-tab");

  if( favTab.classList.contains("active-tab") && getFavMoviesFromLocalStorage().length == 0 ) {
    document.querySelector("#favourite-page").style.display = "flex";
  }
  else{
    document.querySelector("#favourite-page").style.display = "none";
  }
  displayMovies();
}

const allTab = document.getElementById("all-tab");
const favTab = document.getElementById("favorits-tab");

allTab.addEventListener("click", switchTab);
favTab.addEventListener("click", switchTab);
