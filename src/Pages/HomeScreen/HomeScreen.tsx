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
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {getReelDownloadURl, getReelInfo} from '../../apis/FBReelAPI';
import RNFetchBlob from 'rn-fetch-blob';
import * as Progress from 'react-native-progress';
import {getInstReelDownloadLink} from '../../apis/InstaAPI';

type Props = {};

const HomeScreen = (props: Props) => {
  const intervalIdRef: any = useRef(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [fbReelStatus, setFbReelStatus] = useState({});
  const [fbReelJobId, setFbReelJobId] = useState('');
  const [fbReelInfo, setFbReelInfo] = useState<any>(undefined);

  //
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadCompleted, setDownloadCompleted] = useState(false);

  const downloadFile = ({url}: {url: string}) => {
    setIsDownloading(true);
    setDownloadCompleted(false);
    setDownloadProgress(0);

    const {config, fs} = RNFetchBlob;
    const toDate = new Date();
    const downloadPath = fs.dirs.DownloadDir + `/save_my_reel_video.mp4`;
    try {
      config({
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
    } catch (error) {}
  };

  const GetReelInfoHandler = async () => {
    if (!url) {
      ToastAndroid.show('Enter a reel url', 1000);
      return;
    }
    // setLoading(true);
    setFbReelInfo(undefined);
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      try {
        const result = await getReelInfo({url});
        if (result?.data?.job_id) {
          const reel_video_information = await getReelDownloadURl({
            job_id: result?.data?.job_id,
          });

          console.log('reel_video_information', reel_video_information);

          if (reel_video_information?.status === 'working') {
            setFbReelJobId(result?.data?.job_id);
            setFbReelStatus('working');
          }
        }
      } catch (error) {
        ToastAndroid.show('Server not working', 1000);
        return;
      }
    } else if (url.includes('instagram.com')) {
      console.log('Hlw');
      try {
        const result = await getInstReelDownloadLink({url});
        console.log(result);
      } catch (error) {
        console.log(error);
        ToastAndroid.show('Server not working', 1000);
        return;
      }
    } else if (url.includes('youtube.com')) {
      console.log('YouTube');
    } else {
      ToastAndroid.show('Enter a reel url', 1000);
      return;
    }
  };
  const GetInstaReelHandler = async () => {};

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
      <View style={{height: Dimensions.get('screen').height * 0.08}} />
      <Text
        style={{
          color: '#f0fdf4',
          fontSize: 35,
          paddingHorizontal: 15,
          fontWeight: '800',
          textAlign: 'center',
        }}>
        {/* Save My Reel */}
      </Text>
      <ScrollView automaticallyAdjustContentInsets={true}>
        <View style={{height: Dimensions.get('screen').height * 0.03}} />
        {/* Search Contained */}
        <View style={{flexDirection: 'row', gap: 4, alignSelf: 'center'}}>
          <TextInput
            placeholder="https://your_reel_url"
            style={styles?.inputStyle}
            placeholderTextColor={'#666'}
            onChangeText={setUrl}
          />
          <View style={{height: Dimensions.get('screen').height * 0.01}} />
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f2f2f2',
              paddingHorizontal: 14,
              borderRadius: 8,
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
        </View>
        {fbReelInfo?.payload?.map((item: any) => {
          const img = item?.thumbnails[0]?.real;
          const video_path = item?.path;
          console.log(img);
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

        {isDownloading && (
          <Progress.Bar
            progress={downloadProgress}
            width={Dimensions.get('screen').width * 0.8}
            style={styles.progressBar}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  inputStyle: {
    width: Dimensions.get('screen').width * 0.8,
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
