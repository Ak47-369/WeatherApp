import React from "react";
import WeatherBox from "../WeatherBox/weatherBox";
import './weatherContainer.css';

function WeatherContainer({ weatherData }) {
  return (
    <div className="weather-box-container">
      {Object.keys(weatherData).map((api, index) => (
        <WeatherBox
          key={index}
          imageUrl={weatherData[api].imageUrl}
          apiName = {weatherData[api].apiName}
          temperature={weatherData[api].temperature}
          weather={weatherData[api].weather}
          windSpeed={weatherData[api].windSpeed}
          apiStatus={weatherData[api].statusCode}
        />
      ))}
    </div>
  );
}

export default WeatherContainer;