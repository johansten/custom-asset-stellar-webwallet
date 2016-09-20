/* global EventSource, StellarSdk */

angular.module('app')
.factory('Wallet', function ($http, $q, Balance, History, API_SERVER_URL, ASSET, HORIZON_URL) {
	'use strict';

	function _getSourceOps(tx, source) {
		return tx.operations.filter(function (elem) {
			if (elem.source) {
				return (elem.source === source);
			} else {
				return (tx.source === source);
			}
		});
	}

	function _isTxSafeToSign(tx, address) {

		var sourceOps = _getSourceOps(tx, address);
		if (sourceOps.length !== 1) {
			return false;
		}

		var op = sourceOps[0];
		if (op.type !== 'changeTrust') {
			return false;
		}

		if (op.line.code !== ASSET.code) {
			return false;
		}

		if (op.line.issuer !== ASSET.issuer) {
			return false;
		} else {
			return true;
		}
	}

	function _assetFilter(elem) {
		if (elem.asset_type == 'native') {
			return false;
		}

		if (elem.asset_issuer !== ASSET.issuer) {
			return false;
		}

		return (elem.asset_code === ASSET.code);
	}

	function _paymentFilter(elem) {
		if (elem.type !== 'payment') {
			return false;
		}

		return _assetFilter(elem);
	}

	function _createTxRecord(address) {
		return function (record, date) {
			var isSending = record.from === address;
			return {
				counterparty: isSending? record.to: record.from,
				amount: (isSending? '-': '') + record.amount,
				date: date
			};
		};
	}

	function _background() {
		Wallet.getBalance()
		.then(function (res) {
			Balance.value = parseFloat(res);
		});

		Wallet.getTransactions(10)
		.then(function (transactions) {
			History.value = transactions;
		});

		Wallet.onPayment(function (res) {
			History.unshift(res);
			Balance.value = Balance.value + parseFloat(res.amount);
		});
	}

	//
	//
	//

	var server = new StellarSdk.Server(HORIZON_URL);

	var currentAccount = {};
	var Wallet = {
		current: currentAccount
	};

	Wallet.login = function (seed) {

		var keys = StellarSdk.Keypair.fromSeed(seed);
		currentAccount.keys = keys;
		currentAccount.id = keys.accountId();
		localStorage.setItem('seed', seed);

		_background();
	};

	Wallet.logout = function () {
		Balance.clear();
		History.clear();
		currentAccount = {};
		localStorage.removeItem('seed');
	};

	Wallet.isLoggedIn = function () {
		return currentAccount.id;
	};

	Wallet.getBalance = function () {
		return server.accounts()
		.accountId(currentAccount.id)
		.call()
		.then(function (res) {
			var ref = res.balances.filter(_assetFilter);
			if (ref.length) {
				return ref[0].balance;
			} else {
				return '0';
			}
		});
	};

	Wallet.register = function (key) {
		var accountId = key.accountId();
		return $http.post(API_SERVER_URL + '/register', {address: accountId})
		.then(function (res) {
			console.log(res);

			var tx = new StellarSdk.Transaction(res.data.tx_env);
			if (_isTxSafeToSign(tx, accountId)) {
				tx.sign(key);
				console.log('submitting');
				return server.submitTransaction(tx);
			} else {
				$q.reject({
					msg: 'malicious transaction'
				});
			}
		});
	};

	Wallet.sendPayment = function (destination, amount) {

		return server.loadAccount(currentAccount.id)
		.then(function (account) {

			var tx = new StellarSdk.TransactionBuilder(account)
			.addOperation(StellarSdk.Operation.payment({
				destination: destination,
				asset: new StellarSdk.Asset(ASSET.code, ASSET.issuer),
				amount: amount.toString()
			}))
			.build();

			tx.sign(currentAccount.keys);
			return server.submitTransaction(tx);
		});
	};

	Wallet.getTransactions = function (limit) {

		function getDate(res) {
			return res.data.created_at;
		}

		function zipMap(a, b, callback) {
			var res = [];
			for (var i=0; i < a.length; i++) {
				res.push(callback(a[i], b[i]));
			}
			return res;
		}

		return server.operations()
		.forAccount(currentAccount.id)
		.limit(limit)
		.cursor('now')
		.order('desc')
		.call()
		.then(function (res) {

			var records = res.records.filter(_paymentFilter);
			var promises = records.map(function (record) {
				return $http.get(record._links.transaction.href).then(getDate);
			});

			$q.all(promises)
			.then(function (dates) {
				return zipMap(records, dates, _createTxRecord(currentAccount.id));
			});
		});
	};

	Wallet.onPayment = function (callback) {

		function onmessage(msg) {
			if (_paymentFilter(msg)) {
				$http.get(msg._links.transaction.href)
				.then(function (res) {
					callback(
						_createTxRecord(currentAccount.id)(msg, res.data.created_at)
					);
				});
			}
		}

		function onerror(event) {
			if (event.target.readyState === EventSource.CLOSED) {
				connect();
			}
		}

		function connect() {

			if (currentAccount.eventsource) {
				currentAccount.eventsource.close();
				currentAccount.eventsource.onmessage = null;
			}

			currentAccount.eventsource = server.operations()
			.forAccount(currentAccount.id)
			.cursor('now')
			.stream({
				onerror:	onerror,
				onmessage:	onmessage
			});
		}

		connect();
	};

	var seed = localStorage.getItem('seed');
	if (seed) {
		Wallet.login(seed);
	}

	return Wallet;
});
