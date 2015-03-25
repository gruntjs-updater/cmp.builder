'use strict';

exports.init = function (grunt) {


    var lib = {};

    lib.log = function(field, value, prefix){
        var assign = prefix ? ' ' + prefix + ' ' : ' = ';
        if (!value) {
            return prefix ? field + assign : field;
        } else if (typeof value === 'string') {
            return field + assign + value.cyan;
        } else if (value instanceof Array) {
//            if(value.length < 15 || value.length > 40 ){
                return field + assign + '[ ' + value.join(', ').cyan + ' ]';
//            }else{
//                return field + assign + '[\n\t\t' + value.join(',\n\t\t') + ' ]';
//            }

        } else {
            return field + assign + '{ ' + (typeof value) + ':' + value.toString().cyan + ' }';
        }
    };

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

    lib.equalName = function (file, name) {
        return  file.substr(0, name.length) === name;
    };

    lib.equalExt = function (file, ext) {
        return  file.substr(-ext.length) === ext;
    };

    lib.fieldsCount = function (object){
        var count = 0;
        for (var property in object) {
            count++;
        }
        return ''+count;
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

    lib.getDependenciesDir = function(cmpDir, bowerDirName){
        var indexInBower = cmpDir.indexOf(bowerDirName);
        var dependenciesBaseDir = (indexInBower !== -1) ? cmpDir.substring(0, indexInBower) : cmpDir + '/';
        return dependenciesBaseDir + bowerDirName;
    };

    lib.parseScript = function(script, minifyJs) {

        var minJsExt = '.min.js';
        var jsExt = '.js';
        var pointIndex = script.indexOf('./');
        script = (pointIndex === 0 ? script.substr(2) : script );

        if (minifyJs) {

            if (!lib.equalExt(script, minJsExt) && lib.equalExt(script, jsExt)) {
                script = script.replace(new RegExp('\.js$', 'i'), minJsExt);
            } else if (!lib.equalExt(script, minJsExt)) {
                grunt.fail.fatal('\n error cmp().main item = ' + script.red + ', must end with ' + jsExt);
            }

        } else {
            if (lib.equalExt(script, minJsExt)) {
                script = script.replace(new RegExp('\.min\.js$', 'i'), jsExt);
            } else if (!lib.equalExt(script, jsExt)) {
                grunt.fail.fatal('\n error cmp().main item = ' + script.red + ', must end with ' + jsExt);
            }
        }

        return script;

    };

    return lib;
};