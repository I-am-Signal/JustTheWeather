import { OWAPIKey } from './config.js';
import { fetchDifferentLocation, getCurrentLocation } from './location-script.js';

export function fetchCurrentWeather() {
    getCurrentLocation().then(coords => {
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
                // Store the coordinates in sessionStorage
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

        // Weather conditions name formatting
        let weather = data.weather[0].description.split(" ");
        let formattedWeather = "";
        for (let i = 0; i < weather.length; i++){
            formattedWeather += weather[i].charAt(0).toUpperCase() + weather[i].slice(1);
            if (i < weather.length - 1) formattedWeather += " ";
        }
        console.log(data);
        weatherDiv.innerHTML = `
            <img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="Weather Icon">
            <p><strong>Location:</strong> ${data.name}, ${data.sys.country}</p>
            <p><strong>Temperature:</strong> ${data.main.temp} °F</p>
            <p><strong>Feels Like:</strong> ${data.main.feels_like} °F</p>
            <p><strong>Weather:</strong> ${formattedWeather}</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${data.wind.speed} mph</p>
            <button type="button" id="current-location">Refresh Information</button>
            `;

        // Add event listener for the refresh button
        document.getElementById('current-location').addEventListener('click', function (event) {
            event.preventDefault();
            console.log("Debug: Refresh Information button clicked!");
            fetchWeatherByLocation(sessionStorage.getItem('location')); // Call fetchCurrentWeather when the button is clicked
        });
    } else {
        weatherDiv.innerHTML = "<p>Weather data not available.</p>";
    }
}

export function fetchWeatherByLocation(location) {
    let coords;
    if (location) {
        try {
            coords = JSON.parse(location);
            console.log("Debug: input location as ", coords);
            processWeatherData(coords);
        }
        catch {
            fetchDifferentLocation(location)
                .then(data => {
                    if (!data) {
                        alert('Failed to fetch weather data due to invalid location');
                    } else {
                        coords = data;
                        processWeatherData(coords);
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


function processWeatherData(coords) {
    if (!coords) {
        alert('Failed to fetch weather data due to invalid location');
    } else {
        console.log('Debug: coordinates are ', coords); // Log coordinates for debugging
        const { lat, lon } = coords; // Extract latitude and longitude from the response

        // Check if lat and lon are defined
        if (lat === undefined || lon === undefined) {
            alert('Failed to fetch weather data due to missing coordinates');
            return;
        }

        // Use the obtained coordinates to fetch weather data
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWAPIKey}&units=imperial`;

        fetch(weatherUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(weatherData => {
                updateCurrentWeatherDisplay(weatherData);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                alert('Failed to fetch weather data');
            });
    }
}
