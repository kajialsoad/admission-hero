import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class SocketService {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const user = await User.findById(decoded.id);

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected`);

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Join admin users to admin room
      if (socket.userRole === 'admin') {
        socket.join('admin_room');
      }

      // Handle chat events
      this.setupChatHandlers(socket);

      // Handle notification events
      this.setupNotificationHandlers(socket);

      // Handle real-time analytics
      this.setupAnalyticsHandlers(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
      });
    });
  }

  private setupChatHandlers(socket: AuthenticatedSocket) {
    // Join chat conversation
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Leave chat conversation
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Typing indicator
    socket.on('typing_start', (data: { conversationId: string }) => {
      socket.to(data.conversationId).emit('user_typing', {
        userId: socket.userId,
        isTyping: true,
      });
    });

    socket.on('typing_stop', (data: { conversationId: string }) => {
      socket.to(data.conversationId).emit('user_typing', {
        userId: socket.userId,
        isTyping: false,
      });
    });

    // Message read receipt
    socket.on('message_read', (data: { conversationId: string, messageId: string }) => {
      socket.to(data.conversationId).emit('message_read_receipt', {
        messageId: data.messageId,
        readBy: socket.userId,
        timestamp: new Date(),
      });
    });
  }

  private setupNotificationHandlers(socket: AuthenticatedSocket) {
    // Mark notification as read
    socket.on('notification_read', (notificationId: string) => {
      // This would typically update the database
      console.log(`Notification ${notificationId} marked as read by user ${socket.userId}`);
    });

    // Request notification count
    socket.on('get_notification_count', async () => {
      // This would fetch from database and emit back
      socket.emit('notification_count', { count: 0 });
    });
  }

  private setupAnalyticsHandlers(socket: AuthenticatedSocket) {
    // Track real-time user activity
    socket.on('page_view', (data: { page: string, timestamp: Date }) => {
      // Emit to admin room for real-time monitoring
      this.io.to('admin_room').emit('user_activity', {
        userId: socket.userId,
        activity: 'page_view',
        data,
        timestamp: new Date(),
      });
    });

    // Track exam events
    socket.on('exam_event', (data: { eventType: string, examId: string, data: any }) => {
      // Emit to admin room for real-time exam monitoring
      this.io.to('admin_room').emit('exam_activity', {
        userId: socket.userId,
        eventType: data.eventType,
        examId: data.examId,
        data: data.data,
        timestamp: new Date(),
      });
    });
  }

  // Public methods for sending notifications
  public sendNotificationToUser(userId: string, notification: any) {
    this.io.to(`user_${userId}`).emit('new_notification', notification);
  }

  public sendNotificationToAll(notification: any) {
    this.io.emit('new_notification', notification);
  }

  public sendChatMessage(conversationId: string, message: any) {
    this.io.to(conversationId).emit('new_message', message);
  }

  public broadcastToAdmins(event: string, data: any) {
    this.io.to('admin_room').emit(event, data);
  }

  public getConnectedUsers(): number {
    return this.io.sockets.sockets.size;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default SocketService;