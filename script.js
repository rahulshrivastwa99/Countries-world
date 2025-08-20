const countriesContainer = document.querySelector(".countries-container");
const filterByRegion = document.querySelector(".filter-by-region");
const searchInput = document.querySelector(".search-container input");
const themeChanger = document.querySelector(".theme-changer");

let allCountriesData = [];
let isLoading = false;

// Show loading spinner
function showLoading() {
  countriesContainer.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading countries...</p>
    </div>
  `;
}

// Show error message
function showError(message) {
  countriesContainer.innerHTML = `
    <div class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <p>${message}</p>
      <button onclick="loadCountries()" class="retry-button">Try Again</button>
    </div>
  `;
}

// Show no results message
function showNoResults(searchTerm) {
  countriesContainer.innerHTML = `
    <div class="no-results-container">
      <i class="fas fa-search"></i>
      <p>No countries found${searchTerm ? ` for "${searchTerm}"` : ""}</p>
      <p class="suggestion">Try adjusting your search or filter</p>
    </div>
  `;
}

// Load countries with proper error handling
async function loadCountries() {
  if (isLoading) return;

  isLoading = true;
  showLoading();

  try {
    const response = await fetch("https://restcountries.com/v3.1/all");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      allCountriesData = data;
      renderCountries(data);
    } else {
      throw new Error("No country data received");
    }
  } catch (error) {
    console.error("Error loading countries:", error);
    showError(
      "Unable to load countries. Please check your internet connection and try again."
    );
  } finally {
    isLoading = false;
  }
}

// Filter countries by region with error handling
async function filterCountriesByRegion(region) {
  if (isLoading) return;

  isLoading = true;
  showLoading();

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/region/${region}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      renderCountries(data);
    } else {
      showNoResults();
    }
  } catch (error) {
    console.error("Error filtering countries:", error);
    showError("Unable to filter countries. Please try again.");
  } finally {
    isLoading = false;
  }
}

// Render countries with improved error handling
function renderCountries(data) {
  if (!data || data.length === 0) {
    showNoResults();
    return;
  }

  countriesContainer.innerHTML = "";

  data.forEach((country) => {
    const countryCard = document.createElement("a");
    countryCard.classList.add("country-card");
    countryCard.href = `/country.html?name=${encodeURIComponent(
      country.name.common
    )}`;

    const capital = country.capital?.[0] || "N/A";
    const population = country.population
      ? country.population.toLocaleString("en-IN")
      : "N/A";

    countryCard.innerHTML = `
      <img src="${country.flags.svg}" alt="${
      country.name.common
    } flag" loading="lazy" />
      <div class="card-text">
        <h3 class="card-title">${country.name.common}</h3>
        <p><b>Population: </b>${population}</p>
        <p><b>Region: </b>${country.region || "N/A"}</p>
        <p><b>Capital: </b>${capital}</p>
      </div>
    `;
    countriesContainer.append(countryCard);
  });
}

// Debounced search function
let searchTimeout;
function performSearch(searchTerm) {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    if (!searchTerm.trim()) {
      renderCountries(allCountriesData);
      return;
    }

    const filteredCountries = allCountriesData.filter((country) => {
      const countryName = country.name.common.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return countryName.includes(searchLower);
    });

    if (filteredCountries.length === 0) {
      showNoResults(searchTerm);
    } else {
      renderCountries(filteredCountries);
    }
  }, 300);
}

// Event listeners
filterByRegion.addEventListener("change", (e) => {
  const selectedRegion = e.target.value;
  if (selectedRegion === "Filter by Region" || !selectedRegion) {
    renderCountries(allCountriesData);
  } else {
    filterCountriesByRegion(selectedRegion);
  }
});

searchInput.addEventListener("input", (e) => {
  performSearch(e.target.value);
});

themeChanger.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Handle keyboard events for accessibility
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    searchInput.value = "";
    renderCountries(allCountriesData);
  }
});

// Initialize the app
loadCountries();
