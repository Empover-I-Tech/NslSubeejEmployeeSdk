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
