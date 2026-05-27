import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { request, openSettings, PERMISSIONS, RESULTS } from 'react-native-permissions';

class PermissionManager {

    // Location Permission
    static async requestLocationPermission() {
        try {
            let permission;

            if (Platform.OS === 'ios') {
                // iOS location permission
                permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

                const result = await request(permission);
                if (result === RESULTS.GRANTED) {
                    console.log('iOS Location permission granted');
                    return true;
                } else if (result === RESULTS.DENIED) {
                    this.showPermissionRequestAlert('Location');
                    return false;
                } else if (result === RESULTS.BLOCKED) {
                    this.showSettingsAlert('Location');
                    return false;
                }

            } else {
                // Android 12+ requires both FINE and COARSE
                const result = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                ]);

                const fineResult = result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
                const coarseResult = result[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

                if (
                    fineResult === PermissionsAndroid.RESULTS.GRANTED ||
                    coarseResult === PermissionsAndroid.RESULTS.GRANTED
                ) {
                    console.log('Android Location permission granted');
                    return true;
                } else if (
                    fineResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
                    coarseResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
                ) {
                    this.showSettingsAlert('Location');
                    return false;
                } else {
                    this.showPermissionRequestAlert('Location');
                    return false;
                }
            }

            return false;
        } catch (error) {
            console.error('Error requesting location permission:', error);
            return false;
        }
    }


    // Camera Permission
    static async requestCameraPermission() {
        try {
            const permission = Platform.OS === 'ios'
                ? PERMISSIONS.IOS.CAMERA
                : PERMISSIONS.ANDROID.CAMERA;

            const result = await request(permission);

            if (result === RESULTS.GRANTED) {
                console.log('Camera permission granted');
                return true;
            } else if (result === RESULTS.DENIED) {
                this.showPermissionRequestAlert('Camera');
                return false;
            } else if (result === RESULTS.BLOCKED) {
                this.showSettingsAlert('Camera');
                return false;
            }

            return false;
        } catch (error) {
            console.error('Error requesting camera permission:', error);
            return false;
        }
    }

    // Gallery (Storage) Permission
    static async requestGalleryPermission() {
        try {
            let permission;

            if (Platform.OS === 'ios') {
                // iOS Photos permission
                permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
            } else {
                // Android Storage permission
                if (Platform.Version >= 30) {
                    // Android 11+ (API 30+)
                    permission = PERMISSIONS.ANDROID.MANAGE_EXTERNAL_STORAGE;
                } else {
                    // Below Android 11
                    permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
                }
            }

            const result = await request(permission);

            if (result === RESULTS.GRANTED) {
                console.log('Gallery permission granted');
                return true;
            } else if (result === RESULTS.DENIED) {
                this.showPermissionRequestAlert('Gallery');
                return false;
            } else if (result === RESULTS.BLOCKED) {
                this.showSettingsAlert('Gallery');
                return false;
            }

            return false;
        } catch (error) {
            console.error('Error requesting gallery permission:', error);
            return false;
        }
    }

    // SMS Permission for OTP
    static async requestSmsPermission() {
        try {
            if (Platform.OS === 'android') {
                const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS);

                if (result === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('SMS permission granted');
                    return true;
                } else if (result === PermissionsAndroid.RESULTS.DENIED) {
                    this.showPermissionRequestAlert('SMS');
                    return false;
                } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    this.showSettingsAlert('SMS');
                    return false;
                }
            } else {
                Alert.alert('Not Supported', 'SMS reading permission is only available on Android.');
                return false;
            }

        } catch (error) {
            console.error('Error requesting SMS permission:', error);
            return false;
        }
    }

    // Show alert to ask the user to grant permission if it was denied
    static showPermissionRequestAlert(permissionName) {
        Alert.alert(
            `${permissionName} Permission Needed`,
            `This app requires access to your ${permissionName} to function properly. Please grant the permission.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Grant Permission', onPress: async () => {
                        if (permissionName === 'Location') await this.requestLocationPermission();
                        if (permissionName === 'Camera') await this.requestCameraPermission();
                        if (permissionName === 'Gallery') await this.requestGalleryPermission();
                        if (permissionName === 'SMS') await this.requestSmsPermission();
                    }
                }
            ]
        );
    }

    // Show alert to direct the user to settings if permission is permanently denied
    static showSettingsAlert(permissionName) {
        console.log("permissionName", permissionName)
        Alert.alert(
            'Permission Required',
            `The app needs access to your ${permissionName}. Please go to app settings and grant the permission.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => openSettings() },
            ]
        );
    }
}

export default PermissionManager;
