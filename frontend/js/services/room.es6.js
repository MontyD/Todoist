'use strict';

class RoomService {

    constructor($http) {
        this.$http = $http;
        this.urlBase = '/rooms/';

        this.roomInfo = {
          name: '',
          isAdmin: false,
          username: ''
        };

        this.cached = false;
    }

    getInfo(callbackSuccess, callbackError) {
      if (this.cached) {
        return callbackSuccess(this.roomInfo);
      }
      this.$http.get(this.urlBase + 'info').then(
        result => {
          this.roomInfo = result.data;
          this.cached = true;
          return callbackSuccess(this.roomInfo);
        },
        error => callbackError(error)
      );
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

    deleteRoom() {
      return this.$http.delete(this.urlBase);
    }

}



RoomService.$inject = ['$http'];

module.exports = RoomService;
