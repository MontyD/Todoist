'use strict';

class RoomCtrl {

    constructor(Notification, SocketsService, RoomService, TodoListsService, $scope, $rootScope) {
        // Dependencies
        this.Notification = Notification;
        this.SocketsService = SocketsService;
        this.RoomService = RoomService;
        this.TodoListsService = TodoListsService;
        this.$scope = $scope;
        this.$rootScope = $rootScope;

        this.$rootScope.roomName = '';
        this.$rootScope.isAdmin = false;
        this.$rootScope.username = '';

        // initial properties
        this.roomName = '';
        this.isAdmin = false;
        this.username = '';

        this.lists = [];

        this.listsAmount = 8;

        this.listsCurrentPage = 0;

        this.listsTotal = 0;

        this.moving = false;

        this.init();
    }

    init() {
        if (!this.$rootScope.roomName) {
            this.getRoomInfoFromServer();
        } else {
            this.getRoomInfoLocally();
        }
        // read tasks from server
        this.TodoListsService.read(undefined, undefined, this.listsAmount).then(
            result => {
                this.lists = result.data;
            },
            this.handleError.bind(this)
        );

        // read todos count
        this.TodoListsService.countLists().then(
            result => this.listsTotal = result.data.count,
            error => console.error(error)
        );
    }

    getRoomInfoFromServer() {
        this.RoomService.getInfo().then(
            result => {
                this.$rootScope.roomName = result.data.roomName;
                this.$rootScope.isAdmin = result.data.isAdmin;
                this.$rootScope.username = result.data.username;
                this.getRoomInfoLocally();
            },
            this.handleError.bind(this)
        );
    }

    getRoomInfoLocally() {
        this.roomName = this.$rootScope.roomName;
        this.isAdmin = this.$rootScope.isAdmin;
        this.username = this.$rootScope.username;
        this.initSockets();
    }

    initSockets() {
        // echo room name
        this.SocketsService.emit('room', this.roomName);

        // Socket events config
        this.SocketsService.on('UserConnected', (function(data) {

        }).bind(this));


        // <--- Actual Event Listeners
        this.SocketsService.on('NewTask', (function(data) {

            if (this.$rootScope.hash === data.hash) {
                return;
            }
            this.addTaskLocally(data.task, data.username);
            this.Notify(data.username + ' added a todo', 'Success');
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('UpdatedTask', (function(data) {
            if (this.$rootScope.hash === data.hash) {
                return;
            }
            this.updateTaskLocally(data.task);
            if (data.task.status === 'Complete') {
                this.Notify(data.username + ' completed a todo', 'Success');
            }
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedTask', (function(data) {
            if (this.$rootScope.hash === data.hash) {
                return;
            }
            this.updateTaskLocally(data.task, true);
            this.Notify(data.username + ' removed a todo');
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('UpdatedList', (function(data) {
            if (this.$rootScope.hash === data.hash) {
                return;
            }
            this.updateListLocally(data.list.id, data.list.name);
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedList', (function(data) {
            if (this.$rootScope.hash === data.hash) {
                return;
            }
            this.deleteListLocally(data.list.id);
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedAllComplete', (function(data) {
            this.completedLastDay = 0;
            this.Notify(data.username + ' cleared all completed todos');
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('logAllOut', (function(data) {
            window.location = '/rooms/login?kicked=true';
        }).bind(this));
        // ----->

        // create hash and make sockets as initialised.
        this.$rootScope.hash = Math.random().toString(36).substring(7);

    }


    availablePages() {
        return Math.ceil(this.listsTotal / this.listsAmount);
    }

    movePage(pageNumber) {
        if (this.moving) {
            return false;
        }
        this.moving = true;
        let offset = pageNumber * this.listsAmount;
        this.TodoListsService.read(undefined, offset, this.listsAmount, 'Todo').then(
            result => {
                this.moving = false;
                if (result.data.lists.length === 0) {
                    return;
                }
                this.listsCurrentPage = pageNumber;
                this.lists = result.data.lists;
            },
            this.handleError.bind(this)
        );
    }

    pageBack() {
        if (this.listsCurrentPage === 0) {
            return;
        }
        return this.movePage(this.listsCurrentPage - 1);
    }

    pageForward() {
        return this.movePage(this.listsCurrentPage + 1);
    }

    updateListLocally(id, newName) {
        for (let i = 0; i < this.lists.length; i++) {
            if (this.lists[i].id === id) {
                this.lists[i].name = newName;
                return;
            }
        }
    }

    deleteListLocally(id) {
        for (let i = 0; i < this.lists.length; i++) {
            if (this.lists[i].id === id) {
                this.lists.splice(i, 1);
            }
        }
    }

    deleteList(id) {
        this.TodoListsService.destroy(id, this.$rootScope.hash).then(
            result => this.deleteListLocally(id),
            this.handleError.bind(this)
        );
    }

    editList(id, newName) {
        this.TodoListsService.update(id, newName, this.$rootScope.hash).then(
            result => this.updateListLocally(id, newName),
            this.handleError.bind(this)
        );
    }

    Notify(text, type) {
        if (this.doNotNotify) {
            return false;
        }
        switch (type) {
            case 'Success':
                this.Notification.success(text);
                break;
            case 'Error':
                this.Notification.error(text);
                break;
            default:
                this.Notification.info(text);
        }
    }

    handleError(error) {
        if (error.status === 401 || error.status === 403) {
            window.location = '/rooms/login?timeout=true';
        }
        console.error(error);
        this.Notify('Error communicating with server', 'Error');
    }

}

RoomCtrl.$inject = ['Notification', 'SocketsService', 'RoomService', 'TodoListsService', '$scope', '$rootScope'];

export default RoomCtrl;
