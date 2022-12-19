import fs from 'fs';
import settings from './src/settings';
import app from './app.default.json';
import myPackage from './package.json';

const slug = settings.config.appName.toLowerCase().replaceAll(' ', '-');
const identifier = 'foundation.tonomy.projects.' + slug.replaceAll('-', '');

// Check if inputs are correct
if (!/^[0-9a-zA-Z ]+$/g.test(settings.config.appName)) throw new Error('Invalid app name ' + settings.config.appName);
if (!/^([.]{1})([0-9a-z.]+)$/g.test(settings.config.accountSuffix))
    throw new Error('Invalid account suffix ' + settings.config.accountSuffix);

// Update app.json
app.expo.android.package = identifier;
app.expo.android.adaptiveIcon.foregroundImage = settings.config.images.logo1024;
app.expo.icon = settings.config.images.logo1024;
app.expo.ios.bundleIdentifier = identifier;
app.expo.name = settings.config.appName;
app.expo.scheme = slug;
app.expo.slug = slug;
app.expo.splash.image = settings.config.images.splash;
app.expo.web.favicon = settings.config.images.logo48;
app.expo.version = myPackage.version;

if (!['development', 'designonly'].includes(settings.env)) {
    console.log('Replacing expoProjectId');
    app.expo.extra.eas.projectId = settings.config.expoProjectId;
}

console.log(JSON.stringify(app, null, 2));

// Write app.json
fs.writeFileSync('./app.json', JSON.stringify(app, null, 2));
