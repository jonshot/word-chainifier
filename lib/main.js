'use strict';
(function (process, __dirname) {

  var express = require('express'),
       url = require('url'),
       chainBuilder = require('./build-chain'),
          app = express();

  /**
   * Send a json response
   * 
   * @param res The Express result object
   * @param response The response to send
   */
  var jsonResponse = function (res, response) {
    res.send(JSON.stringify(response));
  }
  
  /**
   * Static files
   */
  app.use(express.static(__dirname + '/static'));

  /**
   * Returns a word chain response
   */
  app.get('/build-chain', function (req, res) {

    var params = url.parse(req.url, true).query;
    chainBuilder.buildChain(params).then(function(result) {
      jsonResponse(res, result);
    });    
  });
  
//  var chainBuilder = require('./build-chain');
//  chainBuilder.buildChain({firstWord: 'coded', lastWord: 'grown'}, function(result) {
//    console.log(result);
//  });
  
  var port = process.env.PORT || 80;
  app.listen(port);
}(process, __dirname));