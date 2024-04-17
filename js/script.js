import { APIKey } from './config.js';
var currentLocationClicked = false;

export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                resolve({
                    "lat": position.coords.latitude,
                    "lon": position.coords.longitude
                });
            }, (error) => {
                console.error('Geolocation error:', error);
                alert('Error getting location. Using default location.');
                resolve({
                    "lat": 34.038287,
                    "lon": -84.581747
                }); // Default to KSU Kennesaw if location fails
            });
        } else {
            alert('Geolocation is not supported by this browser.');
            resolve({
                "lat": 34.038287,
                "lon": -84.581747
            }); // Default to KSU Kennesaw if not supported
        }
    });
}

export function fetchCurrentWeather() {
    getCurrentLocation().then(coords => {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords['lat']}&lon=${coords['lon']}&appid=${APIKey}&units=imperial`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                updateCurrentWeatherDisplay(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert('Failed to fetch weather data');
            });
    });
}

function updateCurrentWeatherDisplay(data){
    const weatherDiv = document.getElementById('weather');
    if (data && data.weather && data.weather.length > 0) {
        weatherDiv.innerHTML = `
            <img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="Weather Icon">
            <p><strong>Location:</strong> ${data.name}, ${data.sys.country}</p>
            <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
            <p><strong>Feels Like:</strong> ${data.main.feels_like} °C</p>
            <p><strong>Weather:</strong> ${data.weather[0].description}</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${Math.round(data.wind.speed * 2.23694 * 10) / 10} mph</p>
            <button type="button" id="current-location">Refresh Information</button>
            `;

            // Add event listener for the refresh button
            document.getElementById('current-location').addEventListener('click', function(event) {
                event.preventDefault();
                alert("Debug: Refresh Information button clicked!");
                fetchCurrentWeather(); // Call fetchCurrentWeather when the button is clicked
            });
    } else {
        weatherDiv.innerHTML = "<p>Weather data not available.</p>";
    }
}

export function fetchWeatherByLocation(location) {
    // Construct the API URL for geocoding
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${APIKey}`;

    fetch(geocodingUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0]; // Extract latitude and longitude from the response
                // Use the obtained coordinates to fetch weather data
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}&units=imperial`;

                fetch(weatherUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        updateCurrentWeatherDisplay(data);
                    })
                    .catch(error => {
                        console.error('Error fetching weather data:', error);
                        alert('Failed to fetch weather data');
                    });
            } else {
                console.error('No coordinates found for the provided location');
                alert('No coordinates found for the provided location');
            }
        })
        .catch(error => {
            console.error('Error fetching coordinates:', error);
            alert('Failed to fetch coordinates');
        });
}
