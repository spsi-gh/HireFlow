import 'dotenv/config';
import { createApp } from './app.js';

const port = process.env.PORT || 4000;
createApp().listen(port, '0.0.0.0', () => console.log(`HireFlow API listening on http://localhost:${port}`));
