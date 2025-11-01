import React from 'react';

const WeatherCard = ({ weather }) => {
  const { city, temperature, description, icon, forecast } = weather;

  return (
    <div className="weather-card">
      <h2>{city}</h2>
      <img
        src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
        alt={description}
      />
      <p>{description}</p>
      <h3>{temperature}°C</h3>

      {forecast && forecast.length > 0 && (
        <div className="forecast">
          {forecast.map((item, index) => (
            <div key={index} className="forecast-item">
              <div>{item.time}</div>
              <div>{item.temp}°C</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
