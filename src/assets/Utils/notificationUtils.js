// notificationUtils.js
import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { translate } from '../../Localization/Localisation';
import { storeInAsyncStorage } from '../../utils/keychainUtils';

export async function requestNotificationPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (!granted) {
            const result = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );

            if (result === PermissionsAndroid.RESULTS.GRANTED) {
                return true;
            } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                Alert.alert(
                    translate("Enable_Notifications"),
                    translate("Please_allow_notification_permission_settings"),
                    [
                        { text: translate("cancel"), style: 'cancel' },
                        { text: translate("open_settings"), onPress: () => Linking.openSettings() },
                    ]
                );
                return false;
            } else {
                Alert.alert(translate("Notification_Permission"), translate("Permission_denied"));
                return false;
            }
        } else {
            return true;
        }
    } else {
        return true;
    }
}

export async function getFCMToken() {
    try {
        const token = await messaging().getToken();
        await storeInAsyncStorage('fcmToken', token);
        console.log('FCM TOKEN:', token);
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
    }
}
