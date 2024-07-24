import axios from 'axios';
//https://www.facebook.com/reel/3779502245672060
// publer.io
export const getReelInfo = async ({url}: {url: string}) => {
  let data = JSON.stringify({
    url: url,
    iphone: true,
  });

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://app.publer.io/hooks/media',
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Origin: 'https://publer.io',
      Referer: 'https://publer.io/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    },
    data: data,
  };

  const response = await axios.request(config).then(response => {
    return response;
  });

  return response;
};

export const getReelDownloadURl = async ({job_id}: {job_id: string}) => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://app.publer.io/api/v1/job_status/${job_id}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Origin: 'https://publer.io',
      Referer: 'https://publer.io/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    },
  };

  const response = axios.request(config).then(response => {
    return response;
  });

  return response;
};
