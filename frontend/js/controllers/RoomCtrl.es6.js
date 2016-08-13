'use strict';

class RoomCtrl {

    constructor(Notification, TasksService, SocketsService, $scope) {

        // Dependencies
        this.Notification = Notification;
        this.TasksService = TasksService;
        this.SocketsService = SocketsService;
        this.scope = $scope;

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
                this.Notification.error('Error getting tasks');
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
            this.Notification.success(data);
        }).bind(this));

        this.SocketsService.on('NewTask', (function(data) {
            this.addTaskLocally(data);
            // force view to update;
            this.scope.apply();
        }).bind(this));
    }

    getTasks(start, limit) {
        this.TasksService.read(start, limit).then(
            result => {
                this.tasks = result.data.tasks;
            },
            error => {
                this.Notification.error('Error getting tasks');
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
                this.Notification.error('Error saving tasks');
            }
        );

    }

    // add task locally within js array.
    addTaskLocally(newTask) {
        let alreadyAdded = this.tasks.find(task => task.id === newTask.id);
        if (!alreadyAdded) {
            this.tasks.push(newTask);
        }
    }

}

RoomCtrl.$inject = ['Notification', 'TasksService', 'SocketsService', '$scope'];

export default RoomCtrl;
