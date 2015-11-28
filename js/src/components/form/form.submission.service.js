'use strict';
var app = app || angular.module('wordChainifierApp', []);
(function(app) {
   app.factory('formSubmissionService', ['$rootScope', '$http', function ($rootScope, $http) {
       return {
         /**
          * Passes words to the API for chain building
          * 
          * @param object words A model to be passed to the API containing:
          *   - firstWord string First word in the chain
          *   - secondWord string Second word in the chain
          */
         buildChain: function(words) {
           $rootScope.$broadcast('building-chain');
           $http({
                    method: 'GET',
                    url: '/build-chain',
                    params: words
                }).then(function(response) {
                  $rootScope.$broadcast('chain-built', response);
                });
         }
       };
   }]);
}(app));