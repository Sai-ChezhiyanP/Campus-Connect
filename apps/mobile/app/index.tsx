import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, router } from 'expo-router';
import { mobileStore } from '../services/store';

export default function IndexScreen() {
  const [ready, setReady] = React.useState(false);
  const [isAuth, setIsAuth] = React.useState(mobileStore.isLoggedIn);

  useEffect(() => {
    let timer: any = null;
    const unsub = mobileStore.subscribe(() => {
      setIsAuth(mobileStore.isLoggedIn);
      if (mobileStore.isInitialized) {
        setReady(true);
      }
    });

    if (mobileStore.isInitialized) {
      setReady(true);
    } else {
      timer = setTimeout(() => setReady(true), 200);
    }

    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  if (isAuth) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#070B14',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
