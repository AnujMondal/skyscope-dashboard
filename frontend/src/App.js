import React, { useEffect, useState } from "react";
import "./styles/App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "/api";

export default function App() {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const formatMetric = (value, unit = "", digits = 1) => {
    if (value === null || value === undefined) return "—";
    if (typeof value !== "number") return `${value}${unit}`.trim();
    const formatted = value.toFixed(digits);
    const sanitized = formatted.endsWith(".0")
      ? formatted.slice(0, -2)
      : formatted;
    return `${sanitized}${unit}`.trim();
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("weatherHistory")) || [];
    setHistory(stored);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const res = await fetch(
            `${API_BASE}/weather/coords?lat=${lat}&lon=${lon}`
          );
          const data = await res.json();
          setWeather(data);
          updateHistory(data.city);
        } catch {
          setError("Failed to fetch auto-location weather");
        }
      });
    }
  }, []);

  const updateHistory = (newCity) => {
    if (!newCity) return;
    setHistory((prev) => {
      const next = [newCity, ...prev.filter((c) => c !== newCity)].slice(0, 5);
      localStorage.setItem("weatherHistory", JSON.stringify(next));
      return next;
    });
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
      );
      const data = await res.json();

      if (!Array.isArray(data)) {
        setSuggestions([]);
        return;
      }

      const names = data.map((c) => {
        const statePart = c.state ? `, ${c.state}` : "";
        return `${c.name}${statePart}, ${c.country}`;
      });

      setSuggestions(names);
    } catch (err) {
      console.error("Autocomplete fetch error:", err);
      setSuggestions([]);
    }
  };

  const extractCityOnly = (fullString) => {
    return fullString.split(",")[0].trim();
  };

  const fetchWeather = async (selectedCity) => {
    if (!selectedCity) {
      setError("Please enter a city to search");
      return;
    }
    setError("");
    setSuggestions([]);
    const cityOnly = extractCityOnly(selectedCity);
    setCity(cityOnly);
    try {
      const res = await fetch(
        `${API_BASE}/weather?city=${encodeURIComponent(cityOnly)}`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);
      updateHistory(data.city);
    } catch {
      setError("City not found");
      setWeather(null);
    }
  };

  const metrics = weather
    ? [
        weather.high !== undefined && {
          label: "High",
          value: formatMetric(weather.high, "°C", 1),
        },
        weather.low !== undefined && {
          label: "Low",
          value: formatMetric(weather.low, "°C", 1),
        },
        weather.feels_like !== undefined && {
          label: "Feels Like",
          value: formatMetric(weather.feels_like, "°C", 1),
        },
        weather.humidity !== undefined && {
          label: "Humidity",
          value: formatMetric(weather.humidity, "%", 0),
        },
        weather.wind_speed !== undefined && {
          label: "Wind",
          value: formatMetric(weather.wind_speed, " km/h", 1),
        },
        weather.pressure !== undefined && {
          label: "Pressure",
          value: formatMetric(weather.pressure, " hPa", 0),
        },
      ].filter(Boolean)
    : [];

  return (
    <div className="app-shell">
      <div className="backdrop backdrop-one" />
      <div className="backdrop backdrop-two" />

      <main className="container">
        <header className="headline">
          <span className="headline__eyebrow">Live global weather</span>
          <h1>SkyScope Dashboard</h1>
          <p className="headline__copy">
            Track the next hours with rich visuals, quick-glance stats, and easy
            access to your recently viewed cities.
          </p>
        </header>

        <section className="panel">
          <div className="search" role="search">
            <div className="search-bar">
              <input
                id="city-input"
                type="text"
                placeholder="Search by city or country..."
                value={city}
                onChange={(e) => {
                  const val = e.target.value;
                  setCity(val);
                  fetchSuggestions(val);
                }}
                onKeyDown={(e) => e.key === "Enter" && fetchWeather(city)}
                autoComplete="off"
              />
              <button type="button" onClick={() => fetchWeather(city)}>
                Search
              </button>
            </div>

            {suggestions.length > 0 && (
              <ul className="suggestions" role="listbox">
                {suggestions.map((s, idx) => (
                  <li key={idx} role="option" onClick={() => fetchWeather(s)}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {history.length > 0 && (
            <div className="history">
              <h3>Recent Searches</h3>
              <div className="tags">
                {history.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    className="tag"
                    onClick={() => fetchWeather(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <div className="error">{error}</div>}
        </section>

        {weather && (
          <section className="panel weather-card">
            <div className="weather-summary">
              <div className="weather-summary__meta">
                <h2>{weather.city}</h2>
                <p className="timestamp">
                  {weather.local_date} · {weather.local_time}
                </p>
                <p className="description">{weather.description}</p>
              </div>
              <div className="temperature-badge">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                />
                <span className="temp-main">
                  {formatMetric(weather.temperature, "°C", 1)}
                </span>
                {weather.feels_like !== undefined && (
                  <span className="temp-label">
                    Feels like {formatMetric(weather.feels_like, "°C", 1)}
                  </span>
                )}
              </div>
            </div>

            {metrics.length > 0 && (
              <div className="weather-metrics">
                {metrics.map((metric) => (
                  <div key={metric.label} className="metric-card">
                    <span className="metric-label">{metric.label}</span>
                    <span className="metric-value">{metric.value}</span>
                  </div>
                ))}
              </div>
            )}

            {weather.forecast?.length > 0 && (
              <div className="forecast-section">
                <div className="forecast-header">
                  <h3>Next Hours</h3>
                  <span className="forecast-caption">
                    Automatically adjusted to the city’s local time
                  </span>
                </div>
                <div className="forecast-grid">
                  {weather.forecast.map((f, i) => (
                    <div className="forecast-card" key={`${f.time}-${i}`}>
                      <span className="forecast-time">{f.time}</span>
                      {f.icon && (
                        <img
                          src={`https://openweathermap.org/img/wn/${f.icon}@2x.png`}
                          alt={f.description}
                        />
                      )}
                      <strong>{formatMetric(f.temp, "°C", 1)}</strong>
                      {f.description && (
                        <span className="forecast-desc">{f.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {weather.forecast?.length > 0 && (
              <div className="chart-section">
                <h3>Temperature Trend</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={weather.forecast}
                    margin={{ left: 0, right: 10, top: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="tempGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#a855f7"
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="rgba(148, 163, 184, 0.2)"
                    />
                    <XAxis
                      dataKey="time"
                      stroke="#cbd5f5"
                      tickLine={false}
                      axisLine={false}
                      dy={6}
                    />
                    <YAxis
                      unit="°"
                      stroke="#cbd5f5"
                      tickLine={false}
                      axisLine={false}
                      dx={-6}
                    />
                    <Tooltip
                      cursor={{ stroke: "#38bdf8", strokeWidth: 1 }}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: 12,
                        border: "1px solid rgba(148,163,184,0.3)",
                        color: "#f8fafc",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="url(#tempGradient)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
