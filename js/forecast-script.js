import { OWAPIKey } from './config.js';
import { getCurrentLocation, pascalizeAndStringify, emergencyAlert } from './location-script.js';

/**
 * Fetches the forecast from OpenWeather
 */
export function fetchForecast() {
    getCurrentLocation().then(coords => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords['lat']}&lon=${coords['lon']}&appid=${OWAPIKey}&units=imperial`;
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
                let locationName = null;

                if (data && data.city) {
                    locationName = `${data.city.name}, ${data.city.country}`;
                    const locationHeader = document.createElement('h2');
                    locationHeader.textContent = locationName;
                    forecastDiv.appendChild(locationHeader);
                }

                if (data && data.list && data.list.length > 0) {
                    let currentDate = null;
                    let currentDayForecastDiv = null;
                    let alertCounter = 0;

                    for (let i = 0; i < data.list.length; i++) {
                        const forecast = data.list[i];
                        const dateTime = new Date(forecast.dt * 1000); // Convert timestamp to date

                        // Extract date without time
                        const dateWithoutTime = new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());

                        // If it's a new day, create a new header
                        if (!currentDate || dateWithoutTime.getTime() !== currentDate.getTime()) {
                            currentDate = dateWithoutTime;
                            // Create header for the new day
                            const header = document.createElement('h4');
                            let temp = currentDate.toDateString().split(" ");
                            var formattedDate = temp[0] + ", " + temp[1] + " " + temp[2] + ", " + temp[3];
                            header.textContent = formattedDate;
                            forecastDiv.appendChild(header);

                            // Create div for the day's forecasts
                            currentDayForecastDiv = document.createElement('div');
                            forecastDiv.appendChild(currentDayForecastDiv);
                        }

                        // Create forecast card
                        const forecastCard = document.createElement('div');
                        forecastCard.classList.add('forecast-card');
                        forecastCard.innerHTML = `
                            <img src="http://openweathermap.org/img/w/${forecast.weather[0].icon}.png" alt="Weather Icon">
                            <p style="color: white"><strong style="color: aqua">Time:</strong> ${dateTime.toLocaleTimeString()}</p>
                            <p style="color: white"><strong style="color: aqua">Temperature:</strong> ${forecast.main.temp} °F</p>
                            <p style="color: white"><strong style="color: aqua">Weather:</strong> ${pascalizeAndStringify(forecast.weather[0].description)}</p>
                        `;

                        if (alertCounter < 1) {
                            alertCounter += emergencyAlert(forecast.weather[0].id, dateTime, locationName);
                        }
                        currentDayForecastDiv.appendChild(forecastCard);
                    }
                } else {
                    forecastDiv.innerHTML = "<p>Forecast data not available.</p>";
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert('Failed to fetch forecast data');
            });
    });
}
