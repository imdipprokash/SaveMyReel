import {StyleSheet} from 'react-native';
import {GAMBannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import React from 'react';

type Props = {
  ADS_ID: string;
};

const AdsScreen = ({ADS_ID}: Props) => {
  return (
    <GAMBannerAd
      unitId={ADS_ID}
      sizes={[BannerAdSize.FULL_BANNER]}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
      onAdLoaded={() => {
        console.log('Ad loaded');
      }}
      onAdFailedToLoad={error => {
        console.error('Ad failed to load: ', error);
      }}
    />
  );
};

export default AdsScreen;

const styles = StyleSheet.create({});
