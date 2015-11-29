/**
 * @todo: Research Eulerian path, http://stackoverflow.com/questions/9268709/detecting-when-matrix-multiplication-is-possible/9268893#9268893 
 * @todo: http://wordmorph.sarangconsulting.com/faq.php#_Examples_and_Details_
 * @todo: Levenshtein distance http://yomguithereal.github.io/clj-fuzzy/clojure.html https://en.wikipedia.org/wiki/Hamming_distance word ladder
 * @todo: Breadth first search http://www.keithschwarz.com/interesting/code/word-ladder/ladder.js.html http://www.problemotd.com/problem/word-ladder/
 * @todo: BFS from both nodes terminate when collision
 */
'use strict';
(function (module) {

    var _ = require('lodash'),
            fs = require('fs'),
            lazy = require('lazy'),
            DICTIONARY_PATH = '../data/dictionary.txt',
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
     * Gets dictionary to use for search
     * 
     * @param int length The desired length
     * @param function onComplete A callback function to run on completion. Passed the dictionary for the current words
     */
    var _getDictionary = function (length, onComplete) {

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
                    onComplete(dictionary);
                });
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
    };

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
    };

    /**
     * Finds word chain
     * 
     * @param string firstWord First word in the chain
     * @param string lastWord Last word in the chain
     * @param string onComplete Function to call when chain completes
     */
    var _findChain = function (firstWord, lastWord, onComplete) {

        _getDictionary(firstWord.length, function (dictionary) {

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
            onComplete(response);

        });
    };

    /**
     * Validate params
     * @returns object A response object
     *   - 
     */
    var _validate = function (params) {

        var response = _getResponse();
        
        params.firstWord = params.firstWord.toLowerCase(),
        params.lastWord = params.lastWord.toLowerCase();

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

        if (params.firstWord.length !== params.lastWord.length) {
            response.error = 'firstWord and lastWord must be the same length';
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
        
        response.success = true;
        return response;
    };

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

            var response = _validate(params);  
            
            if(!response.success) {
                callback(response);
                return;
            }

            _findChain(params.firstWord, params.lastWord, callback);
        }
    };
}(module));