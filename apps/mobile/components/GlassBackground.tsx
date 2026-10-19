import React from 'react';
import { StyleSheet, View } from 'react-native';

export function GlassBackground() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Cyan Luminous Cluster (Top-Right) */}
      <View style={styles.cyanCluster}>
        <View style={styles.cyanOuter} />
        <View style={styles.cyanMid} />
        <View style={styles.cyanCore} />
      </View>

      {/* Violet Luminous Cluster (Middle-Left) */}
      <View style={styles.violetCluster}>
        <View style={styles.violetOuter} />
        <View style={styles.violetMid} />
        <View style={styles.violetCore} />
      </View>

      {/* Emerald Accent Cluster (Bottom-Right) */}
      <View style={styles.emeraldCluster}>
        <View style={styles.emeraldOuter} />
        <View style={styles.emeraldMid} />
        <View style={styles.emeraldCore} />
      </View>

      {/* Rose Accent Glow (Top-Left) */}
      <View style={styles.roseCluster}>
        <View style={styles.roseOuter} />
        <View style={styles.roseCore} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cyanCluster: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cyanOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(56, 189, 248, 0.10)',
  },
  cyanMid: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(14, 165, 233, 0.18)',
  },
  cyanCore: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(56, 189, 248, 0.32)',
  },

  violetCluster: {
    position: 'absolute',
    top: 260,
    left: -70,
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  violetOuter: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(139, 92, 246, 0.09)',
  },
  violetMid: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
  },
  violetCore: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(168, 85, 247, 0.30)',
  },

  emeraldCluster: {
    position: 'absolute',
    bottom: 40,
    right: -50,
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emeraldOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  emeraldMid: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(5, 150, 105, 0.16)',
  },
  emeraldCore: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.28)',
  },

  roseCluster: {
    position: 'absolute',
    top: 60,
    left: -40,
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roseOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
  },
  roseCore: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 63, 94, 0.20)',
  },
});
