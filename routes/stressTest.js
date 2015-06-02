"use strict";

const _ = require('lodash');
const async = require('async');
// const cache = require('../lib/cache');
const guilds = require('../lib/guilds');

const guildList = require('../cache/guildMap.json');

const getNum = 128;


module.exports = function(req, res) {

	var sampleGuilds = _.sample(_.keys(guildList), getNum);

	// console.log(guilds);
	console.log(sampleGuilds);

	async.concat(
		sampleGuilds,
		__getImageTags,
		__buildHtml
	);



	function __getImageTags(guildName, nextGuild) {
		async.concat([
			// 256,
			// 190,
			128,
			// 96,
			// 64,
			// 48,
			// 32,
			// 24,
			// 16,
		],
		function(size, nextSize) {
			var slug = guilds.slugify(guildName);
			// nextSize(null, `<img src="/guilds/${slug}/256.svg" style="width:${size}px;height:${size}px;" title="${guildName}" />`);
			nextSize(null, `<img src="http://localhost:3000/guilds/${slug}/256.svg" style="width:${size}px;height:${size}px;" title="${guildName}" />`);
		},
		function(err, results) {
			nextGuild(null, results.join(''));
		});
	}


	function __buildHtml(err, urlNodes) {
		_sendToClient(urlNodes.join('\n'));
	}


	function _sendToClient(html) {
		res.header('content-type', 'text/html');
		res.send(html);
	}




	function __getGuildUrl(guildName) {
		return __getCanonicalUrl([
			'',
			'guilds',
			guildNameUrl
		].join('/'));
	}



	function __getImageUrl(guildName, size) {
		return __getGuildUrl(guildName) + '/' + size + '.svg';
	}



	function __getCanonicalUrl(stub) {
		return [
			'http://',
			req.headers.host,
			stub,
		].join('');
	}


};