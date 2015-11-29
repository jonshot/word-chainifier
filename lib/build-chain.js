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
     * @param object words A words object
     * @param function onComplete A callback function to run on completion. Passed the dictionary for the current words
     */
    var _getDictionary = function (words, onComplete) {
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
                    //Limit the amount of words to search
                    if (word.length >= words.minLength && word.length <= words.maxLength) {
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
             * 
             * @param {type} word
             * @returns {build-chain_L9._wordChainFactory.build-chainAnonym$4}Adds a new link to the word chain
             * 
             * @param string word The word to add to the chain
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
     * Finds successors to given word
     * @param string word The word to get successors for
     * @param int maxLength The maximum word length
     * @param object dictionary The dictionary object containing 
     * @returns array An array of valid words
     */
    var _findSuccessors = function (word, maxLength, dictionary) {
        var result = [];
        //console.time('_findSuccessors');        

        _.times(maxLength, function (index) {
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
     * @param object Words object
     * @param string onComplete Function to call when chain completes
     */
    var _findChain = function (words, onComplete) {

        _getDictionary(words, function (dictionary) {
            //check if reversed...
            var workList = [],
                    usedWords = [],
                    chain,
                    startWord = words.reversed ? words.lastWord : words.firstWord,
                    targetWord = words.reversed ? words.firstWord : words.lastWord;
                    
            workList.push(_wordChainFactory(startWord));

            console.time('_findChain');

            while (workList.length) {

                var curChain = workList.shift();

                if (_.includes(usedWords, curChain.word)) {
                    continue;
                }

                usedWords.push(curChain.word);

                if (curChain.word === targetWord) {
                    chain = curChain.getChain(words.reversed);
                    break;
                }

                _.each(_findSuccessors(curChain.word, words.maxLength, dictionary), function (successor) {
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

//        if (params.firstWord.length !== params.lastWord.length) {
//            response.error = 'firstWord and lastWord must be the same length';
//            return response;
//        }

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

            if (!response.success) {
                callback(response);
                return;
            }

            _findChain(_wordsFactory(params), callback);
        }
    };
}(module));