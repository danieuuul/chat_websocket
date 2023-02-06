import "reflect-metadata";

import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

const app = express();

const server = createServer(app);

mongoose.connect("mongodb://localhost:27017/rocket_socket");

app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/imgs", express.static("imgs"));

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Socket:", socket.id);
});

app.get("/", (request, response) => {
  return response.json({
    message: "Hello websocket",
  });
});

export { server, io };
