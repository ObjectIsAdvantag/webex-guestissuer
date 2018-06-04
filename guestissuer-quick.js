//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

const debug = require('debug')('guest:quick')

const program = require('commander')

program
    .description('generates an access token for the specified user of the "Guest Issuer" organization"\n\
note that:\n\
  - the "Guest Issuer" identifier can be passed either via an ISSUER env variable, or the -i option\n\
  - the secret can be passed either via a SECRET env variable, or the -s option')
  .option('-i, --issuer [issuer_id]', 'Guest Issuer identifier')
  .option('-s, --secret [secret]', 'secret for the developer organization')
    .arguments('<userid> <username>')
    .action(function (userid, username) {

        // Check issuer id & secret
        let issuer = program.issuer || process.env.ISSUER
        if (!issuer) {
            console.error('missing Guest Issuer identifier, exiting...')
            console.error('please specify either via an ISSUER env variable, or the -i option')
            process.exit(1)
        }
        let secret = program.secret || process.env.SECRET
        if (!secret) {
            console.error('missing organization secret, exiting...')
            console.error('please specify either via a SECRET env variable, or the -s option')
            process.exit(1)
        }
        debug('successfully collected Guest Issuer details')

        // Check user info
        if (typeof userid === 'undefined') {
            console.error('no userid specified, exiting...');
            process.exit(1);
        }
        if (typeof username === 'undefined') {
            console.error('no full name specified of "Guest" user, exiting...');
            process.exit(1);
        }
        debug('successfully collected guest user info');

        // Forge issuer token
        const GuestUtil = require('./guestissuer-util');
        const expiresInSeconds =  Math.round(Date.now()/1000) + 60; // Guest token will expire in 60 seconds
        const guestToken = GuestUtil.createGuestToken(issuer, secret, userid, username, expiresInSeconds);
        
        // Request access token
        GuestUtil.fetchToken(guestToken)

    })
    .on('--help', function () {
        console.log('')
        console.log('  Examples:')
        console.log('')
        console.log('    $ guestissuer quick 123456789 "John Doe" -i "issuer_id" -s "secret"')
        console.log('    $ ISSUER="issuer_id" SECRET="secret" guestissuer quick 123456789 "John Doe"')
    })

program.parse(process.argv)
