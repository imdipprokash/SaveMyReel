import {Alert, PermissionsAndroid, Platform, Button, View} from 'react-native';
import {RESULTS, PermissionStatus} from 'react-native-permissions';
export const requestStoragePermission = async () => {
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
      handlePermissionStatus(false);
      console.log('Permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};

export const checkAndroidPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version < 33) {
    const granted = await PermissionsAndroid.requestMultiple([
      'android.permission.CAMERA',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ]);
    if (
      granted['android.permission.CAMERA'] !== 'granted' ||
      granted['android.permission.WRITE_EXTERNAL_STORAGE'] !== 'granted'
    ) {
      throw new Error('Required permission not granted');
    }
  }
};

const handlePermissionStatus = (status: PermissionStatus | boolean) => {
  switch (status) {
    case RESULTS.GRANTED:
      console.log('Permission granted');
      // Proceed with file download or other functionality
      break;
    case RESULTS.DENIED:
      console.log('Permission denied');
      requestPermissionAgain();
      break;
    case RESULTS.BLOCKED:
    case RESULTS.UNAVAILABLE:
      console.log('Permission blocked or unavailable');

      break;
    default:
      console.log('Unknown permission status');
      requestPermissionAgain();
      break;
  }
};

const requestPermissionAgain = async () => {
  Alert.alert(
    'Permission Required',
    'This app needs access to your storage to download files. Please enable the permission in the settings or allow it when prompted.',
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'OK',
        onPress: async () => {
          try {
            const granted = await PermissionsAndroid.request(
              'android.permission.WRITE_EXTERNAL_STORAGE',
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('Permission granted');
            } else {
              console.log('Permission still denied');
            }
          } catch (err) {
            console.warn(err);
          }
        },
      },
    ],
  );
};
