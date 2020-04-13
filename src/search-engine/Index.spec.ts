import {Index} from "./Index";
import {Doc} from "./hook-struct/Doc";
import {test} from 'mocha';
import {createFieldRegister} from "./hooks/createFieldRegister";
import chaiArrays from "chai-arrays";
import chai, {expect} from 'chai';
chai.use(chaiArrays);

interface Person extends Doc {
    title: string,
    url: string,
    content: string,
    created: number,
}

async function createIndex() {
    const index = new Index<Person>("./index.dat");
    await index.init([
        createFieldRegister({
            fields: [
                {
                    name: 'title',
                    type: 'text',
                },
                {
                    name: 'url',
                    type: 'text',
                },
                {
                    name: "content",
                    type: "text",
                },
                {
                    name: 'created',
                    type: 'int'
                }
            ]
        })
    ]);
    return index;
}

test('index-insert', async function() {
    const index = await createIndex();

    await index.add({
        _id: '661544',
        "title": "给大家推荐除了电信联通移动科学上网速度非常不错的 ISP",
        "url": "https://www.v2ex.com/t/661544",
        "created": 1586612356,
        "content": "前排提示，非深圳朋友不用看了。\r\n\r\n\r\n\r\n\r\n这是深圳本地 ISP,Topway 也叫天威视讯，之前一直是做电视业务的，不知道什么时候开始做家宽了，和米国一些 ISP 一样，采用的是同轴电视线，理论带宽一栋楼共享 1G 对等，但还有电视业务....反正实际使用没太大问题，配了千兆同轴猫，最大可以办理的带宽 200M,实际跑不满，说是有带宽损耗，speedtest.net 实测最多 180Mbps，上行也有缩水，还有延迟不小，从本地网关到接入第一跳网关延迟在 7ms 左右，后面就是全光传输了，网络有时候不稳定。\r\n\r\n\r\n\r\n优点来啦，接入采用 DHCP，最多实测 100M 获取 2 个固定！固定！固定！没错你没看错是固定，因为 DHCP 只要你不断电，IP 不会变，不封 80.443 ，但是只要一开服务，第二天 80 就没了，不知道什么原理，200M 宽带可以获取到 4 个固定 ip，出国线路方面大部分走联通 9929，一些 ip 走普通联通，延迟速度都非常不错，比原生联通都好。\r\n\r\n\r\n\r\n总结：\r\n1.延迟大，网络不太稳定，毕竟是同轴\r\n\r\n\r\n2.固定公网 ip，出国速度良好\r\n\r\n\r\n3.价格实惠\r\n\r\n\r\n4.部分地方的天威走的是电信穿透，这个质量嘛...\r\n\r\n\r\n5.有点国内网站还没有国外网站快\r\n\r\n\r\n6 。自带 DNS 乱解析。\r\n\r\n\r\n\r\n附上测速图片： https://s1.ax1x.com/2020/04/11/GbXJBj.png",
    });

    await index.add({
        _id: '661541',
        "title": "机械键盘有推荐的么？",
        "url": "https://www.v2ex.com/t/661541",
        "created": 1586611973,
        "content": "目前在用的是 magic keyboard2 深空灰，想入手个机械键盘，非全尺寸，交替使用。\r\n\r\n请问有推荐的么？预算 800 以内。",
    });

    await index.add({
        _id: '661540',
        "title": "迫于老婆换机，出苹果 x 256g。全部原装",
        "url": "https://www.v2ex.com/t/661540",
        "created": 1586611946,
        "content": "iphone 苹果 X 美版 256G，A1901，无锁，成色还行，电池百分之 89，全部原装，没拆，没修，没进水，原装对码的包装盒，和单机，没配件。老婆换机，一手自用！无任何问题，外地运费只发顺丰到付，2899 一步到位，暂不议价！\r\n某鱼联系，直接放链接\r\nhttps://market.m.taobao.com/app/idleFish-F2e/widle-taobao-rax/page-detail?wh_weex=true&wx_navbar_transparent=true&id=615848798803&ut_sk=1.XpFd5UYtSwUDAKQW5Bhk2egR_12431167_1586611746556.Copy.detail.615848798803.260193252&forceFlush=1",
    });

    await index.add({
        _id: '661542',
        "title": "外地人现阶段去上海是怎么个情况？",
        "url": "https://www.v2ex.com/t/661542",
        "created": 1586612172,
        "content": "目前在北京，去上海工作的话，租房比如网上签自如的话，小区能进去吗？需不需要隔离呢？\r\n\r\n上海的老铁有知道的说说~",
    });

});


test("inspect", async () => {
    await run();
});


test('index-delete', async function() {
    const index = await createIndex();

    await index.delete('yuankui');
    // await index.delete('wangfang');
    // await index.delete('yuansiqi');
});


test('search', async function() {
    const index = await createIndex();

    const docs = await index.jsonSearch({
        where: {
           type: "field",
           field: 'content',
           config: {
               type: "query",
               text: '目前在北京'
           }
        }
    });

    console.log(JSON.stringify(docs, null, 2));

    expect(docs).to.be.ofSize(1);
    expect(docs.map(d => d._id)).to.be.equalTo(['661542']);
});

test('write-performance', async function() {
    const index = await createIndex();

    const start = new Date().getTime();

    const startIndex = 20000;
    const count = 100;
    for (let i = startIndex; i < startIndex + count; i++) {
        console.log(i);
        await index.add({
            _id: i.toString(),
            "title": "给大家推荐除了电信联通移动科学上网速度非常不错的 ISP",
            "url": "https://www.v2ex.com/t/661544",
            "created": 1586612356,
            "content": "前排提示，非深圳朋友不用看了。\r\n\r\n\r\n\r\n\r\n这是深圳本地 ISP,Topway 也叫天威视讯，之前一直是做电视业务的，不知道什么时候开始做家宽了，和米国一些 ISP 一样，采用的是同轴电视线，理论带宽一栋楼共享 1G 对等，但还有电视业务....反正实际使用没太大问题，配了千兆同轴猫，最大可以办理的带宽 200M,实际跑不满，说是有带宽损耗，speedtest.net 实测最多 180Mbps，上行也有缩水，还有延迟不小，从本地网关到接入第一跳网关延迟在 7ms 左右，后面就是全光传输了，网络有时候不稳定。\r\n\r\n\r\n\r\n优点来啦，接入采用 DHCP，最多实测 100M 获取 2 个固定！固定！固定！没错你没看错是固定，因为 DHCP 只要你不断电，IP 不会变，不封 80.443 ，但是只要一开服务，第二天 80 就没了，不知道什么原理，200M 宽带可以获取到 4 个固定 ip，出国线路方面大部分走联通 9929，一些 ip 走普通联通，延迟速度都非常不错，比原生联通都好。\r\n\r\n\r\n\r\n总结：\r\n1.延迟大，网络不太稳定，毕竟是同轴\r\n\r\n\r\n2.固定公网 ip，出国速度良好\r\n\r\n\r\n3.价格实惠\r\n\r\n\r\n4.部分地方的天威走的是电信穿透，这个质量嘛...\r\n\r\n\r\n5.有点国内网站还没有国外网站快\r\n\r\n\r\n6 。自带 DNS 乱解析。\r\n\r\n\r\n\r\n附上测速图片： https://s1.ax1x.com/2020/04/11/GbXJBj.png",
        });
    }

    const cost = new Date().getTime() - start;
    console.log(`cost: ${cost}ms`);
})
    .timeout(50_000);
