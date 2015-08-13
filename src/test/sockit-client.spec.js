/* globals require, describe, beforeEach, afterEach, it, window */

var _ = require('underscore');
var expect = require('chai').expect;
var WebSocket = require('ws');
var repeat = require('repeat');
var proto = require('protobufjs');
var diff = require('deep-diff');

var Update_json = require('../../main/proto/update.proto.json');
var Client = require('../../main/client/session-synch-client');

var Update = proto.loadJson(Update_json).build('Update');

describe('The session sync client', function() {

	var client;
	var server;
	var browser;
	var listeners;

	beforeEach(function() {

		for (var port = 8000; port < 10000; port++) {
			try {
				server = new WebSocket.Server({
					port: port
				});
				break;
			} catch(error) {
				console.log(error);
			}
		}

		if (!server) {
			throw new Error('Unable to start server.');
		}

		server.on('connection', function(socket) {
			console.log('Server received socket connection');

			server.on('message', function(message, flags) {
				console.log('Server received message: ' + message);
			});
		});

		listeners = {
			storage: []
		};

		browser = {

			location: 'http://localhost:' + port + '/',

			sessionStorage: {
				blah: 'argh'
			},

			onstorage: function(callback) {
				listeners.storage.push(callback);
			}

		};

		client = new Client(browser);

		client.socket.on('open', function() {
			console.log('Client opened socket.');
		});

		client.socket.on('message', function(message, flags) {
			console.log('Client received message: ' + message);
		});

	});

	afterEach(function() {

		server && server.close();

	});

	it('should connect as soon as initialised', function(done) {
		var complete = _.once(done);
		client.socket.on('open', complete);
	});

	it('should alter the session on receipt of websocket messages.', function(done) {
		var complete = _.once(done);

		expect(browser.sessionStorage.blah).to.equal('argh');

		var scanning = true;

		repeat(function() {
			if (browser.sessionStorage.blah === 'flargle') {
				console.log('blah = flargle');
				scanning = false;
				complete();
			}
		}).async().until(function() {
			return !scanning;
		}).start().then(function() {
			console.log('Monitor completed watching.');
		}, function(error) {
			console.error(error.stack);
		});

		var delta = diff.diff(browser.sessionStorage, _.extend({}, browser.sessionStorage, {
			blah: 'flargle'
		}));

		var changes = new Update(_.first(delta)).encode().toBase64();

		server.on('connection', function(socket) {
			console.log('Sending update down websocket');
			socket.send(changes);
		});

	});

	it('should send a websocket message on change of the session.', function(done) {
		var complete = _.once(done);

		server.on('connection', function(socket) {
			socket.on('message', function(message) {
				expect(message).to.be.ok;
				var changes = Update.decode64(message).toRaw();
				expect(changes).to.be.ok;
				expect(changes).to.not.be.empty;
				complete();
			});
		});

		browser.sessionStorage.blah = 'flargle';
		_.each(listeners.storage, function(listener) {
			listener({}, {});
		});

	});

});
