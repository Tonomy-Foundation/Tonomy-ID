// import '@sinonjs/text-encoding';
// import 'react-native-get-random-values';
// import '@ethersproject/shims';

// describe('Polyfill overrides', () => {
//     // Mocking fetch and XMLHttpRequest
//     beforeAll(() => {
//         const originalFetch = global.fetch;

//         global.fetch = async (url, options) => {
//             await originalFetch(url, options);
//             throw new Error('Network request failed');
//         };

//         if (global.XMLHttpRequest) {
//             const OriginalXMLHttpRequest = global.XMLHttpRequest;

//             global.XMLHttpRequest = class extends OriginalXMLHttpRequest {
//                 constructor() {
//                     super();
//                     throw new Error('Network request failed');
//                 }
//             };
//         } else {
//             console.warn('XMLHttpRequest is not available in this environment');
//         }
//     });

//     test('fetch should throw "Network request failed" error', async () => {
//         const url = 'https://jsonplaceholder.typicode.com/todos/1';

//         await expect(global.fetch(url)).rejects.toThrow('Network request failed');
//     });

//     test('XMLHttpRequest should throw "Network request failed" error', () => {
//         if (global.XMLHttpRequest) {
//             expect(() => {
//                 const xhr = new XMLHttpRequest();

//                 xhr.open('GET', 'https://jsonplaceholder.typicode.com/todos/1');
//                 xhr.send();
//             }).toThrow('Network request failed');
//         } else {
//             console.warn('XMLHttpRequest is not available in this environment, skipping test');
//         }
//     });
// });
