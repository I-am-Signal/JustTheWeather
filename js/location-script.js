import { OCAPIKey } from './config.js';

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

        if (savedLocation) { // there is a location saved
            resolve(JSON.parse(savedLocation));
        }

        if (!navigator.geolocation) { // browser doesn't support geolocation
            console.error('Geolocation is not supported by this browser.');
            resolve(setDefaultLocation('Geolocation is not supported by this browser. Using default location.'));
        } 
        
        console.log('Debug: attempting to save geolocation from browser.');
        navigator.geolocation.getCurrentPosition((position) => {
            const location = {
                "lat": position.coords.latitude,
                "lon": position.coords.longitude
            };
            sessionStorage.setItem('location', JSON.stringify(location));
            resolve(location);
        }, (error) => {
            console.error('Geolocation error:', error);
            resolve(setDefaultLocation('Error getting location. Using default location.'));
        });
    });
}


/**
 * Alerts the user with the error message and sets the default location to Kennesaw State University.
 * @param {*} errorMessage 
 */
function setDefaultLocation(errorMessage, resolve = null) {
    alert(errorMessage);
    const defaultLocation = {
        "lat": 34.038287,
        "lon": -84.581747
    };
    sessionStorage.setItem('location', JSON.stringify(defaultLocation));
    return defaultLocation;
}


/**
 * Takes in unformatted location string.
 * Returns locations coordinates if valid.
 * Returns null if location input is invalid.
 * @param {*} location 
 * @returns 
 */
export async function fetchDifferentLocation(location) {
    const formattedLocation = location.replace(/\s+/g, ''); // remove spaces for url
    console.log("Debug: formatted location:", formattedLocation);
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formattedLocation)}&key=${OCAPIKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        if (data.results && data.results.length > 0) { // check if there are results
            const coords = data.results[0].geometry;
            coords.lon = coords.lng;
            delete coords.lng; // rename and delete to format coordinate object
            console.log("Debug: " + JSON.stringify(coords) + " is the formatted coords object.");
            sessionStorage.setItem('location', JSON.stringify(coords));
            return coords;
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
export function pascalizeAndStringify(titlestring) {
    titlestring = titlestring.split(" ");
    let formattedStr = "";
    for (let i = 0; i < titlestring.length; i++) {
        formattedStr += titlestring[i].charAt(0).toUpperCase() + titlestring[i].slice(1);
        if (i < titlestring.length - 1) formattedStr += " ";
    }
    return formattedStr;
}

/**
 * Takes in the weather condition ID, Date object dateTime, and city and country location.
 * Returns 1 and sends an alert if the weather conditions are urgent.
 * Returns 0 if the weather conditions are not urgent.
 * @param {*} weatherConditionID 
 * @param {*} dateTime
 * @param {*} cityAndCountry 
 */
export function emergencyAlert(weatherConditionID, dateTime, cityAndCountry = null) {
    let alertString = "";
    let alertNecessary = false;

    // Thunderstorms
    if (weatherConditionID >= 200 && weatherConditionID <= 232) {
        alertString = "There is a thunderstorm at ";
        alertNecessary = true;
    }

    // Heavy Rains
    if (weatherConditionID >= 502 && weatherConditionID <= 531) {
        alertString = "There is heavier rain at ";
        alertNecessary = true;
    }

    // Snow
    if (weatherConditionID >= 601 && weatherConditionID <= 622) {
        alertString = "There is snow at "
    }

    // Atmosphere
    if (weatherConditionID >= 701 && weatherConditionID <= 781) {
        alertString = "There is lower visibility because of weather conditions at "
    }

    // If an alert is necessary
    if (alertNecessary) {
        if (cityAndCountry != null) {
            alert(alertString + dateTime.toLocaleTimeString() + " on " + dateTime.toDateString() + " in " + cityAndCountry + ".");
        }
        else {
            alert(alertString + dateTime.toLocaleTimeString() + " on " + dateTime.toDateString() + ".")
        }
        return 1;
    }

    // If an alert is no necessary
    return 0;
}