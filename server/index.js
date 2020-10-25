const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const webSocketTypes = {
  CONNECTION: 'connection',
  NEW_MESSAGE: 'new_message',
};

const signedUpUsers = {};

const getUser = (userId) => {
  const user = { ...signedUpUsers[userId] };
  delete user.password;

  return user;
};

const messagesList = [];

const app = express();

const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());

const webSocketServer = new WebSocket.Server({ server });

webSocketServer.on('connection', (ws) => {
  ws.on('message', (m) => {
    webSocketServer.clients.forEach((client) => {
      const { userId, message } = JSON.parse(m);

      const newMessage = {
        id: uuidv4(),
        user: getUser(userId),
        message,
        date: new Date().toISOString(),
      };

      messagesList.push(newMessage);

      client.send(
        JSON.stringify({
          type: webSocketTypes.NEW_MESSAGE,
          payload: {
            newMessage,
          },
        })
      );
    });
  });

  ws.on('error', (e) => ws.send(e));

  ws.send(
    JSON.stringify({
      type: webSocketTypes.CONNECTION,
      payload: {
        messages: messagesList,
      },
    })
  );
});

app.post('/signup', async (req, res) => {
  const { body } = req;
  const { name, password } = body;
  const newUserId = uuidv4();

  const newUser = {
    id: newUserId,
    name,
    password,
  };

  signedUpUsers[newUserId] = newUser;

  res.json(getUser(newUserId));
});

server.listen(9007, () => console.log('Chat server started'));
