// Bug fix: https://github.com/getsentry/sentry-react-native/issues/668#issuecomment-838085905
jest.mock('@sentry/react-native', () => ({ init: () => jest.fn() }));
