// services/NavigationService.ts
import { createNavigationContainerRef, ParamListBase } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<ParamListBase>();

export function navigate(name: string, params: any) {
    console.log('Navigating to', name, 'with params', params);

    if (navigationRef.isReady()) {
        console.log('Navigation is ready');
        navigationRef.navigate(name, params);
    }
}
