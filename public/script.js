const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const socket = io();

canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 150;

let drawing = false;
let tool = "pen";
let color = "#000000";
let size = 5;
let lastX = 0;
let lastY = 0;
let undoStack = [];
let redoStack = [];

const colorPicker = document.getElementById("colorPicker");
const sizePicker = document.getElementById("sizePicker");
const clearBtn = document.getElementById("clearBtn");
const penBtn = document.getElementById("penBtn");
const markerBtn = document.getElementById("markerBtn");
const highlighterBtn = document.getElementById("highlighterBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const status = document.getElementById("status");

// Ask for username
let username = prompt("Enter your name:");
socket.emit("setUsername", username);

ctx.lineCap = "round";
ctx.lineJoin = "round";

function startDrawing(x, y) {
  drawing = true;
  [lastX, lastY] = [x, y];
  saveState();
}

function endDrawing() {
  drawing = false;
  ctx.beginPath();
}

function drawLine(x, y) {
  if (!drawing) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = tool === "highlighter" ? size * 3 : size;
  ctx.globalAlpha =
    tool === "marker" ? 0.5 : tool === "highlighter" ? 0.3 : 1;
  ctx.stroke();

  socket.emit("draw", {
    x0: lastX,
    y0: lastY,
    x1: x,
    y1: y,
    color,
    size,
    tool,
  });

  [lastX, lastY] = [x, y];
}

function saveState() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 20) undoStack.shift();
}

function undo() {
  if (undoStack.length > 0) {
    redoStack.push(undoStack.pop());
    let imgData = undoStack[undoStack.length - 1];
    let img = new Image();
    img.src = imgData;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    socket.emit("undo");
  }
}

function redo() {
  if (redoStack.length > 0) {
    let imgData = redoStack.pop();
    let img = new Image();
    img.src = imgData;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    socket.emit("redo", [imgData]);
  }
}

// Mouse Events
canvas.addEventListener("mousedown", (e) =>
  startDrawing(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)
);
canvas.addEventListener("mouseup", endDrawing);
canvas.addEventListener("mousemove", (e) =>
  drawLine(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop)
);

// Touch Events
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  startDrawing(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
});
canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  drawLine(touch.clientX - canvas.offsetLeft, touch.clientY - canvas.offsetTop);
});
canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  endDrawing();
});

// Socket listeners
socket.on("draw", (data) => {
  ctx.beginPath();
  ctx.moveTo(data.x0, data.y0);
  ctx.lineTo(data.x1, data.y1);
  ctx.strokeStyle = data.color;
  ctx.lineWidth = data.tool === "highlighter" ? data.size * 3 : data.size;
  ctx.globalAlpha =
    data.tool === "marker" ? 0.5 : data.tool === "highlighter" ? 0.3 : 1;
  ctx.stroke();
});

socket.on("clear", () => ctx.clearRect(0, 0, canvas.width, canvas.height));
socket.on("undo", () => undo());
socket.on("redo", (data) => redo(data));

// Show who is drawing
socket.on("userDrawing", (name) => {
  status.textContent = `${name} is drawing...`;
  status.classList.add("show");
  clearTimeout(window.statusTimer);
  window.statusTimer = setTimeout(() => {
    status.classList.remove("show");
  }, 1000);
});

// Toolbar
colorPicker.addEventListener("change", (e) => (color = e.target.value));
sizePicker.addEventListener("change", (e) => (size = e.target.value));
clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit("clear");
});
penBtn.addEventListener("click", () => (tool = "pen"));
markerBtn.addEventListener("click", () => (tool = "marker"));
highlighterBtn.addEventListener("click", () => (tool = "highlighter"));
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);
