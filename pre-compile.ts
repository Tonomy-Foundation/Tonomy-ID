import fs from 'fs';
import settings from './src/settings';
import app from './app.default.json';

app.expo.name = settings.config.appName;
const slug = settings.config.appName.toLowerCase().replace(' ', '-');
const identifier = 'foundation.tonomy.' + slug.replace('-', '');

app.expo.slug = slug;
app.expo.ios.bundleIdentifier = identifier;
app.expo.android.package = identifier;

if (settings.env === 'staging') {
    app.expo.extra.eas.projectId = '18ee7c2e-dba4-4c3d-8bd1-712e0c19b901';
}
// TODO
// app.expo.icon
// app.expo.splash.image
// app.expo.android.adaptiveIcon.foregroundImage
// app.expo.web.favicon

fs.writeFileSync('./app.json', JSON.stringify(app, null, 2));
