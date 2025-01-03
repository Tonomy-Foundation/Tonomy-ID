import * as Notifications from 'expo-notifications';

export default function NotificationsProvider() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });

    return null;
}
