const {api} = require('./config');


api.transact({
  actions: [{
    // 合约名
    account: 'eosio.token',
    // 创建代币
    name: 'create',
    authorization: [{
      // 这里要写eosio.token这个系统账号，大概意思是这个币是系统造都
      actor: 'eosio.token',
      permission: 'active',
    }],
    data: {
      // 代币发行方，也就是自己
      issuer: 'tmd111111111',
      // 指定代币都发行量、名称与精度，这里都精度是4位小数。
      maximum_supply: '999999.0000 TMD',
      can_freeze: 0,
      can_recall: 0,
      can_whitelist: 0
    },
  },
    {
      // 合约名
      account: 'eosio.token',
      // 发放代币，把上一步造好的代币发给一个接收者，这里也是写自己
      name: 'issue',
      authorization: [{
        // 合约执行方，这里当然是写自己啦
        actor: 'tmd111111111',
        permission: 'active',
      }],
      data: {
        // 代币的接收者
        to: 'tmd111111111',
        quantity: '999999.0000 TMD',
        memo: "create 999999.0000 TMD"
      }
    }]
}, {
  blocksBehind: 3,
  expireSeconds: 30,
}).then(console.log).catch(console.log);
