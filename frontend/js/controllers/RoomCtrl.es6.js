'use strict';

class RoomCtrl {

    constructor(Notification, TasksService, SocketService) {

        this.Notification = Notification;
        this.TasksService = TasksService;

        this.roomName = '';

        this.username = '';

        this.tasks = [];

        this.newTask = {
            status: 'Todo'
        };

        this.TasksService.read().then(
            result => {
                this.tasks = result.data;
                this.username = result.data.username;
                this.roomName = result.data.roomName;
            },
            error => {
                console.log(error);
                this.Notification.error('Error getting tasks');
            }
        );

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

RoomCtrl.$inject = ['Notification', 'TasksService', 'SocketService'];

export default RoomCtrl;
