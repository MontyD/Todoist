'use strict';

class OverviewCtrl {

    constructor(Notification, TasksService, SocketsService, $scope, $rootScope) {
        // Dependencies
        this.Notification = Notification;
        this.TasksService = TasksService;
        this.SocketsService = SocketsService;
        this.$scope = $scope;
        this.$rootScope = $rootScope;

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

    percentageDone() {
      return (Math.round((this.completed / (this.todo + this.completed)) * 10000))/100;
    }

    percentageDoneTransform() {
      let amount = this.percentageDone() / 100;
      return 'scaleY(' + amount + ')';
    }

    handleError(error) {
        if (error.status === 401 || error.status === 403) {
            window.location = '/rooms/login?timeout=true';
        }
        console.error(error);
        this.Notify('Error communicating with server', 'Error');
    }

}

OverviewCtrl.$inject = ['Notification', 'TasksService', 'SocketsService', '$scope', '$rootScope'];

export default OverviewCtrl;
