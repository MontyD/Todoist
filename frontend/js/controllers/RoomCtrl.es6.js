'use strict';

class RoomCtrl {

    constructor(Notification, SocketsService, RoomService, TodoListsService, $scope) {
        // Dependencies
        this.Notification = Notification;
        this.SocketsService = SocketsService;
        this.RoomService = RoomService;
        this.TodoListsService = TodoListsService;
        this.$scope = $scope;

        // room information
        // synced with room service on init();
        this.room = {
            name: '',
            isAdmin: false,
            username: ''
        };

        // lists object (only current page)
        this.lists = [];

        // amount on page
        this.listsAmountPerPage = 6;

        // current page
        this.listsCurrentPage = 0;

        // total amount of lists,
        // pulled from server on init();
        this.listsTotal = 0;

        // run initial functions
        this.init();
    }

    init() {
        // get info about room
        // takes cb with room info - as success,
        // second arg cb with error - as failure
        // must be bound to this.
        this.RoomService.getInfo((function(roomInfo) {
            this.room = roomInfo;
            // read todos count - returns promise of count
            this.TodoListsService.countLists().then(
                result => {
                    // init sockets, which returns the hash for this session
                    this.hash = this.SocketsService.init(this.room.name);
                    // set total
                    this.listsTotal = result.data.count;
                    // set sockets listeners
                    this.placeSocketEventListners();
                    // display first page of todos
                    // this pulls this page from server
                    this.changePage(1);
                },
                // handle any errors
                this.handleError.bind(this)
            );
        }).bind(this), this.handleError.bind(this));

    }


    /*
    <--------- PAGE TRACKING
    */


    // takes page number as argument (starting at 1, instead of 0)
    // transforms this.lists to that page number of lists
    changePage(number) {
        // set current page - for checking if at the last page by functions below
        this.listsCurrentPage = number;

        // calculate the amount of lists to skip in db
        let offset = (number - 1) * this.listsAmountPerPage;

        // read from server and return to this.lists,
        // if error - handle
        this.TodoListsService.read(undefined, offset, this.listsAmountPerPage).then(
            result => (this.lists = result.data),
            this.handleError.bind(this)
        );
    }

    /*
    ------------>
    */



    /*
    <--------- LOCAL STORAGE FUNCTIONS
    */

    // takes a list and adds it to the relevant page
    addListLocally(list) {
        // increment total lists amount
        // must be done for pagination
        this.listsTotal++;
        // if first page
        if (this.listsCurrentPage === 1) {
            // add list to this.lists
            // and trim the amount of lists
            this.lists.unshift(list);
            if (this.lists.length > this.listsAmountPerPage) {
                this.lists.length = this.listsAmountPerPage;
            }
        } else {
            // not on first page, so append the last list
            // on the previous page, pushing lists down,
            // this keeps pages in sync
            this.appendListBeginningOfPage();
        }
    }

    // attempt to find list by id,
    // and then update list name.
    // if list is not found do nothing as
    // the lists are pulled from server on page change.
    updateListLocally(id, newName) {
        for (let i = 0; i < this.lists.length; i++) {
            if (this.lists[i].id === id) {
                this.lists[i].name = newName;
                return;
            }
        }
    }

    // TODO - test!
    // attempt to find list in array and delete,
    // appending one from server so that the page is full.
    // if not found, remove [0] from current page, and append another
    // at bottom, if id is greater than first on current page
    // this keeps the lists in sync between pages.
    deleteListLocally(id) {
        this.listsTotal--;
        for (let i = 0; i < this.lists.length; i++) {
            if (this.lists[i].id === id) {
                // found, remove
                this.lists.splice(i, 1);

                  // We're missing a list - so add one from server.
                  // return to stop code below executing.
                  return this.appendListEndOfPage();
            }
        }
        // before current page
        // will only run if not found
        if (id > this.lists[0].id) {
            this.lists.splice(0, 1);
            return this.appendListEndOfPage();
        }
    }

    // makes sure that lists length does go
    // over the designated length
    trimLists() {
        if (this.lists.length > this.listsAmountPerPage) {
            this.lists.length = this.listsAmountPerPage;
        }
    }


    /*
    --------->
    */



    /*
    <--------- SERVER FUNCTIONS
    */
    newList() {
        this.TodoListsService.create(undefined, this.hash).then(
            result => this.addListLocally(result.data),
            this.handleError.bind(this)
        );
    }

    deleteList(id) {
        this.TodoListsService.destroy(id, this.hash).then(
            result => this.deleteListLocally(id),
            this.handleError.bind(this)
        );
    }

    editList(id, newName) {
        this.TodoListsService.update(id, newName, this.hash).then(
            result => this.updateListLocally(id, newName),
            this.handleError.bind(this)
        );
    }

    appendListBeginningOfPage() {
        let offset = ((this.listsCurrentPage - 1) * this.listsAmountPerPage);
        this.TodoListsService.read(undefined, offset, 1).then(
            result => {
                if (result.data.length > 0) {
                    this.lists.unshift(result.data[0]);
                    return this.trimLists();
                }
            },
            this.handleError.bind(this)
        );
    }

    appendListEndOfPage() {
        let offset = ((this.listsCurrentPage - 1) * this.listsAmountPerPage) + (this.listsAmountPerPage - 1);
        this.TodoListsService.read(undefined, offset, 1).then(
            result => {
                if (result.data.length > 0) {
                    this.lists.push(result.data[0]);
                }
            },
            this.handleError.bind(this)
        );
    }


    /*
    --------->
    */


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


    placeSocketEventListners() {

        this.SocketsService.on('NewTask', (function(data) {
            this.addTaskLocally(data.task, data.username);
            this.Notify(data.username + ' added a todo', 'Success');
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('UpdatedTask', (function(data) {
            this.updateTaskLocally(data.task);
            if (data.task.status === 'Complete') {
                this.Notify(data.username + ' completed a todo', 'Success');
            }
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedTask', (function(data) {
            this.updateTaskLocally(data.task, true);
            this.Notify(data.username + ' removed a todo');
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('NewTodoList', (function(data) {
            this.addListLocally(data.list);
            this.Notify(data.username + ' added a new list!', 'Success');
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('UpdatedList', (function(data) {
            this.updateListLocally(data.list.id, data.list.name);
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedList', (function(data) {
            this.deleteListLocally(data.list.id);
            this.Notify(data.username + ' deleted a list!', 'Error');
            this.$scope.$apply();
        }).bind(this));

        this.SocketsService.on('DeletedAllComplete', (function(data) {
            this.Notify(data.username + ' cleared all completed todos');
        }).bind(this));

        this.SocketsService.on('logAllOut', (function(data) {
            window.location = '/rooms/login?kicked=true';
        }).bind(this));

    }

    handleError(error) {
        if (error.status === 401 || error.status === 403) {
            window.location = '/rooms/login?timeout=true';
        }
        console.error(error);
        this.Notify('Error communicating with server', 'Error');
    }

}

RoomCtrl.$inject = ['Notification', 'SocketsService', 'RoomService', 'TodoListsService', '$scope'];

export default RoomCtrl;
