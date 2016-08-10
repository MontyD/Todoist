'use strict';

class TasksService {

    constructor($http) {
        this.$http = $http;
        this.urlBase = '/tasks/';
    }

    create(reqTask) {
        return this.$http.post(this.urlBase, {
            task: reqTask
        });
    }

    read(id, start, limit) {
        let requestURL = this.urlBase;
        if (typeof id === 'number') {
            requestURL += id;
        }
        requestURL += '?';
        if (start) {
            requestURL += 'start=' + start + '&';
        }
        if (limit) {
            requestURL += 'limit=' + limit;
        }
        if (requestURL.substr(requestURL.length - 1) === '&' || requestURL.substr(requestURL.length - 1) === '?') {
          requestURL = requestURL.substr(0, requestURL.length - 1);
        }

        return this.$http.get(requestURL);
    }

    update(reqTaskId, reqTask, reqUserInitiated) {
        return this.$http.put(this.urlBase + reqTaskId, {
            task: reqTask
        });
    }

    destroy(reqTaskId) {
        return this.$http.delete(this.urlBase + reqTaskId);
    }



}



TasksService.$inject = ['$http'];

module.exports = TasksService;
