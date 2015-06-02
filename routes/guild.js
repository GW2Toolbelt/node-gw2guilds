"use strict";

const qs = require('querystring');

const guilds = require('../lib/guilds');

module.exports = function(req, res) {
	const renderStart = Date.now();
	const slug = req.params.guildSlug;


	guilds.getBySlug(slug, function(err, data) {
		console.log('data', data);
		if (data && data.has('guild_name')) {
			const canonical = '/guilds/' + data.get('slug');
			console.log(req.url, canonical);

			if (req.url !== canonical) {
				res.redirect(301, canonical);
			}
			else {
				res.render("guild", {
					renderStart: renderStart,
					searchBar: true,

					title: data.get('guild_name') + ' [' + data.get('tag') + ']',
					guild: data.toJS(),
				});
			}
		}
		else {
			res.send(404, 'Guild not found');
		}
	});

};
