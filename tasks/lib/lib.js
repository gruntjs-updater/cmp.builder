'use strict';
var path = require('path');

exports.init = function (grunt) {



    var lib = {};

    lib.isString = function(value){
        return typeof value == 'string' || value instanceof String;
    };

    lib.log = function(field, value, prefix){
        var assign = prefix ? ' ' + prefix + ' ' : ' = ';
        if (!value) {
            return prefix ? field + assign : field;
        } else if (lib.isString(value)) {
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

    lib.iterateDeep = function (object, fields, callback) {
        if (fields instanceof Array) {
            fields.forEach(function (field) {
                var values = object[field];
                if (values instanceof Array) {
                    values.forEach(function (value) {
                        callback(field,value);
                    });
                }else if(lib.isString(values == 'string')) {
                    callback(field,values);
                }
            });
        }else if(lib.isString(fields)) {
            var values = object[fields];
            if (values instanceof Array) {
                values.forEach(function (value) {
                    callback(fields,value);
                });
            }else if(lib.isString(values)) {
                callback(fields,values);
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

        //option options.tasks is depricated
        if(options && options.tasks ){
            //add tasks
            grunt.verbose.writeln('>>'.cyan + ' tasks', options.tasks);
            if(options.tasks instanceof Array ){
                options.tasks.forEach(function (task) {
                    tasks.push(task + ':' + param);
                });
            }else if(lib.isString(options.tasks)){
                tasks.push(options.tasks + ':' + param);
            }
        }
    };

    lib.getDependenciesDir = function(cmpDir, bowerDirName){
        var indexInBower = cmpDir.indexOf(bowerDirName);
        var dependenciesBaseDir = (indexInBower !== -1) ? cmpDir.substring(0, indexInBower) : cmpDir + '/';
        return dependenciesBaseDir + bowerDirName;
    };

    //normalize file
    lib.pathJoin = function(basePath, pathValue, file) {
        return path.join(basePath, pathValue, path.normalize(file)).replace(/\\/g, '/');
    };

    //normalize script
    lib.parseScript = function(file, minifyJs) {

        var minJsExt = '.min.js';
        var jsExt = '.js';

        if (minifyJs) {

            if (!lib.equalExt(file, minJsExt) && lib.equalExt(file, jsExt)) {
                file = file.replace(new RegExp('\.js$', 'i'), minJsExt);
            } else if (!lib.equalExt(file, minJsExt)) {
                grunt.fail.fatal('\n error parse Script file = ' + file.red + ', must end with ' + jsExt);
            }

        } else {
            if (lib.equalExt(file, minJsExt)) {
                file = file.replace(new RegExp('\.min\.js$', 'i'), jsExt);
            } else if (!lib.equalExt(file, jsExt)) {
                grunt.fail.fatal('\n error parse Script file = ' + file.red + ', must end with ' + jsExt);
            }
        }

        return file;

    };

    lib._bowerFiles = {};

    lib.readBowerFile = function(dir) {
        var file = dir + '/bower.json';
        grunt.log.writeln('   read file', file);
        var bower = lib._bowerFiles[file];
        if (!bower) {
            if (!grunt.file.exists(file)) {
                grunt.fail.fatal('\n file ' + file + ' not found. Please start command "grunt cmpBower" ');
            }
            lib._bowerFiles[file] = bower = grunt.file.readJSON(file);
        }
        return bower;
    };

    lib._configFiles = {};

    lib.readConfigFile= function(file, log) {
        if ((typeof file) !== 'string') {
            grunt.fail.fatal('\n config file must be json or yml(yaml)');
        }
        var config = lib._configFiles[file];
        if (!config) {
            if (!grunt.file.exists(file)) {
                grunt.fail.fatal('\n file ' + file + 'not found');
            }
            if (file.slice(-5) === '.yaml' || file.slice(-4) === '.yml') {
                lib._configFiles[file] = config = grunt.file.readYAML(file);
                grunt.log.writeln('>> '.blue + log + ' <= load from file ' + file.cyan);
            } else if (file.slice(-5) === '.json') {
                lib._configFiles[file] = config = grunt.file.readJSON(file);
                grunt.log.writeln('>> '.blue + log + ' <= load from file ' + file.cyan);
            } else {
                grunt.fail.fatal('\n config file must be json or yml(yaml)');
            }
        }
        return config;
    };

    lib.karmaSrc = function (file) {
        return file.split(',').map(function(src){
            var obj = {
                pattern: src
            };
            grunt.log.ok('file:',obj);
            return obj;
        });
    };
    lib.karmaPattern = function (file) {
        return file.pattern.split(',').map(function(src){
            var obj = {
                pattern: src
            };
            ['watched', 'served', 'included'].forEach(function(opt) {
                if (opt in options) {
                    obj[opt] = options[opt];
                }
            });
            grunt.log.ok('file:',obj);
            return obj;
        });
    };

    return lib;
};