'use strict';
(function (module) {

  var _ = require('lodash'),
          fs = require('fs'),
          tmp = require('tmp'),
          lazy = require('lazy'),
          DICTIONARY_PATH = './data/dictionary.txt',
          alphabet = _.range('a'.charCodeAt(0), 'z'.charCodeAt(0)),
          error = {
            status: 'error',
            error: ''
          };

  /**
   * Gets dictionary to use for search
   * 
   * @param int length The desired length
   * @param function callback A callback function to run on completion. Passed the dictionary for the current words
   */
  var _getDictionary = function (length, callback) {
    
    //Dictionary is an object with each letter as a key and an array of words as each value
    var dictionary = _.chain(alphabet)
            .map(function (code) {
              return [String.fromCharCode(code).toLowerCase(), []];
            })
            .zipObject()
            .value();


    var stream = fs.createWriteStream(path, {flags: 'a'});

    lazy(fs.createReadStream(DICTIONARY_PATH))
            .lines
            .forEach(function (line) {
              //Strip newline char
              var word = line.toString().replace(/(\r\n|\n|\r)/gm, '');
              if (word.length === length) {
                var wordToLower = word.toLowerCase();
                dictionary[wordToLower.charAt(0)].push(wordToLower);
              }
            })
            .join(function () {
              stream.end();
              if (_.isFunction(callback)) {
                callback(dictionary);
              }
            });
  }

  var _wordChainFactory = function (word) {
    return {
      prev: null,
      word: word,
      extendLadder: function (word) {
        var newLadder = _wordChainFactory(word);
        newLadder.prev = this;
        return newLadder;
      },
      getLadder: function () {
        var result = [];
        for (var curr = this; curr !== null; curr = curr.prev) {
          result.push(curr.word);
        }
        result.reverse();
        return result;
      },
    };
  }
  
  /**
   * Finds successors to given word
   * @param string word The word to get successors for
   * @param object dictionary The dictionary object containing 
   * @returns {String|Array|Object|Object.result|String.result|Array.result}
   */
  var _findSuccessors = function (word, dictionary) {
    //@todo: make work when start & end lengths are different...
    var result = [];
    _.times(word.length - 1, function(index) {
      _.each(alphabet, function(char) {
        var candidate = word.substring(0, index) + char + word.substring(index + 1);
        if(_.includes(dictionary[candidate.charAt(0)], candidate)) {
          result.push(candidate);
        }
      });
    });
    return result;
  }

  /**
   * Finds word
   * @param {type} firstWord
   * @param {type} lastWord
   * @returns {unresolved}
   */
  var _findChain = function (firstWord, lastWord) {

    _getDictionary(firstWord.length, function (dictionary) {

      var workList = [],
              usedWords = [];

      workList.push(_wordChainFactory(firstWord));

      while (workList.length) {

        var curChain = workList.shift();

        if (_.includes(usedWords, curChain.word)) {
          continue;
        }

        usedWords.push(curChain.word);

        if (curChain.word === lastWord) {
          return curChain.getLadder();
        }

        _.each(_findSuccessors(curChain.word, dictionary), function(successor) {
          workList.push(curChain.extendLadder(successor));
        });        
      }
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

      if (!_.has(params, 'firstWord') || !_.has(params, 'lastWord')) {
        error.error = 'firstWord and lastWord are required';
        return error;
      }

      if (!_.every([params.firstWord, params.lastWord], function (word) {
        return _.isString(word);
      })) {
        error.error = 'firstWord and lastWord must be strings';
        return error;
      }

      var firstWord = params.firstWord.toLowerCase(),
              lastWord = params.lastWord.toLowerCase();

      if (firstWord.length !== lastWord.length) {
        error.error = 'firstWord and lastWord must be the same length';
        return error;
      }

      if (firstWord === lastWord) {
        error.error = 'firstWord and lastWord must be different';
        return error;
      }

      if (!_.every([firstWord, lastWord], function (word) {
        return /^[a-zA-Z]+$/.test(word);
      })) {
        error.error = 'firstWord and lastWord can only contain letters';
        return error;
      }

      _findChain(firstWord, lastWord);
    }
  };
}(module));
//
//(defn next-steps
//  [word goal]
//  (remove (partial = word)
//    (for [i (range (count word))]
//      (apply str (assoc (vec (seq word)) i (nth goal i))))))
//
//(defn ladder-path
//  [word goal path]
//  (let [steps (next-steps word goal)]
//    (if (= (count steps) 1)
//      (conj path goal)
//      (loop [[s & r :as sts] steps]
//        (if (empty? sts)
//          []
//          (if (contains? words s)
//            (ladder-path s goal (conj path s))
//            (recur r)))))))
//
//(defn ladder
//  [word goal]
//  (if (= word goal)
//    [word]
//    (ladder-path word goal [word])))