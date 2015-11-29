'use strict';
var ctrl = ctrl || angular.module('controllers', []);
(function (ctrl) {
    ctrl.controller('resultsBoxCtrl', ['$scope', '$timeout', function ($scope, $timeout) {

            var loadWait;

            //The word chain array
            $scope.chain = [];
            //Display 'no results' text on no result or error
            $scope.noResult = {
                error: false,
                visible: true,
                text: 'No chain'
            };
            //Is word chain being loaded?
            $scope.loading = false;

            /**
             * The API has been called to start building the chain
             */
            $scope.$on('building-chain', function () {
                $scope.chain = [];
                loadWait = $timeout(function () {
                    $scope.loading = true;
                }, 500);
            });

            /**
             * The chain was built, so show result
             * 
             * @param object e The event object
             * @param object response The AJAX response object
             */
            $scope.$on('chain-built', function (e, response) {
                
                $timeout.cancel(loadWait);
                $scope.loading = false;

                var data = response.data,
                        result = data.data;

                $scope.noResult.error = !data.success;

                if (!data.success) {
                    $scope.noResult.text = data.error;
                    $scope.noResult.visible = true;
                    return;
                }

                if (typeof (result) === 'string') {
                    $scope.noResult.text = result;
                    $scope.noResult.visible = true;
                    return;
                }

                $scope.noResult.visible = false;
                $scope.chain = result;
            });
        }]);
}(ctrl));