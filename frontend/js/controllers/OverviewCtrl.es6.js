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

        this.showWeeklyGraph = false;

        // array of completed this week,
        // initially seven 0
        this.completedWeek = [0, 0, 0, 0, 0, 0, 0];

        // array of last few days this week,
        // initially seven blank strings
        this.daysOfTheWeek = ['', '', '', '', '', '', ''];

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

        this.calculateDaysOfTheWeek();

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
        let scale = this.showWeeklyGraph ? 0 : this.percentageDone() / 100;
        return 'scaleY(' + scale + ')';
    }

    calculateTransform(amount) {
      let scale = this.showWeeklyGraph ? amount / this.completed : 0;
      return 'scaleY(' + scale + ')';
    }

    sortToDays(array) {
      let today = this.dateWithoutTime();
      let oneDay = 24*60*60*1000;
        array.forEach(function(element, index) {
          let date = this.dateWithoutTime(element.updatedAt);
          let daysAgo = Math.round(Math.abs((date.getTime() - today.getTime())/(oneDay)));
          this.completedWeek[daysAgo]++;
        }, this);
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

    calculateDaysOfTheWeek() {
      let today = (new Date()).getDay();
      let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      for (let i = 0; i < 7; i++) {
        if ((today - i) > -1) {
          this.daysOfTheWeek[i] = days[today - i];
        } else {
          this.daysOfTheWeek[i] = days[today - i + 7];
        }
      }
    }

    toggleWeeklygraph() {
      this.showWeeklyGraph = !this.showWeeklyGraph;
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
