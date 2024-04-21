import { OCAPIKey, OWAPIKey } from './config.js';

/**
 * Returns the current location coordinates.
 * If there is currently a location saved, it returns its coordinates.
 * If there is not a location saved, it attempts to get the user's web browser's navigator geolocation as coordinates.
 * @returns array containing 'lat' and 'lon' coordinates
 */
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
                    setDefaultLocation('Error getting location. Using default location.');
                });
            } else {
                setDefaultLocation('Geolocation is not supported by this browser.');
            }
        }
    });
}


/**
 * Alerts the user with the error message and sets the default location to Kennesaw State University.
 * @param {*} errorMessage 
 */
function setDefaultLocation(errorMessage) {
    alert(errorMessage);
    const defaultLocation = {
        "lat": 34.038287,
        "lon": -84.581747
    };
    sessionStorage.setItem('location', JSON.stringify(defaultLocation));
    resolve(defaultLocation);
}


/**
 * Clears the current saved location
 */
export function clearSavedLocation() {
    sessionStorage.removeItem('location');
}


/**
 * Takes in unformatted location string.
 * Returns locations coordinates if valid.
 * Returns null if location input is invalid.
 * @param {*} location 
 * @returns 
 */
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


/**
 * Takes in a string with spaces and returns a string with the first letter of each word capitalized.
 * @param {*} titlestring 
 * @returns string
 */
export function pascalizeAndStringify(titlestring){
    titlestring = titlestring.split(" ");
    let formattedStr = "";
    for (let i = 0; i < titlestring.length; i++){
        formattedStr += titlestring[i].charAt(0).toUpperCase() + titlestring[i].slice(1);
        if (i < titlestring.length - 1) formattedStr += " ";
    }
    return formattedStr;
}