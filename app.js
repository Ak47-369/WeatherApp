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
            data = { ...data, statusCode: res.status }; // Add statusCode property to data object
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
          <style>
            body{
              display: flex;
              flex-direction: column;
              align-items :center;
              justify-content:center;
              gap:20px;
            }

            .cityBar{
              align-text:center;
            }

            .weather-box {
              display: flex;
              flex-direction: row;
              gap:20px;
              width: 50%;
              margin: 20px;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
          </style>
        </head>
        <body>
          <div class = "cityBar">
          <h1>Weather in ${cityName}</h1>
          </div>

          <div class="weather-box">
            <h2>OpenWeatherMap</h2>
            ${weatherData.openWeatherMap.statusCode === 200 ? 
              `<img width="72px" height="96px" src="https://openweathermap.org/img/wn/${weatherData.openWeatherMap.weather[0].icon}@2x.png>
              <p>Temperature: ${weatherData.openWeatherMap.main.temp}°C</p>
              <p>Weather: ${weatherData.openWeatherMap.weather[0].main}</p>
              <p>Description: ${weatherData.openWeatherMap.weather[0].description}</p>` 
              : 
              `<img src="./assets/error-image.png" alt="Api Request Unsuccessful">`
            }
          </div>

        
          <div class="weather-box">
            <h2>WeatherBit</h2>
            ${weatherData.weatherBit.statusCode === 200 ?
            `<img width = "72px" height = "96px"  src=https://www.weatherbit.io/static/img/icons/${weatherData.weatherBit.data[0].weather.icon}.png>
            <p>Temperature: ${weatherData.weatherBit.data[0].temp}°C</p>
            <p>Weather: ${weatherData.weatherBit.data[0].weather.description}</p>
            <p>AQI: ${weatherData.weatherBit.data[0].aqi}</p>` : `<img src = "./assets/error-image.png" alt = "Api Request Unsuccessful ">`
            }   
          </div>

          <div class = "weather-box">
            <h2> Tomorrow API</h2>
            ${weatherData.tomorrow.statusCode === 200 ?
            `<img  width = "72px" height = "96px" src ="./assets/${weatherData.tomorrow.timelines.minutely[0].values.weatherCode}.png">
            <p>Temperature: ${weatherData.tomorrow.timelines.minutely[0].values.temperature}°C</p>
            <p>Humidity: ${weatherData.tomorrow.timelines.minutely[0].values.humidity}</p>
            <p>WindSpeed: ${weatherData.tomorrow.timelines.minutely[0].values.windSpeed}</p>` 
            : `<img src = "./assets/error-image.png" alt = "Api Request Unsuccessful">`
            }   
          </div>

            <div class="weather-box">
            <h2>Pirate Weather</h2>
            ${weatherData.pirateWeather.statusCode === 200 ?
            `<img  width = "72px" height = "96px" src ="./assets/${weatherData.pirateWeather.currently.icon}.png">
            <p>Temperature: ${weatherData.pirateWeather.currently.temperature}°C</p>
            <p>Weather: ${weatherData.pirateWeather.currently.summary}</p>
            <p>Description: ${weatherData.pirateWeather.currently.windSpeed}</p>` :
              `<img src = "./assets/error-image.png" alt = "Api Request Unsuccessful">`
            }
          </div>

        </body>
      </html>
    `;
    
    response.setHeader("Content-Type", "text/html");
    response.send(html);
    },6000);
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is Running on Port 3000");
});