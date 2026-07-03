const mongoose = require('mongoose');
const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);
require('dotenv').config();
console.log('MongoDB URI:', process.env.MONGODB_URI);
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;