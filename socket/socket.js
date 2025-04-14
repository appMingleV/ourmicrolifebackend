import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store connected sockets
const userSockets = new Map();
const vendorSockets = new Map();
let ecommerceAdminSocket = null;
let mlmAdminSocket = null;

// Emits notification to all
const emitNotification = (notification) => {
  io.emit("new_notification", notification);
};

// Emit register event to clients (not used typically server-side)
const registermlmadmin = () => {
  io.emit("register", { role: "mlmAdmin", userId: 1 });
};
const registerecommerceAdmin = () => {
  io.emit("register", { role: "ecommerceAdmin", userId: 10 });
};

// Handle socket connection
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  // Register role and save socket reference
  socket.on("register", ({ role, userId }) => {
    socket.userId = userId; // ✅ Attach userId for later reference
    console.log(role, userId);

    if (role === "user") {
      userSockets.set(userId, socket);
      // console.log(object);
    } else if (role === "vendor") vendorSockets.set(userId, socket);
    else if (role === "ecommerceAdmin") ecommerceAdminSocket = socket;
    else if (role === "mlmAdmin") mlmAdminSocket = socket;

    console.log(`Registered ${role} with ID: ${userId}`);
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    for (let [id, s] of userSockets.entries()) {
      if (s === socket) {
        userSockets.delete(id);
        console.log(`User disconnected: ${id}`);
      }
    }

    for (let [id, s] of vendorSockets.entries()) {
      if (s === socket) {
        vendorSockets.delete(id);
        console.log(`Vendor disconnected: ${id}`);
      }
    }

    if (socket === ecommerceAdminSocket) {
      ecommerceAdminSocket = null;
      console.log("Ecommerce admin disconnected");
    }

    if (socket === mlmAdminSocket) {
      mlmAdminSocket = null;
      console.log("MLM admin disconnected");
    }
  });
});

// Notify MLM Admin (if connected)
const paymentNotification =async (userId, name) => {
  if (mlmAdminSocket) {
    console.log(`Socket id -> ${mlmAdminSocket.userId}`);
    mlmAdminSocket.emit("notify", name); // ✅ Use socket directly
    console.log(`Notification sent to mlmAdmin`);
  } else {
    console.log("mlm admin not connected");
  }
};
// Notify vendor and ecommerce admin (if connected)
const OrderNotification = async(userId, vendorId) => {
  console.log("userId", userId, "vendorId", vendorId);
  const vendorSocket = vendorSockets.get(vendorId);
  console.log("vendorSocket", vendorSocket?.id); // To confirm it's defined

  if (vendorSocket) {
    vendorSocket.emit("order-recieve", userId); // ✅ Corrected here
    console.log(`Order notification sent to vendor: ${vendorId}`);
  } else {
    console.log(`Vendor ${vendorId} not connected`);
  }

  if (ecommerceAdminSocket) {
    ecommerceAdminSocket.emit("order-recieve-to-vendor", vendorId);
    console.log("Notification sent to ecommerce admin");
  } else {
    console.log("Ecommerce admin not connected");
  }
};

export {
  app,
  server,
  paymentNotification,
  OrderNotification,
  registermlmadmin,
  emitNotification,
  registerecommerceAdmin,
};
