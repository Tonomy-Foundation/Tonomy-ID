import fs from 'fs';
import settings from './src/settings';
import app from './app.default.json';
import myPackage from './package.json';

app.expo.name = settings.config.appName;
const slug = settings.config.appName.toLowerCase().replace(' ', '-');
const identifier = 'foundation.tonomy.projects.' + slug.replace('-', '');

app.expo.slug = slug;
app.expo.ios.bundleIdentifier = identifier;
app.expo.android.package = identifier;
app.expo.icon = settings.config.images.logo1024;
app.expo.splash.image = settings.config.images.splash;
app.expo.android.adaptiveIcon.foregroundImage = settings.config.images.logo1024;
app.expo.web.favicon = settings.config.images.logo48;
app.expo.version = myPackage.version;

if (settings.env === 'staging') {
    app.expo.extra.eas.projectId = '18ee7c2e-dba4-4c3d-8bd1-712e0c19b901';
}

fs.writeFileSync('./app.json', JSON.stringify(app, null, 2));
