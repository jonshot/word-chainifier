'use strict';
(function (module) {

    var _ = require('lodash'),
            fs = require('fs'),
            tmp = require('tmp'),
            lazy = require('lazy'),
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
//    var _buildChainStep = function (firstWord, lastWord) {
//
//        var length = firstWord.length;
//
//        return lazy(fs.createReadStream(DICTIONARY_PATH))
//                .lines
//                .filter(function (word) {
//                    if (word.length === length) {
//                    }
//                });
//    }

    /**
     * Filter the list of words to match the current word length
     * 
     * @param int length The desired length
     * @param function callback A callback function to run on completion
     */
    var _shortenDictionary = function (length, callback) {
        tmp.file(function (err, path) {

            if (err !== null) {
                return;
            }

            var dictionary = _.chain(_.range(65, 90))
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
                        callback(dictionary);
                    });
        });
    }

    var _wordLadderFactory = function (word) {
        return {
            prev: null,
            word: word,
            extendLadder: function (word) {
                var newLadder = wordLadderFactory(word);
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

    var _findSuccessors = function (word, words) {
        var result = [];
        var msg = "";

        for (var i = 0; i < word.length; ++i) {
            for (var ch = 'a'.charCodeAt(0); ch <= 'z'.charCodeAt(0); ++ch) {
                /* Build the new word. */
                var candidate = word.substring(0, i) + String.fromCharCode(ch) + word.substring(i + 1);

                /* See if it's a word. */
                if (words[candidate] !== undefined) {
                    result.push(candidate);
                }
            }
        }
        return result;
    }

    var _findWordLadder = function (startWord, endWord, words) {
        /* Maintain a work list of partial ladders, seeded with the start word. */
        var workList = [];
        workList.push(new WordLadder(startWord));

        /* Also maintain a list of words that we have already processed; initially
         * this is empty.
         */
        var usedWords = {};

        /* While the worklist isn't empty, process elements from it. */
        while (workList.length !== 0) {
            /* Obtain the current ladder. */
            var ladder = workList.shift();

            /* Look at the last word in the ladder.  If we've already seen it, skip
             * this word.
             */
            if (usedWords[ladder.word] !== undefined) {
                continue;
            }

            /* Otherwise, add that to the used word list. */
            usedWords[ladder.word] = null;

            /* If the last word is the destination word, hand back this word
             * ladder.
             */
            if (ladder.word === endWord) {
                return ladder.toArray();
            }
            /* Now, find all possible successor words for this word, and for each
             * of them extend the word ladder.
             */
            var successors = findSuccessors(ladder.word, words);

            /* For each successor, chain it onto the current word ladder and put
             * it back into the queue.
             */
            for (var i = 0; i < successors.length; ++i) {
                workList.push(ladder.extendLadder(successors[i]));
            }
        }
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

            console.log(firstWord);
            console.log(lastWord);

            _shortenDictionary(firstWord.length, function (tmpFile) {
                console.log(tmpFile);
            });

        }
    };
}(module));