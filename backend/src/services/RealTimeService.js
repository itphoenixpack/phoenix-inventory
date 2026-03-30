const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../utils/logger');

class RealTimeService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.setupAuth();
    this.setupEvents();
  }

  setupAuth() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });
  }

  setupEvents() {
    this.io.on('connection', (socket) => {
      logger.info(`Operative connected to real-time stream: ${socket.user.name} (${socket.id})`);
      
      socket.on('disconnect', () => {
        logger.info(`Operative disconnected from stream: ${socket.id}`);
      });
    });
  }

  broadcastStockUpdate(data) {
    this.io.emit('stock_update', data);
    if (data.quantity < 20) {
      this.io.emit('low_stock_alert', {
        product: data.product_name,
        warehouse: data.warehouse_name,
        quantity: data.quantity
      });
    }
  }

  broadcastNotification(notification) {
    this.io.emit('notification', notification);
  }
}

module.exports = RealTimeService;
