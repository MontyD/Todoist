'use strict';

class RoomCtrl {

    constructor(Notification, TasksService, SocketsService, $scope, $rootScope) {
        // Dependencies
        this.Notification = Notification;
        this.TasksService = TasksService;
        this.SocketsService = SocketsService;
        this.$scope = $scope;
        this.$rootScope = $rootScope;

        // initial variables
        this.roomName = '';

        this.username = '';

        this.tasks = [];

        this.newTask = {
            status: 'Todo'
        };

        this.taskPageAmount = 10;

        this.taskPage = 0;

        this.tasksTotal = 0;

        this.completedLastDay = 0;

        this.cacheActedTask = {};

        this.moving = false;

        // read tasks from server, and also get username
        // and room name. Set initial to true (last arg);
        this.TasksService.read(undefined, undefined, this.taskAmount, 'Todo', true).then(
            result => {
                this.tasks = result.data.tasks;
                this.username = result.data.username;
                this.roomName = result.data.roomName;

                // connect to socket by room name
                this.initSockets();
            },
            this.handleError.bind(this)
        );

        // read todos count
        this.TasksService.countTodos().then(
            result => this.tasksTotal = result.data.count,
            error => console.error(error)
        );

        // read completed count for last day
        this.TasksService.countCompletedLastDay().then(
            result => this.completedLastDay = result.data.count,
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

    initSockets() {
        if (this.$rootScope.socketsJoinedRoom) {
            return;
        }
        this.SocketsService.emit('room', this.roomName);

        // Socket events config
        this.SocketsService.on('UserConnected', (function(data) {

        }).bind(this));

        this.SocketsService.on('NewTask', (function(data) {
            if (data.task.title === this.cacheActedTask.title && this.cacheActedTask.action === 'create') {
                this.cacheActedTask = {};
                return;
            }
            this.addTaskLocally(data.task, data.username);
            this.Notify(data.username + ' added a todo', 'Success');
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('UpdatedTask', (function(data) {
            if (data.task.id === this.cacheActedTask.id && this.cacheActedTask.action === 'update') {
                this.cacheActedTask = {};
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
            if (data.task.id === this.cacheActedTask.id && this.cacheActedTask.action === 'delete') {
                this.cacheActedTask = {};
                return;
            }
            this.updateTaskLocally(data.task, true);
            this.Notify(data.username + ' removed a new todo');
            // force view to update;
            this.$scope.$apply();


        }).bind(this));
        this.$rootScope.socketsJoinedRoom = true;
    }

    availablePages() {
        return Math.ceil(this.tasksTotal / this.taskPageAmount);
    }

    movePage(pageNumber) {
        if (this.moving) {
            return false;
        }
        this.moving = true;
        let offset = pageNumber * this.taskPageAmount;
        this.TasksService.read(undefined, offset, this.taskAmount, 'Todo').then(
            result => {
                this.moving = false;
                if (result.data.tasks.length === 0) {
                    return;
                }
                this.taskPage = pageNumber;
                this.tasks = result.data.tasks;
                this.username = result.data.username;
                this.roomName = result.data.roomName;
            },
            this.handleError.bind(this)
        );
    }

    pageBack() {
        if (this.taskPage === 0) {
            return;
        }
        return this.movePage(this.taskPage - 1);
    }

    pageForward() {
        return this.movePage(this.taskPage + 1);
    }

    // add task locally within js array.
    addTaskLocally(newTask, username) {
        if (this.taskPage === 0) {
            this.tasks.unshift(newTask);
            this.tasksTotal++;
            // resize array if necessary
            if (this.tasks.length > this.taskPageAmount) {
                this.tasks.length = this.taskPageAmount;
            }
        } else {
            this.appendTaskLocally();
        }
    }

    // update task locally within js array.
    // includes remove
    updateTaskLocally(reqTask, remove) {
        let destroy = reqTask.status !== 'Todo' || remove;
        let found = false;
        if (reqTask.status === 'Complete') {
            this.completedLastDay++;
        }
        if (destroy) {
            this.tasksTotal--;
        }
        this.tasks.forEach(function(task, i) {
            if (task.id === reqTask.id) {
                found = true;
                if (destroy) {
                    this.tasks.splice(i, 1);
                    this.appendTaskLocally(true);
                } else {
                    this.tasks[i] = reqTask;
                }
                return;
            }
        }, this);
        // remove from previous
        if (!found && destroy) {
            let before = this.tasks[0].id < reqTask.id;
            if (before) {
                // remove first task, and add one on from server.
                this.tasks.shift();
                this.appendTaskLocally(true);
            }
        }
    }

    appendTaskLocally(end) {
        let offset = end ? (this.taskPage * this.taskPageAmount) + this.tasks.length : this.taskPage * this.taskPageAmount;
        this.TasksService.read(undefined, offset, 1, 'Todo').then(
            result => {
                if (result.data.tasks.length) {
                    this.tasks.push(result.data.tasks[0]);
                }
                if (this.tasks.length > this.taskPageAmount) {
                    this.tasks.length = this.taskPageAmount;
                } else if (this.tasks.length === 0) {
                    this.pageBack();
                }
            },
            this.handleError.bind(this)
        );
    }

    // create task on server
    createTask() {
        this.cacheActedTask.title = this.newTask.title;
        this.cacheActedTask.action = 'create';
        this.TasksService.create(this.newTask).then(
            result => {
                this.newTask = {
                    status: 'Todo'
                };
                this.addTaskLocally(result.data);
            },
            this.handleError.bind(this)
        );

    }


    updateTask(task) {
        if (!task) {
            return;
        }
        this.cacheActedTask.id = task.id;
        this.cacheActedTask.action = 'update';
        this.TasksService.update(task.id, task).then(
            result => this.updateTaskLocally(result.data),
            this.handleError.bind(this)
        );
    }

    deleteTask(task) {
        if (!task) {
            return;
        }
        this.cacheActedTask.id = task.id;
        this.cacheActedTask.action = 'delete';
        this.TasksService.destroy(task.id).then(
            result => this.updateTaskLocally(task, true),
            this.handleError.bind(this)
        );
    }

    handleError(error) {
        if (error.status === 401 || error.status === 403) {
            window.location = '/rooms/login?timeout=true';
        }
        console.error(error);
        this.Notify('Error communicating with server', 'Error');
        this.cacheActedTask = {};
    }

}

RoomCtrl.$inject = ['Notification', 'TasksService', 'SocketsService', '$scope', '$rootScope'];

export default RoomCtrl;
