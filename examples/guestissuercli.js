const jwt = require('jsonwebtoken');

if ((!process.env.GUEST_APPID) || (!process.env.GUEST_SECRET)) {
   console.error("Please provide GUEST_APPID and GUEST_SECRET environment variables, exiting...");
   process.exit(1);
}

let expireDelayInHours = 1; // in hours
const expiresInSeconds =  Math.round(Date.now()/1000) + expireDelayInHours*3600;

let payload = {
    "sub": "2020", // Guest User's Identifier used to persist communication
    "name":  "DevNet", // Guest User's Display Name
    "iss": process.env.GUEST_APPID,
    "exp": expiresInSeconds 
};

let token = jwt.sign(
   payload, 
   Buffer.from(process.env.GUEST_SECRET, 'base64'),
   { algorithm: 'HS256', noTimestamp: true }
);

console.log(`JWT: ${token}`);