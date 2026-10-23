import dotenv from 'dotenv';

// Load server/.env regardless of the directory the server is started from
dotenv.config({ path: new URL('../../.env', import.meta.url) });
