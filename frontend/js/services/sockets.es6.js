'use strict';

class SocketsService {

    constructor($window) {
        this.socket = $window.io.connect($window.location.origin);
        this.subscriptions = [];
        this.hash = Math.random().toString(36).substring(12);
    }

    getHash() {
      return this.hash;
    }

    on(eventName, callback) {
      let alreadySubscribed = this.subscriptions.indexOf(eventName) > -1;
      if (!alreadySubscribed) {
        this.subscriptions.push(eventName);
      } else {
        this.socket.off(eventName);
      }
      this.socket.on(eventName, function(data) {
        if (data.hash === this.hash) {
          return;
        }
        return callback(data);
      });
    }

    emit(eventName, data, callback) {
        this.socket.emit(eventName, data, function() {
            var args = arguments;
            if (callback) {
                callback.apply(this.socket, args);
            }
        });
    }
}

SocketsService.$inject = ['$window'];

module.exports = SocketsService;
