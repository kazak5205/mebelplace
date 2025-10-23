#!/usr/bin/env node

/**
 * MebelPlace WebSocket Test Script
 * Real program for testing WebSocket connections
 */

const { io } = require('socket.io-client');

// Configuration
const SERVER_URL = 'https://mebelplace.com.kz';
const JWT_TOKEN = process.env.JWT_TOKEN || 'your_jwt_token_here';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// Check if JWT token is provided
if (JWT_TOKEN === 'your_jwt_token_here') {
    logError('Please set JWT_TOKEN environment variable');
    logInfo('Usage: JWT_TOKEN=your_token node test-websocket.js');
    process.exit(1);
}

logInfo('Starting MebelPlace WebSocket test...');
logInfo(`Server: ${SERVER_URL}`);
logInfo(`Token: ${JWT_TOKEN.substring(0, 20)}...`);

// Create socket connection
const socket = io(SERVER_URL, {
    auth: {
        token: JWT_TOKEN
    },
    transports: ['websocket', 'polling']
});

let testChatId = null;
let messageCount = 0;

// Connection events
socket.on('connect', () => {
    logSuccess('Connected to server');
    
    // Test 1: Join a test chat
    testChatId = 'test-chat-' + Date.now();
    logInfo(`Joining test chat: ${testChatId}`);
    socket.emit('join_chat', { chatId: testChatId });
});

socket.on('disconnect', (reason) => {
    logWarning(`Disconnected: ${reason}`);
});

socket.on('connect_error', (error) => {
    logError(`Connection error: ${error.message}`);
    process.exit(1);
});

// Chat events
socket.on('joined_chat', (data) => {
    logSuccess(`Joined chat: ${data.chatId}`);
    
    // Test 2: Send a text message
    setTimeout(() => {
        logInfo('Sending test message...');
        socket.emit('send_message', {
            chatId: testChatId,
            content: 'Hello from WebSocket test!',
            type: 'text'
        });
    }, 1000);
    
    // Test 3: Test typing indicators
    setTimeout(() => {
        logInfo('Testing typing indicators...');
        socket.emit('typing_start', { chatId: testChatId });
        
        setTimeout(() => {
            socket.emit('typing_stop', { chatId: testChatId });
        }, 2000);
    }, 2000);
    
    // Test 4: Test voice message
    setTimeout(() => {
        logInfo('Testing voice message...');
        socket.emit('send_voice', {
            chatId: testChatId,
            audioData: 'base64_audio_data_here',
            duration: 5
        });
    }, 4000);
    
    // Test 5: Test photo message
    setTimeout(() => {
        logInfo('Testing photo message...');
        socket.emit('send_photo', {
            chatId: testChatId,
            imageData: 'base64_image_data_here',
            caption: 'Test photo'
        });
    }, 6000);
    
    // Test 6: Test video call request
    setTimeout(() => {
        logInfo('Testing video call request...');
        socket.emit('video_call_request', {
            chatId: testChatId,
            targetUserId: 'test-user-id'
        });
    }, 8000);
    
    // End test after 10 seconds
    setTimeout(() => {
        logInfo('Test completed, disconnecting...');
        socket.disconnect();
        process.exit(0);
    }, 10000);
});

socket.on('new_message', (message) => {
    messageCount++;
    logSuccess(`Received message #${messageCount}: ${message.content}`);
    logInfo(`From: ${message.senderName || 'Unknown'}`);
    logInfo(`Type: ${message.type}`);
});

socket.on('user_joined', (data) => {
    logInfo(`User joined: ${data.userName}`);
});

socket.on('user_left', (data) => {
    logInfo(`User left: ${data.userName}`);
});

socket.on('typing_start', (data) => {
    logInfo(`User typing: ${data.userName}`);
});

socket.on('typing_stop', (data) => {
    logInfo(`User stopped typing: ${data.userName}`);
});

socket.on('video_call_request', (data) => {
    logInfo(`Video call request from: ${data.fromUserName}`);
    
    // Auto-accept for testing
    setTimeout(() => {
        socket.emit('video_call_accept', {
            chatId: data.chatId,
            fromUserId: data.fromUserId
        });
    }, 1000);
});

socket.on('video_call_accept', (data) => {
    logSuccess(`Video call accepted by: ${data.acceptedBy}`);
});

socket.on('video_call_reject', (data) => {
    logWarning(`Video call rejected by: ${data.rejectedBy}`);
});

socket.on('message_status', (data) => {
    logInfo(`Message status: ${data.messageId} - ${data.status}`);
});

socket.on('error', (error) => {
    logError(`Socket error: ${error.message}`);
});

// Handle process termination
process.on('SIGINT', () => {
    logInfo('Received SIGINT, disconnecting...');
    socket.disconnect();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logInfo('Received SIGTERM, disconnecting...');
    socket.disconnect();
    process.exit(0);
});

// Timeout after 30 seconds
setTimeout(() => {
    logWarning('Test timeout reached');
    socket.disconnect();
    process.exit(1);
}, 30000);

logInfo('WebSocket test started. Press Ctrl+C to stop.');
