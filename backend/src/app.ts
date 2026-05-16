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
import subscriptionRoutes from './routes/subscription';
import performanceRoutes from './routes/performance';
import chatRoutes from './routes/chat';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/uploads';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';
import appContentRoutes from './routes/appContent';
import bannerRoutes from './routes/banner';
import statisticsRoutes from './routes/statistics';
import errorHandler from './middlewares/errorHandler';
import path from 'path';

const app = express();

// Serve Admin Dashboard
const adminBuildPath = path.join(__dirname, '../admin-dashboard-build');
app.use('/admin', express.static(adminBuildPath));

// Fallback for Admin Dashboard SPA routing
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminBuildPath, 'index.html'));
});

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
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/app-content', appContentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/statistics', statisticsRoutes);

app.get('/', (_req, res) => res.send({ok:true, message: 'Admission Hero backend'}));

// Health check endpoint for Railway
app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

export default app;
