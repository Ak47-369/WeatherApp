import express from "express";
import bodyParser from "body-parser";
import https from "https";

const app = express();

app.use(bodyParser.urlencoded({extended:true}));

// To use local static files, such as images, style.css
app.use(express.static('public'));

app.get("/weatherapp",function(request,response){
    response.sendFile("D:/Workplace/Projects/WeatherApp/index.html");
});

app.post("/",function(request,response){
    let cityName = request.body.city;
    console.log(cityName);
    let lat_long = " ";

    const apiId = "66685c4c61480343941491yac61f468";
    const url = `https://geocode.maps.co/search?q=${cityName}&api_key=${apiId}`;

    const APIKeys = {
      openWeatherMap: "f16726fe714ecaae4b0de2153eee210a",
      pirateWeather: "Q9Kj2H5UbMqb65FW25Y32EUNOOGT0fxf",
      weatherBit: "d359e8eb4b5f483ba435f2a0c95f2b64",
      tomorrow: "LwRLVEBT7gJEnOx48F2mauGzbIXf6Vwl"
    };
  
    const weatherData = {};

    // Using IIFE
      (async function geoCodeAPI() {
        const res = await fetch(url);
        const data = await res.json();
        console.log(data);
        lat_long = data[0].lat + "," + data[0].lon;
        console.log(lat_long);
        
        // To ensure that all API's called after geoCode API
        const apiUrls = {
          openWeatherMap: `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKeys.openWeatherMap}&units=metric`,
          weatherBit: `https://api.weatherbit.io/v2.0/current?city=${cityName}&key=${APIKeys.weatherBit}`,
          pirateWeather: `https://api.pirateweather.net/forecast/${APIKeys.pirateWeather}/${lat_long}?&units=si`,
          tomorrow: `https://api.tomorrow.io/v4/weather/forecast?location=${cityName}&apikey=${APIKeys.tomorrow}`
        };

        // Now call all Weather API's
        (async function getWeatherData(){
          for(let api of Object.keys(apiUrls)){
            // const res = await https.get(apiUrls[api]);
            let res = await fetch(apiUrls[api]);
            let data = await res.json(); // Parse json into js object
            console.log(res.status);
            // Using spread operator ...
            data = { ...data, statusCode: res.status}; // Add statusCode property to data object
            console.log(apiUrls[api]);
            console.log(data);
            // console.log(data.sta)
            weatherData[api] = data;
          }
        })();
      })();
  
    // Wait till all API's called  
    setTimeout(function(){
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
    },15000);
});

app.post("/weatherapp",function(request,response){
  response.redirect("/weatherapp");
})

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is Running on Port 3000");
});