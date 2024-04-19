import { OWAPIKey } from './config.js';
import { getCurrentLocation } from './location-script.js';

// Define thresholds for each pollutant
const thresholds = {
    co: [0, 4500, 9500, 12500, 15500], // micrograms
    no: [0, 65, 130, 180, 230], // 
    no2: [0, 53, 100, 360, 650],
    o3: [0, 54, 70, 85, 105],
    so2: [0, 35, 75, 185, 305],
    pm10: [0, 20, 35, 50, 75],
    pm25: [0, 10, 20, 25, 50]
};

// Define labels for air quality levels
const labels = ['Good', 'Fair', 'Poor', 'Bad', 'Avoid'];

// Function to determine air quality level based on pollutant value and thresholds
function getAirQualityLevel(value, pollutant) {
    for (let i = 0; i < thresholds[pollutant].length; i++) {
        if (value <= thresholds[pollutant][i]) {
            return labels[i];
        }
    }
    return labels[labels.length - 1]; // Default to highest label if value exceeds all thresholds
}

export function fetchAirQuality() {
    getCurrentLocation().then(coords => {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords['lat']}&lon=${coords['lon']}&appid=${OWAPIKey}`;
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // update Air Quality display
                const airQualityDiv = document.getElementById('air-quality');
                if (data && data.list && data.list.length > 0) {

                    console.log(data);
                    airQualityDiv.innerHTML = `
                        <h2>Air Quality Index (AQI): ${data.list[0].main.aqi}</h2>
                        <p><strong>CO:</strong> ${data.list[0].components.co} µg/m³ (${getAirQualityLevel(data.list[0].components.co, 'co')})</p>
                        <p><strong>NO:</strong> ${data.list[0].components.no} µg/m³ (${getAirQualityLevel(data.list[0].components.no, 'no')})</p>
                        <p><strong>NO<sub>2</sub>:</strong> ${data.list[0].components.no2} µg/m³ (${getAirQualityLevel(data.list[0].components.no2, 'no2')})</p>
                        <p><strong>O<sub>3</sub>:</strong> ${data.list[0].components.o3} µg/m³ (${getAirQualityLevel(data.list[0].components.o3, 'o3')})</p>
                        <p><strong>SO<sub>2</sub>:</strong> ${data.list[0].components.so2} µg/m³ (${getAirQualityLevel(data.list[0].components.so2, 'so2')})</p>
                        <p><strong>PM<sub>10</sub>:</strong> ${data.list[0].components.pm10} µg/m³ (${getAirQualityLevel(data.list[0].components.pm10, 'pm10')})</p>
                        <p><strong>PM<sub>2.5</sub>:</strong> ${data.list[0].components.pm2_5} µg/m³ (${getAirQualityLevel(data.list[0].components.pm2_5, 'pm25')})</p>
                    `;
                } else {
                    airQualityDiv.innerHTML = "<p>Air quality data not available.</p>";
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert('Failed to fetch air quality data');
            });
    });
}