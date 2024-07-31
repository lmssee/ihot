const { stdout, stdin } = process;

console.log('i am run');

setTimeout(() => {
  console.log('====================================');
  console.log(1321321);
  console.log('====================================');
}, 2500);
stdin.on('data', data => console.log('i am in test', data.toString()));
