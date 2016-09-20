/* global angular */
'use strict';

angular.module('app')
.controller('SendCtrl', function ($location, $scope, Wallet) {

	$scope.isPending = false;
	$scope.send = {
		amount: 1
	};

	$scope.submit = function () {

		$scope.isPending = true;
		Wallet.sendPayment($scope.send.destination, $scope.send.amount)
		.then(function (res) {
			$scope.isPending = false;
			$location.path('/home');
			$scope.$apply();
		});
	};
});
