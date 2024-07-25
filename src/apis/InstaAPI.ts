import axios from 'axios';

//https://igdownloader.app/en/download-instagram-reels

export const getInstReelDownloadLink = ({url}: any) => {
  const FormData = require('form-data');
  let data = new FormData();
  data.append('recaptchaToken', '');
  data.append('q', url);
  data.append('t', 'media');
  data.append('lang', 'en');

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://v3.igdownloader.app/api/ajaxSearch',
    headers: {
      // ...data.getHeaders(),
    },
    data: data,
  };

  const response = axios.request(config).then(response => {
    console.log(response);
    return response;
  });

  return response;
};
