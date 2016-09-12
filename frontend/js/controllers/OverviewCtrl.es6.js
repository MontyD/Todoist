'use strict';

class OverviewCtrl {

    constructor(Notification, TasksService, SocketsService, RoomService, $scope) {
        // Dependencies
        this.Notification = Notification;
        this.TasksService = TasksService;
        this.SocketsService = SocketsService;
        this.RoomService = RoomService;
        this.$scope = $scope;

        this.hash = '';

        this.room = {
            name: '',
            isAdmin: false,
            username: ''
        };

        this.showWeeklyGraph = false;

        this.confirmingDelete = false;

        // array of completed this week,
        // initially seven 0
        this.completedWeek = [0, 0, 0, 0, 0, 0, 0];

        // array of last few days this week,
        // initially seven blank strings
        this.daysOfTheWeek = ['', '', '', '', '', '', ''];

        this.init();

        this.RoomService.getInfo(
          roomInfo => {
            this.room = roomInfo;
            this.hash = this.SocketsService.init(roomInfo.name);
          }.bind(this),
          this.handleError.bind(this)
        );

        this.calculateDaysOfTheWeek();

        document.body.className = 'loaded';

    }

    initSockets() {

        // echo room name
        this.SocketsService.emit('room', this.roomName);

        // <--- Actual Event Listeners
        this.SocketsService.on('NewTask', (function(data) {
            this.todo++;
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('UpdatedTask', (function(data) {
            if (data.task.status === 'Complete') {
                this.completed++;
                this.completedWeek[0]++;
                this.todo--;
            }
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedTask', (function(data) {
            this.todo--;
            // force view to update;
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedList', (function(data) {

            // everything will be out of whack - grab all!
            this.init();
            // force view to update;
            this.$scope.$apply();
        }).bind(this));


        this.SocketsService.on('DeletedAllComplete', (function(data) {
          this.completed = 0;
          this.completedWeek = [0, 0, 0, 0, 0, 0, 0];
          this.confirmingDelete = false;
          this.Notify(data.username + ' cleared all completed todos');

          // force view to update;
          this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('logAllOut', (function(data) {
            window.location = '/rooms/login?kicked=true';
        }).bind(this));
        // ----->
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

    init() {

      // read todos count
      this.TasksService.countTodos().then(
          result => this.todo = result.data.count,
          this.handleError.bind(this)
      );

      // read completed count
      this.TasksService.countCompleted().then(
          result => {
              this.completed = result.data.count;
              this.initSockets();
          },
          this.handleError.bind(this)
      );

      this.TasksService.getCompletedLastWeek().then(
          result => this.sortToDays(result.data),
          this.handleError.bind(this)
      );
    }

    percentageDone() {
      let done = (Math.round((this.completed / (this.todo + this.completed)) * 10000)) / 100;
      return isNaN(done) ? 0 : done;
    }

    percentageDoneTransform() {
        let scale = this.showWeeklyGraph ? 0 : this.percentageDone() / 100;
        return 'scaleY(' + scale + ')';
    }

    calculateTransform(amount) {
      let scale = this.showWeeklyGraph ? amount / (this.todo + this.completed) : 0;
      return 'scaleY(' + scale + ')';
    }

    sortToDays(array) {
      let today = this.dateWithoutTime();
      let oneDay = 24*60*60*1000;
      // reset for re-init
      this.completedWeek = [0, 0, 0, 0, 0, 0, 0];
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

OverviewCtrl.$inject = ['Notification', 'TasksService', 'SocketsService', 'RoomService', '$scope'];

export default OverviewCtrl;
