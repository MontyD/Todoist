'use strict';

class TodoListsService {

    constructor($http) {
        this.$http = $http;
        this.urlBase = '/todo-lists/';
    }

    create(name, hash) {
        return this.$http.post(this.urlBase, {
            name: name,
            hash: hash
        });
    }

    read(id, start, limit) {
        let requestURL = this.urlBase;
        // ID is not part of query sting
        if (typeof id === 'number') {
            requestURL += id;
        }
        // begin query string
        requestURL += '?';
        if (start) {
            requestURL += 'start=' + start + '&';
        }
        if (limit) {
            requestURL += 'limit=' + limit + '&';
        }
        if (requestURL.substr(requestURL.length - 1) === '&' || requestURL.substr(requestURL.length - 1) === '?') {
            requestURL = requestURL.substr(0, requestURL.length - 1);
        }

        return this.$http.get(requestURL);
    }

    update(reqListId, reqName, hash) {
        return this.$http.put(this.urlBase + reqListId, {
            todoList: {
              name: reqName
            },
            hash: hash
        });
    }

    destroy(reqTaskId, hash) {
        return this.$http.delete(this.urlBase + reqTaskId + '?hash=' + hash);
    }

    countLists() {
      return this.$http.get(this.urlBase + 'count-all');
    }

}



TodoListsService.$inject = ['$http'];

module.exports = TodoListsService;
