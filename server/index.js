import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create express app
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Port server is listening on
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

// Error handling
app.use((err, req, res, next) => {
  res.status(500).send('Something broke!');
  console.error(err.stack);
});