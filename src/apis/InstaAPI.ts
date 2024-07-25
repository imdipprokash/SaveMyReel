import axios from 'axios';
import FormData from 'form-data';

//https://igdownloader.app/en/download-instagram-reels

export const getInstReelDownloadLink = async ({url}: any) => {
  const options = {
    method: 'GET',
    url: 'https://instagram-reels-downloader2.p.rapidapi.com/.netlify/functions/api/getLink',
    params: {
      url: url,
    },
    headers: {
      'x-rapidapi-key': '01d5613ffdmshd7ca4b4d3d606a2p184b43jsn35a8afacd250',
      'x-rapidapi-host': 'instagram-reels-downloader2.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};
