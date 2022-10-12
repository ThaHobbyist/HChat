const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messagesRoute = require("./routes/messagesRoute");
const socket = require("socket.io");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/message", messagesRoute);

mongoose
	.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("Db connection successfull");
	})
	.catch((e) => {
		console.log(e.message);
	});

const server = app.listen(process.env.PORT, () => {
	console.log(`Server started on port: ${process.env.PORT}`);
});

const io = socket(server, {
	cors: {
		origin: process.env.FRONTEND_HOST,
		credentials: true,
	},
});

global.onlineUsers = new Map();
const users = {};
io.on("connection", (socket) => {
	global.chatSocket = socket;

	socket.on("connected", (userId) => {
		users[userId] = socket.id;
		io.emit("updateUserStatus", users);
		console.log(`User Connected: ${userId}`);
	});

	socket.on("disconnected", () => {
		io.emit("updateUserStatus", users);
		console.log("User Disconnected");
	});

	socket.on("add-user", (userId) => {
		onlineUsers.set(userId, socket.id);
	});

	socket.on("send-msg", (data) => {
		const sendUserSocket = onlineUsers.get(data.to);
		if (sendUserSocket) {
			socket.to(sendUserSocket).emit("msg-recieve", data.message);
		}
	});
});
