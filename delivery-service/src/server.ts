
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocket, WebSocketServer } from 'ws';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Create a server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Map to store order rooms (orderId -> Set of connected clients)
const orderRooms = new Map<string, Set<WebSocket>>();

// create a new websocket connection
wss.on('connection', (ws, req) => {
  console.log('New client connected');

  // Extract orderId from URL query parameters
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const orderId = url.searchParams.get('orderId');

  if (!orderId) {
    console.log('No orderId provided, closing connection');
    ws.close(4000, 'No orderId provided');
    return;
  }

  // Add client to the order room
  if (!orderRooms.has(orderId)) {
    orderRooms.set(orderId, new Set());
  }
  orderRooms.get(orderId)?.add(ws);
  console.log(`Client joined order room: ${orderId}`);

  ws.on('message', (data) => {
    try {
      const message = data.toString();
      console.log(`Received message for order ${orderId}: ${message}`);

      // Broadcast the message only to clients in the same order room
      const clients = orderRooms.get(orderId);
      if (clients) {
        clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log(`Client disconnected from order ${orderId}`);
    const clients = orderRooms.get(orderId);
    if (clients) {
      clients.delete(ws);
      // Clean up empty rooms
      if (clients.size === 0) {
        orderRooms.delete(orderId);
        console.log(`Order room ${orderId} closed (no clients)`);
      }
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});