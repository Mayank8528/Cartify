import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    mongoose.set('bufferTimeoutMS', 30000);

    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
