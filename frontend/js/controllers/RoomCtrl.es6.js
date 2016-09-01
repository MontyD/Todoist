'use strict';

class RoomCtrl {

    constructor(Notification, TasksService, SocketsService, RoomService, $scope, $rootScope) {
        // Dependencies
        this.Notification = Notification;
        this.TasksService = TasksService;
        this.SocketsService = SocketsService;
        this.RoomService = RoomService;
        this.$scope = $scope;
        this.$rootScope = $rootScope;

        this.$rootScope.roomName = '';
        this.$rootScope.isAdmin = false;
        this.isAdmin = false;

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

        this.cache = {};

        this.moving = false;

        // get room info: username, roomname,
        // admin status, and sockets echo that
        // user is connected
        this.RoomService.getInfo().then(
          result => {
            this.$rootScope.roomName = result.data.roomName;
            this.roomName = result.data.roomName;
            this.$rootScope.isAdmin = result.data.isAdmin;
            this.isAdmin = result.data.isAdmin;
            this.username = result.data.username;
          },
          this.handleError.bind(this)
        );

        // read tasks from server
        this.TasksService.read(undefined, undefined, this.taskAmount, 'Todo', true).then(
            result => {
                this.tasks = result.data.tasks;
                this.username = result.data.username;
                this.$rootScope.roomName = result.data.roomName;
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
            this.Notify(data.username + ' removed a new todo');
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

    // <---- SERVER SIDE INTERACTIONS:
    createTask() {
        this.TasksService.create(this.newTask, this.$rootScope.hash).then(
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
        this.TasksService.update(task.id, task, this.$rootScope.hash).then(
            result => this.updateTaskLocally(result.data),
            this.handleError.bind(this)
        );
    }

    deleteTask(task) {
        if (!task) {
            return;
        }
        this.TasksService.destroy(task.id, this.$rootScope.hash).then(
            result => this.updateTaskLocally(task, true),
            this.handleError.bind(this)
        );
    }
    // ---->


    handleError(error) {
        if (error.status === 401 || error.status === 403) {
            window.location = '/rooms/login?timeout=true';
        }
        console.error(error);
        this.Notify('Error communicating with server', 'Error');
    }

}

RoomCtrl.$inject = ['Notification', 'TasksService', 'SocketsService', 'RoomService', '$scope', '$rootScope'];

export default RoomCtrl;
