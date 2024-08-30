const mongoose = require('mongoose');

function connectMongoDB(dbURL)
{
    return mongoose.connect(dbURL);
}

module.exports = {
    connectMongoDB,
}