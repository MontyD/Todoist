'use strict';

class RoomCtrl {

    constructor(Notification, TasksService, SocketsService) {

        // Dependencies
        this.Notification = Notification;
        this.TasksService = TasksService;
        this.SocketsService = SocketsService;

        // initial variables
        this.roomName = '';

        this.username = '';

        this.tasks = [];

        this.newTask = {
            status: 'Todo'
        };

        // read tasks from server, and also get username
        // and room name
        this.TasksService.read().then(
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

    createTask() {
        this.TasksService.create(this.newTask).then(
            result => {
                this.newTask = {
                    status: 'Todo'
                };
                this.tasks.push(result.data);
            },
            error => {
                console.log(error);
                this.Notification.error('Error saving tasks');
            }
        );

    }

}

RoomCtrl.$inject = ['Notification', 'TasksService', 'SocketsService'];

export default RoomCtrl;
