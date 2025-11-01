from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import os
from datetime import datetime
import requests


# Helper function to extract weather data


def extract_weather(data: dict, forecast_data: dict) -> dict:
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


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse URL and query parameters
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
        
        try:
            api_key = os.getenv("OPENWEATHER_API_KEY")
            if not api_key:
                self.wfile.write(json.dumps({"error": "Missing API key"}).encode())
                return
            
            # Handle /api/weather endpoint
            if '/weather' in path and 'city' in query_params:
                city = query_params['city'][0]
                params = {"q": city, "appid": api_key, "units": "metric"}
                current = requests.get("https://api.openweathermap.org/data/2.5/weather", params=params)
                forecast = requests.get("https://api.openweathermap.org/data/2.5/forecast", params=params)
                
                if current.status_code == 200 and forecast.status_code == 200:
                    result = extract_weather(current.json(), forecast.json())
                    self.wfile.write(json.dumps(result).encode())
                else:
                    self.wfile.write(json.dumps({"error": "City not found"}).encode())
                return
            
            # Handle /api/weather/coords endpoint
            if '/weather/coords' in path or '/weather-coords' in path:
                lat = float(query_params.get('lat', [0])[0])
                lon = float(query_params.get('lon', [0])[0])
                params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric"}
                current = requests.get("https://api.openweathermap.org/data/2.5/weather", params=params)
                forecast = requests.get("https://api.openweathermap.org/data/2.5/forecast", params=params)
                
                if current.status_code == 200 and forecast.status_code == 200:
                    result = extract_weather(current.json(), forecast.json())
                    self.wfile.write(json.dumps(result).encode())
                else:
                    self.wfile.write(json.dumps({"error": "Location not found"}).encode())
                return
            
            # Default response
            self.wfile.write(json.dumps({"error": "Invalid endpoint"}).encode())
            
        except Exception as e:
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
