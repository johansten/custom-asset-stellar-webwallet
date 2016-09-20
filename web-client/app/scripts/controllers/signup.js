/* global angular, IdKeys */

'use strict';

angular.module('app')
.controller('SignupCtrl', function ($location, $scope, Wallet) {

	$scope.isPending = false;
	$scope.generate = function () {
		$scope.key = StellarSdk.Keypair.random();
	};

	$scope.register = function () {

		$scope.isPending = true;
		Wallet.register($scope.key)
		.catch(function (err) {
			console.log('registration failed');
			console.log(err);
			$scope.isPending = false;
		})
		.then(function () {
			console.log('register succeeded');
			$location.path('/login');
			$scope.isPending = false;
		});
	};

	$scope.generate();
});
