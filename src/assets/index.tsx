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
    ];

    private static pangeaImages: Array<Image> = [
        {
            name: 'splash',
            image: require('./pangea/pangea-splash.png'),
        },
        {
            name: 'logo48',
            image: require('./pangea/favicon.png'),
        },
        {
            name: 'logo1024',
            image: require('./pangea/pangea-large-logo.png'),
        },
    ];

    static GetImage = (name: string) => {
        let found;

        if (settings.config.ecosystemName === 'Tonomy Staging') {
            found = Images.tonomyImages.find((e) => e.name === name);
        } else {
            found = Images.pangeaImages.find((e) => e.name === name);
        }

        return found ? found.image : null;
    };
}
