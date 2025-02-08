import 'dotenv/config.js';
// export const Config = {
//   RP_ID: 'sesmanovich.alwaysdata.net',
//   RP_NAME: 'Example Service',
//   ORIGIN: 'https://sesmanovich.alwaysdata.net',
//   UUID_NAMESPACE: 'd243c3d4-6f4b-4dc7-b4e4-6c913bff9d9c',
// };

export const Config = {
  RP_ID: process.env.RP_ID ?? 'localhost',
  RP_NAME: process.env.RP_NAME ?? 'Example Service',
  ORIGIN: process.env.ORIGIN ?? 'http://localhost:8100',
  UUID_NAMESPACE: process.env.UUID_NAMESPACE ?? 'd243c3d4-6f4b-4dc7-b4e4-6c913bff9d9c',
  PORT: process.env.PORT ?? 80,
};
