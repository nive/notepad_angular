(function() {
    'use strict';
    var notepad = angular.module('niveNotepad', ['ngRoute', 'nive']);

    // note specific config
    notepad.constant('NOTES', {
        RESOURCE: 'notes', // backend resource name for collection
        KEY: 'note' // backend key for single note
    })
    .config(function($routeProvider, $httpProvider) {
        $routeProvider
            .when('/login', {
                templateUrl: 'app/views/login.html',
                controller: 'AuthCtrl'
            })
            .when('/signout', {
                templateUrl: 'app/views/login.html',
                controller: 'AuthCtrl'
            })
            .when('/profile', {
                templateUrl: 'app/views/profile.html',
                controller: 'ProfileCtrl',
                authReq: true
            })
            .when('/', {
                templateUrl: 'app/views/notes.html',
                controller: 'NotesCtrl',
                authReq: true
            });

        // register custom http interceptor
        $httpProvider.interceptors.push('HttpInterceptor');
    })
    .run(function($rootScope, $location) {
        $rootScope.isAuthenticated = false;
        $rootScope.$on('$routeChangeStart', function(e, next) {
            if(!$rootScope.isAuthenticated && next.authReq) {
                $location.path('/login').replace();
            }
        });
    });

    // --------------------
    // Services

    /**
     * Simple Http interceptor factory
     */
    notepad.factory('HttpInterceptor', function($q, $location, $rootScope) {
        return {
            responseError: function(rejection) {
                switch(rejection.status) {
                    case 403:
                    case 401:
                    case 400:
                        $rootScope.isAuthenticated = false;
                        $location.path('/login').replace();
                        break;
                    case 404:
                        alert('Service error, please retry later!');
                        break;
                    default :
                        alert('General error');
                }

                return $q.reject(rejection);
            }
        };
    });

    /**
     * Notes factory
     */
    notepad.factory('Notes', function(NiveDataStorageFactory, NOTES) {
        var notes = NiveDataStorageFactory({resource: NOTES.RESOURCE});
        return notes;
    });

    // ----------------
    // Controllers

    /**
     * SignInCtrl - responsible for handling user authentication
     */
    notepad.controller('AuthCtrl', function($scope, $rootScope, $location, NiveUser) {

        // credentials model for login form
        $scope.credentials = {};

        // sign out if signout path called
        if(new RegExp(/(signout)/).test($location.path())) {
            NiveUser.signOut().then(function() {
                $rootScope.isAuthenticated = false;
            });
        }

        // check if already authenticated
        else {
            NiveUser.authenticated().then(function(res) {
                $rootScope.isAuthenticated = res.result;
                if(res.result) {
                    redirectToNotes();
                }
            });
        }

        $scope.signIn = function() {
            NiveUser.signIn($scope.credentials).then(
                function(res) {
                    // clear credentials to clear login inputs
                    $scope.credentials = {};
                    $scope.authError = false;
                    $rootScope.isAuthenticated = res && res.data;

                    redirectToNotes();
                },
                function() {
                    $scope.authError = true;
                }
            );
        };

        function redirectToNotes() {
            $location.path('/');
            $location.replace();
        }
    });

    /**
     * NotesCtrl - responsible for notepad behavior
     */
    notepad.controller('NotesCtrl', function($scope, Notes, NOTES) {

        // notes
        $scope.notes = [];

        // load stored notes initially and assign result to $scope
        loadList();

        $scope.add = function(note) {
            Notes.newItem({key: NOTES.KEY, value: note.text}).then(function(res) {
                note.id = res[0];
                $scope.note = {};
                loadList();
            });
        };
        $scope.update = function(note) {
            Notes.setItem(note);
        };

        $scope.remove = function(note) {
            Notes.removeItem({key: note.key, id: note.id}).then(function() {
                $scope.notes.splice($scope.notes.indexOf(note), 1);
            });
        };

        function loadList() {
            Notes.list().then(function(result) {
                $scope.notes = result.items;
            });
        }
    });

    notepad.controller('ProfileCtrl', function($scope, NiveUser) {

        NiveUser.profile($scope.profile).then(function(profile) {
            $scope.profile = profile;
        });

        $scope.updateProfile = function() {
            NiveUser.profile($scope.profile);
        }

        $scope.updatePassword = function() {
            NiveUser.updatePassword($scope.password);
        }
    });

    // ---------------
    // Directives

    /**
     * Match two input fields
     */
    notepad.directive('match', function () {
        return {
            require: 'ngModel',
            restrict: 'A',
            scope: {
                match: '='
            },
            link: function(scope, elem, attrs, ctrl) {
                scope.$watch(function() {
                    var modelValue = ctrl.$modelValue || ctrl.$$invalidModelValue;
                    return (ctrl.$pristine && angular.isUndefined(modelValue)) || scope.match === modelValue;
                }, function(currentValue) {
                    ctrl.$setValidity('match', currentValue);
                });
            }
        };
    });

})();
