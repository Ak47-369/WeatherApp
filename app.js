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

    const apiId = "66685c4c61480343941491yac61f468";
    const url = `https://geocode.maps.co/search?q=${cityName}&api_key=${apiId}`;

    // Convert cityName to Latitude and longitude (because pirateWeather don't take city Name as parameter)
    let lat_long = "";
    https.get(url, function (res) {
        let data = ''; // Initialize a variable to accumulate chunks of data

        res.on("data", function (chunk) {
            data += chunk; // Accumulate chunks
        });

        res.on("end", function () {
            try {
                const jsonData = JSON.parse(data); // Parse the accumulated data
                // console.log(res.statusCode);
                // console.log(jsonData);
                lat_long = jsonData[0].lat + "," + jsonData[0].lon;
            } catch (error) {
                console.error("Error parsing JSON:", error);
                response.status(500).send({ error: "Failed to parse JSON" });
            }
        });
    }).on("error", function (error) {
        console.error("Error with HTTP request:", error);
        response.status(500).send({ error: "Failed to retrieve data from API" });
    });

    setTimeout(function(){
        const APIKeys = {
            openWeatherMap: "f16726fe714ecaae4b0de2153eee210a",
            pirateWeather: "Q9Kj2H5UbMqb65FW25Y32EUNOOGT0fxf",
            weatherBit: "d359e8eb4b5f483ba435f2a0c95f2b64",
            tommorow: "LwRLVEBT7gJEnOx48F2mauGzbIXf6Vwl"
          };
        
          const apiUrls = {
            openWeatherMap: `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKeys.openWeatherMap}&units=metric`,
            weatherBit: `https://api.weatherbit.io/v2.0/current?city=${cityName}&key=${APIKeys.weatherBit}`,
            pirateWeather: `https://api.pirateweather.net/forecast/${APIKeys.pirateWeather}/${lat_long}?&units=si`,
            tommorow: `https://api.tomorrow.io/v4/weather/forecast?location=${cityName}&apikey=${APIKeys.tommorow}`
          };
        
          const weatherData = {};
          // Make API calls to each weather service
          Object.keys(apiUrls).forEach(function(api) {
            https.get(apiUrls[api],function(res) {
                console.log(res.statusCode);  
                console.log(apiUrls[api]);
                let data = " ";
                res.on("data", function(chunk) {
                    data += chunk
                });
        
                res.on("end",function(){
        
                    try{
                        const jsonData = JSON.parse(data);
                        weatherData[api] = jsonData;
                    }
        
                    catch(error){
                        console.error("Error Parsing JSON",error);
                        response.status(500).send("Error : Failed to parse JSON");
                    }
                });
            }).on("error", function (error) {
                console.error("Error with HTTP request:", error);
                response.status(500).send({ error: "Failed to retrieve data from API" });
            });
        });
        
          // Wait for all API calls to complete
          setTimeout(() => {
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
                    <img width = "72px" height = "96px" src =https://openweathermap.org/img/wn/${weatherData.openWeatherMap.weather[0].icon}@2x.png>
                    <p>Temperature: ${weatherData.openWeatherMap.main.temp}°C</p>
                    <p>Weather: ${weatherData.openWeatherMap.weather[0].main}</p>
                    <p>Description: ${weatherData.openWeatherMap.weather[0].description}</p>
                  </div>
                
                  <div class="weather-box">
                    <h2>WeatherBit</h2>
                    <img width = "72px" height = "96px"  src=https://www.weatherbit.io/static/img/icons/${weatherData.weatherBit.data[0].weather.icon}.png>
                    <p>Temperature: ${weatherData.weatherBit.data[0].temp}°C</p>
                    <p>Weather: ${weatherData.weatherBit.data[0].weather.description}</p>
                    <p>AQI: ${weatherData.weatherBit.data[0].aqi}</p>
                  </div>

                  <div class = "weather-box">
                    <h2> Tommorrow API</h2>
                    <img  width = "72px" height = "96px" src ="./assets/${weatherData.tommorow.timelines.minutely[0].values.weatherCode}.png">
                    <p>Temperature: ${weatherData.tommorow.timelines.minutely[0].values.temperature}°C</p>
                    <p>Humidity: ${weatherData.tommorow.timelines.minutely[0].values.humidity}</p>
                    <p>WindSpeed: ${weatherData.tommorow.timelines.minutely[0].values.windSpeed}</p>
                  </div>

                   <div class="weather-box">
                    <h2>Pirate Weather</h2>
                    <img  width = "72px" height = "96px" src ="./assets/${weatherData.pirateWeather.currently.icon}.png">
                    <p>Temperature: ${weatherData.pirateWeather.currently.temperature}°C</p>
                    <p>Weather: ${weatherData.pirateWeather.currently.summary}</p>
                    <p>Description: ${weatherData.pirateWeather.currently.windSpeed}</p>
                  </div>
        
                </body>
              </html>
            `;
        
            response.setHeader("Content-Type", "text/html");
            response.send(html);
          }, 2000); // Wait for 2 seconds to ensure all API calls are complete
    },2000);
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server is Running on Port 3000");
});