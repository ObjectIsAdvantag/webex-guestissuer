# CLI to generate JWT and access tokens for Webex Teams 'Permanent Guest'

'Guest Issuer' applications allow guests (aka, non Webex Teams users) to persistently use the Webex cloud platform through the Teams SDKs and Widgets. Check the [online documentation for details](https://developer.webex.com/guest-issuer.html).

The `sparkguest` command line interface (CLI) helps generate Guest tokens for 'Guest Issuer' applications.

To use the tool, you'll first need to create a 'Guest Issuer' application from [Webex for Developers portal](https://developer.webex.com/add-guest.html), and fetch your 'Guest Issuer' application's identifier and secret.
**Note that you need a Webex Teams paying account to create 'Guest Issuer' application.**


## QuickStart

To generate a Guest token, type the commands below in a terminal

```shell
# Install the CLI
npm install sparkguest -g

# Create a Guest token with the specified user info (expires in 90 minutes by default)
sparkguest create <userId> <userName> -i <issuerAppId> -s <issuerAppSecret> [-d <expirationDelay>]

# Fetch an access token for the Guest user (valid for 6 hours)
sparkguest login <guestToken>
```


You can even get there quicker with the `quick` command:

```shell
# Install the CLI
npm install sparkguest -g

# Create a Guest token, and fetch an access token right away (valud for 6 hours)
# Here, the guest token is volatile (neither stored, not returned)
sparkguest quick <userId> <userName> -i <issuerAppId> -s <issuerAppSecret>
```



## Detailled instructions

To install the `sparkguest` CLI, type:

    ```shell
    npm install sparkguest -g
    ```


To create a 'Guest token' for a 'Guest' user (non Webex Teams users), type:

    ```shell
    sparkguest [create] <userId> <userName> -i <issuerAppId> -s <issuerAppSecret> [-d <expirationDelay>]
    ```

    Where:
        - `userId` is a user identifier unique to your 'Guest Issuer'. This identifier is used by the Webex cloud platform to persist user data among sessions. Understand: if another token gets generated with the same 'userId', the Guest user interacting with that token will see Spaces, Messages, and inherit Memberships from previous Webex interactions for this 'userId',
        - `userName` is used to identify the user in Webex Teams spaces,
        - `expirationDelay` should be specified in seconds, defaults to 5400s (90min) from now.
        - the `issuerAppId` and `issuerAppSecret` tie to the 'Guest Issuer Application' created from the [Webex for Developers portal](https://developer.webex.com/add-guest.html).
    
    Example (with verbose debugging info):

    ```shell
    DEBUG=guest*  sparkguest create "123" "Stève" -i Y2lz...VzLMDY -s AMx/FPI...NABzD6o=
        guest arguments successfully checked +0ms
        guest successfully built Guest token: BDmh0rgbcVMfpklnyWfurxX5Y... +59ms
        guest Guest token is valid till XXXXX +1ms        
    eyJhbGciOiJSUzI1NiJ9.eyJtYWN...uNDU1WiJ9.berce_d8vrRw6vDI....nMAlnYNj-f921mcqU
    ```

    Note that:
        - instead of passing them through command line parameters, you can alternatively specify the 'Guest Issuer Application'  identifier and secret via environment variables `ISSUER` and `SECRET` 
        - the `create` command is the default's for sparkguest. You can omit it as in `sparkguest "123" "Stève" -i Y2lz...VzLMDY -s AMx/FPI...NABzD6o=`
        

Once you've got a 'Guest token', you'll need to fetch an access token (valid for 6 hours).

    ```shell
    sparkguest login <guestToken>
    ```

    Note that:
       - the command uses the Webex Teams API 's /jwt/login endpoint behind the scene.
       - the fetched accessed token is valid for 6 hours


To quickly check the data contained in a JWT token (guest or access token):

    ```shell
    sparkguest verify --jwt <token>
    ```


To quickly the Person behind an access token (equivalent tp a GET /people/me request):

    ```shell
    sparkguest verify --spark <access_token>
    ```


### Guest tokens

Guest tokens have a JWT format, and are signed with your 'Guest Issuer Application' secret so that Webex can be assured of its origin.
It contains an expiration date so that Webex will refuse to generate access tokens - via the /jwt/login endpoint - after the expiration date.

**Example of Guest token**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiU3TDqHZlIiwiaXNzIjoiWTJselkyOXpjR0Z5YXpvdkwzVnpMMDlTUjBGT1NWcEJWRWxQVGk4ek9URTRPR00zTWkwd01ESTVMVF EzWVRRdFlqQXlOUzAxT0dFd1kyRTNORFZrTURZIiwiZXhwIjoxNTE3MDczMDE5fQ.imX0LgZ6LT-xlT3A6mzF5gyGN0S2ty2aUyjTM35E8y4    
```

Note that the Guest token also has a JWT format.
If you decode it, you'll discover its contents.
Go to https://jwt.io to decode it, or simply type: `sparkguest verfiy --jwt <guest_token>`

**Decoded Header Section**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Decoded Data section**

```json
{
  "sub": "123",
  "name": "Stève",
  "iss": "Y2lzY29zcGFyazovL3VzL09SR0FOSVpBVElPTi8zOTE4OGM3Mi0wMDI5LTQ3YTQtYjAyNS01OGEwY2E3NDVkMDY",
  "exp": 1517073019
}
```


### Retreiving API access tokens for 'Guest' users 

These tokens are generated from 'Guest tokens' by invoking Webex Teams API 's /jwt/login endpoint
They give access to the Webex Teams API, SDKs and Widgets under the identity of the 'Guest' user.

To test an access token for a user, reach to the [GET /people/me](https://developer.webex.com/endpoint-people-me-get.html) resource, paste the access token and run the request.
Alternatively, you can type: `sparkguest verify --spark <access_token>`

    Example of Person details for an access token attached to a Guest user:

    _Note that the person type is `bot` and the email is formed from `<user_id>@<decoded-org>`_

    ```json
    {
        "id": "Y2lzY29zcGFyazovL3VzL1B....Q5YzgtODAzMS02OTY1NWM4MGI3Njc",
        "emails": [
            "123@39188c72-0029-47a4-b025-58a0ca745d06"
        ],
        "displayName": "Stève",
        "avatar": "https://00792fd90955bc2.....da928cc2123a400b.ssl.cf1.rackcdn.com/default_machine~80",
        "orgId": "Y2lzY29zcGFyazovL3VzL09SR0FOSVp...DI5LTQ3YTQtYjAyNS01OGEwY2E3NDVkMDY",
        "created": "2018-01-27T16:13:25.558Z",
        "type": "appuser"
    }
    ```

Note that the issued token also has a JWT format.
If you decode it, you'll discover its structure.
Go to https://jwt.io, or simply type: `sparkjwt verify --jwt <token>`


**Decoded Header Section**

```json
{
  "alg": "RS256"
}
```

**Decoded Data section**

```json
{
  "machine_type": "appuser",
  "expiry_time": 1517095624105,
  "user_type": "machine",
  "realm": "2a9e1....ad3c991b1b5",
  "cis_uuid": "8dcc341a...55c80b767",
  "reference_id": "b4f77f9.....204f3daac88",
  "iss": "https://idbroker.webex.com/idb",
  "token_type": "Bearer",
  "client_id": "C311772...1c2c82784a1f2975c",
  "token_id": "AaZ3r0t...0YzIxYzliZGE0NDNiOGRiYzctMmI1",
  "private": "eyJhbGciOiJkaXIiL...Tx45V0-PA",
  "user_modify_timestamp": "20180127172701.477Z"
}
```


### Tip : Adding a 'Permanent Guest' to a space

The general use case for "Permanent Guest" is to call an existing Webex Teams user, and create a space and add Bots or Webex Teams users to the space.

Sometimes, you may be interested to add a 'Permanent Guest' to an existing space (or newly created space).
You'll hit a difficulty here since 'Permanent Guest' cannot be reached via their Webex email.
Simply use the `personId` in the [POST /membership - Create a membership](https://developer.webex.com/endpoint-memberships-post.html) resource.
Note that you can get the Webex Teams `personId` of a "Permanent Guest" through a [GET /people/me](https://developer.webex.com/endpoint-people-me-get.html) request issued with the "Permanent Guest" access token.