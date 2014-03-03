'use strict';

exports.init = function (grunt) {


    var lib = {};


    lib.iterate = function(object, callback) {
        if(object instanceof Array ){
            object.forEach(function(subObject){
                lib.iterate(subObject,callback);
            });
        }
        else{
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    callback(property, object[property]);
                }
            }
        }

    };

    lib.addTasks = function(tasks,options,param){
        if(options && options.tasks){
            //add tasks
            if(options.tasks instanceof Array ){
                options.tasks.forEach(function (task) {
                    tasks.push(task + ':' + param);
                });
            }else {
                tasks.push(options.tasks + ':' + param);
            }
        }
    };

    return lib;
};