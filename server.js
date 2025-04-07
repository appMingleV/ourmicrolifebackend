import express from "express";
import dotenv from "dotenv";
import pool from "./config/db.js";
import route from "./routes/index.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { teamDistrubutionPayOut } from "./service/refferralSystem/refferral.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api", route);

app.get("/testing", async (req, res) => {
    try {
        await teamDistrubutionPayOut(
            670,
            500,
            100,
            "group",
            "group purchase earning"
        );
        return res.status(200).json({ status: "success" });
    } catch (err) {
        return res.status(500).json({ status: "failed" });
    }
});

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Maps to store connected sockets by role and ID
const userSockets = new Map();
const vendorSockets = new Map();
let ecommerceAdminSocket = null;
let mlmAdminSocket = null;

io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    /**
     * Frontend should emit:
     * socket.emit("register", { role: "vendor", userId: "vendor_123" });
     */
    socket.on("register", ({ role, userId }) => {
        if (role === "user") userSockets.set(userId, socket);
        else if (role === "vendor") vendorSockets.set(userId, socket);
        else if (role === "ecommerceAdmin") ecommerceAdminSocket = socket;
        else if (role === "mlmAdmin") mlmAdminSocket = socket;

        console.log(`Registered ${role} with ID: ${userId}`);
    });

    /**
     * When order is placed
     * Frontend should emit:
     * socket.emit("place_order", { vendorId: "vendor_123", orderDetails });
     */
    socket.on("place_order", (orderData) => {
        const { vendorId } = orderData;

        const vendorSocket = vendorSockets.get(vendorId);

        if (vendorSocket) {
            vendorSocket.emit("order_notification", orderData);
            console.log(`Order sent to vendor: ${vendorId}`);
        } else {
            console.log(`Vendor socket not found for ID: ${vendorId}`);
        }

        if (ecommerceAdminSocket) {
            ecommerceAdminSocket.emit("order_notification", orderData);
            console.log(`Order sent to ecommerce admin`);
        } else {
            console.log(`Ecommerce admin socket not connected`);
        }
    });

    socket.on("payment_done", (paymentData) => {
        if (mlmAdminSocket) {
            mlmAdminSocket.emit("payment_notification", paymentData);
            console.log("Payment notification sent to MLM admin");
        } else {
            console.log("MLM admin socket not connected");
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        // Optional: Clean-up logic
    });
});

server.listen(process.env.PORT || 5000, () => {
    console.log("Server listening on port " + process.env.PORT);
});
