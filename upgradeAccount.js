const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');
const fetch = require('node-fetch');
const { TextDecoder, TextEncoder } = require('text-encoding');
const privateKey = "5Jg3KWnT2cUsKvmiJYRo7iULfwyhunVU3uDrZEAvjtq2GpABiJQ";
const signatureProvider = new JsSignatureProvider([privateKey]);

const rpc = new JsonRpc('http://145.239.133.201:8888', { fetch });
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });


// 升级账户，给自己多买一点内存、网络与cpu，eos虽然是没有交易费，但是其他杂费可一点都不含糊。

api.transact({
  actions: [{
      account: 'eosio',
      // 购买内存的action名
      name: 'buyrambytes',
      authorization: [{
        actor: 'tmd111111111',
        permission: 'active',
      }],
      data: {
        payer: 'tmd111111111',
        receiver: 'tmd111111111',
        bytes: 1024*1024,
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
        receiver: 'tmd111111111',
        // 这里的货币单位，要查询一下系统货币的名称才能填，可能是SYS或者EOS
        stake_net_quantity: '20.0000 EOS',
        stake_cpu_quantity: '20.0000 EOS',
        transfer: false,
      }
    }]
}, {
  blocksBehind: 3,
  expireSeconds: 30,
}).then(console.log);
