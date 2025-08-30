import square from 'square';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { SquareClient, SquareEnvironment } = square;

const squareClient = new SquareClient({
  accessToken: process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.trim(),
  environment: SquareEnvironment.SANDBOX,
});

console.log('Available catalog methods:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(squareClient.catalog)));