🧠 Real-Time Collaborative Whiteboard

A real-time collaborative whiteboard built with Node.js, Express, and Socket.IO that allows multiple users to draw, write, and collaborate together on a shared canvas — all live!
Users can select tools like pen, marker, or highlighter, adjust color and brush size, and even see who’s drawing in real time.

🚀 Live Demo

👉 View Live on Render

💡 Features

✅ Real-time multi-user drawing using Socket.IO
✅ Supports pen, marker, and highlighter tools
✅ Color picker and brush size adjustment
✅ Undo / Redo / Clear options
✅ Displays who is drawing in real time
✅ Works seamlessly on desktop and mobile
✅ Simple, clean, responsive interface
✅ Securely deployed on Render

🛠️ Tech Stack
Category	Technology
Frontend	HTML, CSS, JavaScript
Backend	Node.js, Express.js
Real-Time Communication	Socket.IO
Deployment	Render
Version Control	Git & GitHub
🧩 How It Works

When a user joins, they enter a username.

Every drawing action (pen strokes, marker, highlighter) is emitted through Socket.IO.

All connected clients instantly receive and render the updates.

The system also synchronizes undo/redo and clear events.

A floating status displays who is drawing in real time.

🖥️ Local Setup

If you’d like to run it locally on your system:

# Clone the repository
git clone https://github.com/sarahsonia/realtime-whiteboard.git
cd realtime-whiteboard

# Install dependencies
npm install

# Start the server
node server.js

# Visit the app
http://localhost:3000


💫 Future Enhancements

Add user cursor positions for live tracking

Save and download whiteboard drawings

Add authentication for private rooms

Implement voice or chat integration

👩‍💻 Author

Sarah Sonia
B.Tech CSE 
🌍 Hyderabad, Telangana

📧kattasarahsonia@gmail.com
💼[Linkedin](https://www.linkedin.com/in/sarah-sonia-katta-434513283/)

🪄 License

This project is licensed under the MIT License — feel free to use and modify.

🌟 Star this repo

If you like this project or found it helpful, don’t forget to ⭐ it on GitHub — it helps others find it too!