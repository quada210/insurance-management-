// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Generic API Request Helper
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

// Export for use in other files
window.apiRequest = apiRequest;