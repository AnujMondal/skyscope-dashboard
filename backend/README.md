# Weather Dashboard Backend

## Setup

1. Create a virtual environment:

```
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate
```

2. Install requirements:

```
pip install -r requirements.txt
```

3. Add `.env` file with:

```
OPENWEATHER_API_KEY=your_api_key
```


4. Run the server:

```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```


## API Endpoint

- **GET /weather?city=CityName**

Returns JSON with temperature, description, and icon code.