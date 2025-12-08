const { SquareClient } = require('square');

const client = new SquareClient({ accessToken: 'test' });

console.log('Square SDK Client Properties:');
console.log(Object.keys(client).filter(k => !k.startsWith('_')).join('\n'));
