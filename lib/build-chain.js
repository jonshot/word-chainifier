getDictionary 739ms
findChain 2462

_getDictionary: 693ms
_findChain: 2762ms



'use strict';
(function (module) {

  var _ = require('lodash'),
          Fs = require('fs'),
          Lazy = require('lazy'),
          Promise = require('promise'),
          Async = require('async'),
          DICTIONARY_PATH = './data/dictionary.txt',
          alphabet = _.map(_.range('a'.charCodeAt(0), 'z'.charCodeAt(0) + 1), function (code) {
            return String.fromCharCode(code);
          });

  /**
   * Gets a response object
   * @returns object Response object
   */
  var _getResponse = function () {
    return {
      success: false,
      error: '',
      data: null
    };
  };

  /**
   * Build a words object
   * 
   * @param object params Object with the following properties:
   *   - firsWord The first word in the chain
   *   - lastWord The last word in the chain
   *   
   *   @return a words object
   */
  var _wordsFactory = function (params) {
    return _.extend({
      minLength: Math.min(params.firstWord.length, params.lastWord.length),
      maxLength: Math.max(params.firstWord.length, params.lastWord.length),
      reversed: params.firstWord.length > params.lastWord.length
    }, params);
  };

  /**
   * Builds a word chain object
   * @param string word The word chain word
   * @returns object Word chain object
   */
  var _wordChainFactory = function (word) {
    return {
      prev: null,
      word: word,
      /**
       * Extends word chain
       * 
       * @param string word A word to add to the chain
       * @returns object a new word chain object
       */
      extendChain: function (word) {
        var newChain = _wordChainFactory(word);
        newChain.prev = this;
        return newChain;
      },
      /**
       * Gets the word chain
       * 
       * @param bool reversed If firstWord longer than lastWord chain doesn't need to be reversed
       */
      getChain: function (reversed) {

        var result = [],
                curNode = this;

        for (curNode; curNode !== null; curNode = curNode.prev) {
          result.push(curNode.word);
        }

        if (!reversed) {
          result.reverse();
        }
        return result;
      }
    };
  };

  /**
   * Gets dictionary to use for search
   * 
   * @param object words A words object
   * @returns promise a Promise object with the dictionary as an argument
   */
  var _getDictionary = function (words) {
    //Dictionary is an object with each letter as a key and an array of words as each value
    var dictionary = _.chain(alphabet)
            .map(function (letter) {
              return [letter, []];
            })
            .zipObject()
            .value();

    return new Promise(function (fulfill) {

      console.time('_getDictionary');
      Lazy(Fs.createReadStream(DICTIONARY_PATH))
              .lines
              .forEach(function (line) {
                //Strip newline char
                var word = line.toString().replace(/(\r\n|\n|\r)/gm, '');
                //Limit the amount of words to search
                if (word.length >= words.minLength && word.length <= words.maxLength) {
                  var wordToLower = word.toLowerCase();
                  dictionary[wordToLower.charAt(0)].push(wordToLower);
                }
              })
              .join(function () {
                console.timeEnd('_getDictionary');
                fulfill(dictionary);
              });
    });
  };

  /**
   * Finds successors to given word
   * @param string word The word to get successors for
   * @param int maxLength The maximum word length
   * @param object dictionary The dictionary object containing 
   * @returns array An array of valid words
   */
  var _findSuccessors = function (word, maxLength, dictionary) {

    var result = [];

    _.times(maxLength, function (index) {
      _.each(alphabet, function (char) {
        var candidate = word.substring(0, index) + char + word.substring(index + 1);
        if (_.includes(dictionary[candidate.charAt(0)], candidate) && candidate !== word) {
          result.push(candidate);
        }
      });
    });

    return result;
  };

  /**
   * Validate params
   * @returns object A response object
   *   - 
   */
  var _validate = function (params) {

    var response = _getResponse();

    if (!_.has(params, 'firstWord') || !_.has(params, 'lastWord')) {
      response.error = 'firstWord and lastWord are required';
      return response;
    }

    if (!_.every([params.firstWord, params.lastWord], function (word) {
      return _.isString(word);
    })) {
      response.error = 'firstWord and lastWord must be strings';
      return response;
    }

    if (params.firstWord === params.lastWord) {
      response.error = 'firstWord and lastWord must be different';
      return response;
    }

    if (!_.every([params.firstWord, params.lastWord], function (word) {
      return /^[a-zA-Z]+$/.test(word);
    })) {
      response.error = 'firstWord and lastWord can only contain letters';
      return response;
    }

    params.firstWord = params.firstWord.toLowerCase();
    params.lastWord = params.lastWord.toLowerCase();

    response.success = true;
    return response;
  };

  var _findChain = function () {

  }

  module.exports = {
    /**
     * Builds a word chain
     * 
     * @param object params The query string params object containing:
     *  - firstWord string The first word in the chain
     *  - secondWord string The second word in the chain
     * @returns array The word chain
     */
    buildChain: function (params) {

      return new Promise(function (fulfill) {

        var response = _validate(params);

        if (!response.success) {
          fulfill(response);
        }

        var words = _wordsFactory(params);

        _getDictionary(words).then(function (dictionary) {

//          var usedWords = [],
//                  chain,
//                  startWord = words.reversed ? words.lastWord : words.firstWord,
//                  targetWord = words.reversed ? words.firstWord : words.lastWord;

          console.time('_findChain');

          var startChain, endChain, resolved = false;

          var checkChains = function () {
            if(_.intersection().length) {
              resolved = true;
            }
          }
          var built = function () {
            var chain = _.union(startChain, endChain);
            var response = _getResponse();
            response.success = true;
            response.data = _.isArray(chain) ? chain : 'Word chain not found';
            console.timeEnd('_findChain');
            fulfill(response);
          }


          Async.parallel([
            function () {

              var usedWords = [],
                      startWord = words.reversed ? words.lastWord : words.firstWord,
                      targetWord = words.reversed ? words.firstWord : words.lastWord;
              var queue = Async.queue(function (curChain, callback) {

                if (_.includes(usedWords, curChain.word)) {
                  callback();
                  return;
                }

                usedWords.push(curChain.word);

                if (curChain.word === targetWord) {
                  startChain = curChain.getChain(words.reversed);
                  queue.kill();
                  built();
                  callback();
                  return;
                } else {
                  _.each(_findSuccessors(curChain.word, words.maxLength, dictionary), function (successor) {
                    queue.push(curChain.extendChain(successor));
                  });
                }

                Async.setImmediate(function () {
                  callback();
                });

              });
              queue.push(_wordChainFactory(startWord));
            },
          ], function () {
            var usedWords = [],
                    targetWord = words.reversed ? words.lastWord : words.firstWord,
                    startWord = words.reversed ? words.firstWord : words.lastWord;
            var queue = Async.queue(function (curChain, callback) {

              if (_.includes(usedWords, curChain.word)) {
                callback();
                return;
              }

              usedWords.push(curChain.word);

              if (curChain.word === targetWord) {
                endChain = curChain.getChain(words.reversed);
                queue.kill();
                built();
                callback();
                return;
              } else {
                _.each(_findSuccessors(curChain.word, words.maxLength, dictionary), function (successor) {
                  queue.push(curChain.extendChain(successor));
                });
              }

              Async.setImmediate(function () {
                callback();
              });

            });
            queue.push(_wordChainFactory(startWord));
          });

//          var queue = Async.queue(function (curChain, callback) {
//
//            if (_.includes(usedWords, curChain.word)) {
//              callback();
//              return;
//            }
//
//            usedWords.push(curChain.word);
//
//            if (curChain.word === targetWord) {
//              chain = curChain.getChain(words.reversed);
//              queue.kill();
//
//              var response = _getResponse();
//              response.success = true;
//              response.data = _.isArray(chain) ? chain : 'Word chain not found';
//              console.timeEnd('_findChain');
//              fulfill(response);
//              callback();
//              return;
//            } else {
//              _.each(_findSuccessors(curChain.word, words.maxLength, dictionary), function (successor) {
//                queue.push(curChain.extendChain(successor));
//              });
//            }
//
//            Async.setImmediate(function () {
//              callback();
//            });
//
//          });

//          queue.push(_wordChainFactory(startWord));

        });
      });
    }
  };
}(module));