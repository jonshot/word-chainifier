'use strict';
var app = app || angular.module('wordChainifierApp', []);
(function (app) {
  app.controller('resultsBoxCtrl', ['$scope', function ($scope) {

//The word chain array
      $scope.chain = [];
      //Display no results text on no result or error
      $scope.noResult = {
        visible: true,
        text: 'No chain'
      };
      $scope.$on('chain-built', function (e, response) {

        var data = response.data;
        
        if (!data.success) {
          $scope.noResult.text = data.error;
          $scope.noResult.visible = true;
          return;
        }
        
        if (!data.chain.length) {
          $scope.noResult.text = 'No chain';
          $scope.noResult.visible = true;
          return;
        }
        
        $scope.noResult.visible = false;
        $scope.chain = data.chain;
      });
    }]);
}(app));