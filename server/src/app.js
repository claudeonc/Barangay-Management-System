import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BMS Server is running' });
});

import authRoutes from './routes/auth.routes.js';
import residentRoutes from './routes/resident.routes.js';
import householdRoutes from './routes/household.routes.js';
import documentRoutes from './routes/document.routes.js';
import logRoutes from './routes/log.routes.js';
import personnelRoutes from './routes/personnel.routes.js';
import { requireAuth } from './middleware/auth.js';

app.use('/api/auth', authRoutes);
app.use('/api/residents', requireAuth, residentRoutes);
app.use('/api/households', requireAuth, householdRoutes);
app.use('/api/documents', requireAuth, documentRoutes);
app.use('/api/logs', requireAuth, logRoutes);
app.use('/api/personnel', requireAuth, personnelRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
