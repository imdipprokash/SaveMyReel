import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import HomeScreen from './src/Pages/HomeScreen/HomeScreen';

type Props = {};

const App = (props: Props) => {
  return (
    <View>
      <HomeScreen />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({});
