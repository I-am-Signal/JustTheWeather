import { getCurrentLocation } from './script.js';

function fetchWeatherMap() {
    getCurrentLocation().then(coords => {
        const { lat, lon } = coords;
        const mapUrl = `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=temperature&lat=${lat}&lon=${lon}&zoom=10`;

        // Set the URL of the iframe to display the weather map
        const iframe = document.getElementById('weather-map');
        iframe.src = mapUrl;
    });
}

fetchWeatherMap();
