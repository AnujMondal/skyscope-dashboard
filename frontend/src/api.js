import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const getWeather = async (city) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/weather`, {
      params: { city },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error.response?.data || new Error('Server error');
  }
};
