//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

const debug = require('debug')('guest:create')

const program = require('commander')

program
    .description('creates a "Guest token" from the specified user info and "Guest Issuer"\n\
  note that:\n\
    - the "Guest Issuer" identifier can be passed either via an ISSUER env variable, or the -i option\n\
    - the secret can be passed either via a SECRET env variable, or the -s option')
    .option('-i, --issuer [issuer id]', 'Guest Issuer identifier')
    .option('-s, --secret [secret]', 'Guest Issuer secret')
    .option('-d, --delay [seconds]', 'Expiration delay in seconds, defaults to 90 minutes from now.')
    .arguments('<userid> <username>')
    .action(function (id, name) {
        // Check issuer id & secret
        let issuer = program.issuer || process.env.ISSUER
        if (!issuer) {
            console.error('missing Guest Issuer identifier, exiting...')
            console.error('please specify either via an ISSUER env variable, or the -i option')
            process.exit(1)
        }
        let secret = program.secret || process.env.SECRET
        if (!secret) {
            console.error('missing Guest Issuer secret, exiting...')
            console.error('please specify either via a SECRET env variable, or the -s option')
            process.exit(1)
        }
        debug('successfully collected Guest Issuer details')

        // Check user info
        if (typeof id === 'undefined') {
            console.error('no identifier specified for "Guest" user, exiting...');
            process.exit(1);
        }
        if (typeof name === 'undefined') {
            console.error('no full name specified of "Guest" user, exiting...');
            process.exit(1);
        }
        debug('successfully collected guest user info')

        // Expiration delay from now, in seconds
        let delay = program.delay || process.env.EXPIRES;  // in seconds
        if (delay) {
            // Turn to int
            try {
                delay = parseInt(delay);
            }
            catch (err) {
                delay = undefined
            }
        }
        if (!delay) {
            // Defaults to 90 minutes
            delay = 90*60; 
        }
        const expiresInSeconds =  Math.round(Date.now()/1000) + delay;

        // Forge issuer token
        const GuestUtil = require('./sparkguest-util')
        const issuerToken = GuestUtil.createGuestToken(issuer, secret, id, name, expiresInSeconds)

        // Show token
        console.log(`Here is a JWT token, valid for: ${delay} seconds, for Permanent Guest: ${name}`);
        console.log(issuerToken)
    })
    .on('--help', function () {
        console.log('')
        console.log('  Examples:')
        console.log('')
        console.log('    $ sparkguest create 123456789 "John Doe" -i "issuer_id" -s "issuer_secret"')
        console.log('    $ ISSUER="issuer_id" SECRET="issuer_secret" sparkguest create 123456789 "John Doe"')
    })

program.parse(process.argv)
