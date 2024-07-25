import {
  Dimensions,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  ToastAndroid,
  Alert,
  Permission,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {getReelDownloadURl, getReelInfo} from '../../apis/FBReelAPI';
import RNFetchBlob from 'rn-fetch-blob';
import axios from 'axios';
import {getVideoInfo} from '../../apis/YoutubeAPI';
import AdsScreen from '../../AdsId/AdsScreen';
import {BANNER_ID1, BANNER_ID2, REWARDED_ID} from '../../AdsId/AdsId';
import {
  RewardedInterstitialAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

type Props = {};
const adUnitId = __DEV__ ? TestIds.REWARDED_INTERSTITIAL : REWARDED_ID;

const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(
  adUnitId,
  {
    keywords: ['fashion', 'clothing'],
  },
);

const requestStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'App needs access to your storage to download files.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Permission granted');
      // Proceed with file download
    } else {
      console.log('Permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};

const HomeScreen = (props: Props) => {
  const intervalIdRef: any = useRef(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [fbReelStatus, setFbReelStatus] = useState({});
  const [fbReelJobId, setFbReelJobId] = useState('');
  const [fbReelInfo, setFbReelInfo] = useState<any>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [instaReelInfo, setInstaReelInfo] = useState<any>(undefined);

  const [youtubeReelInfo, setYoutubeReelInfo] = useState<any>(undefined);

  //
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  const downloadFile = async ({url}: {url: string}) => {
    setIsDownloading(true);
    setDownloadCompleted(false);
    setDownloadProgress(0);
    rewardedInterstitial.show();

    const {config, fs} = RNFetchBlob;
    const downloadPath =
      fs.dirs.DownloadDir +
      `/save_my_reel_video_${Math.random().toString(36).substring(7)}.mp4`;

    try {
      await config({
        fileCache: true,
        appendExt: 'mp4',
        path: downloadPath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: downloadPath,
          description: 'Downloading video...',
        },
      })
        .fetch('GET', url)
        .progress((received, total) => {
          setDownloadProgress(received / total);
        })
        .then(res => {
          console.log('File downloaded to:', res.path());
          setDownloadCompleted(true);
        })
        .catch(error => {
          console.error('Download error:', error);
        })
        .finally(() => {
          setIsDownloading(false);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const GetReelInfoHandler = async () => {
    if (!url) {
      ToastAndroid.show('Enter a reel url', 1000);
      return;
    }
    setLoading(true);
    setFbReelInfo(undefined);
    setInstaReelInfo(undefined);
    setYoutubeReelInfo(undefined);
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      try {
        const result = await getReelInfo({url});
        if (result?.data?.job_id) {
          const reel_video_information = await getReelDownloadURl({
            job_id: result?.data?.job_id,
          });

          if (reel_video_information?.status === 'working') {
            setFbReelJobId(result?.data?.job_id);
            setFbReelStatus('working');
          }
        }
      } catch (error) {
        Alert.prompt('Please try again!');
        return;
      }
    } else if (url.includes('instagram.com')) {
      const options = {
        method: 'GET',
        url: 'https://instagram-downloader.p.rapidapi.com/index',
        params: {
          url: url,
        },
        headers: {
          'x-rapidapi-key':
            '01d5613ffdmshd7ca4b4d3d606a2p184b43jsn35a8afacd250',
          'x-rapidapi-host': 'instagram-downloader.p.rapidapi.com',
        },
      };

      try {
        setLoading(false);
        const response = await axios.request(options);
        setInstaReelInfo(response.data?.result);
      } catch (error) {
        Alert.prompt('Please try again!');
        return;
      }
    } else if (url.includes('youtube.com')) {
      try {
        setLoading(false);
        const response = await getVideoInfo({url});

        setYoutubeReelInfo(response?.data?.data);
      } catch (error) {
        Alert.prompt('Please try again!');
        return;
      }
    } else {
      ToastAndroid.show('Enter a reel url', 1000);
      return;
    }
  };

  const GetFbReelInfo = async () => {
    if (fbReelJobId) {
      try {
        const reel_video_information = await getReelDownloadURl({
          job_id: fbReelJobId,
        });

        console.log('reel_video_information', reel_video_information);
        if (reel_video_information?.status === 'complete') {
          clearInterval(intervalIdRef.current);
          setLoading(false);
          if (reel_video_information?.payload) {
            setFbReelInfo(reel_video_information);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (fbReelStatus === 'working') {
      intervalIdRef.current = setInterval(() => {
        GetFbReelInfo();
      }, 5000);

      return () => clearInterval(intervalIdRef.current);
    }
  }, [fbReelStatus]);

  useEffect(() => {
    if (downloadCompleted) {
      Alert.alert('Download', 'Download complete!!');
    }
  }, [downloadCompleted]);

  useEffect(() => {
    requestStoragePermission();
    const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setLoaded(true);
      },
    );
    const unsubscribeEarned = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('User earned reward of ', reward);
      },
    );

    // Start loading the rewarded interstitial ad straight away
    rewardedInterstitial.load();

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <View
      style={{
        width: Dimensions.get('screen').width,
        height: Dimensions.get('screen').height,
      }}>
      <ImageBackground
        source={require('../../assets/BgImage1.jpeg')}
        style={{
          width: Dimensions.get('screen').width,
          height: Dimensions.get('screen').height,
          position: 'absolute',
        }}
      />
      <StatusBar translucent backgroundColor={'transparent'} />
      <View style={{height: Dimensions.get('screen').height * 0.06}} />
      <Text
        style={{
          color: '#fff',
          fontSize: 35,
          paddingHorizontal: 15,
          fontWeight: '800',
          textAlign: 'center',
        }}>
        ReelSaver
      </Text>
      <ScrollView
        style={{marginBottom: Dimensions.get('screen').height * 0.035}}>
        <View style={{height: Dimensions.get('screen').height * 0.03}} />
        {/* Search Contained */}
        <View style={{gap: 4, alignSelf: 'center', alignItems: 'center'}}>
          <TextInput
            placeholder="https://your_reel_url"
            style={styles?.inputStyle}
            placeholderTextColor={'#666'}
            onChangeText={setUrl}
          />
          <View style={{height: Dimensions.get('screen').height * 0.002}} />
          <AdsScreen ADS_ID={BANNER_ID1} />
          <View style={{height: Dimensions.get('screen').height * 0.002}} />
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f2f2f2',
              paddingHorizontal: 14,
              borderRadius: 8,
              width: Dimensions.get('screen').width * 0.35,
              height: Dimensions.get('screen').height * 0.045,
            }}
            disabled={loading}
            activeOpacity={0.7}
            onPress={GetReelInfoHandler}>
            {loading ? (
              <ActivityIndicator style={{width: 30, height: 30}} />
            ) : (
              <Image
                source={require('../../assets/Search_lcon.png')}
                style={{
                  width: 30,
                  height: 30,
                }}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
          <View style={{height: Dimensions.get('screen').height * 0.002}} />
          <AdsScreen ADS_ID={BANNER_ID2} />
        </View>
        {fbReelInfo?.payload?.map((item: any) => {
          const img = item?.thumbnails[0]?.real;
          const video_path = item?.path;
          return (
            <View
              key={img}
              style={{
                marginTop: 20,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
              }}>
              <Image
                source={{uri: img}}
                style={{
                  width: Dimensions.get('screen').width * 0.8,
                  height: Dimensions.get('screen').height * 0.4,
                  borderRadius: 10,
                }}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={{
                  marginTop: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'skyblue',
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  height: Dimensions.get('screen').height * 0.056,
                  flexDirection: 'row',
                }}
                disabled={isDownloading}
                activeOpacity={0.7}
                onPress={() => downloadFile({url: video_path})}>
                <Image
                  source={require('../../assets/Download.png')}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                  }}
                  resizeMode="cover"
                />
                <Text
                  style={{
                    color: '#333',
                    fontSize: 25,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                  Download
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {instaReelInfo && (
          <View
            key={'87234'}
            style={{
              marginTop: 20,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
            }}>
            <Image
              source={{uri: instaReelInfo?.image_url}}
              style={{
                width: Dimensions.get('screen').width * 0.8,
                height: Dimensions.get('screen').height * 0.4,
                borderRadius: 10,
              }}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={{
                marginTop: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'skyblue',
                paddingHorizontal: 14,
                borderRadius: 8,
                height: Dimensions.get('screen').height * 0.056,
                flexDirection: 'row',
              }}
              disabled={isDownloading}
              activeOpacity={0.7}
              onPress={() => downloadFile({url: instaReelInfo?.video_url})}>
              <Image
                source={require('../../assets/Download.png')}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                }}
                resizeMode="cover"
              />
              <Text
                style={{
                  color: '#333',
                  fontSize: 25,
                  fontWeight: '600',
                  textAlign: 'center',
                }}>
                Download
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {youtubeReelInfo && (
          <View
            key={'87234'}
            style={{
              marginTop: 20,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
            }}>
            <Image
              source={{uri: youtubeReelInfo?.thumbnail}}
              style={{
                width: Dimensions.get('screen').width * 0.8,
                height: Dimensions.get('screen').height * 0.4,
                borderRadius: 10,
              }}
              resizeMode="cover"
            />
            {youtubeReelInfo?.video_formats?.map((item: any, index: number) => {
              if (item?.url) {
                return (
                  <TouchableOpacity
                    key={index}
                    style={{
                      marginTop: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'skyblue',
                      paddingHorizontal: 14,
                      borderRadius: 8,
                      height: Dimensions.get('screen').height * 0.056,
                      flexDirection: 'row',
                    }}
                    disabled={isDownloading}
                    activeOpacity={0.7}
                    onPress={() => downloadFile({url: item?.url})}>
                    <Image
                      source={require('../../assets/Download.png')}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                      }}
                      resizeMode="cover"
                    />
                    <Text
                      style={{
                        color: '#333',
                        fontSize: 25,
                        fontWeight: '600',
                        textAlign: 'center',
                      }}>
                      Download {item?.quality}
                    </Text>
                  </TouchableOpacity>
                );
              }
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  inputStyle: {
    width: Dimensions.get('screen').width * 0.9,
    borderRadius: 8,
    borderColor: '#fff',
    height: Dimensions.get('screen').height * 0.05,
    color: '#000',
    backgroundColor: '#fff',
    fontSize: 20,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  btnStyle: {
    width: Dimensions.get('screen').width * 0.5,
    borderRadius: 10,
    borderColor: '#fff',
    backgroundColor: 'skyblue',
    height: Dimensions.get('screen').height * 0.055,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    marginTop: 20,
    alignSelf: 'center',
  },
});
