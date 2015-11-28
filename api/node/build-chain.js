'use strict';
(function (module) {

    var _ = require('lodash'),
            fs = require('fs'),
            lazy = require('lazy'),
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
        }
    }

    /**
     * Gets dictionary to use for search
     * 
     * @param int length The desired length
     * @param function callback A callback function to run on completion. Passed the dictionary for the current words
     */
    var _getDictionary = function (length, callback) {

        //Dictionary is an object with each letter as a key and an array of words as each value
        var dictionary = _.chain(alphabet)
                .map(function (letter) {
                    return [letter, []];
                })
                .zipObject()
                .value();

        console.time('_getDictionary');

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
                    console.timeEnd('_getDictionary');
                    callback(dictionary);
                });
    }

    /**
     * Builds a word chain object
     * @param string word The word chain word
     * @returns object Word chain object
     */
    var _wordChainFactory = function (word) {
        return {
            prev: null,
            word: word,
            extendChain: function (word) {
                var newChain = _wordChainFactory(word);
                newChain.prev = this;
                return newChain;
            },
            getChain: function () {

                var result = [],
                        curNode = this;

                for (curNode; curNode !== null; curNode = curNode.prev) {
                    result.push(curNode.word);
                }

                result.reverse();
                return result;
            }
        };
    }

    /**
     * Finds successors to given word
     * @param string word The word to get successors for
     * @param object dictionary The dictionary object containing 
     * @returns array An array of valid words
     */
    var _findSuccessors = function (word, dictionary) {
        //@todo: make work when start & end lengths are different...
        var result = [];
        //console.time('_findSuccessors');

        _.times(word.length, function (index) {
            _.each(alphabet, function (char) {
                var candidate = word.substring(0, index) + char + word.substring(index + 1);
                if (_.includes(dictionary[candidate.charAt(0)], candidate) && candidate !== word) {
                    result.push(candidate);
                }
            });
        });
        //console.timeEnd('_findSuccessors');

        return result;
    }

    /**
     * Finds word chain
     * 
     * @param string firstWord First word in the chain
     * @param string lastWord Last word in the chain
     * @param string callback Function to call when chain completes
     */
    var _findChain = function (firstWord, lastWord, callback) {

        return _getDictionary(firstWord.length, function (dictionary) {

            var workList = [],
                    usedWords = [],
                    chain;

            workList.push(_wordChainFactory(firstWord));

            console.time('_findChain');

            while (workList.length) {

                var curChain = workList.shift();

                if (_.includes(usedWords, curChain.word)) {
                    continue;
                }

                usedWords.push(curChain.word);

                if (curChain.word === lastWord) {
                    chain = curChain.getChain();
                    break;
                }

                _.each(_findSuccessors(curChain.word, dictionary), function (successor) {
                    workList.push(curChain.extendChain(successor));
                });
            }

            console.timeEnd('_findChain');

            var response = _getResponse();

            response.success = true;
            response.data = _.isArray(chain) ? chain : 'Word chain not found';
            callback(response);

        });
    }

    module.exports = {
        /**
         * Builds a word chain
         * 
         * @param object params The query string params object containing:
         *  - firstWord string The first word in the chain
         *  - secondWord string The second word in the chain
         *  @param function callback Callback function to execute when chain found
         *  
         * @returns array The word chain
         */
        buildChain: function (params, callback) {

            var response = _getResponse();

            if (!_.has(params, 'firstWord') || !_.has(params, 'lastWord')) {
                response.error = 'firstWord and lastWord are required';
                callback(response);
            }

            if (!_.every([params.firstWord, params.lastWord], function (word) {
                return _.isString(word);
            })) {
                response.error = 'firstWord and lastWord must be strings';
                callback(response);
            }

            var firstWord = params.firstWord.toLowerCase(),
                    lastWord = params.lastWord.toLowerCase();

            if (firstWord.length !== lastWord.length) {
                response.error = 'firstWord and lastWord must be the same length';
                callback(response);
            }

            if (firstWord === lastWord) {
                response.error = 'firstWord and lastWord must be different';
                callback(response);
            }

            if (!_.every([firstWord, lastWord], function (word) {
                return /^[a-zA-Z]+$/.test(word);
            })) {
                response.error = 'firstWord and lastWord can only contain letters';
                callback(response);
            }

            _findChain(firstWord, lastWord, callback);
        }
    };
}(module));