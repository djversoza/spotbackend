module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres://localhost/spotographer'
  },
  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    }
  }  

};
