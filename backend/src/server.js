const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorHandler');
const companyMiddleware = require('./middleware/companyMiddleware');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const stockRoutes = require('./routes/stockRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();

// Security and Logging Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(companyMiddleware);

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
  res.send('Inventory API Running');
});

// Global Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('--- PHOENIX SYSTEMS OPERATIONAL ---');
  console.log(`Port: ${PORT}`);
  console.log(`Node: ${process.env.NODE_ENV || 'production'}`);
  console.log('---------------------------------');
});

// Global Resilience Protocol
process.on('unhandledRejection', (reason, promise) => {
    console.error('--- CRITICAL UNHANDLED REJECTION ---');
    console.error('Promise:', promise);
    console.error('Reason:', reason);
    console.error('------------------------------------');
});

process.on('uncaughtException', (err) => {
    console.error('--- CRITICAL UNCAUGHT EXCEPTION ---');
    console.error('Error:', err);
    console.error('----------------------------------');
    
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is currently unavailable. Ensure no other instances are running.`);
        process.exit(1);
    }
});