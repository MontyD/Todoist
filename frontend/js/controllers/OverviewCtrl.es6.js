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

        // array of completed this week,
        // initially seven 0
        this.completedWeek = [0, 0, 0, 0, 0, 0, 0];

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

        this.TasksService.getCompletedLastWeek().then(
            result => this.sortToDays(result.data),
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
        return (Math.round((this.completed / (this.todo + this.completed)) * 10000)) / 100;
    }

    percentageDoneTransform() {
        let amount = this.percentageDone() / 100;
        return 'scaleY(' + amount + ')';
    }

    sortToDays(array) {
      let today = this.dateWithoutTime();
      let oneDay = 24*60*60*1000;
        array.forEach(function(element, index) {
          let date = this.dateWithoutTime(element.updatedAt);
          let daysAgo = Math.round(Math.abs((date.getTime() - today.getTime())/(oneDay)));
          this.completedWeek[daysAgo]++;
        }, this);
        console.log(this.completedWeek);
    }

    dateWithoutTime(date) {
      if (!date) {
        date = new Date();
      } else if (!(date instanceof Date)) {
        date = new Date(date);
      }
      let returnDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      return returnDate;
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
