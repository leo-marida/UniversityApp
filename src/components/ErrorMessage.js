// src/components/ErrorMessage.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../theme/theme';

const ErrorMessage = ({ message }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  text: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ErrorMessage;