var socketsRouting = function(socket) {
    'use strict';

    socket.on('room', function(room) {
        // on connection socket echos room name,
        // add socket to that name
        socket.join(room);
    });
};

module.exports = socketsRouting;
