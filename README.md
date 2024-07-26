# JustTheWeather
[*JustTheWeather*](https://justtheweather.tiiny.site) is a fully frontend IoT web application that interacts with two APIs (OpenWeather and OpenCage) to provide you with up-to-date information about weather in your current area or an area you are curious about.

Currently, *JustTheWeather* supports four views:
* [Current Weather](https://justtheweather.tiiny.site)
* [5-day Forecast](https://justtheweather.tiiny.site/forecast.html)
* [Weather Map](https://justtheweather.tiiny.site/map.html)
* [Air Quality](https://justtheweather.tiiny.site/air.html)

To select a location, navigate to the Current Weather screen using the navigation bar or clicking the *JustTheWeather* logo in the top left.

This web application is currently hosted [here](https://justtheweather.tiiny.site/).

## Running your own version

In order to run your own version of this web application, you must have your own API keys for the following services:
* [OpenWeather](https://openweathermap.org)
* [OpenCage](https://opencagedata.com)

The `config.js` file is used for configuration of the application. For the web application to work, your API keys need to be input here. Additionally, you can modify the default location that is displayed when geolocation fails in this file.

You can use extensions like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) to view and modify the application locally.

To host this application, we opted for [Tiiny Host](https://tiiny.host/), as they provide one free site hosting with your account. They have only a few stipulations for using their service for free:
* a "Shared with tiiny.host" promotion bar will be placed below your active site
* you must login every three months for the application to remain actively hosted

Additionally, Tiiny Host does offer paid subscriptions for similarly frontend-only static web applications that will remove the two above stated stipulations.

Once run locally or hosted, the site will provide you with everything our currently hosted version does. You can modify the code in anyway, but please do credit this project and link to this Github Repository. You can do so by including a credit statement such as: uses code from [JustTheWeather](https://justtheweather.tiiny.site) by Dylan Carder et al.