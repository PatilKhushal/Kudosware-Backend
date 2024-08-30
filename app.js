// imports
const express = require('express');
const { connectMongoDB } = require('./config/connection');
const authRoutes = require('./routes/authRoutes');
const dotenv = require('dotenv');
const cors = require('cors');

// initializations
dotenv.config();
const app = express();


// connection to Local Mongo DB
connectMongoDB(process.env.MONGO_URI)
    .then(() => console.log("Connected to DB Successfully"))
    .catch((error) => console.log("Connection unsuccessful due to => ", error));

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);


// Serve static files from the uploads folder
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

// Running server on port 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))