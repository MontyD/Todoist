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
        this.completed = 0;
        this.todo = 0;

        // read todos count
        this.TasksService.countTodos().then(
            result => this.todo = result.data.count,
            error => console.error(error)
        );

        // read completed count for last day
        this.TasksService.countCompleted().then(
            result => {
                this.completed = result.data.count;
                this.roomName = result.data.roomName;
            },
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

    percentageDone() {
      return ((this.completed / (this.todo + this.completed)) * 100).toFixed(2) + '%';
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
