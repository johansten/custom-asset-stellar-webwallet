/* global angular, localStorage */

angular.module('app')
.factory('History', function ($rootScope) {
	'use strict';

	var _value = [];
	return {
		set value(x) {
			_value = x;
			$rootScope.$apply();
		},
		get value() {
			return _value;
		},
		clear: function () {
			_value = [];
		},
		unshift: function(x) {
			_value.unshift(x);
//			$rootScope.$apply();
		}
	};
});
