import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import app from './app';
import connectDB from './config/db';
import SocketService from './services/socketService';
import { initSubscriptionExpiryJob } from './jobs/subscriptionExpiry';

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  
  // Initialize subscription expiry job
  initSubscriptionExpiryJob();
  
  // Create HTTP server
  const server = createServer(app);
  
  // Initialize Socket.IO
  const socketService = new SocketService(server);
  
  // Attach Socket.IO instance to app for use in routes
  (app as any).io = socketService.getIO();
  
  server.listen(PORT, () => {
    console.log(`Admission Hero backend running on port ${PORT}`);
    console.log(`Socket.IO server initialized`);
  });
}

start().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
