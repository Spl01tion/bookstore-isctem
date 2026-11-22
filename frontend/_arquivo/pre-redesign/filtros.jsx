// Em app/filtros.jsx — ecrã ainda por implementar
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FiltrosScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Filtros — em construção</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f8' },
  text: { fontSize: 18, color: '#555' },
});
