# 🌦️ Weather Dashboard

A full-stack Weather Dashboard built with FastAPI (backend) and React (frontend). It shows real-time weather, autocomplete suggestions, recent searches, and visual charts, all using data from the OpenWeatherMap API. The app is responsive, clean, and great for exploring weather data visually while practicing modern Python tools.


## 🔧 Tech Stack

### Frontend (React)
- React.js
- Recharts (📊 for visualizations)
- CSS (Custom Responsive Styling)
- OpenWeatherMap Geocoding API
- OpenWeatherMap Weather API

### Backend (FastAPI)
- FastAPI
- Requests (API integration)
- CORS Middleware
- Uvicorn

---

## 📦 Features

- 🔍 **Auto-location Weather**: Uses Geolocation API to fetch current weather on page load.
- 🏙️ **City Search**: Type any city to get live weather data.
- 🧠 **Autocomplete Suggestions**: Powered by OpenWeatherMap Geocoding API.
- 🕘 **Recent Search History**: Stored via `localStorage`, clickable for quick access.
- 📊 **Chart Dashboard**: Visual representation of weather data using Recharts.
- 📱 **Mobile Friendly**: Fully responsive UI.
- ⚙️ **.env Configurable**: Clean environment variable usage for both frontend & backend.

---

## 🌍 How to Run the Project Locally

### 📁 Clone the Repository

```bash
git clone https://github.com/yashvidotdev/weather-dashboard.git
cd weather-dashboard
````



## 🖥️ Frontend Setup

```bash
cd frontend
npm install
```

### 📄 Create `.env` in `frontend/` with:

```env
REACT_APP_OPENWEATHER_API_KEY=your_openweathermap_api_key
```

### ▶️ Start Frontend

```bash
npm start
```

---

## ⚙️ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 📄 Create `.env` in `backend/` with:

```env
OPENWEATHER_API_KEY=your_openweathermap_api_key
```

### ▶️ Start Backend

```bash
uvicorn app.main:app --reload
```

---

## 🚀 Deployment Guide

### ☁️ Deploy on Render (or Railway / Fly.io)

**Step 1**: Push your full project to GitHub.

**Step 2**: For **Backend**:

* Use [Render](https://render.com) or [Railway](https://railway.app)
* Deploy only the `backend/` folder
* Set the environment variable:

  ```
  OPENWEATHER_API_KEY=your_openweathermap_api_key
  ```

**Step 3**: For **Frontend**:

* Use [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/)
* Set environment variable:

  ```
  REACT_APP_OPENWEATHER_API_KEY=your_openweathermap_api_key
  ```
* Set the build command: `npm run build`
* Publish directory: `frontend/build`

---

## 🤝 Contributing

We welcome contributions to improve this project!

### 📌 How to Contribute

1. Fork the repository.
2. Create a new branch:

   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit:

   ```bash
   git commit -m "Add: feature-name"
   ```
4. Push to your branch:

   ```bash
   git push origin feature-name
   ```
5. Open a **Pull Request** with a clear description.

Please create a PR even for small changes (e.g., UI tweaks or minor refactors).

---

## 📩 Contact

For collaboration or queries, reach out via [GitHub Issues](https://github.com/yashvidotdev/weather-dashboard/issues).

---

