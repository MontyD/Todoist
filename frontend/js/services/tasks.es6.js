'use strict';

class TasksService {

    constructor($http) {
        this.$http = $http;
        this.urlBase = '/tasks/';
    }

    create(reqTask, hash) {
        return this.$http.post(this.urlBase, {
            task: reqTask,
            hash: hash
        });
    }

    read(id, start, limit, status, initial) {
        let requestURL = this.urlBase;
        // ID is not part of query sting
        if (typeof id === 'number') {
            requestURL += id;
        }
        // begin query string
        requestURL += '?';
        if (initial) {
            requestURL += 'initial=true&';
        }
        if (start) {
            requestURL += 'start=' + start + '&';
        }
        if (limit) {
            requestURL += 'limit=' + limit + '&';
        }
        if (status) {
          requestURL += 'status=' + status;
        }
        if (requestURL.substr(requestURL.length - 1) === '&' || requestURL.substr(requestURL.length - 1) === '?') {
            requestURL = requestURL.substr(0, requestURL.length - 1);
        }

        return this.$http.get(requestURL);
    }

    update(reqTaskId, reqTask, hash) {
        return this.$http.put(this.urlBase + reqTaskId, {
            task: reqTask,
            hash: hash
        });
    }

    destroy(reqTaskId, hash) {
        return this.$http.delete(this.urlBase + reqTaskId + '?hash=' + hash);
    }

    countTodos() {
      return this.$http.get(this.urlBase + 'todo-count');
    }

    countCompletedLastDay() {
      return this.$http.get(this.urlBase + 'completed-last-day');
    }

    countCompleted() {
      return this.$http.get(this.urlBase + 'completed-count');
    }

}



TasksService.$inject = ['$http'];

module.exports = TasksService;
