import { server } from './app';
import { connectDB } from './config/mongoose';
import seed from './seed';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seed();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();