// src/screens/FavoritesScreen.js
import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadFavorites, saveFavorites } from '../services/storage';
import UniversityCard from '../components/UniversityCard';
import { COLORS, SIZES } from '../theme/theme';
import Swipeable from 'react-native-gesture-handler/Swipeable';

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchFavorites = async () => {
        const loadedFavorites = await loadFavorites();
        setFavorites(loadedFavorites);
      };
      fetchFavorites();
    }, [])
  );

  const removeFromFavorites = (university) => {
    const updatedFavorites = favorites.filter(fav => fav.name !== university.name);
    setFavorites(updatedFavorites);
    saveFavorites(updatedFavorites);
  };
  
  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [0, 100],
        extrapolate: 'clamp',
    });
    return (
        <View style={styles.deleteButton}>
            <Text style={styles.deleteButtonText} onPress={() => removeFromFavorites(item)}>Delete</Text>
        </View>
    );
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>You have no favorite universities yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
            <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}>
                <UniversityCard
                    university={item}
                    onFavorite={() => removeFromFavorites(item)}
                    isFavorite={true}
                />
            </Swipeable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    marginVertical: SIZES.base,
    borderRadius: SIZES.radius,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  }
});

export default FavoritesScreen;