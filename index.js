var natural = require('natural'),
    Promise = require('bluebird'),
    WordNet = require('node-wordnet'),
    _       = require('lodash'),
    wordnet = new WordNet();

var dict = {};
var word = 'love';
var synonymSet;
var level = 3;
var results = [];

function getSynonymWords(word) {
  var synonymSet = new Set();
  return wordnet.lookupAsync(word).then(function (results) {
    console.log(results[0]);
    return results[0].synonyms;
  });
};

// {'go': ['went', 'run'], 'love': ['passion', 'like']}
function getRelatedWordsLevel(dict) {
  return new Promise(function(resolve) {
    var newDict = {};
    for(var key in dict){
      if (dict.hasOwnProperty(key)) {
        var synonyms = dict[key];
        Promise.map(synonyms, function (synonym) {
          return getSynonymWords(synonym).then(function (synonyms) {
            return newDict[synonym] = synonyms;
          });
        }).then(function () {
          resolve(newDict);
        });
      }
    }
  });
}
/*
function getRelatedWords(dict) {
   // first we get all the synonyms
   var synonyms = Object.keys(dict).map(x => dict[x]).reduce((p, c) => p.concat(c), []);
   // second we get all the synonyms for each word with the word itself
   var withSynonyms = Promise.map(synonyms, s => Promise.all([s, getSynonymWords(s)]));
   // then we fold it back to an object with Promise.reduce
   var asDict = Promise.reduce(withSynonyms, (p, c) => (p[c[0]] = c[1]), {});
   // and return it
   return asDict;
}
*/

function getRelatedWords(dict) {
   // first we get all the synonyms
   var synonyms = Object.keys(dict).map(x => dict[x]).reduce((p, c) => p.concat(c), []);
   // second we get all the synonyms for each word with the word itself
   var withSynonyms = Promise.map(synonyms, s => Promise.all([s, getSynonymWords(s)]));
   // then we fold it back to an object with Promise.reduce
   var asDict = withSynonyms.reduce((p, c) => (p[c[0]] = c[1]), {});
   // and return it
   return asDict;
}


getRelatedWordsLevel({hi: ['goodbye', 'hello', 'hi', 'love']}).then(function (dict) {
  console.log(dict);
});

function buildDict(word, maxLevel) {
  var curLevel = 1;
  var currentDict = {};
  var dicts = [];
  var isInitiated = false;
  if (curLevel == 1) {
    getSynonymWords(word).then(function (synonyms) {
      currentDict[word] = synonyms;
      dicts.push(currentDict);
      isInitiated = true;
    });
  };
  while (true) {
    if (curLevel > maxLevel) {
      break;
    };

    if (isInitiated && (curLever <= maxLevel)) {
      getRelatedWordsLevel(currentDict).then(function (dict) {
        currentDict = dict;
        dicts.push(currentDict);
        curLevel++;
      });
    }
  };
  return dicts;
}

function getRelatedWordsByLevel(words, level, dict) {
  if (level > 0) {
    return dict;
  } else {
    level--;
    var allPro = [];
    words.forEach(function (word) {
      allPro.push(getSynonymWords(word));
    });
    Promise.all(allPro).then(function () {
      console.log('done!');
    });
  }
};

function getRelatedWordsByMaxlevel(word, maxLevel) {
}
/*
var s = new Set()
s.add("hello").add("goodbye").add("hello")
console.log(s.size === 2);
console.log(s.has("hello") === true);
*/
/*
{
  user_id,
  name: 'hello',
  synonym_1: ['hi', 'xin chao'],
  synonym_2: ['hi', 'sorry']
  synonym_3: ['hi', 'sorry']
}
*/
