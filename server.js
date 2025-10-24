const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(path.join(__dirname, "public")));

// ✅ Fix for Render root route & deployment
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

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
    if (drawHistory.length > 1000) drawHistory.shift();
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

const PORT = process.env.PORT || 3000; // ✅ Important for Render
http.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
