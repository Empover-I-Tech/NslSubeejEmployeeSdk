// PermissionHelper.js

import { Alert, Linking, Platform } from 'react-native';
import {
    check,
    request,
    openSettings,
    PERMISSIONS,
    RESULTS,
} from 'react-native-permissions';

const showSettingsAlert = (permissionName) => {
    Alert.alert(
        `${permissionName} Permission Required`,
        `This feature needs ${permissionName.toLowerCase()} access. Please enable it from settings.`,
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Open Settings',
                onPress: () => openSettings(),
            },
        ],
        { cancelable: true }
    );
};

const getStoragePermissions = () => {
    const sdkInt = parseInt(Platform.Version, 10);

    if (sdkInt >= 33) {
        return [PERMISSIONS.ANDROID.READ_MEDIA_IMAGES];
    } else {
        const perms = [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];
        if (sdkInt <= 28) {
            perms.push(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        }
        return perms;
    }
};

export const checkAndRequestPermission = async (permission, permissionLabel) => {
    const status = await check(permission);

    switch (status) {
        case RESULTS.GRANTED:
            return true;

        case RESULTS.DENIED: {
            const req = await request(permission);
            return req === RESULTS.GRANTED;
        }

        case RESULTS.BLOCKED:
        case RESULTS.UNAVAILABLE:
        default:
            showSettingsAlert(permissionLabel);
            return false;
    }
};

export const requestCameraAndStoragePermissions = async () => {
    if (Platform.OS !== 'android') return true;

    const cameraGranted = await checkAndRequestPermission(
        PERMISSIONS.ANDROID.CAMERA,
        'Camera'
    );

    const storagePermissions = getStoragePermissions();
    let storageGranted = true;

    for (const perm of storagePermissions) {
        const granted = await checkAndRequestPermission(perm, 'Storage');
        if (!granted) {
            storageGranted = false;
        }
    }

    return cameraGranted && storageGranted;
};

export const showPermissionDeniedAlert = (featureName = 'this feature') => {
    Alert.alert(
        'Permissions Required',
        `${featureName} needs access to camera and storage. Please enable permissions from app settings.`,
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Open Settings',
                onPress: () => Linking.openSettings(),
            },
        ],
        { cancelable: true }
    );
};
