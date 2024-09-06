import express from "express";
import bodyParser from "body-parser";
import getApiEndPoints from "./public/APIdata/apiEndPoints.js";
import APIKeys from "./public/APIdata/apiKeys.js";

const app = express();

// body-parser Middleware to parse url encoded body
app.use(bodyParser.urlencoded({extended:true}));

// To use local static files, such as images, style.css
app.use(express.static('public'));

app.get("/weatherapp",function(request,response){
    response.sendFile("D:/Workplace/Projects/WeatherApp/index.html");
    // response.sendFile(__dirname + "index.html");
});

app.post("/",async function(request,response){

  if (!request.body || !request.body.city) {
    response.status(400).send("Missing city name in request body");
    return;
  }

  let cityName = request.body.city;
  // console.log(cityName);

  // Validate the city name
  if (typeof cityName !== "string" || cityName.trim() === "") {
    response.status(400).send("Invalid city name");
    return;
  }

  let lat_long = " "; // Initialize with a default value

  // response.send(`City name: ${cityName}, Latitude and Longitude: ${lat_long}`);
 
  const weatherData = {};
  const geoAPI = `https://geocode.maps.co/search?q=${cityName}&api_key=${APIKeys.geoAPI}`
    try {
      const res = await fetch(geoAPI);
      const data = await res.json();
      lat_long = data[0].lat + "," + data[0].lon;
      
      const apiUrls = getApiEndPoints(cityName,lat_long);
      const promises = Object.keys(apiUrls).map(api => fetch(apiUrls[api]));
      const responses = await Promise.all(promises);
      const dataPromises = responses.map(res => res.json());
      const results = await Promise.all(dataPromises);
  
      results.forEach((data, index) => {
        const api = Object.keys(apiUrls)[index];
        data.statusCode = responses[index].status;
        weatherData[api] = data;
      });
  
      const html = `
      <html>
        <head>
          <title>Weather App</title>
          <link rel="icon" type="image/png" href="./assets/favicon.png" sizes="16x16">
          <style>
            body{
              padding : 10px;
              display: flex;
              flex-direction: column;
              align-items :center;
              justify-content:center;
              gap:20px;
            }

          .weather-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
          }

          .weather-box {
            flex: 0 0 calc(50% - 20px); /* adjust the width to 50% minus gap */
            margin: 20px;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }

          /* Add media queries for responsiveness */
          @media (max-width: 768px) {
            .weather-box {
              flex: 0 0 calc(100% - 20px); /* on smaller screens, make each box full width */
            }
          }

          @media (min-width: 768px) and (max-width: 1200px) {
            .weather-box {
              flex: 0 0 calc(50% - 20px); /* on medium screens, make each box 50% width */
            }
          }

          @media (min-width: 1200px) {
            .weather-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .weather-box {
              margin: 20px;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
          }


          .weather-box h2 {
            margin-top: 0;
          }

          .weather-details {
            margin-top: 20px;
          }

          .weather-details p {
            margin-bottom: 10px;
            font-size: 20px;
            font-weight: bold;
            color: #333;
          }

          .weather-details b {
            font-weight: bold;
            color: #00698f;
          }

          .temperature {
            font-size: 26px;
            font-weight: bold;
            color: #00698f;
          }

          .weather-condition {
            font-size: 20px;
            font-weight: bold;
            color: #333;
          }

          .weather-description {
            font-size: 20px;
            color: #666;
          }

          .weather-image{
            width:96px;
            height:76px;
          }

          .error-image {
            object-fit: contain;
            border-radius: 12px;
          }

          .cityBar{
            align-text:center;
          }

          </style>
        </head>
        <body>
          <div class = "cityBar">
            <h1>Weather in ${cityName}</h1> 
            <form action = "/weatherapp" method = "post">
              <button type="submit" class="fa-solid fa-magnifying-glass" id="searchBtn"></button>
            </form>
          </div>
          
          <div class =  "weather-container">
            <div class="weather-box">
              <h2>OpenWeatherMap</h2>
              <div class="weather-details">
                ${weatherData.openWeatherMap.statusCode === 200 ? 
                `<img src="https://openweathermap.org/img/wn/${weatherData.openWeatherMap.weather[0].icon}@2x.png" class = "weather-image">
                <p><b>Temperature:</b> <span class="temperature">${weatherData.openWeatherMap.main.temp}°C</span></p>
                <p><b>Weather:</b> <span class="weather-condition">${weatherData.openWeatherMap.weather[0].main}</span></p>
                <p><b>Description:</b> <span class="weather-description">${weatherData.openWeatherMap.weather[0].description}</span></p>`
                : `<img src="./assets/error-image.png" alt="Api Request Unsuccessful" class = "error-image">`
                }
              </div>
            </div>

            <div class="weather-box">
              <h2>WeatherBit</h2>
              <div class = "weather-details">
                ${weatherData.weatherBit.statusCode === 200 ?
              `<img src=https://www.weatherbit.io/static/img/icons/${weatherData.weatherBit.data[0].weather.icon}.png class = "weather-image">
              <p><b> Temperature:</b> <span class = "temperature">${weatherData.weatherBit.data[0].temp}°C</span></p>
              <p><b>Weather:</b> <span class="weather-condition">${weatherData.weatherBit.data[0].weather.description}</span></p>
              <p><b>AQI:</b><span class = "weather-description"> ${weatherData.weatherBit.data[0].aqi}</span></p>` : `<img src = "./assets/error-image.png" alt = "Api Request Unsuccessful" class = "error-image">`
              }  
              </div> 
            </div>

            <div class = "weather-box">
              <h2> Tomorrow API</h2>
              <div class = "weather-details">
                ${weatherData.tomorrow.statusCode === 200 ?
                `<img src ="./assets/${weatherData.tomorrow.timelines.minutely[0].values.weatherCode}.png" class = "weather-image">
                <p><b> Temperature:</b> <span class = "temperature">${weatherData.tomorrow.timelines.minutely[0].values.temperature}°C</span></p>
                <p><b>Humidity:</b> <span class="weather-condition">${weatherData.tomorrow.timelines.minutely[0].values.humidity}</span></p>
                <p><b>WindSpeed:</b><span class = "weather-description"> ${weatherData.tomorrow.timelines.minutely[0].values.windSpeed}</p>` 
                : `<img src = "./assets/error-image.png" alt = "Api Request Unsuccessful" class = "error-image">`
                }   
              </div>
            </div>

            <div class="weather-box">
              <h2>Pirate Weather</h2>
              <div class = "weather-details">
                ${weatherData.pirateWeather.statusCode === 200 ?
                `<img src ="./assets/${weatherData.pirateWeather.currently.icon}.png" class = "weather-image">
                <p><b>Temperature:</b> <span class="temperature">${weatherData.pirateWeather.currently.temperature}°C</span></p>
                <p><b>Weather:</b> <span class="weather-condition">${weatherData.pirateWeather.currently.summary}</span></p>
                <p><b>WindSpeed:</b> <span class="weather-description">${weatherData.pirateWeather.currently.windSpeed}</span></p>`: `<img src = "./assets/error-image.png" alt = "Api Request Unsuccessful" class = "error-image">`
                }
              </div>
            </div>

          </div>
          <script src="https://kit.fontawesome.com/90a3bdb97a.js" crossorigin="anonymous"></script>
        </body>
      </html>
    `;
    
    response.setHeader("Content-Type", "text/html");
    response.send(html);
  } catch (error) {
    console.error(error);
    response.status(500).send("Error occurred while fetching weather data");
  }

});

app.post("/weatherapp",function(request,response){
  response.redirect("/weatherapp");
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is Running on Port 3000");
});