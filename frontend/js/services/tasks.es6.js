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

    read(id, start, limit, asAdmin) {
        let requestURL = this.urlBase;
        if (id) {
            requestURL += id;
        }
        requestURL += '?';
        if (asAdmin) {
            requestURL += 'all=true&';
        }
        if (start) {
            requestURL += 'start=' + start + '&';
        }
        if (limit) {
            requestURL += 'limit=' + limit;
        }
        return this.$http.get(this.urlBase + id);
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
