'use strict';

class RoomCtrl {

    constructor(Notification, TasksService, SocketsService, $scope) {
        // Dependencies
        this.Notification = Notification;
        this.TasksService = TasksService;
        this.SocketsService = SocketsService;
        this.$scope = $scope;

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
            error => {
                console.error(error);
                this.Nofity('Error getting todos', 'Error');
            }
        );

        // read todos count
        this.TasksService.countTodos().then(
            result => this.tasksTotal = result.data.count,
            error => console.error(error)
        );

    }

    initSockets() {
        this.SocketsService.emit('room', this.roomName);

        // Socket events config
        this.SocketsService.on('UserConnected', (function(data) {
            this.Notify(data, 'Success');
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
            error => {
                console.error(error);
                this.Notify('Error getting todos', 'Error');
            }
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
            let offset = (this.taskPage * this.taskPageAmount);
            this.TasksService.read(undefined, offset, 1, 'Todo').then(
                result => {
                    if (result.data.tasks.length !== 0) {
                        this.tasks.unshift(result.data.tasks[0]);
                        this.tasksTotal++;
                        // resize array if necessary
                        if (this.tasks.length > this.taskPageAmount) {
                            this.tasks.length = this.taskPageAmount;
                        }
                    }

                },
                error => {
                    console.error(error);
                    this.Notify('Error getting todos', 'Error');
                    this.cacheActedTask = {};
                }
            );
        }


    }

    // update task locally within js array.
    // includes remove
    updateTaskLocally(reqTask, remove) {
        let found = false;
        this.tasks.forEach(function(task, i) {
            if (task.id === reqTask.id) {
                if (reqTask.status !== 'Todo' || remove) {
                    this.tasks.splice(i, 1);
                    if (this.tasks.length === 0){
                      this.pageBack();
                    }
                    this.tasksTotal--;
                    found = true;
                    return;
                }
                this.tasks[i] = reqTask;
                return;
            }
        }, this);
        // remove from previous
        if ((reqTask.status !== 'Todo' || remove) && !found) {
            this.tasksTotal--;
            let before = this.tasks[0].id < reqTask.id;
            if (before) {
                // remove first task, and add one on from server.
                this.tasks.shift();
                let offset = (this.taskPage * this.taskPageAmount) + this.tasks.length;
                this.TasksService.read(undefined, offset, 1, 'Todo').then(
                    result => {
                        if (result.data.tasks.length) {
                            this.tasks.push(result.data.tasks[0]);
                        }
                        if (this.tasks.length === 0) {
                          this.pageBack();
                        }
                    },
                    error => {
                        console.error(error);
                        this.Notify('Error getting todos', 'Error');
                    }
                );
            }
        }
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
            error => {
                console.error(error);
                this.Notify('Error saving todos', 'Error');
                this.cacheActedTask = {};
            }
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
            error => {
                console.error(error);
                this.Notify('Error updating todo', 'Error');
                this.cacheActedTask = {};
            }
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
            error => {
                console.error(error);
                this.Notify('Error removing todo', 'Error');
                this.cacheActedTask = {};
            }
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

}

RoomCtrl.$inject = ['Notification', 'TasksService', 'SocketsService', '$scope'];

export default RoomCtrl;
