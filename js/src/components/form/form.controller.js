'use strict';
var app = app || angular.module('wordChainifierApp', []);
(function(app) {
  app.controller('formCtrl', ['$scope', 'formSubmissionService', function($scope, formSubmissionService) {
      
      $scope.words = {
        firstWord: '',
        lastWord: ''
      };
      
      /**
       * Check if the form element has an error
       * 
       * @param string form The form object containing the control
       * @param string input The name of the input to check errors for
       * @returns bool
       */
      $scope.hasError = function(form, input) {
        return form[input].$invalid && form[input].$touched;
      }
      
      /**
       * Handles form submission       
       */
      $scope.submit = function(isValid) {
        if(isValid) {
          formSubmissionService.buildChain($scope.words);
        }
      }
  }]);
}(app));
