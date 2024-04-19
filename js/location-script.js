import { OCAPIKey, OWAPIKey } from './config.js';

export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        // Check if location is already stored
        const savedLocation = sessionStorage.getItem('location');
        console.log("Debug: current saved location: ", JSON.parse(savedLocation));

        if (savedLocation) {
            sessionStorage.setItem('location', savedLocation);
            resolve(JSON.parse(savedLocation));
        }
        else {

            if (navigator.geolocation) {
                console.log('Debug: saving geolocation from browser.');
                navigator.geolocation.getCurrentPosition((position) => {
                    const location = {
                        "lat": position.coords.latitude,
                        "lon": position.coords.longitude
                    };
                    sessionStorage.setItem('location', JSON.stringify(location));
                    resolve(location);
                }, (error) => {
                    console.error('Geolocation error:', error);
                    defaultLocation('Error getting location. Using default location.');
                });
            } else {
                defaultLocation('Geolocation is not supported by this browser.');
            }
        }
    });
}

function defaultLocation(errorMessage) {
    alert(errorMessage);
    const defaultLocation = {
        "lat": 34.038287,
        "lon": -84.581747
    };
    sessionStorage.setItem('location', JSON.stringify(defaultLocation));
    resolve(defaultLocation);
}

export function clearLocationCache() {
    sessionStorage.removeItem('location');
}

// Takes in unformatted location string, returns coordinates
export async function fetchDifferentLocation(location) {
    // Remove spaces from the location string
    const formattedLocation = location.replace(/\s+/g, '');
    console.log("Debug: " + formattedLocation + " is formatted location.");
    // Construct the URL for the OpenCage Geocoder API
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formattedLocation)}&key=${OCAPIKey}`;

    try {
        // Fetch the geocoding data from OpenCage
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        // Check if there are any results
        if (data.results && data.results.length > 0) {
            // Extract the latitude and longitude
            const coords = data.results[0].geometry;
            coords.lon = coords.lng; // Rename 'lng' to 'lon'
            delete coords.lng; // Delete 'lng' property
            console.log("Debug: " + JSON.stringify(coords) + " is the formatted coords object.");
            sessionStorage.setItem('location', JSON.stringify(coords));
            return coords; // Return coordinates as an object
        } else {
            console.error('No results found for the location:', location);
            alert('No results found for the location:', location);
            return null; // No coordinates found
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null; // Return null in case of error
    }
}