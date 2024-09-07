import React, { useState } from 'react';
import './App.css';
import WeatherContainer from './Components/WeatherContainer/weatherContainer';

function App() {
  const [weatherData, setWeatherData] = useState({});
  const [city, setCity] = useState('');
  const [searched, setSearched] = useState(false); // new state variable

  const fetchWeatherData = async function(city) {
    try {
      console.log('Sending request with city:', city);
      const response = await fetch("http://localhost:3000/getWeatherData", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });
  
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCityChange = (event) => {
    setCity(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (city.trim() !== '') {
      fetchWeatherData(city.trim());
      setSearched(true); // update searched state
    }
  };

  return (
    <div className="App">
      <div className="cityBar">
        {searched ? (
          <h2>Weather in {city}</h2>
        ) : (
          <h2>Enter city name</h2>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={city}
            onChange={handleCityChange}
            placeholder="Enter your City name"
            className="cityInput"
          />
          <button type="submit" className="cityButton">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </form>
      </div>
      {searched && <WeatherContainer weatherData={weatherData} />}
    </div>
  );
};

export default App;