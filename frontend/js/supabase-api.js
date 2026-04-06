<<<<<<< HEAD
// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Generic API Request Helper
=======
// Auto-detect API URL for your deployed app
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://insurance-management-xbn2.onrender.com/api';

console.log('🔗 Using API URL:', API_BASE_URL);

>>>>>>> c097251ff7c8748e7fe323a4fe8dcd32e995df03
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
<<<<<<< HEAD
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
=======
    console.log(`📡 ${method} ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned HTML instead of JSON. Backend may not be running.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
>>>>>>> c097251ff7c8748e7fe323a4fe8dcd32e995df03
    }

    return data.data || data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

<<<<<<< HEAD
// Export for use in other files
=======
>>>>>>> c097251ff7c8748e7fe323a4fe8dcd32e995df03
window.apiRequest = apiRequest;