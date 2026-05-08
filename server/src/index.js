require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const { connectDB } = require('./config/db');
const { initCloudinary } = require('./config/cloudinary');
const { errorHandler } = require('./middleware/errorHandler');
const { startCronJobs } = require('./jobs/cron');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const propertyRoutes = require('./routes/property.routes');
const leaseRoutes = require('./routes/lease.routes');
const paymentRoutes = require('./routes/payment.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const messageRoutes = require('./routes/message.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true },
});

initCloudinary();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/leases', leaseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.set('io', io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    const secret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change';
    const decoded = jwt.verify(token, secret);
    socket.userId = decoded.sub;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  const room = String(socket.userId);
  socket.join(room);
  socket.on('disconnect', () => { });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
let currentPort = PORT;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = currentPort + 1;
    console.warn(`Port ${currentPort} already in use, trying ${nextPort}...`);
    currentPort = nextPort;
    server.listen(currentPort);
    return;
  }

  console.error(err);
  process.exit(1);
});

connectDB()
  .then(() => {
    startCronJobs();
    server.listen(currentPort, () => {
      console.log(`API listening on http://localhost:${currentPort}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
