# JWT

The examples illustrates two methods to generate JWT tokens for Guest Issuer applications.

In short, the difference is the presence of an 'iat' attribute which specifies the time at which the guest token was generated.

Here is the payload for [webex4devs documentation](./webex4devs.js)

```json
{
  "sub": "2020",
  "name": "DevNet",
  "iss": "Y2lzY29zcGFyazovL3VzL09SR0FOSVpBVElPTi85OTU3MzdiYS00MWQwLTRkOTktODZiMy1hNzgwYzllM2FmYTg",
  "exp": 1578815795
}
```

Here is the payload for [guestissuer CLI](./guestissuercli.js)

```json
{
  "sub": "2020",
  "name": "DevNet",
  "iss": "Y2lzY29zcGFyazovL3VzL09SR0FOSVpBVElPTi85OTU3MzdiYS00MWQwLTRkOTktODZiMy1hNzgwYzllM2FmYTg",
  "iat": 1578815795,
  "exp": 1578815795
}
```
