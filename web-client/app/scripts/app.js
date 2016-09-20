/* global angular */
angular.module('app', [
	'ngRoute',
	'ngTouch'
])

.config(function ($locationProvider, $routeProvider) {
	'use strict';

	$routeProvider
	.when('/', {
		templateUrl: 'views/landing.html',
		controller: 'LandingCtrl',
		resolve: {
			check: function($location, Wallet) {
				if (Wallet.isLoggedIn()) {
					$location.path('/home');
				}
			}
		}
	})
	.when('/login', {
		templateUrl: 'views/login.html',
		controller: 'LoginCtrl'
	})
	.when('/signup', {
		templateUrl: 'views/signup.html',
		controller: 'SignupCtrl'
	})
	.when('/home', {
		templateUrl: 'views/home.html',
		controller: 'HomeCtrl'
	})
	.when('/send', {
		templateUrl: 'views/send.html',
		controller: 'SendCtrl'
	})
	.when('/receive', {
		templateUrl: 'views/recv.html',
		controller: 'RecvCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});

	// use the HTML5 History API
	$locationProvider.html5Mode(true);
})

.constant('HORIZON_URL', 'https://horizon-testnet.stellar.org')
.constant('API_SERVER_URL', 'http://localhost:9000/api')
.constant('ASSET', {
	issuer:	'GCRA6COW27CY5MTKIA7POQ2326C5ABYCXODBN4TFF5VL4FMBRHOT3YHU',
	code:	'TEST'
});

