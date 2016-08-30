'use strict';

class OverviewCtrl {

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

        this.completedLastDay = 0;

        this.cacheActedTask = {};

        this.moving = false;

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
        this.SocketsService.emit('room', this.roomName);

        this.SocketsService.on('NewTask', (function(data) {
            this.addTaskLocally(data.task, data.username);
            this.Notify(data.username + ' added a todo', 'Success');
            // force view to update;
            this.$scope.$apply();
        }).bind(this));
        this.SocketsService.on('UpdatedTask', (function(data) {
            if (data.task.status === 'Complete') {
                this.Notify(data.username + ' completed a todo', 'Success');
            }
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedTask', (function(data) {
            this.Notify(data.username + ' removed a new todo');
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

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

OverviewCtrl.$inject = ['Notification', 'TasksService', 'SocketsService', '$scope'];

export default OverviewCtrl;
