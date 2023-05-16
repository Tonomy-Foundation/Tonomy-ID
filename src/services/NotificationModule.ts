import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export default function NotificationModule() {
    useEffect(() => {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: false,
                shouldSetBadge: false,
            }),
        });
    }, []);

    useEffect(() => {
        Notifications.scheduleNotificationAsync({
            content: {
                title: 'Look at that notification',
                body: "I'm so proud of myself!",
            },
            trigger: null,
        });
    }, []);

    return null;
}
