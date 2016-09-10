'use strict';

class RoomCtrl {

    constructor(Notification, SocketsService, RoomService, TasksService, TodoListsService, $scope) {
        // Dependencies
        this.Notification = Notification;
        this.SocketsService = SocketsService;
        this.RoomService = RoomService;
        this.TasksService = TasksService;
        this.TodoListsService = TodoListsService;
        this.$scope = $scope;

        this.room = {
            name: '',
            isAdmin: false,
            username: ''
        };

        this.lists = [];

        this.listsAmountPerPage = 6;

        this.listsCurrentPage = 1;

        this.listsTotal = 0;

        this.todosPerList = 8;

        this.hash = '';

        this.init();
    }

    init() {
        this.RoomService.getInfo(
            roomInfo => {
                this.room = roomInfo;
                this.TodoListsService.countLists().then(
                    result => {
                        this.hash = this.SocketsService.init(this.room.name);

                        this.listsTotal = result.data.count;

                        this.placeSocketEventListners();

                        this.changePage(1, function() {
                            document.body.className = 'loaded';
                        });
                    },
                    this.handleError.bind(this)
                );
            }.bind(this), this.handleError.bind(this));

    }


    /*
    <--------- PAGE TRACKING
    */

    changePage(number, cb) {
        let offset = (number - 1) * this.listsAmountPerPage;

        this.TodoListsService.read(undefined, offset, this.listsAmountPerPage).then(
            result => {
                this.lists = result.data;
                if (typeof cb === 'function') {
                    cb();
                }
            },
            this.handleError.bind(this)
        );
    }


    /*
    <--------- LOCAL STORAGE FUNCTIONS
    */

    addListLocally(list) {
        this.listsTotal++;
        if (this.listsCurrentPage === 1) {
            if (typeof list.tasks === 'undefined') {
                list.tasks = [];
            }
            this.lists.unshift(list);
            if (this.lists.length > this.listsAmountPerPage) {
                this.lists.length = this.listsAmountPerPage;
            }
        } else {
            this.appendListBeginningOfPage();
        }
    }
    updateListLocally(id, newName) {
        for (let i = 0; i < this.lists.length; i++) {
            if (this.lists[i].id === id) {
                this.lists[i].name = newName;
                return;
            }
        }
    }

    deleteListLocally(id) {
        this.listsTotal--;
        for (let i = 0; i < this.lists.length; i++) {
            if (this.lists[i].id === id) {
                this.lists.splice(i, 1);
                return this.appendListEndOfPage();
            }
        }
        if (id > this.lists[0].id) {
            this.lists.splice(0, 1);
            return this.appendListEndOfPage();
        }
    }
    trimLists() {
        if (this.lists.length > this.listsAmountPerPage) {
            this.lists.length = this.listsAmountPerPage;
        }
    }

    trimTodosInList(todoArray) {
        if (todoArray.length > this.todosPerList) {
            todoArray.length = this.todosPerList;
        }
    }

    addTodoLocally(todo) {
        let list = this.lists.find(function(el) {
            return el.id === todo.todoListId;
        });
        if (list) {
            list.tasks.unshift(todo);
            this.trimTodosInList(list);
        }
    }

    updateTaskLocally(todo, remove) {
        let list = this.lists.find(function(el) {
            return el.id === todo.todoListId;
        });
        if (list) {
            for (let i = 0; i < list.tasks.length; i++) {
                if (list.tasks[i].id === todo.id) {
                    if (todo.status === 'Complete' || remove) {
                        list.tasks.splice(i, 1);
                        this.appendTodoAtEndOfList(list.id, list.tasks.length);
                    } else {
                        list.tasks[i] = todo;
                    }
                    return false;
                }
            }
        }
    }

    resetNewTodo(id) {
        let list = this.lists.find(function(el) {
            return el.id === id;
        }, this);
        if (list) {
            list.newTask = {
                title: '',
                status: 'Todo',
                todoListId: list.id
            };
        }
    }

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
        let offset = ((this.listsCurrentPage - 1) * this.listsAmountPerPage) + this.lists.length;
        this.TodoListsService.read(undefined, offset, 1).then(
            result => {
                if (result.data.length > 0) {
                    this.lists.push(result.data[0]);
                }
            },
            this.handleError.bind(this)
        );
    }

    appendTodoAtEndOfList(id, offset) {
        this.TasksService.read(undefined, offset, 1, 'Todo', id).then(
            result => {
                if (result.data.tasks.length > 0) {
                    let list = this.tasks.find(function(el) {
                        return el.id === id;
                    }, this);
                    if (list) {
                        list.tasks.push(result.data.tasks[0]);
                    }
                }
            },
            this.handleError.bind(this)
        );

    }

    createTodo(listID, task) {
        let newTodo = task;
        newTodo.todoListId = listID;
        this.TasksService.create(task, this.hash).then(
            result => {
                this.addTodoLocally(result.data);
                this.resetNewTodo(result.data.todoListId);
            },
            this.handleError.bind(this)
        );
    }

    editTask(task) {
        this.TasksService.update(task.id, task, this.hash).then(
            result => {
                if (result.data.status === 'Complete') {
                    return this.updateTaskLocally(result.data);
                }
            },
            this.handleError.bind(this)
        );
    }

    deleteTask(task) {
        this.TasksService.destroy(task.id, this.hash).then(
            result => this.updateTaskLocally(task, true),
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
            this.addTodoLocally(data.task, data.username);
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

RoomCtrl.$inject = ['Notification', 'SocketsService', 'RoomService', 'TasksService', 'TodoListsService', '$scope'];

export default RoomCtrl;
