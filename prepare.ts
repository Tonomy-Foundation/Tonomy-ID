import fs from 'fs';
import settings from './src/settings';
import app from './app.default.json';
import myPackage from './package.json';
import appPersonal from './app.json';

const slug = settings.config.appName.toLowerCase().replaceAll(' ', '-');
const identifier = 'foundation.tonomy.projects.' + slug.replaceAll('-', '');

// Check if inputs are correct
if (!/^[0-9a-zA-Z ]+$/g.test(settings.config.appName)) throw new Error('Invalid app name ' + settings.config.appName);
if (!/^([.]{1})([0-9a-z.]+)$/g.test(settings.config.accountSuffix))
    throw new Error('Invalid account suffix ' + settings.config.accountSuffix);

// Update app.json
app.expo.name = settings.config.appName;
app.expo.slug = slug;
app.expo.ios.bundleIdentifier = identifier;
app.expo.android.package = identifier;
app.expo.icon = settings.config.images.logo1024;
app.expo.splash.image = settings.config.images.splash;
app.expo.android.adaptiveIcon.foregroundImage = settings.config.images.logo1024;
app.expo.web.favicon = settings.config.images.logo48;
app.expo.version = myPackage.version;

if (settings.env !== 'development') {
    app.expo.extra.eas.projectId = settings.config.expoProjectId;
}

// Write app.json
fs.writeFileSync('./app.json', JSON.stringify(app, null, 2));
