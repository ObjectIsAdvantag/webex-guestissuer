//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

const debug = require('debug')('guest:login')

const program = require('commander')

program
    .description('fetch a new access token for Webex API, SDKs and Widgets.\n\
  note that:\n\
    - the user identity is inferred from the specified "Guest" token\n\
    - the returned access token is only valid for 6 hours')
    .arguments('<guest-token>')
    .action(function (guestToken) {
        // Check issuer token is present       
        if (!guestToken) {
            console.error('missing guest token, exiting...')
            console.error("you can generate a guest token with command: 'guestissuer create'")
            process.exit(1)
        }
        debug('successfully collected guest token')

         // Request access token
         const GuestUtil = require('./guestissuer-util')
         GuestUtil.fetchToken(guestToken)
    })
    .on('--help', function () {
        console.log('')
        console.log('  Example:')
        console.log('')
        console.log('    $ guestissuer login "12tre33.54343275.5456456745"')
    });

program.parse(process.argv)
