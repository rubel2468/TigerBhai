import mongoose from "mongoose";
const MONGODB_URL = process.env.MONGODB_URI

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    }
}

export const connectDB = async () => {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URL, {
            dbName: 'tigerbhai',
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
            connectTimeoutMS: 10000, // 10 seconds timeout for initial connection
            socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
        })
    }

    cached.conn = await cached.promise

    return cached.conn
}