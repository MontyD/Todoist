'use strict';

class SettingsCtrl {

    constructor(Notification, TasksService, SocketsService, RoomService, $scope, $rootScope) {
        // Dependencies
        this.Notification = Notification;
        this.TasksService = TasksService;
        this.SocketsService = SocketsService;
        this.RoomService = RoomService;
        this.$scope = $scope;
        this.$rootScope = $rootScope;

        this.completed = false;

        this.roomName = this.$rootScope.roomName;

        this.confirmingDeleteTasks = false;
        this.confirmingLogOut = false;

        this.passcodeAttemptedSubmit = false;
        this.newPassCode = '';

        this.TasksService.countCompleted().then(
            result => this.completed = result.data.count > 0 ? true : false,
            this.handleError.bind(this)
        );

        this.initSockets();
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
        // echo room name
        this.SocketsService.emit('room', this.roomName);

        this.SocketsService.on('logAllOut', (function(data) {
            window.location = '/rooms/login?kicked=true';
        }).bind(this));
    }

    toggleConfirmingDeleteTasks() {
        this.confirmingDeleteTasks = !this.confirmingDeleteTasks;
    }

    deleteCompletedTasks() {
        this.TasksService.clearCompleted(this.$rootScope.hash).then(
            result => this.completed = false,
            this.handleError.bind(this)
        );
    }

    toggleConfirmingLogOut() {
        this.confirmingLogOut = !this.confirmingLogOut;
    }

    logAllOut() {
      this.RoomService.logAllOut().then(
        result => window.location = '/rooms/login?kicked=true',
        this.handleError.bind(this)
      );
    }

    changePasscode(valid) {
      if (!valid) {
        this.passcodeAttemptedSubmit = true;
        return;
      }
      this.RoomService.update({password: this.newPassCode}).then(
        result => {
          this.Notify('Passcode sucessfully changed!', 'Success');
          this.newPassCode = '';
          this.passcodeAttemptedSubmit = false;
        },
        this.handleError.bind(this)
      );
    }

    handleError(error) {
        if (error.status === 401 || error.status === 403) {
            window.location = '/rooms/login?timeout=true';
            return;
        }
        if (error.status === 400) {
          this.Notify(error.data, 'Error');
          return;
        }
        console.error(error);
        this.Notify('Error communicating with server', 'Error');
    }

}

SettingsCtrl.$inject = ['Notification', 'TasksService', 'SocketsService', 'RoomService', '$scope', '$rootScope'];

export default SettingsCtrl;
