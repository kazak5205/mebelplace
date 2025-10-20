# Chat API Documentation

## Overview
This document describes the Chat API endpoints and WebSocket events for the MebelPlace real-time chat system.

## Base URL
```
https://mebelplace.com.kz/api/chat
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Create Chat
**POST** `/create`

Creates a new chat room.

**Request Body:**
```json
{
  "participants": ["user_id_1", "user_id_2"],
  "type": "private|group|channel",
  "name": "Chat Name (optional for private chats)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "chat_uuid",
    "type": "private",
    "name": "Chat Name",
    "creator_id": "user_uuid",
    "created_at": "2025-01-20T11:00:00Z"
  },
  "message": "Chat created successfully",
  "timestamp": "2025-01-20T11:00:00Z"
}
```

### 2. Get Chat List
**GET** `/list`

Retrieves all chats for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "chat_uuid",
      "type": "private",
      "name": "Chat Name",
      "unread_count": 5,
      "last_message_at": "2025-01-20T11:00:00Z"
    }
  ],
  "message": "Chats retrieved successfully",
  "timestamp": "2025-01-20T11:00:00Z"
}
```

### 3. Get Chat Messages
**GET** `/:id/messages?page=1&limit=50`

Retrieves messages for a specific chat.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "message_uuid",
      "chat_id": "chat_uuid",
      "sender_id": "user_uuid",
      "content": "Hello world!",
      "type": "text",
      "sender_name": "John Doe",
      "sender_avatar": "avatar_url",
      "created_at": "2025-01-20T11:00:00Z"
    }
  ],
  "message": "Messages retrieved successfully",
  "timestamp": "2025-01-20T11:00:00Z"
}
```

### 4. Send Message
**POST** `/:id/message`

Sends a message to a chat.

**Request Body:**
```json
{
  "content": "Message content",
  "type": "text|image|video|audio|file|sticker|voice",
  "replyTo": "message_uuid (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "message_uuid",
    "chat_id": "chat_uuid",
    "sender_id": "user_uuid",
    "content": "Message content",
    "type": "text",
    "created_at": "2025-01-20T11:00:00Z"
  },
  "message": "Message sent successfully",
  "timestamp": "2025-01-20T11:00:00Z"
}
```

### 5. Upload File
**POST** `/:id/upload`

Uploads a file to a chat.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (file to upload)
- Field: `type` (file type: image|video|audio|file)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "message_uuid",
    "chat_id": "chat_uuid",
    "sender_id": "user_uuid",
    "content": "filename.jpg",
    "type": "image",
    "file_path": "/uploads/images/filename.jpg",
    "file_name": "original_name.jpg",
    "file_size": 1024000,
    "created_at": "2025-01-20T11:00:00Z"
  },
  "message": "File uploaded successfully",
  "timestamp": "2025-01-20T11:00:00Z"
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('https://mebelplace.com.kz', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

#### Client → Server

**join_chat**
```javascript
socket.emit('join_chat', { chatId: 'chat_uuid' });
```

**send_message**
```javascript
socket.emit('send_message', {
  chatId: 'chat_uuid',
  content: 'Hello world!',
  type: 'text',
  replyTo: 'message_uuid' // optional
});
```

**send_voice**
```javascript
socket.emit('send_voice', {
  chatId: 'chat_uuid',
  audioData: 'base64_audio_data',
  duration: 30 // seconds
});
```

**send_photo**
```javascript
socket.emit('send_photo', {
  chatId: 'chat_uuid',
  imageData: 'base64_image_data',
  caption: 'Photo caption' // optional
});
```

**typing_start**
```javascript
socket.emit('typing_start', { chatId: 'chat_uuid' });
```

**typing_stop**
```javascript
socket.emit('typing_stop', { chatId: 'chat_uuid' });
```

**video_call_request**
```javascript
socket.emit('video_call_request', {
  chatId: 'chat_uuid',
  targetUserId: 'user_uuid'
});
```

**video_call_accept**
```javascript
socket.emit('video_call_accept', {
  chatId: 'chat_uuid',
  fromUserId: 'user_uuid'
});
```

**video_call_reject**
```javascript
socket.emit('video_call_reject', {
  chatId: 'chat_uuid',
  fromUserId: 'user_uuid'
});
```

#### Server → Client

**joined_chat**
```javascript
socket.on('joined_chat', (data) => {
  console.log('Joined chat:', data.chatId);
});
```

**new_message**
```javascript
socket.on('new_message', (message) => {
  console.log('New message:', message);
});
```

**user_joined**
```javascript
socket.on('user_joined', (data) => {
  console.log('User joined:', data.userName);
});
```

**typing_start**
```javascript
socket.on('typing_start', (data) => {
  console.log('User typing:', data.userName);
});
```

**typing_stop**
```javascript
socket.on('typing_stop', (data) => {
  console.log('User stopped typing:', data.userName);
});
```

**video_call_request**
```javascript
socket.on('video_call_request', (data) => {
  console.log('Video call request from:', data.fromUserName);
});
```

**video_call_accept**
```javascript
socket.on('video_call_accept', (data) => {
  console.log('Video call accepted by:', data.acceptedBy);
});
```

**video_call_reject**
```javascript
socket.on('video_call_reject', (data) => {
  console.log('Video call rejected by:', data.rejectedBy);
});
```

**message_status**
```javascript
socket.on('message_status', (data) => {
  console.log('Message status:', data.messageId, data.status);
});
```

**error**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});
```

## Error Responses

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "timestamp": "2025-01-20T11:00:00Z"
}
```

## File Upload Limits

- Maximum file size: 50MB
- Allowed image types: JPEG, PNG, GIF, WebP
- Allowed video types: MP4, WebM, QuickTime
- Allowed audio types: MP3, WAV, OGG, WebM
- Allowed document types: PDF, TXT

## Rate Limiting

- API requests: 100 requests per 15 minutes per IP
- File uploads: 10 uploads per 15 minutes per user
- WebSocket connections: 5 concurrent connections per user
