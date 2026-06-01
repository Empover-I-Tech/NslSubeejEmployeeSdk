import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from 'react-native-geolocation-service';

/**
 * Store data in AsyncStorage.
 * @param {string} key - The key or identifier for the stored item.
 * @param {string} value - The value to store.
 */
export const storeInAsyncStorage = async (key, value) => {
    console.log(key,"valsjjsjsjs",value)
    try {
        await AsyncStorage.setItem(key, value);
        console.log(`Stored ${key} => ${value} successfully in AsyncStorage.`);
    } catch (error) {
        console.error(`Failed to store ${key} in AsyncStorage:`, error);
    }
};

/**
 * Retrieve data from AsyncStorage.
 * @param {string} key - The key or identifier for the item.
 * @returns {Promise<string|null>} - The retrieved value, or null if not found.
 */
export const getFromAsyncStorage = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            console.log(`Retrieved ${key} successfully from AsyncStorage.`);
            return value; // Return the stored value
        } else {
            console.log(`${key} not found in AsyncStorage.`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to retrieve ${key} from AsyncStorage:`, error);
        return null;
    }
};

/**
 * Delete data from AsyncStorage.
 * @param {string} key - The key or identifier for the item.
 */
export const deleteFromAsyncStorage = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
        console.log(`Deleted ${key} successfully from AsyncStorage.`);
    } catch (error) {
        console.error(`Failed to delete ${key} from AsyncStorage:`, error);
    }
};

export async function getUserLocation() {
    try {
        const position = await new Promise((resolve, reject) =>
            Geolocation.getCurrentPosition(resolve, reject)
        );
        console.log('position----------------->', position?.coords?.latitude)
        const newRegion = {
            latitude: position?.coords?.latitude,
            longitude: position?.coords?.longitude,
            // longitudeDelta: LONGITUDE_DELTA,
            // latitudeDelta: LATITUDE_DELTA
        };
        return newRegion;
    } catch (error) {
       
        return error;
    }
}

