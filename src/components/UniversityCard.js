// src/components/UniversityCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../theme/theme';

const UniversityCard = ({ university, onFavorite, isFavorite, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{university.name}</Text>
        <Text style={styles.country}>{university.country} {university['state-province'] && `- ${university['state-province']}`}</Text>
      </View>
      <TouchableOpacity onPress={() => onFavorite(university)} style={styles.favoriteButton}>
        <Text style={{ color: isFavorite ? COLORS.primary : COLORS.secondary }}>
          {isFavorite ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginVertical: SIZES.base,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  country: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  favoriteButton: {
    padding: SIZES.base,
  },
});

export default UniversityCard;