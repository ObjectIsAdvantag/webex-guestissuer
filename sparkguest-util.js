//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

const debug = require('debug')('guest:util');

//
// Builds a Guest Token from the specifed user info
//
module.exports.createGuestToken = function (issuer, secret, userid, username, expiresInSeconds) {
    debug(`generating Guest token for user with id: ${userid}, name: ${username}, in Guest Issuer: ${issuer}`);

    try {

        // sign with HMAC SHA256
        const jwt = require('jsonwebtoken');

        const payload = {
            "sub": userid,
            "name": username,
            "iss": issuer,
            "exp": expiresInSeconds
        };

        const decoded = Buffer.from(secret, 'base64');

        const guestToken = jwt.sign(payload, decoded, { algorithm: 'HS256', noTimestamp: true });

        debug("successfully built Guest token: " + guestToken.substring(0,30));

        return guestToken;
    }
    catch (err) {
        console.error("failed to generate a Guest token, exiting...");
        debug("err: " + err.message);
        process.exit(1);
    }
}


//
// Request an access token for the specified Guest User's Issuer Token
//
module.exports.fetchToken = function (guestToken) {
    debug("requesting new access token");
    
    debug('contacting Webex API endpoint: /jwt/login');
    
    const axios = require('axios');
    axios.post('https://api.ciscospark.com/v1/jwt/login', '',
    { headers: { 'Authorization': 'Bearer ' + guestToken } })
    .then(response => {
        if (!response.data || !response.data.token) {
            debug("no token found in response: " + response);
            console.log("failed to generate an access token: bad response");
            console.log("exiting...");
            process.exit(1);
        }
    
        let accessToken = response.data.token;
        console.log(`Here is an access token, valid for: ${response.data.expiresIn} seconds`);
        console.log(accessToken);
    })
    .catch(err => {
        switch (err.code) {
            case 'ENOTFOUND':
                debug("could not contact the Webex API");
                break
            default:
                debug("error accessing /jwt/login, err: " + err.message);

                if (err.response && (err.response.status >= 400) && (err.response.status < 500)) {
                    console.log(`Invalid Guest token: ${err.response.data.message}`);
                    process.exit(1);
                }    
                break;
        }
        
        console.log("failed to generate an access token");
        console.log("exiting...");
        process.exit(1);
    })   
}