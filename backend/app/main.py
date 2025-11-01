from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = FastAPI(title="Weather API Proxy", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_weather(data, forecast_data):
    city_name = data.get("name")

    main_data = data.get("main", {})
    weather_details = (data.get("weather") or [{}])[0]
    wind_data = data.get("wind", {})

    temperature = round(main_data.get("temp", 0), 1)
    feels_like = round(main_data.get("feels_like", temperature), 1)
    temp_max = round(main_data.get("temp_max", temperature), 1)
    temp_min = round(main_data.get("temp_min", temperature), 1)
    humidity = main_data.get("humidity")
    pressure = main_data.get("pressure")

    wind_speed = wind_data.get("speed")
    wind_speed_kmh = round(wind_speed * 3.6, 1) if wind_speed is not None else None

    description = weather_details.get("description", "").title()
    icon = weather_details.get("icon")

    timezone_offset = data.get("timezone", 0)
    local_time = datetime.utcfromtimestamp(data.get("dt", 0) + timezone_offset)
    time_str = local_time.strftime("%H:%M")
    date_str = local_time.strftime("%d %b %Y")

    forecast = []
    for item in (forecast_data.get("list") or [])[:8]:
        forecast_weather = (item.get("weather") or [{}])[0]
        ftime = datetime.utcfromtimestamp(item.get("dt", 0) + timezone_offset).strftime("%H:%M")
        ftemp = round(item.get("main", {}).get("temp", 0), 1)
        forecast.append(
            {
                "time": ftime,
                "temp": ftemp,
                "icon": forecast_weather.get("icon"),
                "description": forecast_weather.get("description", "").title(),
            }
        )

    return {
        "city": city_name,
        "temperature": temperature,
        "feels_like": feels_like,
        "high": temp_max,
        "low": temp_min,
        "humidity": humidity,
        "pressure": pressure,
        "wind_speed": wind_speed_kmh,
        "description": description,
        "icon": icon,
        "forecast": forecast,
        "local_time": time_str,
        "local_date": date_str,
    }

def ensure_api_key():
    key = os.getenv("OPENWEATHER_API_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Missing OpenWeather API key")
    return key


@app.get("/weather")
async def get_weather(city: str):
    api_key = ensure_api_key()
    try:
        params = {"q": city, "appid": api_key, "units": "metric"}
        current = requests.get("https://api.openweathermap.org/data/2.5/weather", params=params)
        forecast = requests.get("https://api.openweathermap.org/data/2.5/forecast", params=params)
        current.raise_for_status()
        forecast.raise_for_status()
        return extract_weather(current.json(), forecast.json())
    except requests.RequestException:
        raise HTTPException(status_code=404, detail="City not found") from None


@app.get("/weather/coords")
async def get_weather_by_coords(lat: float, lon: float):
    api_key = ensure_api_key()
    try:
        params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric"}
        current = requests.get("https://api.openweathermap.org/data/2.5/weather", params=params)
        forecast = requests.get("https://api.openweathermap.org/data/2.5/forecast", params=params)
        current.raise_for_status()
        forecast.raise_for_status()
        return extract_weather(current.json(), forecast.json())
    except requests.RequestException:
        raise HTTPException(status_code=404, detail="Location not found") from None
