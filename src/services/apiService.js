// API service for handling API requests
import { API_URL } from '../config';

/**
 * Make a GET request to the API
 * @param {string} endpoint - API endpoint
 * @param {object} queryParams - URL query parameters
 * @returns {Promise} - Promise with response data
 */
export const get = async (endpoint, queryParams = {}) => {
  try {
    // Build query string
    const queryString = Object.keys(queryParams).length > 0 
      ? `?${new URLSearchParams(queryParams).toString()}` 
      : '';
    
    // Make the request
    const response = await fetch(`${API_URL}${endpoint}${queryString}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API GET error:', error);
    throw error;
  }
};

/**
 * Make a POST request to the API
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @returns {Promise} - Promise with response data
 */
export const post = async (endpoint, data = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API POST error:', error);
    throw error;
  }
};

/**
 * Make a PUT request to the API
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @returns {Promise} - Promise with response data
 */
export const put = async (endpoint, data = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API PUT error:', error);
    throw error;
  }
};

/**
 * Make a DELETE request to the API
 * @param {string} endpoint - API endpoint
 * @param {object} queryParams - URL query parameters
 * @returns {Promise} - Promise with response data
 */
export const del = async (endpoint, queryParams = {}) => {
  try {
    // Build query string
    const queryString = Object.keys(queryParams).length > 0 
      ? `?${new URLSearchParams(queryParams).toString()}` 
      : '';
    
    const response = await fetch(`${API_URL}${endpoint}${queryString}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API DELETE error:', error);
    throw error;
  }
};

export default {
  get,
  post,
  put,
  del
};