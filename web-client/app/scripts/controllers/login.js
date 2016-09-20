/* global angular, IdKeys */

'use strict';

angular.module('app')
.controller('LoginCtrl', function ($location, $scope, Wallet) {
	$scope.error = '';

	$scope.login = function () {
		Wallet.login($scope.user.seed);
		$location.path('/home');
	};
});
