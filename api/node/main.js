'use strict';
(function () {

  var express = require('express'),
       url = require('url'),
          app = express();

  /**
   * Send a json response
   * 
   * @param res The Express result object
   * @param response The response to send
   */
  var jsonResponse = function (res, response) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(response));
  }

  /**
   * Returns a word chain response
   */
  app.get('/build-chain', function (req, res) {

    var params = url.parse(req.url, true).query,
            chainBuilder = require('./build-chain');

            jsonResponse(res, chainBuilder.buildChain(params));
  });

  app.listen(8080);
}());