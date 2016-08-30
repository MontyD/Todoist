var socketsRouting = function(socket) {
    'use strict';

    socket.on('room', function(room) {
        // on connection socket echos room name,
        // add socket to that name - if not already
        // a member of it
        if (socket.rooms[room] !== room) {
          socket.join(room);
        }
    });
};

module.exports = socketsRouting;
