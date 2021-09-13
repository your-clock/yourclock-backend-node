const mongoose = require('mongoose');
const debugLib = require('debug')

const logger = debugLib('yck:startDatabase')

module.exports.connect = async () => {
    let uri;
    if(process.env.NODE_ENV === 'test'){
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongodb = new MongoMemoryServer();
        uri = await mongodb.getUri()
    }else{
        uri = process.env.MONGO_URI
    }

    const mongooseOpts = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    };

    await mongoose.connect(uri, mongooseOpts, function (err) {
        if (err) {
            logger(`Error connecting to Atlas: ${err}`);
        } else {
            logger(`Connected to Atlas in environment: ${process.env.NODE_ENV}`);
        }
    });
}
