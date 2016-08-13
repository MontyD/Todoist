'use strict';

class SocketsService {

    constructor($window, $rootScope) {
        this.socket = $window.io.connect($window.location.origin);
        this.$rootScope = $rootScope;
    }

    on(eventName, callback) {
        this.socket.on(eventName, function() {
            var args = arguments;
            callback.apply(this.socket, args);
        });
    }

    emit(eventName, data, callback) {
      console.log(eventName);
      console.log(data);
        this.socket.emit(eventName, data, function() {
            var args = arguments;
            if (callback) {
                callback.apply(this.socket, args);
            }
        });
    }
}



SocketsService.$inject = ['$window', '$rootScope'];

module.exports = SocketsService;
