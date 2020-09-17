//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

const debug = require('debug')('guest:verify')

const program = require('commander')

program
    .description('reveals info contained in a JWT token')
    .option("-j, --jwt", "decrypts the JWT token (works with JWT issuer and issued tokens)")
    .option("-s, --access", "shows the Webex user identity behind a valid access token")
    .arguments('<token>')
    .action(function (token) {

        // Check token is specified
        if (typeof token === 'undefined') {
            console.error('no token specified, exiting...');
            process.exit(1);
        }
        debug('successfully collected token')

        if (program.access) {
            // Fetch info from Webex API /people/me
            debug('got it: will ask Webex about this token')
            checkAccessToken(token)
            return
        }

        // JWT option
        debug('got it: will reveal JWT info')
        checkJWTtoken(token)

    })
    .on('--help', function () {
        console.log('')
        console.log('  Examples:')
        console.log('')
        console.log('    $ guestissuer verify --jwt 123456789.RRETEZT3T63362.987654321')
        console.log('    $ guestissuer verify --access 123456789.RRETEZT3T63362.987654321')
    })

program.parse(process.argv)


function checkJWTtoken(token) {

    debug('checking token')

    try {

        // sign with HMAC SHA256
        const jwt = require('jsonwebtoken')

        const decoded = jwt.decode(token, { complete: true })

        if (!decoded) {
            debug("decode returned null")
            console.log("the specified token does not comply with JWT format")
            process.exit(1)
        }

        debug("successfully decoded")
        console.log(decoded)
    }
    catch (err) {
        console.error("failed to decode JWT token, exiting...");
        debug("err: " + err)
        process.exit(1)
    }
}


// Invokes the /people/me resource from Webex API
// and displays info for the specified access token
function checkAccessToken(token) {
    debug('contacting Webex API resource: /people/me')

    const axios = require('axios');
    axios.get('https://api.ciscospark.com/v1/people/me',
        { headers: { 'Authorization': 'Bearer ' + token } })
        .then(response => {
            if (!response.data) {
                debug("unexpected response, no payload")
                console.log("could not contact Webex")
                process.exit(1)
            }

            console.log(response.data)
        })
        .catch(err => {
            if (err.response) {
                if (err.response.status == 401) {
                    debug("401, bad token")
                    console.error("bad token, could not authenticate")
                    process.exit(1);
                }

                console.error("could not retrieve info, err: " + err.message)
                process.exit(1);
            }

            switch (err.code) {
                case 'ENOTFOUND':
                    debug("could not reach host: ENOTFOUND")
                    break
                default:
                    debug("error accessing /people/me, err: " + err.message)
                    break
            }
            console.error("could not contact Webex")
            process.exit(1);
        })
}