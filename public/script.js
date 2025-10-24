const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const socket = io();

canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 150;

let drawing = false;
let tool = "pen";
let color = "#000000";
let size = 5;
let lastX = 0, lastY = 0;
let history = [];
let redoStack = [];
let username = prompt("Enter your name:");

// UI elements
const colorPicker = document.getElementById("colorPicker");
const sizePicker = document.getElementById("sizePicker");
const clearBtn = document.getElementById("clearBtn");
const penBtn = document.getElementById("penBtn");
const markerBtn = document.getElementById("markerBtn");
const highlighterBtn = document.getElementById("highlighterBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const popupBtn = document.getElementById("popupToggle");
const popup = document.getElementById("userPopup");
const userList = document.getElementById("userList");
const status = document.getElementById("status");

popupBtn.addEventListener("click", () => popup.classList.toggle("hidden"));
socket.emit("setUsername", username);

// Canvas setup
ctx.lineCap = "round";
ctx.lineJoin = "round";

function saveState() {
  if (history.length > 20) history.shift();
  history.push(canvas.toDataURL());
  redoStack = [];
}

function startPosition(e) {
  drawing = true;
  [lastX, lastY] = [e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop];
  saveState();
}

function endPosition() {
  drawing = false;
  ctx.beginPath();
  socket.emit("userDrawing", ""); // clear status
}

function draw(e) {
  if (!drawing) return;
  const currentX = e.clientX - canvas.offsetLeft;
  const currentY = e.clientY - canvas.offsetTop;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(currentX, currentY);
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.globalAlpha = tool === "pen" ? 1 : tool === "marker" ? 0.6 : 0.3;
  if (tool === "highlighter") ctx.lineWidth = size * 3;
  ctx.stroke();

  socket.emit("draw", { x0: lastX, y0: lastY, x1: currentX, y1: currentY, color, size, tool, username });

  [lastX, lastY] = [currentX, currentY];
}

socket.on("initDrawHistory", (history) => {
  history.forEach((data) => drawLine(data));
});

socket.on("draw", (data) => drawLine(data));

socket.on("redrawAll", (data) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  data.forEach((d) => drawLine(d));
});

socket.on("clear", () => ctx.clearRect(0, 0, canvas.width, canvas.height));

socket.on("userDrawing", (user) => {
  status.textContent = user ? `${user} is drawing...` : "";
});

socket.on("updateUsers", (users) => {
  userList.innerHTML = "";
  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = u;
    userList.appendChild(li);
  });
});

function drawLine(data) {
  ctx.beginPath();
  ctx.moveTo(data.x0, data.y0);
  ctx.lineTo(data.x1, data.y1);
  ctx.strokeStyle = data.color;
  ctx.lineWidth = data.size;
  ctx.globalAlpha = data.tool === "pen" ? 1 : data.tool === "marker" ? 0.6 : 0.3;
  if (data.tool === "highlighter") ctx.lineWidth = data.size * 3;
  ctx.stroke();
}

// Button events
undoBtn.addEventListener("click", () => socket.emit("undo"));
redoBtn.addEventListener("click", () => socket.emit("redo", redoStack));
colorPicker.addEventListener("change", (e) => (color = e.target.value));
sizePicker.addEventListener("change", (e) => (size = e.target.value));
clearBtn.addEventListener("click", () => socket.emit("clear"));
penBtn.addEventListener("click", () => (tool = "pen"));
markerBtn.addEventListener("click", () => (tool = "marker"));
highlighterBtn.addEventListener("click", () => (tool = "highlighter"));

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", endPosition);
canvas.addEventListener("mousemove", draw);
