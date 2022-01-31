var ENV = process.argv [2] === 'local' ? undefined : process.argv [2];

var DOMAIN = {
   dev:  'https://altocode.nl/picdev/',
   prod: 'https://altocode.nl/pic/app/',
   test: 'http://localhost:8000/'
} [ENV || 'test'];

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
   cookieName: 'acpic' + (ENV ? '-' + ENV : ''),
   allowedFormats: ['image/jpeg', 'image/png', 'image/bmp', 'image/heic', 'image/heif', 'image/gif', 'image/tiff', 'image/webp', 'video/mp4', 'video/quicktime', 'video/3gpp', 'video/avi', 'video/x-msvideo', 'video/webm', 'video/x-ms-wmv', 'video/x-m4v'],
   port: ENV ? 1427 : 8000,
   basepath: ENV ? '/root/files' : '/tmp',
   redisdb: ENV ? 15 : 13,
   maxFileSize: 2 * 1000 * 1000 * 1000,
   crypto: {
      algorithm: 'aes-256-gcm',
      nonceLength: 16,
      tagLength: 16,
   },
   freeSpace: 5 * 1000 * 1000 * 1000,
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
      importList: function (provider, username) {
         return {
            subject: 'Your files from ' + provider + ' are ready to be imported',
            message: TEMPLATE (['p', [
               GREETING (username),
               ['br'],
               ['Your ' + provider + ' files are fully listed. You can now ', ['a', {href: DOMAIN + '#/import'}, 'select the folders'], ' you want to import to ac;pic.'],
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               ['span', {class: 'bold'}, 'The ac;pic team']
            ]])
         }
      },
      importUpload: function (provider, username) {
         return {
            subject: 'Your files from ' + provider + ' were imported',
            message: TEMPLATE (['p', [
               GREETING (username),
               ['br'],
               ['Your ' + provider + ' files are now in ac;pic! You can find them in ', ['a', {href: DOMAIN + '#/pics'}, '"View Pictures"'], '.'],
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               ['span', {class: 'bold'}, 'The ac;pic team']
            ]])
         }
      },
      importError: function (provider, username) {
         return {
            subject: 'There was an error importing your files from ' + provider,
            message: TEMPLATE (['p', [
               GREETING (username),
               ['br'],
               ['Unfortunately there was an error importing your files from ' + provider + '. Alas! Please check the ', ['a', {href: DOMAIN + '#/import'}, '"Import"'], ' view to try again.'],
               ['br'], ['br'],
               'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
               ['br'],
               ['span', {class: 'bold'}, 'The ac;pic team']
            ]])
         }
      }
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
      region: 'REGION',
      piv: {
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
         key:    'KEY'
      },
      oauth: {
         dev: {
            client: 'CLIENTID',
            secret: 'SECRET'
         },
         prod: {
            client: 'CLIENTID',
            secret: 'SECRET'
         },
         test: {
            client: 'CLIENTID',
            secret: 'SECRET'
         }
      } [process.argv [2] === 'local' ? 'dev' : process.argv [2]]
   },
   ping: {
      // Your ac;log credentials here. ac;log hasn't been published yet, so you can use an empty object instead.
   }
}
*/
