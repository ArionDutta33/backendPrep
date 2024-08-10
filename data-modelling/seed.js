import mongoose from 'mongoose';
import { Order } from './model/order.model.js'; // Adjust the import path according to your file structure

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/your-database-name')
    .then(() => {
        console.log('Connected to MongoDB');
        // Seed the database
        seedOrders();
    }).catch(err => {
        console.error('Connection error', err);
    });

const seedOrders = async () => {
    try {
        // Sample orders to seed
        const orders = [
            {
                orderPrice: 250.00,
                customer: new mongoose.Types.ObjectId(), // Use `new` to create ObjectId
                orderItems: [
                    { productId: new mongoose.Types.ObjectId(), quantity: 2 },
                    { productId: new mongoose.Types.ObjectId(), quantity: 1 },
                ],
                address: "456 Another Street, City, Country",
                status: "Pending"
            },
            {
                orderPrice: 120.00,
                customer: new mongoose.Types.ObjectId(),
                orderItems: [
                    { productId: new mongoose.Types.ObjectId(), quantity: 3 },
                ],
                address: "789 Example Avenue, City, Country",
                status: "Delivered"
            },
            {
                orderPrice: 340.00,
                customer: new mongoose.Types.ObjectId(),
                orderItems: [
                    { productId: new mongoose.Types.ObjectId(), quantity: 1 },
                    { productId: new mongoose.Types.ObjectId(), quantity: 4 },
                ],
                address: "123 Example Street, City, Country",
                status: "Cancelled"
            },
        ];

        // Insert orders into the database
        await Order.insertMany(orders);
        console.log("Orders seeded successfully!");

    } catch (error) {
        console.error("Error seeding orders:", error);
    } finally {
        mongoose.disconnect(); // Disconnect from the database
    }
};
