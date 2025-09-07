const square = require('square');

console.log('Square module exports:', Object.keys(square));
console.log('\nClient exists:', !!square.Client);
console.log('SquareClient exists:', !!square.SquareClient);
console.log('Environment exists:', !!square.Environment);
console.log('SquareEnvironment exists:', !!square.SquareEnvironment);

if (square.Environment) {
  console.log('\nEnvironment keys:', Object.keys(square.Environment));
}

if (square.SquareEnvironment) {
  console.log('\nSquareEnvironment keys:', Object.keys(square.SquareEnvironment));
}

// Try creating a client with different patterns
if (square.Client) {
  try {
    const client = new square.Client({
      accessToken: 'test',
      environment: square.Environment?.Sandbox || 'sandbox'
    });
    console.log('\nClient created successfully with square.Client');
    console.log('Client properties:', Object.keys(client));
  } catch (e) {
    console.log('\nFailed to create client with square.Client:', e.message);
  }
}

if (square.SquareClient) {
  try {
    const client = new square.SquareClient({
      accessToken: 'test',
      environment: square.SquareEnvironment?.Sandbox || 'sandbox'
    });
    console.log('\nClient created successfully with square.SquareClient');
    console.log('Client properties:', Object.keys(client));
  } catch (e) {
    console.log('\nFailed to create client with square.SquareClient:', e.message);
  }
}