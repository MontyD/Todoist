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

        // read tasks from server, and also get username
        // and room name. Set initial to true (last arg);
        this.TasksService.read(undefined, undefined, undefined, true).then(
            result => {
                this.tasks = result.data.tasks;
                this.username = result.data.username;
                this.roomName = result.data.roomName;

                // connect to socket by room name
                this.initSockets();
            },
            error => {
                console.log(error);
                this.Nofity('Error getting todos', 'Error');
            }
        );

    }

    // have to create temporary room var,
    // as socket functions have to be called
    // with this as socket.
    initSockets() {
        let room = this.roomName;
        this.SocketsService.emit('room', room);

        // Socket events config
        this.SocketsService.on('UserConnected', (function(data) {
            this.Notify(data, 'Success');
        }).bind(this));

        this.SocketsService.on('NewTask', (function(data) {
            this.addTaskLocally(data.task, data.username);
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('UpdatedTask', (function(data) {
            this.updateTaskLocally(data.task);
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

    }

    hasTodos() {
        return this.tasks.some(element => element.status === 'Todo');
    }

    getTasks(start, limit) {
        this.TasksService.read(start, limit).then(
            result => {
                this.tasks = result.data.tasks;
            },
            error => {
                this.Notify('Error getting todos', 'Error');
            }
        );
    }

    // create task on server
    createTask() {
        this.TasksService.create(this.newTask).then(
            result => {
                this.newTask = {
                    status: 'Todo'
                };
                this.addTaskLocally(result.data);
            },
            error => {
                console.log(error);
                this.Notify('Error saving todos', 'Error');
            }
        );

    }

    // add task locally within js array.
    addTaskLocally(newTask, username) {
        let alreadyAdded = this.tasks.find(task => task.id === newTask.id);
        if (!alreadyAdded) {
            this.tasks.push(newTask);
            if (username) {
                this.Notify(username + ' added a new todo');
            }
        }
    }

    updateTaskComplete(id) {
        if (!id) {
            return;
        }
        this.TasksService.update(id, {
            status: 'Complete'
        }).then(
            result => this.updateTaskLocally(result.data),
            error => {
                console.log(error);
                this.Notify('Error updating todo', 'Error');
            }
        );
    }

    updateTaskLocally(reqTask) {
        for (var i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].id === reqTask.id) {
                this.tasks[i] = reqTask;
                break;
            }
        }
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
