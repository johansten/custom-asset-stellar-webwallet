/* global angular, StellarSdk */

angular.module('app')
.directive('validAddress', function () {
	'use strict';

    return {
        require: 'ngModel',
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.validAddress = function(modelValue) {
				return StellarSdk.Keypair.isValidPublicKey(modelValue);
            };
		}
    };

});
