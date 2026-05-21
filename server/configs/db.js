import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"));
        
        // The link is now perfectly inside the quotes!
        await mongoose.connect("mongodb://fruzo:fruzo9090@ac-ncrn2sz-shard-00-00.29fxqnk.mongodb.net:27017,ac-ncrn2sz-shard-00-01.29fxqnk.mongodb.net:27017,ac-ncrn2sz-shard-00-02.29fxqnk.mongodb.net:27017/?ssl=true&replicaSet=atlas-134sb1-shard-0&authSource=admin&appName=Cluster0");
        
    } catch (error) {
        console.error("Connection Error: ", error.message);
    }
};

export default connectDB;