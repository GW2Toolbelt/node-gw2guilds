"use strict"

const fs = require ('fs');
const path = require('path');

const async = require('async');
const _ = require('lodash');



/*
*
*   DEFINE EXPORT
*
*/

let Controller = {};
module.exports = Controller;




/*
*
*   PRIVATE PROPERTIES
*
*/

const __INSTANCE = {
	cacheFolder: path.join(process.cwd(), 'cache'),
};



/*
*
*   PSUEDO INIT
*
*/




/*
*
*   PUBLIC METHODS
*
*/

Controller.init = function(onInitDone){
	fs.mkdir(Controller.getCacheFolder(), onInitDone);
};



Controller.getCacheFolder = function(){
	return __INSTANCE.cacheFolder;
};



Controller.get = function(cacheKey, cacheTime, fallback, callback){
	const cachePath = __getCachePath(cacheKey);

	__isFresh(
		cachePath,
		cacheTime,
		__read.bind(null, cachePath, callback),
		fallback.bind(null, function(err, data){
			__write(cachePath, data, callback.bind(null, err, data));
		})
	);
};



Controller.put = function(cacheKey, content, callback){
	const cachePath = __getCachePath(cacheKey);
	__write(cachePath, content, callback)
};



Controller.deleteCacheFiles = function(extensionToDelete, callback){
	fs.readdir(Controller.getCacheFolder(), function(err, files){
        async.each(
            files,
            __deleteFile.bind(null, extensionToDelete),
            callback
        );
	});
};

function __deleteFile(extensionToDelete, fileName, callback){
    const splitFile = fileName.split('.');
    if(splitFile[splitFile.length-1] === extensionToDelete){
        fs.unlink(path.join(Controller.getCacheFolder(), fileName), callback);
    }
    else{
        callback()
    }
}




/*
*
*   PRIVATE METHODS
*
*/


/*
*	IO
*/



function __read(cachePath, onReadDone){
	fs.readFile(cachePath, function(err, data){
		if(data){
			data = data.toString();

			try{
				data = JSON.parse(data);
			}
			catch(excpt){}

			// console.log('__read', cachePath, data);
		}

		onReadDone(err, data);
	});
};



function __write(cachePath, content, onWriteDone){	
	const toDisk = JSON.stringify(content);

	const tmpPath = __getTempFile();

	// console.log('__write', cachePath, content);

	fs.writeFile(tmpPath, toDisk, function(err){

		fs.rename(tmpPath, cachePath, function(err){
			if(err){

				fs.unlink(tmpPath, function(err){
					setTimeout(function(){
						console.log('RETRYING CACHE WRITE', cachePath);
						__write(cachePath, content, onWriteDone);
					}, 100);
				});
				
			}
			else{
				onWriteDone(err)
			}
		});
	});
};



function __isFresh (cachePath, cacheTime, onFresh, onNotFresh){
	if(!cacheTime){
		onFresh(true);
	}
	else{
		let isFresh = false;

		fs.stat(cachePath, function(err, stats){
			// if(err){console.log(err)}

			if(stats){
				const localAge = Date.now() - stats.mtime;
				isFresh = !!(localAge <= cacheTime);
				// console.log(cachePath, localAge);
			}

			// console.log('__isFresh', cachePath, isFresh);

			if(isFresh || !onNotFresh){
				onFresh(isFresh);
			}
			else{
				onNotFresh(isFresh);
			}
		});
	}
};



/*
*	PATHS
*/

function __getMapPath(){
	return path.join(
		Controller.getCacheFolder(),
		'map.json'
	);
}

function __getCachePath(cacheKey){
	return path.join(
		Controller.getCacheFolder(),
		cacheKey + '.json'
	);
}


function __getTempFile(){
	return path.join(
		Controller.getCacheFolder(),
		require('uuid').v1() + '.tmp'
	);
}