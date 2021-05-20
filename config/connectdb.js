const mongoose = require('mongoose');

module.exports.connect = async () => {
    var uri;
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
            console.log(`Error conectando a Atlas: ${err}`);
        } else {
            console.log(`Connected to Atlas in enviroment: ${process.env.NODE_ENV}`);
        }
    });
}
