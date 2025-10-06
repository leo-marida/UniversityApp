// src/screens/BrowseScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Modal, Button, TextInput } from 'react-native';
import { WebView } from 'react-native-webview';
import RNPickerSelect from 'react-native-picker-select';
import { fetchUniversities, fetchAllCountries } from '../api/universityApi';
import { saveFavorites, loadFavorites, saveFilters, loadFilters } from '../services/storage';
import UniversityCard from '../components/UniversityCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import { COLORS, SIZES } from '../theme/theme';
import { initDB } from '../services/database';
const BrowseScreen = () => {
  const [universities, setUniversities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load initial data
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await initDB(); // Initialize the database first
        
        const savedFilters = await loadFilters();
        setSelectedCountry(savedFilters.country || '');
        
        const loadedFavorites = await loadFavorites();
        setFavorites(loadedFavorites);
  
        await loadCountries();
        await loadUniversities(1, savedFilters.country || '');
      } catch (e) {
        setError('Failed to initialize and load data.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const loadCountries = async () => {
    try {
        const countryData = await fetchAllCountries();
        setCountries(countryData.map(c => ({ label: c, value: c })));
    } catch (e) {
        setError('Failed to load countries.');
    }
  };

  const loadUniversities = useCallback(async (pageNum, country) => {
    setLoading(true);
    setError(null);
    try {
      const newUniversities = await fetchUniversities(country, pageNum);
      setUniversities(prev => pageNum === 1 ? newUniversities : [...prev, ...newUniversities]);
    } catch (e) {
      setError('Failed to fetch universities. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setPage(1);
    loadUniversities(1, country);
    saveFilters({ country });
  };
  
  const handleLoadMore = () => {
    const newPage = page + 1;
    setPage(newPage);
    loadUniversities(newPage, selectedCountry);
  };

  const toggleFavorite = (university) => {
    const isFavorited = favorites.some(fav => fav.name === university.name);
    let updatedFavorites;
    if (isFavorited) {
      updatedFavorites = favorites.filter(fav => fav.name !== university.name);
    } else {
      updatedFavorites = [...favorites, university];
    }
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
  };

  const handlePressUniversity = (university) => {
    setSelectedUniversity(university);
    setModalVisible(true);
  };
  
  const filteredUniversities = universities.filter(uni => 
    uni.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a university..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <RNPickerSelect
        onValueChange={handleCountryChange}
        items={countries}
        value={selectedCountry}
        style={pickerSelectStyles}
        placeholder={{ label: "Select a country", value: null }}
      />
      {loading && universities.length === 0 ? <LoadingIndicator /> : null}
      {error ? <ErrorMessage message={error} /> : null}
      <FlatList
        data={filteredUniversities}
        keyExtractor={(item, index) => item.name + index}
        renderItem={({ item }) => (
          <UniversityCard
            university={item}
            onFavorite={toggleFavorite}
            isFavorite={favorites.some(fav => fav.name === item.name)}
            onPress={() => handlePressUniversity(item)}
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && universities.length > 0 ? <LoadingIndicator /> : null}
      />
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedUniversity && (
          <>
            <WebView source={{ uri: selectedUniversity.web_pages[0] }} />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: SIZES.padding,
      backgroundColor: COLORS.background,
    },
    searchBar: {
      backgroundColor: COLORS.white,
      padding: SIZES.base * 1.5,
      borderRadius: SIZES.radius,
      marginBottom: SIZES.padding,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: COLORS.lightGray,
      borderRadius: SIZES.radius,
      color: COLORS.text,
      paddingRight: 30,
      backgroundColor: COLORS.white,
      marginBottom: SIZES.padding,
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 0.5,
      borderColor: COLORS.lightGray,
      borderRadius: SIZES.radius,
      color: COLORS.text,
      paddingRight: 30,
      backgroundColor: COLORS.white,
      marginBottom: SIZES.padding,
    },
});

export default BrowseScreen;