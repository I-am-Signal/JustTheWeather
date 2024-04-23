import { getCurrentLocation } from './location-script.js';

export function fetchWeatherMap() {
    getCurrentLocation().then(coords => {
        const { lat, lon } = coords;
        const mapUrl = `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=temperature&lat=${lat}&lon=${lon}&zoom=10`;

        // Set the URL of the iframe to display the weather map
        const loading = document.getElementById('map');
        loading.innerHTML = `
            <button type="button" id="refresh" class="btn btn-primary">Refresh Map</button>
            <iframe id="weather-map" width="100%" height="600" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
        `;
        const iframe = document.getElementById('weather-map');
        iframe.src = mapUrl;
        document.getElementById('refresh').addEventListener('click', function (event) {
            event.preventDefault();
            console.log("Debug: Refresh Map button clicked!");
            const loading = document.getElementById('map');
            loading.innerHTML = `Loading...`;
            fetchWeatherMap();
        });
    });
}