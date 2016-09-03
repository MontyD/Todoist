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

    updatePasscode(data) {
      return this.$http.put(this.urlBase + 'update-passcode', data);
    }

    updateAdminPassword(data) {
      return this.$http.put(this.urlBase + 'update-admin-password', data);
    }

}



RoomService.$inject = ['$http'];

module.exports = RoomService;
