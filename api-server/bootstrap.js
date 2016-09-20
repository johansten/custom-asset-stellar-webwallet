/* global console, module, require */

/*
	ASSET_ISSUER:
{
	address: GCRA6COW27CY5MTKIA7POQ2326C5ABYCXODBN4TFF5VL4FMBRHOT3YHU,
 	seed: SBGES7DUQ62LWIZTHTHVF6D5STRFHUPOOLO4DJOYATRJR4O6TDHQWZ6U
}

	API SERVER:
{
	address: GAVTINLTFFPJKJ3YTTGGXWSTHTAUM4D6ERYLD3Z5SWHLMGSW3XOB73HA,
 	seed: SCVDITN4HRVOMD7IHJQW5CVI56F7TIBL3DX32W7HEYN2C2VEAU4SQXOA
}

 */

(function () {
	'use strict';

	var API_SERVER_SEED = 'SCVDITN4HRVOMD7IHJQW5CVI56F7TIBL3DX32W7HEYN2C2VEAU4SQXOA';
	var ISSUER_SEED = 'SBGES7DUQ62LWIZTHTHVF6D5STRFHUPOOLO4DJOYATRJR4O6TDHQWZ6U';

	//

	var stellar = require('stellar-sdk');
	var server = new stellar.Server('https://horizon-testnet.stellar.org');

	//

	var issuerKey = stellar.Keypair.fromSeed(ISSUER_SEED);
	var serverKey = stellar.Keypair.fromSeed(API_SERVER_SEED);

	var issuerAccount = issuerKey.accountId();
	var serverAccount = serverKey.accountId();

	var asset = new stellar.Asset('TEST', issuerAccount);

	//

	server.loadAccount(issuerAccount)
	.then(function (account) {

		//	make server account trust issuer for MAX_INT REFs
		//	create REFs by sending to server account

		var tx = new stellar.TransactionBuilder(account)
		.addOperation(stellar.Operation.changeTrust({
			source: serverAccount,
			asset: asset
		}))
		.addOperation(stellar.Operation.payment({
			destination: serverAccount,
			asset: asset,
			amount: '1000000'
		}))
		.build();

		tx.sign(issuerKey);
		tx.sign(serverKey);

		return server.submitTransaction(tx);
	})
	.catch(console.log)
    .then(console.log);

})();

