// src/services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveFavorites = async (favorites) => {
  try {
    const jsonValue = JSON.stringify(favorites);
    await AsyncStorage.setItem('@favorites', jsonValue);
  } catch (e) {
    console.error('Error saving favorites:', e);
  }
};

export const loadFavorites = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@favorites');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error loading favorites:', e);
    return [];
  }
};

export const saveFilters = async (filters) => {
    try {
      const jsonValue = JSON.stringify(filters);
      await AsyncStorage.setItem('@filters', jsonValue);
    } catch (e) {
      console.error('Error saving filters:', e);
    }
};

export const loadFilters = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@filters');
      return jsonValue != null ? JSON.parse(jsonValue) : { country: '' };
    } catch (e) {
      console.error('Error loading filters:', e);
      return { country: '' };
    }
};