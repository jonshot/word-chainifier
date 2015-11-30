'use strict';
var ctrl = ctrl || angular.module('controllers', []);
(function (ctrl) {
  ctrl.controller('mainCtrl', ['$scope', '$document', function ($scope, $document) {
      $document.ready(function () {
        $scope.showing = true;
        $scope.$apply();
      });
    }]);
}(ctrl));
