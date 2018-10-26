const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');
const ecc = require('eosjs-ecc');

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




// rpc对象支持promise，所以使用 async/await 函数运行rpc命令
const  runRpc = async () => {

  // 获取主网信息
  const info = await rpc.get_info();
  console.log(info);

  // 获取账号tmd111111111的信息
  const accountInfo = await rpc.get_account('tmd111111111');
  console.log(accountInfo);

  const accountInfo2 = await rpc.get_account('tmdqqqqqqqqq');
  console.log(accountInfo2);

  //获取账号tmd111111111的资产,查询资产的时候要加上资产的合约名字eosio.token
  const balance = await rpc.get_currency_balance('eosio.token','tmd111111111');
  console.log(balance);

  //获取账号操作历史
  const actionHistory = await rpc.history_get_actions('tmd111111111');
  console.log(actionHistory);

};


// 创建账号
// api对象支持promise，所以使用 async/await 函数运行api命令
const createAccount = async () => {

  // 创建账号前，生成公私钥，需要使用 eosjs-ecc 模组
  const newPrivateKey = await ecc.randomKey();
  const newPublicKey = ecc.privateToPublic(newPrivateKey);
  console.log(newPrivateKey, newPublicKey);

  // 本次生成结果是
  // newPublicKey  EOS7hKV4FDKyFacdqCnXvanGv5p8YBPDwvD3km7P36pwb1do4b3wP
  // newPrivateKey 5Jm73Ngn3aH9FcukWd1djvxq9iyoidxHhvaxzDigA19D42MhHEN


  // 这是将多个action合并到一起发起。
  // 因为在创建账号的时候需要三个步骤
  // 1）将用户名与公钥绑在一起
  // 2) 为新用户租借网络带宽与cpu
  // 3) 为新用户购买内存
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


// 转账操作
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


runRpc().catch(err=>{
  console.log("rpc error: ",err)
});


// createAccount().catch(err=>{
//   console.log("api error: ",err)
// });

// transfer().catch(err=>{
//   console.log("transfer error: ",err)
// });
