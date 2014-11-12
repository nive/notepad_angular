'use strict';
angular.module('niveNotepadDev', ['ngMockE2E', 'niveNotepad']).run(function($httpBackend) {

    var notes = [
        {
            id: 1,
            key: 'note',
            value: 'first stored note ever!',
            timestamp: 1414747731.52867
        },
        {
            id: 2,
            key: 'note',
            value: 'yet another note',
            timestamp: 1414747731.52834
        }
    ];

    $httpBackend.whenPOST(/.*(signin)\/*/).respond(function(method, url, data) {
        data = angular.fromJson(data);

        if(data.identity && data.identity.length > 2
                && data.password && data.password.length > 2) {
            return [200, 1414747731.52867];
        }

        return [400, {message: 'wrong credential'}];
    });

    $httpBackend.whenGET(/.*(signout)\/*/).respond(function(method, url, data) {
        return [200, {result: true}];
    });

    $httpBackend.whenGET(/.*(authenticated)/).respond(function() {
        return [200, {result: false}];
    });

    $httpBackend.whenGET(/.*(list)/).respond(function() {
        return [200, {total: notes.length, items: notes}];
    });

    $httpBackend.whenPOST(/.*(newItem)\/*/).respond(function(method, url, data) {
        data = angular.fromJson(data);
        data.id = notes.length +1;
        data.timestamp = new Date().getTime() / 1000;

        notes.push(data);

        return [200, {result: 1, success: [data.id]}];
    });

    $httpBackend.whenPOST(/.*(setItem)\/*/).respond(function(method, url, data) {
        data = angular.fromJson(data);

        notes.forEach(function(note, i) {
            if(note.id === data.id) {
                notes[i] = data;
                return false;
            }

            return true;
        });

        return [200, {result: 1, success: [data.id]}];
    });

    $httpBackend.whenPOST(/.*\/removeItem\/*/).respond(function(method, url, data) {
        data = angular.fromJson(data);
        notes = notes.filter(function(note) {
            return note.id !== data.id;
        });

        return [200, {result: 1, success: [data.id]}];
    });

    $httpBackend.whenGET(/.*(profile)(?!.html)\/*/).respond(function(method, url, data) {

        var profile = {
            realname: 'DUMMY',
            name: 'NAME',
            email: 'dummy@example.org'
        };

        return [200, profile];
    });

    $httpBackend.whenGET(/\/(views)*/).passThrough();
});
