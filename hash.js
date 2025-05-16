// hash.js
const bcrypt = require('bcrypt');

const password = 'Hayshj110420'; // Replace with your real password

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed password:', hash);
});
