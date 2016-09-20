# custom-asset-stellar-webwallet

This is a web wallet for custom assets in the Stellar network.

It's simple, but shows off some interesting concepts.

Account creation, e.g., is done using a multi-signature transaction, where both the user and the server signs for parts of it; the server for creating the account and for sending an initial balance, and the user for setting a trustline for the asset in question.


To start:
```
cd api-server
npm install
./api-server.development.sh
```

```
cd web-client
npm install
bower install
grunt serve
```
