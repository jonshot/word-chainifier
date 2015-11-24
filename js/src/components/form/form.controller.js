'use strict';
var app = app || angular.module('wordChainifierApp', []);
(function(app) {
  app.controller('formCtrl', ['$scope', function($scope) {
      /**
       * Handles form submission       
       */
      $scope.submitForm = function() {
        //@todo: Validation, pass to Clojure...
      }
  }]);
}(app));
