import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { PermissionsAndroid, Alert } from 'react-native';
// import IntentLauncher from 'react-native-intent-launcher';
import RNFS from 'react-native-fs';
import RNFetchBlob from "react-native-blob-util";
import { translate } from "../../Localization/Localisation";
import moment from "moment";

export const CASH_FREE_TRANSACTION_LIST = "CASH_FREE_TRANSACTION";

export const GETSTARTED = "GETSTARTED";
export const FCM_TOKEN = "FCM_TOKEN";
export const MOBILE_NUMBER = "MOBILE_NUMBER";
export const COMPANY_STYLES = "COMPANY_STYLES";
export const USER_DETAILS = "USER_DETAILS"
export const USER_ID = "USER_ID";
export const USER_NAME = "USER_NAME";
export const LANGUAGE_ID = "1";
export const COUNTRY_ID = "5";
export const LANGUAGE_CODE = "en";
export const DEVICE_TOKEN = 'deviceToken';
export const YES = 'Yes';
export const NO = 'No';
export const OK = 'Ok';
export const NOTOK = 'Not Ok';
export const LOGINONCE = "LOGINONCE";
export const USERMENU = "USERMENU";
export const PROFILEIMAGE = "PROFILEIMAGE";
export const FAQDATA = "FAQDATA";
export const ROLENAME = "ROLENAME";
export const SELECTEDCOMPANY = "SELECTEDCOMPANY";
export const ROLEID = "ROLEID";

export const Partially_Accepted = 'Partially Accepted';
export const ASSIGNED = 'Assigned';
export const APPROVED = 'Approved';
export const INPROGRESS = 'InProgress';
export const COMPLETED = 'Completed';
export const REJECTED = 'Rejected';
export const EDITDATA = 'EditData'
export const TERMS_CONDITIONS = 'termsConditionsAccepted'
export const WHATSAPPCHECKED = 'WhatsappChecked'
export const LOADER_GIF = "LOADER_GIF";
export const USERMENUCONTROL = "USERMENUCONTROL"
export const FIELDACTIVITYQR = "FIELDACTIVITYQR"

export const DOWNLOAD_FOLDER_NAME = 'GeoTaggingDownloads';
export const DOWNLOAD_FOLDER_PATH = `${RNFS.CachesDirectoryPath}/${DOWNLOAD_FOLDER_NAME}`;


export async function getSystemVersion() {
    let deviceId = DeviceInfo.getSystemVersion()
    return deviceId;
}

export async function getAppVersion() {
    let version = DeviceInfo.getVersion();
    console.log("APPVERSION", version);
    return version;
}
export async function getBuildNumber() {
    let number = DeviceInfo.getBuildNumber();
    return number;
}

export async function getPlatformNumber() {
    let number = DeviceInfo.getBuildNumber();
    return number;
}
export async function getAppName() {
    let appName = DeviceInfo.getApplicationName();
    return appName;
}
export async function getAppVersionCode() {
    return DeviceInfo.getBuildNumber();
}

export async function getDeviceId() {
    let deviceId = await DeviceInfo.getUniqueId()
    return deviceId;
}
export async function getDeviceName() {
    let deviceId = await DeviceInfo.getDeviceName()
    return deviceId;
}

export async function getScale() {
    let deviceId = await DeviceInfo.getFontScale()
    return deviceId;
}
export async function filterArrayOfObjects(array, field, code) {
    return array.filter(data => data[field] !== undefined && data[field] == code);
}

export async function removeItemFromArray(array, field, code) {
    return array.filter(item => item[field] !== code);
}

// export async function filterObjects(array, field, code) {
//     console.warn("crop filterting herer", array.length + "--" + field + "--" + code)
//     return array.filter(data => data[field] == code);
// }
// export async function filterArrayOfObjects2(array, field1, code1, field2, code2) {
//     console.warn("crop filterting herer", array + "--" + field1 + "--" + code1 + "--" + field2 + "--" + code2)
//     return array.filter(data => (data[field1] == code1) && (data[field2] == code2));
// }
// export async function filterArrayOfObjects3(array, field1, code1, field2, code2, field3, code3) {
//     console.warn("crop filterting herer", array + "--" + field1 + "--" + code1 + "--" + field2 + "--" + code2 + "--" + field3 + "--" + code3)
//     return array.filter(data => (data[field1] == code1) && (data[field2] == code2) && (data[field3] == code3));
// }

export async function filterObjects(array, field, code) {
    console.warn("Filtering objects here:", array.length + "--" + field + "--" + code);

    // Filter the array based on the provided field and code
    let filteredArray = array.filter(data => data[field] == code);

    // Check if the first object should be added
    if (filteredArray != null && filteredArray.length > 1 && (code == 0 || array[0].name == "All")) {
        filteredArray.unshift(array[0]);
    }

    return filteredArray;
}
export async function filterArrayOfObjects2(array, field1, code1, field2, code2) {
    console.warn("crop filterting herer", array + "--" + field1 + "--" + code1 + "--" + field2 + "--" + code2)
    let filteredArray = array.filter(data => (data[field1] == code1) && (data[field2] == code2));
    // Check if the first object should be added
    if (filteredArray != null && filteredArray.length > 1 && array[0].name == "All") {
        filteredArray.unshift(array[0]);
    }
    return filteredArray;
}
export async function filterArrayOfObjects3(array, field1, code1, field2, code2, field3, code3) {
    console.warn("crop filterting herer", array + "--" + field1 + "--" + code1 + "--" + field2 + "--" + code2 + "--" + field3 + "--" + code3)

    let filteredArray = array.filter(data => (data[field1] == code1) && (data[field2] == code2) && (data[field3] == code3));
    if (filteredArray != null && filteredArray.length > 1 && array[0].name == "All") {
        filteredArray.unshift(array[0]);
    }
    return filteredArray;
}
export const getUniqueItems = (array, propertyName) => {
    const uniqueItemsMap = new Map();
    array.forEach(item => uniqueItemsMap.set(item[propertyName], item));
    return Array.from(uniqueItemsMap.values());
};

export async function getNotchHeight() {
    let deviceId = DeviceInfo.hasNotch()
    if (deviceId) {
        if (Platform.OS === 'ios') {
            // For iOS devices with a notch
            const { height, windowPhysicalPixels } = Dimensions.get('screen');
            console.log(windowPhysicalPixels + " check window")
            const windowHeight = height;
            const windowPhysicalHeight = windowPhysicalPixels.height;

            // Calculate the notch height
            const notchHeight = windowPhysicalHeight - windowHeight;

            return notchHeight;
        } else if (Platform.OS === 'android') {
            // For Android devices with a notch (Not all Android devices have notches)
            // You may need to use a library or check the device model to determine if it has a notch
            // and its dimensions.
            // On Android, you might need to use a third-party library or native modules to detect the notch.

            // Placeholder for Android notch height calculation
            // You may need to implement this part based on your requirements.
            return 0; // Replace with actual notch height calculation logic
        } else {
            // For devices without a notch or other platforms
            return 0;
        }
    }

}

export async function storeData(key, value) {
    var isStored = false;
    try {
        AsyncStorage.setItem(key, JSON.stringify(value));
        isStored = true;
        return isStored;
    } catch (error) {
        return isStored;
    }
}

export async function retrieveData(key) {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
        // We have data!!
        return JSON.parse(value);
    }
    else
        return "";
}

export async function clearAsyncStorage() {
    console.log("clearAsyncStorage");

    RNFetchBlob.fs.unlink(RNFetchBlob.fs.dirs.CacheDir + '/vm_loader.gif');
    storeData(LOGINONCE, false);
    try {
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared successfully.');
        return true;
    } catch (error) {
        console.error('Failed to clear AsyncStorage:', error);
        return false;
    }
}

export const getGreetingMessage = () => {
    const currentHour = new Date().getHours();
    const is24HourFormat = true;
    let greetingMessage = '';
    if (is24HourFormat) {
        if (currentHour >= 5 && currentHour < 12) {
            greetingMessage = 'Good morning';
        } else if (currentHour >= 12 && currentHour < 18) {
            greetingMessage = 'Good afternoon';
        } else {
            greetingMessage = 'Good evening';
        }
    } else {
        const amPm = currentHour >= 12 ? 'PM' : 'AM';
        const formattedHour = currentHour % 12 || 12;
        if (currentHour >= 5 && currentHour < 12) {
            greetingMessage = `Good morning`;
        } else if (currentHour >= 12 && currentHour < 18) {
            greetingMessage = `Good afternoon`;
        } else {
            greetingMessage = `Good evening`;
        }
    }
    return greetingMessage;
};

export const requestMultiplePermissions = async (permissions) => {
    let settingsOpened = false;

    try {
        const grantedPermissions = {};

        for (const permission of permissions) {
            let result;
            if (Platform.OS === 'android') {
                result = await PermissionsAndroid.request(permission);
            } else if (Platform.OS === 'ios') {
                console.log('iOS platform detected. Handling permission request for iOS.');
                result = 'granted'; // Adjust this logic for iOS
            } else {
                console.warn(`Unsupported platform: ${Platform.OS}`);
                result = PermissionsAndroid.RESULTS.DENIED;
            }

            grantedPermissions[permission] = result;

            if (result === PermissionsAndroid.RESULTS.GRANTED || result === 'granted') {
                console.log(`Permission ${permission} granted`);
            } else {
                console.log(`Permission ${permission} denied`);

                if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN && !settingsOpened) {
                    console.log(`Permission ${permission} denied with Never Ask Again.`);
                    settingsOpened = true;

                    let permissionName = '';
                    switch (permission) {
                        case PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE:
                            permissionName = 'Read External Storage';
                            break;
                        case PermissionsAndroid.PERMISSIONS.CAMERA:
                            permissionName = 'Camera';
                            break;
                        default:
                            permissionName = 'required permission';
                    }

                    Alert.alert(
                        translate("permission_required"),
                        `${translate("appNeedAcces")} ${permissionName}${translate("pleaseGoToSettings")}`,
                        [
                            { text: translate("cancel"), style: 'cancel' },
                            { text: translate("open_settings"), onPress: () => openAppSettings() },
                        ]
                    );
                }

            }
        }

        return grantedPermissions;
    } catch (err) {
        console.error(err);
        return {};
    }
};


const openAppSettings = () => {

    if (Platform.OS == 'android') {
        const pkg = DeviceInfo.getBundleId()
        // IntentLauncher.startActivity({
        //     action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
        //     data: 'package:' + pkg
        // })
    } else {
        Linking.openURL('app-settings:')
    }
}
export function isNullOrEmpty(value) {
    if (value == null || value == undefined || (typeof value == 'string' && value.trim() == '') || (Array.isArray(value) && value.length === 0)) {
        return false
    }
    else {
        return true
    }
}

export const readFileToBase64 = async (filePath) => {
    try {
        const fileContent = await RNFS.readFile(filePath, 'base64');

        // console.log("BASE64Content", fileContent);
        return fileContent;
    } catch (error) {
        console.log('Error converting file to Base64:', error);
        return null;
    }
};

export const removeTags = (content) => {
    return content.replace(/<(?!b\s*\/?)[^>]+>/g, '');
};

export const extractPlainText = (html) => {
    const element = document.createElement('div');
    element.innerHTML = html;
    return element.textContent || element.innerText || '';
};

export function isHTML(str) {
    return /<[a-z][\s\S]*>/i.test(str);
}

export function capitalizeFirstLetter(inputString) {
    if (!inputString) {
        return inputString;
    }

    const capitalizedString = inputString.charAt(0).toUpperCase() + inputString.slice(1);
    return capitalizedString;
}

export function sortObjectsAlphabetically(objects, key) {
    objects.sort((a, b) => {
        const valueA = a[key];
        const valueB = b[key];

        const valueALower = valueA.toLowerCase();
        const valueBLower = valueB.toLowerCase();

        return valueALower.localeCompare(valueBLower);
    });

    // Return the sorted array
    return objects;
}

export const isValidImageUrl = async (url) => {
    // Check if URL starts with HTTP or HTTPS
    if (!/^https?:\/\/.+\..+/i.test(url)) {
        return false;
    }

    // Check if the URL has a valid image extension
    const validExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
    const urlParts = url.split(".");
    const extension = urlParts[urlParts.length - 1].toLowerCase();

    if (!validExtensions.includes(extension)) {
        return false;
    }

    // Check if the image exists by making a HEAD request
    try {
        const response = await fetch(url, { method: "HEAD" });
        const contentType = response.headers.get("Content-Type");

        // Validate if response is an image
        return response.ok && contentType && contentType.startsWith("image/");
    } catch (error) {
        return false; // If request fails, URL is not valid
    }
};

export const getFormattedDateTime = async () => {
    const now = new Date();

    const pad = (n) => n.toString().padStart(2, '0');

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1); // Months are zero-indexed
    const year = now.getFullYear();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${day}${month}${year}${hours}${minutes}${seconds}`;
};


export const createHelpDeskFormData = async (record) => {
    const { imageURI, ...jsonData } = record;

    // If scanCouponLabel is a Realm result or non-plain object, clean it
    if (Array.isArray(jsonData.scanCouponLabel)) {
        jsonData.scanCouponLabel = jsonData.scanCouponLabel.map(item => ({
            couponName: item?.couponName?.toString?.() || ''
        }));
    }

    const formData = new FormData();
    formData.append("jsonData", JSON.stringify(jsonData));

    if (imageURI && imageURI.startsWith("file://")) {
        const imageName = imageURI.split("/").pop();
        formData.append("complaintImage", {
            uri: imageURI,
            name: imageName,
            type: "image/jpeg",
        });
    } else {
        // If backend allows empty string for image, keep this
        formData.append("complaintImage", "");
    }

    // Debugging
    console.log("== FormData to Submit ==");
    for (const [key, value] of formData._parts) {
        console.log(`${key}:`, value);
    }

    return formData;
};


// export const createHelpDeskFormData = async (record) => {
//     const { imageURI, ...jsonData } = record;

//     const allowedKeys = [
//         "id",
//         "userId",
//         "categoryId",
//         "subCategoryId",
//         "categoryName",
//         "subcategoryName",
//         "status",
//         "remarks",
//         "scanCouponLabel"
//     ];

//     const filteredJsonData = {};
//     allowedKeys.forEach(key => {
//         if (jsonData[key] !== undefined) {
//             if (key === "scanCouponLabel" && Array.isArray(jsonData[key])) {
//                 filteredJsonData[key] = jsonData[key].map(item => ({
//                     couponName: item.couponName + ''
//                 }));
//             } else {
//                 filteredJsonData[key] = jsonData[key];
//             }
//         }
//     });

//     const formData = new FormData();
//     formData.append("jsonData", JSON.stringify(filteredJsonData));

//     if (imageURI && imageURI.startsWith("file://")) {
//         const imageName = imageURI.split("/").pop();
//         formData.append("complaintImage", {
//             uri: imageURI,
//             name: imageName,
//             type: "image/jpeg",
//         });
//     } else {
//         formData.append("complaintImage", "");
//     }

//     // DEBUG LOG
//     console.log("== FormData to Submit ==");
//     for (const [key, value] of formData._parts) {
//         console.log(`${key}:`, value);
//     }

//     return formData;
// };

// mergeComplaintData.js


function getRelativeTime(mobileDateTimeStr) {
    if (!mobileDateTimeStr || mobileDateTimeStr.length !== 14) return 'Just now';

    const day = parseInt(mobileDateTimeStr.slice(0, 2));
    const month = parseInt(mobileDateTimeStr.slice(2, 4)) - 1;
    const year = parseInt(mobileDateTimeStr.slice(4, 8));
    const hour = parseInt(mobileDateTimeStr.slice(8, 10));
    const minute = parseInt(mobileDateTimeStr.slice(10, 12));
    const second = parseInt(mobileDateTimeStr.slice(12, 14));

    const submittedDate = new Date(year, month, day, hour, minute, second);
    const now = new Date();

    const diffMs = now - submittedDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function isLocalFilePath(path) {
    return (
        typeof path === 'string' &&
        (path.startsWith('file://') || path.startsWith('content://') || path.includes('/'))
    );
}

export const downloadFileToLocal = async (url, fileName) => {
    const { fs, config } = RNFetchBlob;
    const dirs = fs.dirs;
    const path = `${dirs.CacheDir}/${fileName}`;

    try {
        const fileExists = await fs.exists(path);

        if (fileExists) {
            console.log('File already exists. Skipping download.');
            return path;
        }

        console.log(`Downloading: ${fileName}`);
        const response = await config({
            fileCache: true,
            path: path,
        }).fetch('GET', url);

        console.log('Downloaded to:', response.path());
        return response.path();
    } catch (error) {
        console.warn('Error downloading file:', error);
        return null;
    }
};

export const processComplaintImages = async (jsonData) => {
    const complaintList = jsonData.complaintList;
    const imageCacheMap = {}; // { imageUrl: localPath }

    const processImage = async (url) => {
        if (!url) return null;
        if (imageCacheMap[url]) return imageCacheMap[url];

        const fileName = url.substring(url.lastIndexOf('/') + 1);
        const localPath = await downloadFileToLocal(url, fileName);

        if (localPath) {
            imageCacheMap[url] = localPath;
        }

        return localPath;
    };

    for (const complaint of complaintList) {
        complaint.complaintImageLocal = await processImage(complaint.complaintImage);

        if (Array.isArray(complaint.relatedDuplicates)) {
            for (const dup of complaint.relatedDuplicates) {
                dup.complaintImageLocal = await processImage(dup.complaintImage);
            }
        }
    }

    return {
        ...jsonData,
        complaintList,
    };
};

function formatDateToServerStyle(date) {
    const pad = (n) => (n < 10 ? '0' + n : n);
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}.${ms}`;
}

export async function mergeComplaintData(existingData = [], newDataArray = []) {
    const userName = await retrieveData(USER_NAME);
    const couponSubcategories = ['Damaged Coupons', 'Invalid Coupons'].map(s => s.toLowerCase().trim());
    const couponCategoryName = 'Coupon Issue'.toLowerCase().trim();

    for (const complaint of newDataArray || []) {
        const categoryName = complaint?.categoryName?.toLowerCase().trim() || '';
        const subcategoryName = complaint?.subcategoryName?.toLowerCase().trim() || '';
        const couponName = complaint?.scanCouponLabel?.[0]?.couponName?.toLowerCase().trim() || '';
        const isCouponComplaint = categoryName === couponCategoryName && couponSubcategories.includes(subcategoryName);

        const imageUrl = isLocalFilePath(complaint?.imageURI) ? complaint.imageURI : '';
        const relativeTime = getRelativeTime(complaint?.mobileSubmitionDateTime);
        const createdOn = formatDateToServerStyle(new Date());

        const newComplaint = {
            dupicateCount: 0,
            subcategoryName: complaint?.subcategoryName?.trim() || '',
            complaintImage: imageUrl,
            scanCouponLabel: complaint?.scanCouponLabel || [],
            complaintStatus: complaint?.status ? translate('Pending') : translate('Closed'),
            raisedBy: `${userName} ${relativeTime}`,
            createdOn,
            categoryName: complaint?.categoryName?.trim() || '',
            remarks: complaint?.remarks?.trim() || '',
            status: complaint?.status,
            categoryId: complaint?.categoryId,
            subCategoryId: complaint?.subCategoryId,
            coupon: complaint?.scanCouponLabel?.[0]?.couponName?.trim() || '',
        };

        const existingIndex = existingData.findIndex((group) => {
            const groupCategory = group?.categoryName?.toLowerCase().trim() || '';
            const groupSubcategory = group?.subcategoryName?.toLowerCase().trim() || '';
            const groupCoupon = group?.coupon?.toLowerCase().trim() || '';

            const baseMatch = groupCategory === categoryName && groupSubcategory === subcategoryName;

            if (isCouponComplaint) {
                return baseMatch && groupCoupon === couponName;
            } else {
                return baseMatch;
            }
        });

        if (existingIndex >= 0) {
            const group = existingData[existingIndex];
            group.relatedDuplicates = [...(group.relatedDuplicates || []), { ...newComplaint }];
            group.dupicateCount = group.relatedDuplicates.length;
        } else {
            existingData.push({
                dupicateCount: 0,
                relatedDuplicates: [{ ...newComplaint }],
                ...newComplaint,
            });
        }
    }

    return existingData;
}
export const compareVersions = (v1, v2) => {
    const a = v1.split('.').map(Number);
    const b = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        const diff = (a[i] || 0) - (b[i] || 0);
        if (diff !== 0) return diff;
    }
    return 0;
};

export const CASHBACKSCAN = "CASHBACKSCAN"
export const CASHBACKSCAN2 = "CASHBACKSCAN2"
export const REWARDS = "rewards"
export const CASHBACK = "cashback"
export const SCAN = "scan"
export const REDEEM = "redeem"
export const DONE = "done"
export const SCANEARN = "Scan & Earn"
export const SELF = "self"
export function isNullOrEmptyNOTTrim(value) {
    if (value === null || value === undefined || value === '') {
        return true; // It IS null or empty
    }
    return false; // It has some value
}


export const isEmptyValueObject = (value) => {
    return (
        value === null ||
        value === undefined ||
        (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0)
    );
};

export const SUCCESS_st = "SUCCESS";
export const FAILED_st = "FAILED";
export const PENDING_st = "PENDING";
export const BANK_DETAILS_M = "BankDetails";
export const UPI_M = "upi";
export const PAYTM_M = "paytm";
export const AMAZON_PAY_GIFT_CARD = "Amazon Pay gift Card";
export const BANK_TRANSFER_M = "banktransfer";

export const isDigitOnly = (value) => {
    return /^[0-9]+$/.test(value);
};

export const strYMMDhmsSToDMMMYhms = (str) => {
    return moment(str, "YYYY-MM-DD HH:mm:ss.SSS").format("DD-MMM-YYYY HH:mm:ss");
}

export const allowOnlyAlphabets = (input) => {
    return input.replace(/[^a-zA-Z ]/g, '');
};

export const allowOnlyNumbers = (input) => input.trim().replace(/[^0-9]/g, '');
export const allowOnlyAlphabetsNumbers = (input) => input.trim().replace(/[^a-zA-Z0-9]/g, '');








