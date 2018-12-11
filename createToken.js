const {api} = require('./config');


api.transact({
  actions: [{
    // 合约名,已经在命令行把eosio.token 这个合约部署到了账号tmd111111111下面，
    // 所以这里的用户名也就是合约名写自己账号名tmd111111111。
    account: 'tmd111111111',
    // 创建代币
    name: 'create',
    authorization: [{
      // 执行者账号，也就是自己的账号
      actor: 'tmd111111111',
      permission: 'active',
    }],
    data: {
      // 代币发行方，也就是自己，必须指定一个代币执行者，必须要有这个账号的执行权，
      // 并且该账号一定也要部署了eosio.token这个合约。
      // 一般情况也是写自己的账号名
      issuer: 'tmd111111111',
      // 指定代币都发行量、名称与精度，这里都精度是4位小数。
      maximum_supply: '999999.0000 NND',
      can_freeze: 0,
      can_recall: 0,
      can_whitelist: 0
    },
  },
    {
      // 合约名,已经在命令行吧eosio.token 这个合约部署到了账号tmd111111111下面，
      // 所以这里的用户名也就是合约名写自己tmd111111111。
      account: 'tmd111111111',
      // 发放代币，把上一步造好的代币发给一个接收者，这里也是写自己
      name: 'issue',
      authorization: [{
        // 合约执行方，这里当然是写自己啦
        actor: 'tmd111111111',
        permission: 'active',
      }],
      data: {
        // 代币的接收者，这里可以填写任意合法的地址，这里写了自己的地址。
        to: 'tmd111111111',
        quantity: '999999.0000 NND',
        memo: "create 999999.0000 NND"
      }
    }]
}, {
  blocksBehind: 3,
  expireSeconds: 30,
}).then(console.log).catch(console.log);


//如果执行结果出现了 transaction_id,则表明交易成功
// 可以运行 rpc.get_currency_balance('tmd111111111','tmd111111111') 检验一下发行结果。
// 在demo.js 中有这段代码。

