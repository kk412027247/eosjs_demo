const ecc = require('eosjs-ecc');

// 用助记词生成私钥
const privateKey = ecc.seedPrivate('tmd12345');
const publicKey = ecc.privateToPublic(privateKey);

console.log('publicKey',publicKey);
console.log('privateKey',privateKey);
