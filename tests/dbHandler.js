const mongoose = require("mongoose");

//MongoMemoryServer: A package that runs an in-memory version of MongoDB for testing purposes.
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

//connect to in-memory database
exports.dbConnect = async () => {
  //creating instance of MongoMemoryServer
  mongoServer = await MongoMemoryServer.create();

  //getting connection string
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useUnifiedTopology: true,
  });
};

//disconnect in-memory database
exports.dbDisconnect = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

//Remove all the data for all db collections.
exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};
