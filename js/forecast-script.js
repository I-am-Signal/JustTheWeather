import { APIKey } from './config.js';
import { getCurrentLocation } from './script.js';

function fetchForecast() {
    getCurrentLocation().then(coords => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords['lat']}&lon=${coords['lon']}&appid=${APIKey}&units=imperial`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Update 5-Day Forecast display
                const forecastDiv = document.getElementById('forecast');
                forecastDiv.innerHTML = ''; // Clear previous content

                if (data && data.list && data.list.length > 0) {
                    let currentDate = null;
                    let currentDayForecastDiv = null;

                    for (let i = 0; i < data.list.length; i++) {
                        const forecast = data.list[i];
                        const dateTime = new Date(forecast.dt * 1000); // Convert timestamp to date

                        // Extract date without time
                        const dateWithoutTime = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());

                        // If it's a new day, create a new header
                        if (!currentDate || dateWithoutTime.getTime() !== currentDate.getTime()) {
                            currentDate = dateWithoutTime;
                            // Create header for the new day
                            const header = document.createElement('h2');
                            header.textContent = currentDate.toDateString();
                            forecastDiv.appendChild(header);

                            // Create div for the day's forecasts
                            currentDayForecastDiv = document.createElement('div');
                            forecastDiv.appendChild(currentDayForecastDiv);
                        }

                        // Create forecast card
                        const forecastCard = document.createElement('div');
                        forecastCard.classList.add('forecast-card');
                        forecastCard.innerHTML = `
                            <p><strong>Time:</strong> ${dateTime.toLocaleTimeString()}</p>
                            <p><strong>Temperature:</strong> ${forecast.main.temp} °F</p>
                            <p><strong>Weather:</strong> ${forecast.weather[0].description}</p>
                        `;
                        currentDayForecastDiv.appendChild(forecastCard);
                    }
                } else {
                    forecastDiv.innerHTML = "<p>Forecast data not available.</p>";
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                //alert('Failed to fetch forecast data');
            });
    });
}

fetchForecast();
