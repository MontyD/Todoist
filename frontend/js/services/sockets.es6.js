'use strict';

class SocketsService {

    constructor($window, $rootScope) {
        this.socket = $window.io.connect();
        this.rootScope = $rootScope;
    }

    on(eventName, callback) {
      this.socket.on(eventName, function () {
        var args = arguments;
        this.rootScope.$apply(function () {
          callback.apply(this.socket, args);
        });
      });
    }

    emit(eventName, data, callback) {
      this.socket.emit(eventName, data, function () {
        var args = arguments;
        this.rootScope.$apply(function () {
          if (callback) {
            callback.apply(this.socket, args);
          }
        });
      });
    }
}



SocketsService.$inject = ['$window', '$rootScope'];

module.exports = SocketsService;
