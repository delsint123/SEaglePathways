import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import reviewRouter from './routes/reviewRoute';
import userRouter from './routes/userRoute';
import companyRouter from './routes/companyRoute';

// Create express app
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

// Middleware
app.use(bodyParser.json());
app.use(express.json());
//app.use(cors(corsOptions));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use('/review', reviewRouter);
app.use('/user', userRouter);
app.use('/company', companyRouter);

// Port server is listening on
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  res.status(500).send('Something broke!');
  console.error(err.stack);
}); 

export default app;