const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let users = {};
let drawHistory = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("setUsername", (username) => {
    users[socket.id] = username;
    console.log(`${username} joined the whiteboard`);
    io.emit("updateUsers", Object.values(users));
    socket.emit("initDrawHistory", drawHistory);
  });

  socket.on("draw", (data) => {
    drawHistory.push(data);
    if (drawHistory.length > 1000) drawHistory.shift(); // limit history size
    io.emit("draw", data);
    if (users[socket.id]) {
      io.emit("userDrawing", users[socket.id]);
    }
  });

  socket.on("clear", () => {
    drawHistory = [];
    io.emit("clear");
    console.log("Board cleared");
  });

  socket.on("undo", () => {
    drawHistory.pop();
    io.emit("redrawAll", drawHistory);
  });

  socket.on("redo", (data) => {
    drawHistory.push(...data);
    io.emit("redrawAll", drawHistory);
  });

  socket.on("disconnect", () => {
    console.log(`${users[socket.id]} disconnected`);
    delete users[socket.id];
    io.emit("updateUsers", Object.values(users));
  });
});

http.listen(3000, () => console.log("Server running on http://localhost:3000"));
