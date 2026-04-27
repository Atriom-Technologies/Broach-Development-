import { io } from 'socket.io-client';

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjA4NGU3NC02MzIxLTRkYmQtYmFmYi01NDFhZGJjYTUyM2QiLCJlbWFpbCI6Imp1c3RpbmVlZUBleGFtcGxlLmNvbSIsInVzZXJUeXBlIjoicmVxdWVzdGVyX3JlcG9ydGVyIiwic2Vzc2lvbklkIjoiZWJjNGFiNTItOTI1Ni00NTM5LWEwN2QtOWI1NzQ1YWZlYWExIiwiaWF0IjoxNzc3Mjg5NjY4LCJleHAiOjE3Nzc4OTQ0Njh9.V-2JPblVkecxB0rAuqF1v7SwTLnbMCVcF4kZ_329fQc';

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
    content: 'Thank you. I need to explain something',
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
