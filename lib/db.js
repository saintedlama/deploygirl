const lowdb = require('lowdb');

const db = createDb();
db.defaults({ applications: [] }).value();

function createDb() {
  if (process.env.NODE_ENV=='test') {
    return lowdb();
  }

  return lowdb('db.json');
}

module.exports = db;