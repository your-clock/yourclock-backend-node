const { MongoMemoryServer } = require('mongodb-memory-server');
const mongodb = new MongoMemoryServer();
const mongoose = require('mongoose');

module.exports.connect = async () => {
    const uri = process.env.NODE_ENV === 'test' ? await mongodb.getUri() : process.env.MONGO_URI;

    const mongooseOpts = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };

    await mongoose.connect(uri, mongooseOpts, function (err) {
        if (err) {
            console.log(`Error conectando a Atlas: ${err}`);
        } else {
            console.log(`Connected to Atlas in enviroment: ${process.env.NODE_ENV}`);
        }
    });
}
