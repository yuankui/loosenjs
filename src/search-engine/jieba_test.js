const jieba = require('nodejieba');

jieba.load({
    stopWordDict: '/Users/yuankui/git/grace-editor/src/search-engine/jieba_test.dict.js'
})
const strings = jieba.cutForSearch(`yuanxkui`, true);

console.log(strings);