/* global angular */
'use strict';

angular.module('app')
.controller('RecvCtrl', function ($scope, Wallet) {
	$scope.user = {
		address: Wallet.current.id
	};
});
