import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

const options = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
    // Dev módban használjuk a global cache-t a HMR miatt
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // Prod: minden deploy-nál egyszeri kliens
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

// Ezt add az Auth adapternek
export default clientPromise;
