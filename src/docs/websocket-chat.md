# Chat WebSocket Contract

**Namespace:** `/chat`

---

## 1. Authentication

Pass the JWT using one of the following methods during the handshake.

### Option 1: Socket.io Auth (Recommended)

```json
{
  "auth": {
    "token": "JWT_ACCESS_TOKEN"
  }
}
```

### Option 2: Handshake Headers

`Authorization: Bearer <token>`

---

## 2. Client-to-Server Events (Emit)

### **Event:** `joinRoom`

_Join a specific chat room to start receiving messages._

```json
{
  "chatRoomId": "string"
}
```

### **Event:** `sendMessage`

_Sends a message to a specific room._

```json
{
  "chatRoomId": "string",
  "content": "string"
}
```

### **Event:** `typing`

_Notifies others that the user is currently typing._

```json
{
  "chatRoomId": "string"
}
```

---

## 3. Server-to-Client Events (Listen)

### **Event:** `messageReceived`

_Triggered when a new message is posted to a room._

```json
{
  "id": "string",
  "chatRoomId": "string",
  "senderId": "string",
  "senderRole": "ORG | REPORTER",
  "content": "string",
  "createdAt": "ISO-8601 Date String"
}
```

### **Event:** `userTyping`

```json
{
  "userId": "string",
  "isTyping": boolean
}
```

### WebSocket

URL: https://broach-api.onrender.com/chat
Auth: JWT via socket.auth.token

Events:

- joinRoom { chatRoomId }
- sendMessage { chatRoomId, content }
- typing { chatRoomId }

Server events:

- joinedRoom
- messageReceived
- userTyping

---

## 📜 Business Rules

1. **Order of Operations:** You must successfully emit `joinRoom` before you can send or receive messages for that room.
2. **Authorization:** Only participants added to the room can join/send messages (handled by `WsJwtGuard`).
3. **Persistence:** All messages are persisted in the database before being broadcast.
4. **Validation:** Closed conversations will reject any `sendMessage` attempts with a `WsException`.
