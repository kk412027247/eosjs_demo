## 事前准备
>在使用NODE.JS 调用EOS API之前，首先需要先准备一个EOS的网络。(如果主网都没有，那还调用个毛线)

可以用EOS主网，或者是现成的测试网络，又或者是本地搭建的网络。
我这里为了测试方便，使用了官方的测试网络。
地址：http://jungle.cryptolions.io/
----



![create_account](https://upload-images.jianshu.io/upload_images/7505289-7a8a936b1716f99a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 注册账号
- 登录页面之后点击  [Create Account](http://jungle.cryptolions.io/#account) 开始创建账号
- 输入账号名 `tmd111111111` 
- 输入公共钥 `EOS6paeQBGNDhbYwoseHLUeLA4LH4ATq9FYT9eW3AYkotC93UbjS2 `
- 最后点击 **create**

>这个操作是将 **用户名** 与 **公钥** 进行绑定。
用户名必须是12位，包含小写字母与数字1 ~ 5。
公钥是根据私钥生成的，而私钥是根据根据一套复杂规则随机生成的。
也可以用[这个网站](https://eostea.github.io/eos-generate-key/)可以生成一套公私钥。
以下是我生成的公私钥。
私钥：`5Jg3KWnT2cUsKvmiJYRo7iULfwyhunVU3uDrZEAvjtq2GpABiJQ`
公钥：`EOS6paeQBGNDhbYwoseHLUeLA4LH4ATq9FYT9eW3AYkotC93UbjS2`

----



![faucet.png](https://upload-images.jianshu.io/upload_images/7505289-3a026118cab572ee.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 获取测试币
- 注册成功后
- 点击  [Faucet](http://jungle.cryptolions.io/#faucet) 获取测试币
- 填入自己的账号 `tmd111111111`
- 点击 **Send Coint**

----
## 连接主网

### 模组安装
连接主网需要用到 `eosjs` `node-fetch` `text-encoding` `eosjs-ecc` 这些模组

```
npm install eosjs@beta node-fetch text-encoding eosjs-ecc

// eosjs-ecc 是在node环境下生成公私钥匙的。
```

### 模组调用
> 注意： eosjs模组api变化很快，要注意使用的版本，这里使用的是 `20.0.0-beta2`
```
const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');

// 只有在node.js环境下，才需要以下模组； 浏览器不需要引入这个模组。
const fetch = require('node-fetch');
// 只有在node.js / IE11 /IE Edge 浏览器环境下，需要以下模组；
const { TextDecoder, TextEncoder } = require('text-encoding');

// 这里的私钥填写刚才生成的私钥
const privateKey = "5Jg3KWnT2cUsKvmiJYRo7iULfwyhunVU3uDrZEAvjtq2GpABiJQ";
const signatureProvider = new JsSignatureProvider([privateKey]);

// rpc 对象可以运行 eos的rpc命令
// rpc 命令查询 https://eosio.github.io/eosjs/classes/json_rpc.jsonrpc.html
const rpc = new JsonRpc('http://junglehistory.cryptolions.io:18888', { fetch });


// api 对象可以运行eos的合约，比如转账，创建账号等等(需要费用的操作)
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
```
### 测试链接

```
// rpc对象支持promise，所以使用 async/await 函数运行rpc命令
const  runRpc = async () => {

  // 获取主网信息
  const info = await rpc.get_info();
  console.log(info);

  // 获取账号tmd111111111的信息
  const accountInfo = await rpc.get_account('tmd111111111');
  console.log(accountInfo);

  //获取账号tmd111111111的资产
  const balance = await rpc.get_currency_balance('eosio.token','tmd111111111');
  console.log(balance);

  //获取账号操作历史
  const actionHistory = await rpc.history_get_actions('tmd111111111');
  console.log(actionHistory);

};

runRpc().catch(err=>{
  console.log("rpc error: ",err)
});

```
> 如果一切正常会打印出查询结果。这个查询结果比较长，我就不贴出来了。
---
## 运行合约
在eos系统中，创建账号或者转账都可以认为是运行合约。

### 创建账号

> 创建账号前，需要生成公私钥，需要使用 `eosjs-ecc` 模组

```
  const newPrivateKey = await ecc.randomKey();
  const newPublicKey = ecc.privateToPublic(newPrivateKey);
  console.log(newPrivateKey, newPublicKey);

  // 本次生成结果是
  // newPublicKey  EOS7hKV4FDKyFacdqCnXvanGv5p8YBPDwvD3km7P36pwb1do4b3wP
  // newPrivateKey 5Jm73Ngn3aH9FcukWd1djvxq9iyoidxHhvaxzDigA19D42MhHEN
```


发起创建账号这个合约需要三个步骤，并且这三个要打包在一起，同时发起。
1.  将用户名与公钥绑在一起
2.  为新用户租借网络带宽与cpu
3.  为新用户购买内存

> 注意：创建账号的参数中有可能使用`newact`  或者 `name`，具体要看区块链的版本，以及根据报错信息进行修改，以下的例子是两个都写上了。

```
  const result = await api.transact({
    actions: [{
      // 这个account是指合约名
      account: 'eosio',
      // 创建新账号的action名
      name: 'newaccount',
      authorization: [{
        actor: 'tmd111111111',
        permission: 'active',
      }],
      data: {
        creator: 'tmd111111111',
        // 这里的name指的是新用户的名字，在内部测试时候用的是name这个字段。
        name: 'tmdqqqqqqqqq',
        // newcat 是公测链，新用户名的参数，可能版本不一样，字段不一样
        newact:'tmdqqqqqqqqq',
        owner: {
          threshold: 1,
          keys: [{
            // 写入上面新生成的公钥
            key: 'EOS7hKV4FDKyFacdqCnXvanGv5p8YBPDwvD3km7P36pwb1do4b3wP',
            weight: 1
          }],
          accounts: [],
          waits: []
        },
        active: {
          threshold: 1,
          keys: [{
            // 写入上面新生成的公钥
            key: 'EOS7hKV4FDKyFacdqCnXvanGv5p8YBPDwvD3km7P36pwb1do4b3wP',
            weight: 1
          }],
          accounts: [],
          waits: []
        },
      },
    },
      {
        account: 'eosio',
        // 购买内存的action名
        name: 'buyrambytes',
        authorization: [{
          actor: 'tmd111111111',
          permission: 'active',
        }],
        data: {
          payer: 'tmd111111111',
          receiver: 'tmdqqqqqqqqq',
          bytes: 3000,
        },
      },
      {
        account: 'eosio',
        // 抵押资产的action名，用于租用带宽与cpu,抵押资产,抵押的越多，带宽和cup就越多
        name: 'delegatebw',
        authorization: [{
          actor: 'tmd111111111',
          permission: 'active',
        }],
        data: {
          from: 'tmd111111111',
          receiver: 'tmdqqqqqqqqq',
          // 这里的货币单位，要查询一下系统货币的名称才能填，可能是SYS或者EOS
          stake_net_quantity: '1.0000 EOS',
          stake_cpu_quantity: '1.0000 EOS',
          transfer: false,
        }
      }]
  }, {
    blocksBehind: 3,
    expireSeconds: 30,
  });

  console.log(result)
};

createAccount().catch(err=>{
  console.log("api error: ",err)
});
```
## 转账
转账操作就比较简单了

```
const transfer = async () => {
  const result = await api.transact({
    actions: [{
      account: 'eosio.token',
      name: 'transfer',
      authorization: [{
        actor: 'tmd111111111',
        permission: 'active',
      }],
      data: {
        from: 'tmd111111111',
        to: 'tmdqqqqqqqqq',
        quantity: '10.1234 EOS',
        memo: '',
      },
    }]
  }, {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  console.dir(result);
};


transfer().catch(err=>{
  console.log("transfer error: ",err)
});

```

创建账号和成功后，可以用rpc命令检查一下是否成功
```
const accountInfo2 = await rpc.get_account('tmdqqqqqqqqq');
console.log(accountInfo2);
```
---
## 使用postman获取区块数据
在命令行中打印区块信息可能比较难看清楚，eos也支持直接的http请求查询数据。
[api查询列表](https://developers.eos.io/eosio-nodeos/reference)

### 例子：
在`postman`中查询账号`tmd111111111`的操作历史

![postman_get_history.png](https://upload-images.jianshu.io/upload_images/7505289-fcf6321c29b34935.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 请求地址：http://junglehistory.cryptolions.io:18888/v1/history/get_actions
- 请求方式：POST
- 请求头：Content-Type：application/json
- 请求体：{"account_name" : "tmd111111111"}

----
最后附上全部代码



