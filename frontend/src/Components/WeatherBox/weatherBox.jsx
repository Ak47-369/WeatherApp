import React from "react";
import './weatherBox.css';
import notFoundImage from '../../Assets/error-image.png';

function capitalize(s){
    return s && s[0].toUpperCase() + s.slice(1);
}

function WeatherBox({apiName,temperature,weather,apiStatus,windSpeed,imageUrl}){
    // console.log("In" + apiName);
    if(apiStatus === 200) { // Successful API Request
        return(
            <div className="weather-box">
                <img src = {imageUrl} alt = "Weather Icon" className="weather-image"/>
                <h1>{capitalize(apiName)}</h1>
                <h2>Temperature : {temperature}°C</h2>
                <h2>Weather: {capitalize(weather)}</h2>
                <h2>WindSpeed: {windSpeed}</h2>
            </div>
        );
    }

    else{ // API Request failed
        return(
            <div className="weather-box">
                <img src = {notFoundImage} alt = "Error-Image" className="error-image"/>
                <h2> {apiName} API Request Failed</h2>
            </div>
        )
    }
};

export default WeatherBox;