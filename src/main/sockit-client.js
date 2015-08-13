/* globals module, define, sessionStorage */

var _ = require('underscore');
var WebSocket = require('ws');
var diff = require('deep-diff');
var proto = require('protobufjs');
var path = require('path');

var json = require(path.join(__dirname, '../proto/update.proto.json'));

var Update = proto.loadJson(json).build('Update');

module.exports = function(window) {
	var self = this;

	var root = window || root;

	self.session = root.sessionStorage;
	self.previous = {};

	self.socket = new WebSocket(root.location/*.replace('^http', 'ws')*/);

	self.socket.on('message', function(message) {

		// Decode the incoming message.
		var change = Update.decode64(message).toRaw();

		// Apply the received changes to the session storage.
		diff.applyChange(self.session, true, change);

		// Reset previous to avoid cyclical updates.
		self.previous = _.clone(self.session);

	});

	self.pendingChanges = [];
	self.changeProcessor = function(change) {
		self.pendingChanges.push(change);
	};

	root.onstorage(function(event) {

		// Calculate changes.
		var changes = diff.diff(self.previous, self.session, function(path, key) {

			var chain = [].concat(path, key);

			function reducer(memo, item) {
				return memo && memo[item];
			}

			var value = _.reduce(chain, reducer, self.session)
				|| _.reduce(chain, reducer, self.previous);

			return _.isFunction(value);

		});

		if (_.isEmpty(changes)) {
			return;
		}

		_.each(changes, self.changeProcessor);

		self.previous = _.clone(self.session);

	});

	self.socket.on('open', function() {
		var socket = this;

		self.changeProcessor = function(change) {

			// Encode the change into a protocol buffer.
			var payload = new Update(change).encode().toBase64();

			// Send it down the socket.
			console.log('Sending update down websocket.');
			socket.send(payload);

		};

		_.each(self.pendingChanges, self.changeProcessor);

	});

};
