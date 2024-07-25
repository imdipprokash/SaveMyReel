import {
  Dimensions,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';

type Props = {};

const HomeScreen = (props: Props) => {
  return (
    <View
      style={{
        backgroundColor: '#f2f2f2',
        width: Dimensions.get('screen').width,
        height: Dimensions.get('screen').height,
      }}>
      <StatusBar translucent backgroundColor={'transparent'} />
      <ImageBackground
        source={require('../../assets/BgImage.jpg')}
        style={{
          width: Dimensions.get('screen').width,
          height: Dimensions.get('screen').height,
          position: 'absolute',
        }}
      />
      <Text style={{color: 'red', fontSize: 20, paddingHorizontal: 15}}>
        HomeScreen
      </Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
