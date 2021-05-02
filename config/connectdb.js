const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');

if(process.env.NODE_ENV === "test"){
    module.exports.connect = async () => {
        const uri = await mongod.getUri();

        const mongooseOpts = {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true 
        };

        await mongoose.connect(uri, mongooseOpts, function(err){
            if(err){
                console.log(`Error conectando a Atlas: ${err}`)
            }else{
                console.log(`Connected to Atlas in enviroment: ${process.env.NODE_ENV}`)
            }
        });
    }
}else{
    mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, function(err){
		if(err){
			console.log(`Error conectando a Atlas: ${err}`)
		}else{
			console.log(`Connected to Atlas in enviroment: ${process.env.NODE_ENV}`)
		}
	})
}