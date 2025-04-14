import settings from '../settings';

interface Image {
    name: string;
    image: any;
}
export class Images {
    private static tonomyImages: Array<Image> = [
        {
            name: 'splash',
            image: require('./tonomy/tonomy-splash.png'),
        },
        {
            name: 'logo48',
            image: require('./tonomy/tonomy-logo48.png'),
        },
        {
            name: 'logo1024',
            image: require('./tonomy/tonomy-logo1024.png'),
        },
        {
            name: 'favicon',
            image: require('./tonomy/tonomy-logo48.png'),
        },
    ];

    private static pangeaImages: Array<Image> = [
        {
            name: 'splash',
            image: require('./tonomyProduction/tono-splash.png'),
        },
        {
            name: 'logo48',
            image: require('./tonomyProduction/logo48x48.png'),
        },
        {
            name: 'logo1024',
            image: require('./tonomyProduction/logo1024x1024.png'),
        },
        {
            name: 'favicon',
            image: require('./tonomyProduction/favicon.png'),
        },
    ];

    static GetImage = (name: string) => {
        let found;

        if (settings.env === 'staging') {
            found = Images.tonomyImages.find((e) => e.name === name);
        } else {
            found = Images.pangeaImages.find((e) => e.name === name);
        }

        return found ? found.image : null;
    };
}
