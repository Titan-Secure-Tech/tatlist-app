const square = require('square');
require('dotenv').config({ path: '.env.local' });

console.log('Square module:', Object.keys(square));
console.log('Square client constructor exists:', typeof square.SquareClient);

const { SquareClient, SquareEnvironment } = square;

const client = new SquareClient({
  accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
  environment: SquareEnvironment.SANDBOX,
});

console.log('Client created successfully');
console.log('Client properties:', Object.keys(client));
console.log('locationsApi exists:', typeof client.locationsApi);

if (client.locationsApi) {
  console.log('locationsApi methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(client.locationsApi)));
}