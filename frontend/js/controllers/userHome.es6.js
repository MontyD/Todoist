'use strict';

class UserHomeCtrl {

    constructor(Notification, TasksService) {

        this.Notification = Notification;
        this.TasksService = TasksService;

    }

}

UserHomeCtrl.$inject = ['Notification', 'TasksService'];

export default UserHomeCtrl;
