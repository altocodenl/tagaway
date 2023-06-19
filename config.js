var ENV = process.argv [2] === 'local' ? undefined : process.argv [2];

var DOMAIN = {
   dev:  'https://tagaway.nl/dev/app/',
   prod: 'https://tagaway.nl/app/',
   // For local testing
   //test: 'http://localhost:8000/'
   // For testing on dev server
   test: 'https://tagaway.nl/test/app/'
} [ENV || 'test'];

var TEMPLATE = function (username, content) {
   return [
      ['head', [
         ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat'}],
      ]],
      ['body', [
         ['style', [
            ['p', {'font-family': '\'Montserrat\', sans-serif'}],
         ]],
         ['p', [
            GREETING (username),
            ['br'],
            content,
            ['br'], ['br'],
            'Have an amazing ' + ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] [new Date ().getDay ()] + '!',
            ['br'],
            ['span', {class: 'bold'}, 'The Altocode team']
         ]]
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
   allowedFormats: ['image/jpeg', 'image/png', 'image/bmp', 'image/heic', 'image/heif', 'image/gif', 'image/tiff', 'image/webp', 'video/mp4', 'video/quicktime', 'video/3gpp', 'video/avi', 'video/x-msvideo', 'video/webm', 'video/x-ms-wmv', 'video/x-m4v', 'video/mpeg', 'video/x-flv'],
   maxUsers: 50,
   thumbSizes: {S: 300, M: 900},
   port: ENV ? 1427 : 8000,
   basepath: ENV ? '/root/files/acpic' : '/tmp',
   invalidPath: ENV ? '/root/files/acpic/invalid' : '/tmp',
   redisdb: ENV ? 15 : 13,
   geodataPath: 'utils/cities500.txt',
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
      name:    'tagaway'
   },
   etemplates: {
      feedback: {
         subject: 'Thank you for your feedback!',
         message: function (username, feedback) {
            return TEMPLATE (username, [
               'We have received your feedback and we are ever so thankful for having received it.',
               ['br'],
               'For your record, this is what we received:',
               ['br'],
               feedback,
            ]);
         }
      },
      verify: {
         subject: 'Please verify your email',
         message: function (username, token) {
            return TEMPLATE (username, [
               'Welcome to tagaway! Please verify your email by clicking on the following link: ',
               ['a', {href: DOMAIN + 'auth/verify/' + encodeURIComponent (token)}, 'Verify your email'],
            ]);
         }
      },
      welcome: {
         subject: 'Welcome to Tagaway!',
         message: function (username) {
            return TEMPLATE (username, [
               'Welcome to tagaway! We are thrilled to have you with us.',
               ['br'],
               'This is Federico and Tom, creators of Tagaway. Thank you so much for giving our app a try.'
               ['br'],
               'Tagaway is just getting started, so you might find some bugs and incomplete features. But every week we’ll be releasing new versions to improve Tagaway. If you find any bugs or you feel that you need a particular feature, please let us know! One of the many benefits of being among the first few users!'
               ['br'],
               'Feel free to tell us how we can make tagaway work better for you. When you have a moment, just hit "reply" to this email and let us know what you think.',
            ]);
         }
      },
      recover: {
         subject: 'Did you forget your password?',
         message: function (username, token) {
            return TEMPLATE (username, [
               'Did you forget your password? If you did, all is well: please ', ['a', {href: DOMAIN + '#/reset/' + encodeURIComponent (token) + '/' + encodeURIComponent (username)}, 'click on this link to set a new password.'],
               ['br'],
               'If you did not request a password reset, please do NOT click the link above. Instead reply immediately to this email and let us know.',
            ]);
         }
      },
      reset: {
         subject: 'You just changed your password',
         message: function (username) {
            return TEMPLATE (username, [
               'We just changed your password. If you performed this change, no further action is necessary.',
               ['br'],
               'If you didn\'t change your password, please contact us IMMEDIATELY.',
            ]);
         }
      },
      importList: function (provider, username) {
         return {
            subject: 'Your files from ' + provider + ' are ready to be imported',
            message: TEMPLATE (username, [
               ['Your ' + provider + ' files are fully listed. You can now ', ['a', {href: DOMAIN + '#/import'}, 'select the folders'], ' you want to import to tagaway.'],
            ])
         }
      },
      importUpload: function (provider, username) {
         return {
            subject: 'Your files from ' + provider + ' were imported',
            message: TEMPLATE (username, [
               ['Your ' + provider + ' files are now in tagaway! You can find them in ', ['a', {href: DOMAIN + '#/pics'}, '"View Pictures"'], '.'],
            ])
         }
      },
      importError: function (provider, username) {
         return {
            subject: 'There was an error importing your files from ' + provider,
            message: TEMPLATE (username, [
               ['Unfortunately there was an error importing your files from ' + provider + '. Alas! Please check the ', ['a', {href: DOMAIN + '#/import'}, '"Import"'], ' view to try again.'],
            ])
         }
      },
      share: function (username, from, tag) {
         return {
            subject: from + ' wants to share the tag "' + tag + '" with you',
            message: TEMPLATE (username, [
               [from + ' wants to share the tag "' + tag + '" with you!'],
               ['If you wish to accept this tag, please click ', ['a', {href: DOMAIN + '#/share/' + encodeURIComponent (from) + '/' + encodeURIComponent (tag)}, 'here'], '.'],
            ])
         }
      }
   }
}

// Below is a template for creating secret.js. All UPPERCASE strings must be replaced by proper values.
/*
module.exports = {
   cookieSecret: 'COOKIESECRET',
   admins: ['EMAIL1', ...],
   s3: {
      accessKeyId:     'ACCESSKEY',
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
         key: 'KEY'
      },
      oauth: {
         client: 'CLIENTID',
         secret: 'SECRET'
      }
   },
   aclog: {
      // Your ac;log credentials here. ac;log hasn't been published yet, so you can use an empty object instead.
   }
}
*/
