import fs from 'fs';
import settings from './src/settings';
import app from './app.default.json';
import myPackage from './package.json';

const slug = settings.config.appName.toLowerCase().replaceAll(' ', '-');
const identifier = 'foundation.tonomy.projects.' + slug.replaceAll('-', '');

// TODO some validation of the values? e.g. check the account suffix starts with '.'

app.expo.name = settings.config.appName;
app.expo.slug = slug;
app.expo.ios.bundleIdentifier = identifier;
app.expo.android.package = identifier;
app.expo.icon = settings.config.images.logo1024;
app.expo.splash.image = settings.config.images.splash;
app.expo.android.adaptiveIcon.foregroundImage = settings.config.images.logo1024;
app.expo.web.favicon = settings.config.images.logo48;
app.expo.version = myPackage.version;

if (settings.isProduction()) {
    app.expo.extra.eas.projectId = settings.config.expoProjectId;
}

fs.writeFileSync('./app.json', JSON.stringify(app, null, 2));
