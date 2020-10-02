var ENV = process.argv [2] === 'local' ? undefined : process.argv [2];

var DOMAIN = {
   dev:  'https://altocode.nl/picdev/',
   prod: 'https://altocode.nl/pic/app/',
} [ENV];

var TEMPLATE = function (content) {
   return [
      ['head', [
         ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat'}],
      ]],
      ['body', [
         ['style', [
            ['p', {'font-family': '\'Montserrat\', sans-serif'}],
         ]],
         content,
      ]],
   ];
}

var GREETING = function (username) {
   username = username [0].toUpperCase () + username.slice (1);
   return ['Hi ', ['span', username], ','];
}

module.exports = {
   domain: DOMAIN,
   cookiename: 'ac-v1',
   allowedFormats: ['image/jpeg', 'image/png', 'video/mp4'],
   port: 1427,
   basepath: ENV ? '/root/files' : '/tmp',
   redisdb: 15,
   crypto: {
      algorithm: 'aes-256-gcm',
      nonceLength: 16,
      tagLength: 16,
   },
   storelimit: {
      tier1: 2 * 1000 * 1000 * 1000,
   },
   backup: {
      frequency: 10,
      path: '/var/lib/redis/dump.rdb',
   },
   email: {
      address: 'info@altocode.nl',
      name: 'acpic'
   },
   etemplates: {
      feedback: {
         subject: 'Thank you for your feedback!',
         message: function (username, feedback) {
            return TEMPLATE (['p', [
               GREETING (username),
               ['br'],
               'We have received your feedback and we are ever so thankful for having received it.',
               ['br'],
               'For your record, this is what we received:',
               ['br'],
               feedback,

               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               ['span', {class: 'bold'}, 'The ac;pic team']
            ]]);
         }
      },
      invite: {
         subject: 'Your invitation to join ac;pic',
         message: function (username, token, email) {
            return TEMPLATE (['p', [
               GREETING (username),
               ['br'],
               'You have been officially invited to join ac;pic. ',
               ['a', {href: DOMAIN + '#/signup/' + encodeURIComponent (JSON.stringify ({token: token, email: email}))}, 'Please click on this link to create your account.'],
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               ['span', {class: 'bold'}, 'The ac;pic team']
            ]]);
         }
      },
      verify: {
         subject: 'Please verify your email',
         message: function (username, token) {
            return TEMPLATE (['p', [
               GREETING (username),
               ['br'],
               'Welcome to ac;pic! Please verify your email by clicking on the following link: ',
               ['a', {href: DOMAIN + 'auth/verify/' + encodeURIComponent (token)}, 'Verify your email'],
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               ['span', {class: 'bold'}, 'The ac;pic team']
            ]]);
         }
      },
      welcome: {
         subject: 'Welcome to ac;pic!',
         message: function (username, token) {
            return TEMPLATE (['p', [
               GREETING (username),
               ['br'],
               'Welcome to ac;pic! We are thrilled to have you with us.',
               ['br'],
               'ac;pic is just getting started; we would love to have your feedback. Feel free to tell us how we can make ac;pic work better for you. When you have a moment, just hit "reply" to this email and let us know what you think.',
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               ['span', {class: 'bold'}, 'The ac;pic team']
            ]]);
         }
      },
      recover: {
         subject: 'Did you forget your password?',
         message: function (username, token) {
            return TEMPLATE (['p', [
               GREETING (username),
               ['br'],
               'Did you forget your password? If you did, all is well: please ', ['a', {href: DOMAIN + '#/auth/reset/' + encodeURIComponent (token) + '/' + encodeURIComponent (username)}, 'click on this link to set a new password.'],
               ['br'],
               'If you did not request a password reset, please do NOT click the link above. Instead reply immediately to this email and let us know.',
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               ['span', {class: 'bold'}, 'The ac;pic team']
            ]]);
         }
      },
      reset: {
         subject: 'You just changed your password',
         message: function (username) {
            return TEMPLATE (['p', [
               GREETING (username),
               ['br'],
               'We just changed your password. If you performed this change, no further action is necessary.',
               ['br'],
               'If you didn\'t change your password, please contact us IMMEDIATELY.',
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               ['span', {class: 'bold'}, 'The ac;pic team']
            ]]);
         }
      },
   }
}

// Below is a template for creating secret.js . All UPPERCASE strings must be replaced by proper values.
/*
module.exports = {
   cookieSecret: 'COOKIESECRET',
   admins: ['EMAIL1', 'EMAIL2', ...],
   s3: {
      accessKeyId:     'KEY',
      secretAccessKey: 'SECRETKEY',
      pic: {
         bucketName:      'BUCKETNAME',
      },
      db: {
         bucketName:      'BUCKETNAME',
      }
   },
   ses: {
      accessKeyId:     'KEY',
      secretAccessKey: 'SECRETKEY',
      region:          'REGION'
   },
   crypto: {
      password: 'CRYPTOSTRONGPASSWORD'
   },
   google: {
      api: {
         key:    'KEY',
         client: 'CLIENTID',
         secret: 'SECRET'
      },
      oauth: {
         client: 'CLIENTID',
         secret: 'SECRET'
      },
   },
   ping: {
      // Your ac;log credentials here. ac;log hasn't been published yet, so you can use an empty object instead.
   }
}
*/
