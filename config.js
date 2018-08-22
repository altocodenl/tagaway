module.exports = {
   cookiename: 'ac-v1',
   allowedmime: ['image/jpeg', 'image/png'],
   port: 1427,
   accesslog: 'access.log',
   errorlog:  'error.log',
   clientlog: 'client.log',
   picfolder: process.argv [2] === 'prod' ? '/root/files' : '/media/truecrypt2/acpicfiles',
   redisdb: 15,
   crypto: {
      algorithm: 'aes-256-ctr'
   },
   storelimit: {
      tier1:        1024 * 1024 * 1024,
      tier2:   10 * 1024 * 1024 * 1024,
      tier3:  100 * 1024 * 1024 * 1024,
      tier4: 1024 * 1024 * 1024 * 1024
   },
   backup: {
      frequency: 10,
      path: '/var/lib/redis/dump.rdb',
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
