import RNFS from 'react-native-fs';
import { DOWNLOAD_FOLDER_PATH } from '../../assets/Utils/Utils';

export const ensureDownloadFolderExists = async () => {
  const exists = await RNFS.exists(DOWNLOAD_FOLDER_PATH);
  if (!exists) {
    await RNFS.mkdir(DOWNLOAD_FOLDER_PATH);
  }
};

export const downloadImageToLocalCopy = async (url, fileName) => {
  try {
    await ensureDownloadFolderExists();

    const localPath = `${DOWNLOAD_FOLDER_PATH}/${fileName}`;
    const fileExists = await RNFS.exists(localPath);

    if (fileExists) {
      console.log(`Image already exists at: ${localPath}`);
      return `file://${localPath}`;
    }

    const res = await RNFS.downloadFile({
      fromUrl: url,
      toFile: localPath,
    }).promise;

    if (res.statusCode === 200) {
      console.log(`Image downloaded successfully to: ${localPath}`);
      return `file://${localPath}`;
    } else {
      console.warn(`Image download failed with status: ${res.statusCode} for URL: ${url}`);
      return '';
    }
  } catch (error) {
    console.warn(`Image download failed for URL: ${url}, Error: ${error.message}`);
    return '';
  }
};

export const processSampleGeoTaggingData = async (data) => {
  console.log("marketChecjin=-=-=>1", data);
  const updatedList = await Promise.all(
    data.map(async (item, index) => {
      console.log("checking[[p[>>2", item);
      const fileName = `cropImgs_${item.productLabel}_${item.cropName}.png`;
      const localPath = await downloadImageToLocalCopy(item.imageUrl, fileName);
      console.log("localCheclk=-=--=>3", localPath);
      return {
        ...item,
        imageUrlLocal: localPath,
      };
    })
  );

  console.log("upfatye=-=-=->4", updatedList);
  return {
    updatedList,
  };
};
