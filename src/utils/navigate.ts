import { createNavigationContainerRef, ParamListBase } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<ParamListBase>();

export function navigate(name: string, params: any) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    }
}
