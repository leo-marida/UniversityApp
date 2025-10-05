// src/api/universityApi.js
import axios from 'axios';

const API_URL = 'http://universities.hipolabs.com/search';

export const fetchUniversities = async (country = '', page = 1, limit = 20) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        country: country,
        // The API doesn't support pagination, so we simulate it by fetching all and slicing.
        // For a real-world scenario with a large dataset, the API should support pagination.
      },
    });
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return response.data.slice(startIndex, endIndex);
  } catch (error) {
    console.error('Error fetching universities:', error);
    throw error;
  }
};

export const fetchAllCountries = async () => {
    try {
        const response = await axios.get(API_URL);
        const countries = [...new Set(response.data.map(uni => uni.country))].sort();
        return countries;
    } catch (error) {
        console.error('Error fetching countries:', error);
        throw error;
    }
};