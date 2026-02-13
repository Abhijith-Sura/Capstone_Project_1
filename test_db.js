
import { connect } from 'mongoose';

const connectionString = 'mongodb://backend:Abhi88886666@cluster0-shard-00-00.5wlb8aj.mongodb.net:27017,cluster0-shard-00-01.5wlb8aj.mongodb.net:27017,cluster0-shard-00-02.5wlb8aj.mongodb.net:27017/blog_project?ssl=true&replicaSet=atlas-waq5d5-shard-0&authSource=admin&retryWrites=true&w=majority';

const connectDB = async () => {
    try {
        console.log("Attempting to connect with standard string...");
        await connect(connectionString);
        console.log("DB connected successfully!");
        process.exit(0);
    } catch (err) {
        console.error("DB connection failed", err);
        process.exit(1);
    }
};

connectDB();
