'use strict';

class RoomCtrl {

    constructor(Notification, SocketsService, RoomService, TodoListsService, $scope) {
        // Dependencies
        this.Notification = Notification;
        this.SocketsService = SocketsService;
        this.RoomService = RoomService;
        this.TodoListsService = TodoListsService;
        this.$scope = $scope;

        this.room = {
            name: '',
            isAdmin: false,
            username: ''
        };

        this.lists = [];

        this.listsAmount = 9;

        this.listsCurrentPage = 0;

        this.listsTotal = 0;

        this.moving = false;

        this.init();
    }

    init() {
        // get info about room
        this.RoomService.getInfo((function(roomInfo) {
            this.room = roomInfo;
            // read todos count
            this.TodoListsService.countLists().then(
                result => {
                    this.hash = this.SocketsService.init(this.room.name);
                    this.listsTotal = result.data.count;
                    // set sockets listeners
                    this.placeSocketEventListners();
                    // get fist page of todos
                    this.changePage(1);
                },
                this.handleError.bind(this)
            );
        }).bind(this), this.handleError.bind(this));

    }

    changePage(number) {
        this.listsCurrentPage = number;
        let offset = (number - 1) * this.listsAmount;
        this.TodoListsService.read(undefined, offset, this.listsAmount).then(
            result => (this.lists = result.data),
            this.handleError.bind(this)
        );
    }


    /*
    <--------- LOCAL STORAGE FUNCTIONS
    */
    addListLocally(list) {
        this.listsTotal++;
        if (this.listsCurrentPage === 1) {
            this.lists.unshift(list);
            if (this.lists.length > this.listsAmount) {
                this.lists.length = this.listsAmount;
            }
        } else {
            this.appendListBeginningOfPage();
        }
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
            this.listsTotal--;
            let found = false;
            for (let i = 0; i < this.lists.length; i++) {
                if (this.lists[i].id === id) {
                    this.lists.splice(i, 1);
                    found = true;
                }
            }
            if ((this.listsCurrentPage - 1) < (Math.floor(this.listsTotal / this.listsAmount))) {
                this.appendListEndOfPage();
            }
            //TODO!
        }
        /*
        --------->
        */



    /*
    <--------- SERVER FUNCTIONS
    */
    newList() {
        this.TodoListsService.create(undefined, this.hash).then(
            result => this.addListLocally(result.data),
            this.handleError.bind(this)
        );
    }

    deleteList(id) {
        this.TodoListsService.destroy(id, this.hash).then(
            result => this.deleteListLocally(id),
            this.handleError.bind(this)
        );
    }

    editList(id, newName) {
        this.TodoListsService.update(id, newName, this.hash).then(
            result => this.updateListLocally(id, newName),
            this.handleError.bind(this)
        );
    }

    appendListBeginningOfPage() {
        let offset = ((this.listsCurrentPage - 1) * this.listsAmount);
        this.TodoListsService.read(undefined, offset, 1).then(
            result => {
                this.lists.unshift(result.data[0]);
                if (this.lists.length > this.listsAmount) {
                    this.lists.length = this.listsAmount;
                }
            },
            this.handleError.bind(this)
        );
    }

    appendListEndOfPage() {
        let offset = ((this.listsCurrentPage - 1) * this.listsAmount) + (this.listsAmount - 1);
        this.TodoListsService.read(undefined, offset, 1).then(
            result => this.lists.push(result.data[0]),
            this.handleError.bind(this)
        );
    }


    /*
    --------->
    */


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


    placeSocketEventListners() {

        this.SocketsService.on('NewTask', (function(data) {
            this.addTaskLocally(data.task, data.username);
            this.Notify(data.username + ' added a todo', 'Success');
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('UpdatedTask', (function(data) {
            this.updateTaskLocally(data.task);
            if (data.task.status === 'Complete') {
                this.Notify(data.username + ' completed a todo', 'Success');
            }
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedTask', (function(data) {
            this.updateTaskLocally(data.task, true);
            this.Notify(data.username + ' removed a todo');
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('NewTodoList', (function(data) {
            this.addListLocally(data.list);
            this.Notify(data.username + ' added a new list!', 'Success');
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('UpdatedList', (function(data) {
            this.updateListLocally(data.list.id, data.list.name);
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedList', (function(data) {
            this.deleteListLocally(data.list.id);
            this.Notify(data.username + ' deleted a list!', 'Error');
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedAllComplete', (function(data) {
            this.Notify(data.username + ' cleared all completed todos');
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('logAllOut', (function(data) {
            window.location = '/rooms/login?kicked=true';
        }).bind(this));

    }

    handleError(error) {
        if (error.status === 401 || error.status === 403) {
            window.location = '/rooms/login?timeout=true';
        }
        console.error(error);
        this.Notify('Error communicating with server', 'Error');
    }

}

RoomCtrl.$inject = ['Notification', 'SocketsService', 'RoomService', 'TodoListsService', '$scope'];

export default RoomCtrl;
