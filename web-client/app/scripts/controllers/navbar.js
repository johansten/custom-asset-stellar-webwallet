/* global angular, IdKeys */

'use strict';

angular.module('app')
.controller('NavbarCtrl', function ($location, $scope, Wallet) {

	$scope.isLoggedIn = Wallet.isLoggedIn;

	$scope.login = function () {
		console.log("logging in");
	};

	$scope.logout = function () {
		Wallet.logout();
		$location.path('/');
	};
});
