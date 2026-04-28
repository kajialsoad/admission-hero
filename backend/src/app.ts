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
import paymentRoutes from './routes/payments';
import chatRoutes from './routes/chat';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/uploads';
import analyticsRoutes from './routes/analytics';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
// For JSON payloads
app.use(express.json());

// For FormData (x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Middleware to attach Socket.IO instance to requests
app.use((req, _res, next) => {
  (req as any).io = (app as any).io;
  next();
});

// api
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (_req, res) => res.send({ok:true, message: 'Admission Hero backend'}));

// Health check endpoint for Railway
app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

export default app;
