// functional Testing
const http = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

let ioServer, httpServer, httpServerAddr;
let clientSocket1, clientSocket2;

beforeAll((done) => {
  httpServer = http.createServer(); // manual server
  ioServer = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Setup socket behavior
  ioServer.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("send-message", (message) => {
      const roomId = [message.senderId, message.recipientId].sort().join("-");
      socket.to(roomId).emit("receive-message", message);
    });
  });

  httpServer.listen(() => {
    httpServerAddr = httpServer.address();
    const url = `http://localhost:${httpServerAddr.port}`;

    clientSocket1 = Client(url);
    clientSocket2 = Client(url);

    // wait for clients to connect
    let connected = 0;
    [clientSocket1, clientSocket2].forEach((client) => {
      client.on("connect", () => {
        connected++;
        if (connected === 2) done();
      });
    });
  });
});

afterAll(() => {
  ioServer.close();
  httpServer.close();
  clientSocket1.close();
  clientSocket2.close();
});

test("should connect socket clients", () => {
  expect(clientSocket1.connected).toBe(true);
  expect(clientSocket2.connected).toBe(true);
});

test("should join room and receive message", (done) => {
  const message = {
    senderId: "u1",
    recipientId: "u2",
    text: "Hello",
  };

  const roomId = [message.senderId, message.recipientId].sort().join("-");

  clientSocket1.emit("join-room", roomId);
  clientSocket2.emit("join-room", roomId);

  clientSocket2.on("receive-message", (msg) => {
    expect(msg).toEqual(message);
    done();
  });

  clientSocket1.emit("send-message", message);
});
