var socketsRouting = function(socket) {
    'use strict';
    console.log('new user');

    socket.on('room', function(room) {
      console.log('joining: ' + room);
       socket.join(room);
   });

    socket.on('disconnect', function() {
        console.log('user left');
    });
};

module.exports = socketsRouting;
