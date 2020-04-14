const jieba = require('nodejieba');

jieba.load({
    stopWordDict: '/Users/yuankui/git/grace-editor/src/search-engine/jieba_test.dict.js'
})
const strings = jieba.extract(`Python是世界上最好的语言`, 100);

console.log(strings.map(t => t.word));

let search = jieba.cutForSearch('目前在用的是 magic keyboard2 深空灰，想入手个机械键盘，非全尺寸，交替使用。\r\n\r\n请问有推荐的么？预算 800 以内', true);

console.log(search);