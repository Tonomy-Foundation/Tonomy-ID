// types/images.d.ts
declare module '*.png' {
    const value: any;
    export default value;
}

declare module '*.svg' {
    import * as React from 'react';
    import { SvgProps } from 'react-native-svg';
    const content: React.FC<SvgProps>;
    export default content;
}
