const jieba = require('nodejieba');

jieba.load({
    stopWordDict: '/Users/yuankui/git/grace-editor/src/search-engine/jieba_test.dict.js'
})
const strings = jieba.extract(`Python是世界上最好的语言`, 100);

console.log(strings.map(t => t.word));