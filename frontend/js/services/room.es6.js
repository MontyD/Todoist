'use strict';

class RoomService {

    constructor($http) {
        this.$http = $http;
        this.urlBase = '/rooms/';
    }

    logAllOut() {
      return this.$http.delete(this.urlBase + 'log-all-out');
    }

}



RoomService.$inject = ['$http'];

module.exports = RoomService;
