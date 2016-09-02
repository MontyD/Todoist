'use strict';

class RoomService {

    constructor($http) {
        this.$http = $http;
        this.urlBase = '/rooms/';
    }

    getInfo() {
      return this.$http.get(this.urlBase + 'info');
    }

    logAllOut() {
      return this.$http.delete(this.urlBase + 'log-all-out');
    }

    update(data) {
      return this.$http.put(this.urlBase, data);
    }

}



RoomService.$inject = ['$http'];

module.exports = RoomService;
