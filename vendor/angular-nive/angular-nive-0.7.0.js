/**
 * (c) 2013-2014 Nive GmbH - www.nive.co
 * 
 * angular-nive v0.7.0
 * http://www.nive.co
 * 
 * License: MIT
 */
'use strict';
angular.module('nive.resource', []);
angular.module('nive.services', ['nive.resource']);
angular.module('nive', ['nive.services']);

'use strict';
angular.module('nive.resource').provider('NiveAPI', function() {

        var _$q,
        successHandler = function(response) {
            return response.data;
        },
        errorHandler = function(response) {

            // if the request was not handled by the server (or what not handles properly - ex. server error),
            // return a general error message
            if (!angular.isObject(response.data) || !response.data.message) {
                return _$q.reject('NiveAPI: An unknown error occurred.');
            }

            // Otherwise, use expected error message.
            return _$q.reject(response.data.message);
        };

        this.successHandler = function(handler) {
            if(angular.isFunction(handler)) {
                successHandler = handler;
            }

            return successHandler;
        };

        this.errorHandler = function(handler) {
            if(angular.isFunction(handler)) {
                errorHandler = handler;
            }

            return errorHandler;
        };

        this.$get = function($http, $q) {

            _$q = $q;

            return {
                get: function(resource, remoteMethod, params, apiOptions) {
                    return this.call(resource, remoteMethod, params, 'GET', apiOptions);
                },

                post: function(resource, remoteMethod, params, apiOptions) {
                    return this.call(resource, remoteMethod, params, 'POST', apiOptions);
                },

                call: function(resource, remoteMethod, params, httpMethod, apiOptions) {

                    httpMethod = angular.isString(httpMethod) ? httpMethod : 'GET';

                    // build request url
                    var url = nive.endpoint.apiUrl(angular.extend({}, {
                        name: resource,
                        method: remoteMethod
                    }, apiOptions || {}));

                    var request = $http({
                        method: httpMethod,
                        url: url,
                        data: params,
                        params: 'GET' === httpMethod? params : '',
                        responseType: 'json'
                    });

                    return request.then(successHandler, errorHandler);
                }
            };
        };
    }
);

'use strict';
angular.module('nive.services').factory('NiveDataStorageFactory', function(NiveAPI) {

    var __options = {},

    /**
     * DataStorage
     *
     * @param {string|Object} options Options passed to constructor, should at least have a resource
     * @constructor
     */
    DataStorage = function DataStorage(options) {
        this.options(options);
    };

    /**
     * Factory method for creating a new DataStorage instance
     *
     * @param {string|Object} options - Options passed to constructor
     * @static
     * @returns {DataStorage} new instance
     */
    DataStorage.factory = function(options) {
        return new DataStorage(angular.isString(options)? {resource: options} : options);
    };

    DataStorage.prototype = {

        options: function(option, value) {

            switch (true) {
                case angular.isString(option):
                    if(angular.isDefined(value)) {
                        __options[option] = value;
                    } else {
                        return __options[option];
                    }
                    break;
                case angular.isObject(option):
                    angular.extend(__options, option);
                    break;
            }

            return __options;
        },

        getItem: function(options) {
            if(angular.isString(options)) {
                options = {key: options};
            }

            return NiveAPI.get(this.options('resource'), 'getItem', options, this.options());
        },

        newItem: function(values) {
            if(angular.isArray(values)) {
                values = {items: values};
            }

            return NiveAPI.post(this.options('resource'), 'newItem', values, this.options());
        },

        setItem: function(values) {
            if(angular.isArray(values)) {
                values = {items: values};
            }

            return NiveAPI.post(this.options('resource'), 'setItem', values, this.options());
        },

        removeItem: function(values) {
            if(angular.isString(values)) {
                values = {key: values};
            }

            return NiveAPI.post(this.options('resource'), 'removeItem', values, this.options());
        },

        deleteItem: function(values) {
            return this.removeItem(values);
        },

        list: function(values) {
            return NiveAPI.get(this.options('resource'), 'list', values, this.options());
        },

        keys: function(values) {
            return NiveAPI.get(this.options('resource'), 'keys', values, this.options());
        }
    };

    return DataStorage.factory;
});

'use strict';
angular.module('nive.services').factory('NiveFileHostFactory', function(NiveAPI) {

    var  __options = {},

    /**
     * FileHost Class
     *
     * @param {string|Object} options Options passed to constructor, should at least hace a name
     * @constructor
     */
    FileHost = function FileHost(options) {
        this.options(options);
    };

    /**
    * Factory Method, creates a FileHost
    *
    * @param {string|Object} options - Options passed to constructor
    * @static
    * @returns {FileHost} - new FileHost instance
    */
    FileHost.factory = function(options) {
        return new FileHost(options);
    };

    FileHost.prototype = {

        options: function(option, value) {

            switch (true) {
                case angular.isString(option):
                    if(angular.isDefined(value)) {
                        __options[option] = value;
                    } else {
                        return __options[option];
                    }
                    break;
                case angular.isObject(option):
                    angular.extend(__options, option);
                    break;
            }

            return __options;
        },

        list: function(values) {
            if(angular.isString(values)) {
                values = {path: values};
            }

            return NiveAPI.get(this.options('name'), '@list', values, this.options());
        },

        details: function(values) {
            if(angular.isString(values)) {
                values = {path: values};
            }

            return NiveAPI.get(this.options('name'), '@details', values, this.options());
        },

        properties: function(values) {
            if(angular.isString(values)) {
                values = {path: values};
            }

            return NiveAPI.get(this.options('name'), '@properties', values, this.options());
        }
    };

    return FileHost.factory;
});

'use strict';
angular.module('nive.services').provider('NiveUser', function() {

    var options = {
        resource: 'users'
    };

    this.options = function(option, value) {

        switch (true) {
            case angular.isString(option):
                if(angular.isDefined(value)) {
                    options[option] = value;
                } else {
                    return options[option];
                }
                break;
            case angular.isObject(option):
                angular.extend(options, option);
                break;
        }

        return options;
    };

    this.$get = function(NiveAPI) {

        return {
            signIn: function(params) {
                return NiveAPI.post(options.resource, 'signin', params, options);
            },

            signOut: function() {
               return NiveAPI.get(options.resource, 'signout', null, options);
            },

            identity: function() {
                return NiveAPI.get(options.resource, 'identity', null, options);
            },

            name: function(params) {
                return NiveAPI.get(options.resource, 'name', params, options);
            },

            profile: function() {
                return NiveAPI.get(options.resource, 'profile', null, options);
            },

            authenticated: function(params) {
                if(angular.isArray(params)) {
                    params = {groups: params};
                }

                if(angular.isString(params)) {
                    params = {groups: [params]};
                }

                return NiveAPI.get(options.resource, 'authenticated', params, options);
            },

            signup: function(params) {
                return NiveAPI.get(options.resource, 'signup', params, options);
            },

            signup2: function(params) {
                if(angular.isString(params)) {
                    params = {token: params};
                }

                return NiveAPI.get(options.resource, 'signup2', params, options);
            },

            update: function(params) {
                return NiveAPI.get(options.resource, 'update', params, options);
            },

            updatePassword: function(params) {
                return NiveAPI.get(options.resource, 'updatePassword', params, options);
            },

            updateEmail: function(params) {
                if(angular.isString(params)) {
                    params = {email: params};
                }

                return NiveAPI.get(options.resource, 'updateEmail', params, options);
            },

            updateEmail2: function(params) {
                if(angular.isString(params)) {
                    params = {token: params};
                }

                return NiveAPI.get(options.resource, 'updateEmail2', params, options);
            },

            resetPassword: function(params) {
                if(angular.isString()) {
                    params = {identity: params};
                }

                return NiveAPI.get(options.resource, 'resetPassword', params, options);
            },

            resetPassword2: function(params) {
                return NiveAPI.get(options.resource, 'resetPassword2', params, options);
            }
        };
    };
});
