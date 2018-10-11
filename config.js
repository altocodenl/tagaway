var DOMAIN = {
   dev:  'https://altocode.nl/picdev/',
   prod: 'https://altocode.nl/pic/',
} [process.argv [2]];

var ACPIC = [['span', {style: 'font-weight: bold;'}, 'ac:'], ['span', {style: 'font-weight: bold; color: red'}, 'pic']];
var TEMPLATE = function (content) {
   return ['body', {style: 'width: 50%; margin-left: 25%;'}, [
      ['p', {style: 'text-align: center; font-size: 28px;'}, ['a', {href: DOMAIN, style: 'color: inherit; text-decoration: none'}, ACPIC]],
      content,
   ]];
}
var GREETING = function (username) {
   username = username [0].toUpperCase () + username.slice (1);
   return ['Hi ', ['span', {style: 'font-weight: bold; color: red'}, username], ','];
}

module.exports = {
   cookiename: 'ac-v1',
   allowedmime: ['image/jpeg', 'image/png'],
   port: 1427,
   accesslog: 'access.log',
   errorlog:  'error.log',
   clientlog: 'client.log',
   picfolder: process.argv [2] ? '/root/files' : '/home/hq/acpic/files',
   redisdb: 15,
   crypto: {
      algorithm: 'aes-256-ctr'
   },
   storelimit: {
      tier1:   12 * 1024 * 1024 * 1024,
      tier2:  100 * 1024 * 1024 * 1024,
   },
   backup: {
      frequency: 10,
      path: '/var/lib/redis/dump.rdb',
   },
   etemplates: {
      invite: {
         subject: 'Your invitation to join acpic',
         message: function (username, token) {
            return TEMPLATE (['p', {style: "color: black; font-size: 16px; font-family: 'Lucida Bright', Georgia, serif;"}, [
               GREETING (username),
               ['br'],
               'You have been officially invited to join ', ACPIC, '!',
               ['br'],
               ['a', {href: DOMAIN + '#/auth/signup/' + encodeURIComponent (token)}, 'Please click on this link to create your account.'],
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               'The ', ACPIC, ' team'
            ]]);
         }
      },
      verify: {
         subject: 'Please verify your email',
         message: function (username, token) {
            return TEMPLATE (['p', {style: "color: black; font-size: 16px; font-family: 'Lucida Bright', Georgia, serif;"}, [
               GREETING (username),
               ['br'],
               'Welcome to ', ACPIC, ' ! Please verify your email by clicking on the following link: ',
               ['a', {href: DOMAIN + 'auth/verify/' + encodeURIComponent (token)}, 'Verify your email'],
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               'The ', ACPIC, ' team'
            ]]);
         }
      },
      welcome: {
         subject: 'Welcome to acpic!',
         message: function (username, token) {
            return TEMPLATE (['p', {style: "color: black; font-size: 16px; font-family: 'Lucida Bright', Georgia, serif;"}, [
               GREETING (username),
               ['br'],
               'Welcome to ', ACPIC, ' ! We are thrilled to have you with us.',
               ['br'],
               ACPIC, ' is just getting started; we would love to have your feedback. Feel free to tell us how we can make ', ACPIC, ' work better for you.',
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               'The ', ACPIC, ' team'
            ]]);
         }
      },
      recover: {
         subject: 'Did you forget your password?',
         message: function (username, token) {
            return TEMPLATE (['p', {style: "color: black; font-size: 16px; font-family: 'Lucida Bright', Georgia, serif;"}, [
               GREETING (username),
               ['br'],
               'Did you forget your password? If you did, all is well: please ', ['a', {href: DOMAIN + '#/auth/reset/' + encodeURIComponent (token) + '/' + encodeURIComponent (username)}, 'click on this link to set a new password.'],
               ['br'],
               'If you did not request a password reset, please do NOT click the link above. Instead reply immediately to this email and let us know.',
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               'The ', ACPIC, ' team'
            ]]);
         }
      },
      reset: {
         subject: 'You just changed your password',
         message: function (username) {
            return TEMPLATE (['p', {style: "color: black; font-size: 16px; font-family: 'Lucida Bright', Georgia, serif;"}, [
               GREETING (username),
               ['br'],
               'We just changed your password. If you performed this change, no further action is necessary.',
               ['br'],
               'If you didn\'t change your password, please contact us IMMEDIATELY.',
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               'The ', ACPIC, ' team'
            ]]);
         }
      },
   }
}

// Below is a template for creating secret.js . All UPPERCASE strings must be replaced by proper values.
/*
module.exports = {
   cookie: 'COOKIESECRET',
   s3: {
      accessKeyId:     'KEY',
      secretAccessKey: 'SECRETKEY',
      pic: {
         bucketName:      'BUCKETNAME',
         region:          'REGION',
      },
      db: {
         bucketName:      'BUCKETNAME',
         region:          'REGION',
      }
   },
   ses: {
      accessKeyId:     'KEY',
      secretAccessKey: 'SECRETKEY',
   },
   crypto: {
      password: 'CRYPTOSTRONGPASSWORD',
   },
   admins: ['EMAIL1', 'EMAIL2', ...]
}
*/
