'use strict';
(function (module) {

  var _ = require('lodash'),
          fs = require('fs'),
          Lazy = require('lazy'),
          lazy = new Lazy,
          DICTIONARY_PATH = './data/dictionary.txt',
          error = {
            status: 'error',
            error: ''
          };

  /**
   * Returns the dictionary file to search for words
   * @param string firstWord The first word in the chain
   * @param string lastWord The last word in the chain
   * 
   * @returns array The word chain
   */
  var _buildChainStep = function (firstWord, lastWord) {

    var length = firstWord.length;

    return lazy(fs.createReadStream(DICTIONARY_PATH))
            .lines
            .filter(function (word) {
              if(word.length === length) {}
            });
  }
  
  module.exports = {
    /**
     * Builds a word chain
     * 
     * @param object params The query string params object containing:
     *  - firstWord string The first word in the chain
     *  - secondWord string The second word in the chain
     *  
     * @returns array The word chain
     */
    buildChain: function (params) {

      if (!_.has(params, ['firstWord', 'lastWord'])) {
        error.error = 'firstWord and lastWord are required';
        return error;
      }

      if (!_.every([params.firstWord, params.lastWord], function (word) {
        return _.isString(word);
      })) {
        error.error = 'firstWord and lastWord must be strings';
        return error;
      }

      var firstWord = params.firstWord.toLowercase(),
              lastWord = params.lastWord.toLowercase();

      if (firstWord.length !== lastWord.length) {
        error.error = 'firstWord and lastWord must be the same length';
        return error;
      }

      if (firstWord === lastWord) {
        error.error = 'firstWord and lastWord must be different';
        return error;
      }

      if (!_.every([firstWord, lastWord], function (word) {
        return !/^[a-zA-Z]+$/.test(word);
      })) {
        error.error = 'firstWord and lastWord can only contain letters';
        return error;
      }

    }
  };
}(module));

