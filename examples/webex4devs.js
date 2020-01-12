const jwt = require('jsonwebtoken');

if ((!process.env.GUEST_APPID) || (!process.env.GUEST_SECRET)) {
   console.error("Please provide GUEST_APPID and GUEST_SECRET environment variables, exiting...");
   process.exit(1);
}

let payload = {
   "sub": "2020", // Guest User's Identifier used to persist communication
   "name": "DevNet", // Guest User's Display Name
   "iss": process.env.GUEST_APPID
};

let token = jwt.sign(
   payload,
   Buffer.from(process.env.GUEST_SECRET, 'base64'),
   { expiresIn: '1h' }
);

console.log(`JWT: ${token}`);