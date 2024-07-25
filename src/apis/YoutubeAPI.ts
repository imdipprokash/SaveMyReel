import axios from 'axios';
type get_infoPros = {
  url: string;
};
export const getVideoInfo = async ({url}: get_infoPros) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://cdn36.savetube.me/info?url=${url}`,
    headers: {},
  };

  const response = axios.request(config).then(response => {
    return response;
  });

  return response;
};

export const getDownloadLink = async ({vide_type, key}: any) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://cdn35.savetube.me/download/video/${vide_type}/${key}`,
    headers: {},
  };

  const response = axios.request(config).then(response => {
    return response;
  });

  return response;
};
