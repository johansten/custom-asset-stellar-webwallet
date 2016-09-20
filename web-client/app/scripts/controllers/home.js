/* global angular */
'use strict';

angular.module('app')
.controller('HomeCtrl', function ($scope, $timeout, Balance, History, ASSET) {
	$scope.asset = ASSET;
	$scope.balance = Balance;
	$scope.history = History;
});
