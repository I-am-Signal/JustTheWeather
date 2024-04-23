import { OWAPIKey } from './config.js';
import { fetchDifferentLocation, getCurrentLocation, pascalizeAndStringify, emergencyAlert } from './location-script.js';

/**
 * Fetches the current weather and displays it using OpenWeather's Current Weather API
 */
export function fetchCurrentWeather() {
    getCurrentLocation().then(coords => {
        if (coords == null) {
            alert('Failed to fetch weather data due to failed coordinate retrieval.');
            return;
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords['lat']}&lon=${coords['lon']}&appid=${OWAPIKey}&units=imperial`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                updateCurrentWeatherDisplay(data);
                sessionStorage.setItem('location', JSON.stringify(coords));
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert('Failed to fetch weather data');
            });
    });
}


function updateCurrentWeatherDisplay(data) {
    const weatherDiv = document.getElementById('weather');
    if (data && data.weather && data.weather.length > 0) {

        weatherDiv.innerHTML = `
            <img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="Weather Icon">
            <p><strong>Location:</strong> ${data.name}, ${data.sys.country}</p>
            <p><strong>Temperature:</strong> ${data.main.temp} °F</p>
            <p><strong>Feels Like:</strong> ${data.main.feels_like} °F</p>
            <p><strong>Weather:</strong> ${pascalizeAndStringify(data.weather[0].description)}</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${data.wind.speed} mph</p>
            <button type="button" id="current-location">Refresh Information</button>
            <button type="button" id="geo-locate">Geolocate Location</button>
        `;

        document.getElementById('current-location').addEventListener('click', function (event) {
            event.preventDefault();
            console.log("Debug: Refresh Information button clicked!");
            fetchCurrentWeather();
        });

        document.getElementById('geo-locate').addEventListener('click', function (event) {
            event.preventDefault();
            console.log("Debug: Geolocate Location button clicked!");
            sessionStorage.removeItem('location');
            fetchCurrentWeather();
        });

        emergencyAlert(data.weather[0].id, new Date(data.dt * 1000), (data.name + ", " + data.sys.country))

    } else {
        weatherDiv.innerHTML = "<p>Weather data not available.</p>";
    }
}


/**
 * Takes in a json format location coordinate string and displays the weather for that location
 * @param {*} location 
 */
export function fetchWeatherByLocation(location) {
    if (location) {
        try {
            coords = JSON.parse(location);
            console.log("Debug: input location as ", coords);
            fetchCurrentWeather();
        }
        catch {
            fetchDifferentLocation(location)
                .then(data => {
                    if (!data) {
                        alert('Failed to fetch weather data due to invalid location');
                    } else {
                        fetchCurrentWeather();
                    }
                })
                .catch(error => {
                    console.error('Error in location data retrieval:', error);
                    alert('Failed to fetch location data');
            });
        }
    }
    else {
        alert('No location data found.');
    }
}