import * as Notifications from 'expo-notifications';

export default function NotificationModule() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });

    return null;
}
