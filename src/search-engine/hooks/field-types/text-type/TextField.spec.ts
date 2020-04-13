import {test} from 'mocha';
import 'chai';
import jieba from 'nodejieba';

jieba.load();

test("cut", async () => {
    console.log(new Date().getTime());

    const results = jieba.extract("2020-11-28 我有，一个写日记的习惯。", 10);
    console.log(new Date().getTime());
    console.log(results);

    const results2 = jieba.extract("介绍拙作 jpgcrypt: 一个将图片加密成马赛克的工具（欢迎测试反馈）", 10);

    console.log(results2);
    console.log(new Date().getTime());

})