'use strict';

class UserHomeCtrl {

    constructor(Notification, TasksService) {

        this.Notification = Notification;
        this.TasksService = TasksService;

        this.tasks = [];

        this.newTask = {
            status: 'open'
        };

        this.TasksService.read().then(
            result => {
                this.tasks = result.data;
            },
            error => {
                console.log(error);
                this.Notification.error('Error getting tasks');
            }
        );

    }

    getTasks(start, limit, asAdmin) {
        this.TasksService.read(null, start, limit, asAdmin).then(
            result => this.tasks = result.data,
            error => {
                console.log(error);
                this.Notification.error('Error getting tasks');
            }
        );
    }

    createTask() {
        this.TasksService.create(this.newTask).then(
            result => {
                this.newTask = {
                  status: 'open'
                };
                this.tasks.unshift(result.data);
            },
            error => {
                console.log(error);
                this.Notification.error('Error saving tasks');
            }
        );

    }

}

UserHomeCtrl.$inject = ['Notification', 'TasksService'];

export default UserHomeCtrl;
