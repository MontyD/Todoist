'use strict';

class SettingsCtrl {

    constructor(Notification, TasksService, SocketsService, RoomService) {
        // Dependencies
        this.Notification = Notification;
        this.TasksService = TasksService;
        this.SocketsService = SocketsService;
        this.RoomService = RoomService;

        this.room = {
            name: '',
            isAdmin: false,
            username: ''
        };

        this.hash = '';

        this.completed = false;

        this.confirmingDeleteTasks = false;
        this.confirmingLogOut = false;

        this.passwordAttemptedSubmit = false;
        this.passwords = {
            old: '',
            new: '',
            confirm: ''
        };

        this.passcodeAttemptedSubmit = false;
        this.newPassCode = '';

        this.confirmingDeleteRooms = false;

        this.TasksService.countCompleted().then(
            result => this.completed = result.data.count > 0 ? true : false,
            this.handleError.bind(this)
        );

        this.RoomService.getInfo(
            roomInfo => {
                this.room = roomInfo;
                this.hash = this.SocketsService.init(roomInfo.name);
            }.bind(this),
            this.handleError.bind(this)
        );

        this.initSockets();

        this.menuOpen = false;

        document.body.className = 'loaded';
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
        this.TasksService.clearCompleted(this.hash).then(
            result => this.completed = false,
            this.handleError.bind(this)
        );
    }

    toggleConfirmingLogOut() {
        this.confirmingLogOut = !this.confirmingLogOut;
    }

    logAllOut() {
        this.RoomService.logAllOut().then(
            result => window.location = '/' + this.room.name + '?logout=true',
            this.handleError.bind(this)
        );
    }

    changePasscode(valid) {
        if (!valid) {
            this.passcodeAttemptedSubmit = true;
            return;
        }
        this.RoomService.updatePasscode({
            passcode: this.newPassCode
        }).then(
            result => {
                this.Notify('Passcode sucessfully changed!', 'Success');
                this.newPassCode = '';
                this.passcodeAttemptedSubmit = false;
            },
            this.handleError.bind(this)
        );
    }

    changeAdminPassword(valid) {
        if (!valid) {
            this.passwordAttemptedSubmit = true;
            return;
        }
        if (this.passwords.new !== this.passwords.confirm) {
            this.passwordAttemptedSubmit = true;
            this.Notify('Passwords do not match', 'Error');
            return;
        }
        this.RoomService.updateAdminPassword(this.passwords).then(
            result => {
                this.Notify('Admin password sucessfully changed!', 'Success');
                this.passwords = {
                    old: '',
                    new: '',
                    confirm: ''
                };
                this.passwordAttemptedSubmit = false;
            },
            this.handleError.bind(this)
        );
    }

    toggleConfirmingDeleteRoom() {
        this.confirmingDeleteRooms = !this.confirmingDeleteRooms;
    }

    deleteRoom() {
        this.RoomService.deleteRoom().then(
            result => window.location = '/rooms/login',
            this.handleError.bind(this)
        );
    }

    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    }

    handleError(error) {
        if (error.status === 401 || error.status === 403) {
            window.location = '/' + this.room.name + '?logout=true';
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

SettingsCtrl.$inject = ['Notification', 'TasksService', 'SocketsService', 'RoomService'];

export default SettingsCtrl;
