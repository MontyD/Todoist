'use strict';

class UserHomeCtrl {

    constructor(Notification, TasksService) {

        this.Notification = Notification;
        this.TasksService = TasksService;

        this.tasks = [];

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

}

UserHomeCtrl.$inject = ['Notification', 'TasksService'];

export default UserHomeCtrl;
