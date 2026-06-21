import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import prisma from './src/db.js';

// Ensure the default admin user is always a SUPER_ADMIN
prisma.user.updateMany({
  where: { Username: 'admin' },
  data: { Role: 'SUPER_ADMIN' }
}).then(() => console.log('Enforced SUPER_ADMIN role on admin user'))
  .catch(err => console.error('Failed to enforce SUPER_ADMIN role:', err));

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Barangay Management System server is running on port ${PORT}`);
});
