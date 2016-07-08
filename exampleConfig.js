module.exports = {
  sessionSecret: 'sessionSecret (any random string)',
  env: process.env.NODE_ENV || 'development',
  defaultAdmin: {
    username: 'defaultUser',
    password: 'password',
    email: 'whatever@example.com',
    actualName: 'Monty Dawson'
  }
};
