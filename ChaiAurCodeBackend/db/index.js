import mongoose from "mongoose";
async function connectDB() {
    try {
        const connectionInstance = await mongoose.connect(process.env.URL)
        console.log(`\n mongo db connected ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Error", error)
        process.exit(1)
    }
}

export default connectDB