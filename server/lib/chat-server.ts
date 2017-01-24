import * as socketio from 'socket.io';

const nickNames = Object.create(null);
const currentRoom = Object.create(null);

let io;
let guestNumber = 1;

const chatServerListen = (server) => {
  io = socketio.listen(server);
  io.sockets.on('connection', socket => {
    assignName(socket);
    joinRoom(socket, 'Lobby');

    socket.on('nameAttempt', name => assignName(socket, name));

    socket.on('join', room => {
      socket.leave(currentRoom[socket.id]);
      joinRoom(socket, room.newRoom);
    });

    socket.on('message', message => {
      socket.broadcast.to(message.room).emit('message', {
        text: `${nickNames[socket.id]}: ${message.text}`
      });
    });

    socket.on('rooms', () => {
      socket.emit(
        'rooms',
        Object
          .keys(io.of('/').adapter.rooms)
          .filter(room => {
             return room !== '' && !Object.keys(nickNames).some(id => id === room);
          })
      );
    });

    socket.on('disconnect', () => delete nickNames[socket.id]);
  });
};

function assignName(socket, name?) {
  const result: any = Object.create(null);
  result.success = false;
  if (name && name.startsWith('Guest')) {
    result.message = 'Names cannot begin with "Guest".';
  } else if (name && isUsed(name)) {
    result.message = 'That name is already in use.';
  } else {
    if (nickNames[socket.id] === undefined) {
      name = `Guest${guestNumber++}`;
    } else {
      socket
        .broadcast
        .to(currentRoom[socket.id])
        .emit('message', {
          text: `${nickNames[socket.id]} is now known as ${name}.`
        });
    }
    nickNames[socket.id] = result.name = name;
    result.success = true;
  }
  socket.emit('nameResult', result);
}

function joinRoom(socket, room) {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit('joinResult', {
    success: true,
    room: room
  });

  socket
    .broadcast
    .to(room)
    .emit('message', {
      text: `${nickNames[socket.id]} has joined ${room}.`
    });

  const usersInRoom = io.sockets.adapter.rooms[room].sockets;
  const usersInRoomIds = Object.keys(usersInRoom);
  if (usersInRoomIds.length > 1) {
    socket.emit('message', {
      text: usersInRoomIds
              .reduce((users, id, index) => {
                return users += usersInRoom[id] !== socket.id ?
                  (index ? ', ' : '') + nickNames[id] :
                  '';
              }, `Users currently in ${room}: `) + '.'
    });
  }
}

function isUsed(name) {
  for (const id in nickNames) {
    if (nickNames[id] === name) { return true; }
  }
  return false;
}

export = chatServerListen;
