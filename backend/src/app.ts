import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import universityRoutes from './routes/university';
import examRoutes from './routes/exams';
import questionRoutes from './routes/questions';
import adminRoutes from './routes/admin';
import errorHandler from './middlewares/errorHandler';
import paymentRoutes from './routes/payments';

const app = express();

app.use(helmet());
app.use(cors());
// For JSON payloads
app.use(express.json());

// For FormData (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// api
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => res.send({ok:true, message: 'Admission Hero backend'}));

// Health check endpoint for Railway
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

export default app;
