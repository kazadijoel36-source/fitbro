import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';

export default function HomeScreen() {
  // 1. We tell TypeScript the data might be null at the start
  const [vitals, setVitals] = useState<{current_weight: number, current_water_ml: number, daily_water_goal_ml: number} | null>(null);
  const [loading, setLoading] = useState(true);

  // REPLACE THIS WITH YOUR IPv4 ADDRESS FROM IPCONFIG
 const API_BASE = "http://192.168.0.210:8000";

  const syncData = async () => {
    try {
      const res = await fetch(`${API_BASE}/vitals/1`);
      const data = await res.json();
      setVitals(data);
      setLoading(false);
    } catch (e) { 
        console.log("Sync failed: ", e);
        setLoading(false); 
    }
  };

  useEffect(() => { syncData(); }, []);

  const addWater = async () => {
    await fetch(`${API_BASE}/add-water/1?amount=250`, { method: 'POST' });
    syncData();
  };

  // 2. THE GUARD: If vitals is null, show a loading spinner instead of crashing
  if (loading || !vitals) {
    return (
      <View style={[styles.container, {justifyContent: 'center'}]}>
        <ActivityIndicator size="large" color="#00ff88" />
        <Text style={{color: 'white', textAlign: 'center', marginTop: 10}}>Connecting to FitBro Brain...</Text>
      </View>
    );
  }

  // 3. Now vitals is guaranteed to exist here
  const progress = Math.min(Math.max(((90 - vitals.current_weight) / (90 - 84)) * 100, 0), 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Mission <Text style={{color: '#00ff88'}}>Status</Text></Text>
        
        <View style={styles.card}>
          <Text style={styles.label}>Progress to 84kg</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.subLabel}>{vitals.current_weight}kg / 84kg</Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.label, { color: '#00d2ff' }]}>💧 Hydration</Text>
          <Text style={styles.statValue}>{vitals.current_water_ml} / {vitals.daily_water_goal_ml}ml</Text>
          <TouchableOpacity style={styles.button} onPress={addWater}>
            <Text style={{fontWeight:'bold', color: 'black'}}>+ 250ml</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent: { padding: 20, paddingTop: 40 },
  header: { fontSize: 30, fontWeight: '900', color: 'white', marginBottom: 20 },
  card: { backgroundColor: '#161616', padding: 20, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  label: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  progressBarBg: { height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#00ff88' },
  statValue: { color: 'white', fontSize: 24, fontWeight: 'bold', marginVertical: 10 },
  button: { backgroundColor: '#00d2ff', padding: 12, borderRadius: 10, alignItems: 'center' },
  subLabel: { color: '#666', fontSize: 12, marginTop: 5 }
});