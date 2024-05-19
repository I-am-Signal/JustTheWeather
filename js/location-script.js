import { OCAPIKey, defaultLocation } from './config.js';

/**
 * Returns the current location coordinates.
 * If there is currently a location saved, it returns its coordinates.
 * If there is not a location saved, it attempts to get the user's web browser's navigator geolocation as coordinates.
 * @returns array containing 'lat' and 'lon' coordinates
 */
export function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        const savedLocation = sessionStorage.getItem('location');
        console.debug("Debug: current location data:", savedLocation);

        if (savedLocation) {
            resolve(JSON.parse(savedLocation));
            return;
        }

        console.log("Attempting to geolocate your current location.");
        if (!navigator.geolocation) { // browser doesn't support geolocation
            console.error('Geolocation is not supported by this browser.');
            resolve(setDefaultLocation('Geolocation is not supported by this browser. Using default location.'));
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const location = {
                "lat": position.coords.latitude,
                "lon": position.coords.longitude
            };
            sessionStorage.setItem('location', JSON.stringify(location));
            fetchDifferentLocation(location['lat'] + ", " + location['lon']);
            resolve(location);
        }, (error) => {
            console.error('Geolocation error:', error);
            resolve(setDefaultLocation('Error getting location. Using default location.'));
        });
    });
}


/**
 * Alerts the user with the error message and sets the default location to Kennesaw State University.
 * @param {string} errorMessage 
 */
function setDefaultLocation(errorMessage, resolve = null) {
    alert(errorMessage);
    sessionStorage.setItem('location', JSON.stringify(defaultLocation));
    fetchDifferentLocation(defaultLocation['lat'] + ", " + defaultLocation['lon'])
    return defaultLocation;
}


/**
 * Takes in unformatted location string.
 * Returns locations coordinates if valid.
 * Returns null if location input is invalid.
 * @param {string} location 
 * @returns 
 */
export async function fetchDifferentLocation(location) {
    try {
        let data = await callOpenCageAPI(location);

        if (data.results && data.results.length > 0) {
            const coords = data.results[0].geometry;
            coords.lon = coords.lng;
            delete coords.lng; // rename and delete to format coordinate object
            sessionStorage.setItem('location', JSON.stringify(coords));
            formatLocationName(data);
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
 * Takes in unformatted location string.
 * Returns formatted JSON API response object if valid.
 * Returns null if location input is invalid.
 * @param {string} location 
 * @returns 
 */
async function callOpenCageAPI(location) {
    const formattedLocation = location.replace(/\s+/g, ''); // remove spaces for url
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formattedLocation)}&key=${OCAPIKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.debug("Debug:", data);

        if (data.results && data.results.length > 0) {
            return data
        }
        return null; //No results found for the location
    } catch (error) {
        console.error('Error calling OpenCage Geocoder:', error);
        return null;
    }
}


/**
 * Takes in a string with spaces and returns a string with the first letter of each word capitalized.
 * @param {string} title 
 * @returns formatted title string
 */
export function pascalizeAndStringify(title) {
    title = title.split(" ");
    let formattedStr = "";
    for (let i = 0; i < title.length; i++) {
        formattedStr += title[i].charAt(0).toUpperCase() + title[i].slice(1);
        if (i < title.length - 1) formattedStr += " ";
    }
    return formattedStr;
}

/**
 * Takes in the weather condition ID, Date object dateTime, and city and country location.
 * Returns 1 and sends an alert if the weather conditions are urgent.
 * Returns 0 if the weather conditions are not urgent.
 * @param {int} weatherConditionID 
 * @param {Date} dateTime
 * @param {string} cityAndCountry 
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

/**
 * Takes in the raw data received from an OpenCage API call.
 * Returns the formatted location name string.
 * @param {JSON} openCageData 
 * @param {string} locationName
 */
export async function formatLocationName(openCageData = null, locationName = null) {
    if (!openCageData && locationName) {
        openCageData = await callOpenCageAPI(locationName);
    }

    const place = openCageData.results[0].components;
    let formattedLocation = "";
    if (place.village) {
        formattedLocation += place.village;
    }
    else if (place.town) {
        formattedLocation += place.town;
    }
    else if (place.city) {
        formattedLocation += place.city;
    }
    else if (place.county) {
        formattedLocation += place.county;
    }
    else {
        formattedLocation += place._normalized_city;
    }

    if (place.state) {
        formattedLocation += ", " + place.state;
    } else {
        formattedLocation += ", " + place.country;
    }
    sessionStorage.setItem('locationName', formattedLocation);
    return formattedLocation;
}

/**
 * Takes in a date object and returns the hex code corresponding with the time of day
 * @param {Date} time 
 * @returns 
 */
export function colorOfTheSky(time) {
    time = time.toLocaleTimeString().split(" ");
    const hour = parseInt(time[0].split(":")[0]);
    const half = time[time.length - 1];
    if (half == "AM") {
        if (hour >= 10) // 10am to noon
            return "00bfff";
        if (hour >= 8) // 8am to 9:59am
            return "87ceeb";
        if (hour >= 5) // 5am to 7:59am
            return "2f2f56";
        return "0a0a30"; // midnight to 4:59am
    }
    else {
        if (hour >= 10) // 10pm to midnight
            return "0a0a30";
        if (hour >= 8) // 8pm to 9:59pm
            return "db7228";
        if (hour >= 5) // 5pm to 7:59pm
            return "dc9f62";
        return "00aaff"; // noon to 4:59pm
    }
}