'use strict';
var app = app || angular.module('wordChainifierApp', []);
(function (app) {
    app.controller('resultsBoxCtrl', ['$scope', function ($scope) {

            //The word chain array
            $scope.chain = [];
            //Display no results text on no result or error
            $scope.noResult = {
                error: false,
                visible: true,
                text: 'No chain'
            };
            //Is word chain being loaded
            $scope.loading = false;

            /**
             * The API has been called to start building the chain
             */
            $scope.$on('building-chain', function () {
                $scope.loading = true;
            });

            /**
             * The chain was built, so show result
             * 
             * @param object e The event object
             * @param object response The AJAX response object
             */
            $scope.$on('chain-built', function (e, response) {

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
}(app));