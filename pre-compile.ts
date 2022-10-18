import fs from 'fs';
import settings from './src/settings';
import app from './app.default.json';

app.expo.name = settings.config.appName;
const slug = settings.config.appName.toLowerCase().replace(' ', '-');
const identifier = 'foundation.tonomy.' + slug.replace(' ', '');

app.expo.slug = slug;
app.expo.ios.bundleIdentifier = identifier;
app.expo.android.package = identifier;

if (settings.env === 'staging') {
    app.expo.extra.eas.projectId = '83b91e03-98c2-4ae1-80a3-57d3fbe6db6d';
}
// TODO
// app.expo.icon
// app.expo.splash.image
// app.expo.android.adaptiveIcon.foregroundImage
// app.expo.web.favicon

fs.writeFileSync('./app.json', JSON.stringify(app, null, 2));
