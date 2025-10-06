// src/api/universityApi.js
import { getUniversities, getCountries } from '../services/database';

export const fetchUniversities = async (country = '', page = 1, limit = 20) => {
  return getUniversities(country, page, limit);
};

export const fetchAllCountries = async () => {
  return getCountries();
};