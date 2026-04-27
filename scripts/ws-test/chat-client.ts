import { io } from 'socket.io-client';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4MTU3M2E4NS0yOWJjLTQwNDAtYjcyYi01NTY1ODg2NjZhNDAiLCJlbWFpbCI6Imp1c3RpbmZvdWRhdGlvbkBleGFtcGxlLmNvbSIsInVzZXJUeXBlIjoic3VwcG9ydF9vcmdhbml6YXRpb24iLCJzZXNzaW9uSWQiOiJjYzk4ZjYyOC0xMmJkLTQ4OWQtYjE2ZC0yMmFiNWFmMDg4YzgiLCJpYXQiOjE3NzcyOTA0OTIsImV4cCI6MTc3Nzg5NTI5Mn0.BjvD3ikjWCCXaQRUi9qww0Q6Ps0M5N86lEqTYKZHIL0';

const socket = io('http://localhost:3000/chat', {
  extraHeaders: {
    Authorization: `Bearer ${token}`, // Sends it in the initial HTTP Upgrade request
  },
  auth: {
    token,
  },
});

// log EVERYTHING (important for debugging)
socket.onAny((event, data) => {
  console.log('[EVENT]', event, data);
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);

  socket.emit('joinRoom', {
    chatRoomId: '62720bc8-969b-4325-a5da-df72d6ead413',
  });
});

// confirm room join
socket.on('joinedRoom', (data) => {
  console.log('Joined room:', data);

  socket.emit('sendMessage', {
    chatRoomId: '62720bc8-969b-4325-a5da-df72d6ead413',
    content: 'Client, please go on. i read your messages',
  });
});

// messages from others / self
socket.on('messageReceived', (msg) => {
  console.log('Message received:', msg);
});

// typing indicator
socket.on('userTyping', (data) => {
  console.log('Typing:', data);
});

// critical error debugging
socket.on('connect_error', (err) => {
  console.log('Connection error:', err.message);
});
