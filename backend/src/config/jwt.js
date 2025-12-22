const { JWT_SECRET }  = require ('./env.js');
console.log(JWT_SECRET);
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

module.exports = {
  JWT_SECRET,
};
