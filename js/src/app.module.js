'use strict';
/**
 * @todo: Add words to database
 * @todo: Check if both words in database
 * @todo: Normalise
 * @todo: check max length
 * @todo: check min length
 * @todo: Check two words are the same length
 * @todo: Make sure two words aren't the same
 * @todo: Make sure the words contain only alphas
 * @todo: Find all matches of next step in chain; keep repeating for until word is matched (research optimisations) and all chains met (reduce or something)
 * @todo: Research Eulerian path, http://stackoverflow.com/questions/9268709/detecting-when-matrix-multiplication-is-possible/9268893#9268893 
 * @todo: http://wordmorph.sarangconsulting.com/faq.php#_Examples_and_Details_
 * @todo: Levenshtein distance http://yomguithereal.github.io/clj-fuzzy/clojure.html https://en.wikipedia.org/wiki/Hamming_distance word ladder
 * @todo: Breadth first search http://www.keithschwarz.com/interesting/code/word-ladder/ladder.js.html http://www.problemotd.com/problem/word-ladder/
 * @todo: BFS from both nodes terminate when collision
 * @todo: Try sending to Clojure API or something as will be quicker using multi-threading etc...
 * @todo: Bootstrap front-end
 * @todo: Form validation
 * @todo: Return result 
 */
var app = app || angular.module('wordChainifierApp', []);
(function(app) {
  app.controller('mainCtrl', ['$scope', function() {
      
  }]);
}(app));