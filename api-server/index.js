/* global console, process, require */

(function () {
	'use strict';

	var stellar = require('stellar-sdk');
	var express = require('express');
	var bodyParser = require('body-parser');

	function allowCORS(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

		if (req.method === 'OPTIONS') {
			res.sendStatus(200);
		} else {
			next();
		}
	}

	var serverKey = stellar.Keypair.fromSeed(process.env.SERVER_SEED);
	var serverAccount = serverKey.accountId();

	var asset = new stellar.Asset(
		process.env.ASSET_CODE,
		process.env.ASSET_ISSUER
	);

	var server = new stellar.Server(process.env.STELLAR_REMOTE);

	var app = express();
	if (process.env.ACCEPT_CORS && process.env.ACCEPT_CORS.toLowerCase() === 'true') {
		app.use(allowCORS);
	}
	app.use(bodyParser.json());

	app.post(process.env.SERVER_URI_PREFIX + '/register', function (req, res) {

		var address = req.body.address;
		console.log(address);

		server.loadAccount(serverAccount)
		.then(function (account) {

			var tx = new stellar.TransactionBuilder(account)
			.addOperation(stellar.Operation.createAccount({
				destination: address,
				startingBalance: process.env.INITIAL_XLM_AMOUNT
			}))
			.addOperation(stellar.Operation.changeTrust({
				source: address,
				asset: asset
			}))
			.addOperation(stellar.Operation.payment({
				destination: address,
				asset: asset,
				amount: process.env.INITIAL_ASSET_AMOUNT
			}))
			.build();

			tx.sign(serverKey);

			res.json({
				tx_env: tx.toEnvelope().toXDR().toString('base64')
			});
		})
		.catch(console.log);

	});

	app.listen(process.env.SERVER_PORT);
})();
