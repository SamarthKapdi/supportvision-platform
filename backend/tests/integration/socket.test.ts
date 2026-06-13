import { createServer } from 'http';
import { Server } from 'socket.io';
import Client from 'socket.io-client';
import { AddressInfo } from 'net';
import jwt from 'jsonwebtoken';
// Import your actual socket handler initialization
// import { setupSockets } from '../../src/sockets'; 

describe('Socket Integration Tests', () => {
  let io: Server;
  let clientSocket: any;
  let serverSocket: any;
  let port: number;

  const validToken = jwt.sign({ id: 'user-1', role: 'CUSTOMER' }, 'test-secret');

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    
    // Mock socket setup
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      try {
        jwt.verify(token, 'test-secret');
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      serverSocket = socket;
      
      socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        io.to(roomId).emit('participantJoined', { id: socket.id });
      });

      socket.on('sendMessage', (data) => {
        io.to(data.roomId).emit('receiveMessage', { text: data.text, from: socket.id });
      });

      socket.on('heartbeat', () => {
        socket.emit('heartbeatAck');
      });
    });

    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      done();
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  it('Should reject connection without token', (done) => {
    const badClient = Client(`http://localhost:${port}`);
    badClient.on('connect_error', (err) => {
      expect(err.message).toBe('Authentication error');
      badClient.close();
      done();
    });
  });

  it('Should connect with valid token', (done) => {
    clientSocket = Client(`http://localhost:${port}`, {
      auth: { token: validToken }
    });
    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });
  });

  it('Should join session room and broadcast participant events', (done) => {
    clientSocket.emit('joinRoom', 'room-123');
    clientSocket.on('participantJoined', (data: any) => {
      expect(data.id).toBeDefined();
      done();
    });
  });

  it('Should send and receive chat messages', (done) => {
    clientSocket.emit('sendMessage', { roomId: 'room-123', text: 'Hello World' });
    clientSocket.on('receiveMessage', (data: any) => {
      expect(data.text).toBe('Hello World');
      expect(data.from).toBeDefined();
      done();
    });
  });

  it('Should handle heartbeat', (done) => {
    clientSocket.emit('heartbeat');
    clientSocket.on('heartbeatAck', () => {
      expect(true).toBe(true);
      done();
    });
  });
});
