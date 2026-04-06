// Change this line to use environment-based URL
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'   // Development
  : 'https://your-backend-name.onrender.com/api';  // Production (update later)

async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data.data || data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

window.apiRequest = apiRequest;