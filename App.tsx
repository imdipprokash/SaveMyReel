import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import HomeScreen from './src/pages/HomeScreen/HomeScreen';
import {
  checkAndroidPermission,
  requestStoragePermission,
} from './src/utils/AskPermission';

type Props = {};

const App = (props: Props) => {
  useEffect(() => {
    // requestStoragePermission();
    checkAndroidPermission();
  }, []);
  return (
    <View>
      <HomeScreen />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({});
