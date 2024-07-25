/*
ac;pic - v0.1.0

Written by Altocode (https://altocode.nl) and released into the public domain.

Please refer to readme.md to read the annotated source (some parts are annotated already, but not the whole file yet).
*/

// *** SETUP ***

var CONFIG = require ('./config.js');
var SECRET = require ('./secret.js');
var ENV    = process.argv [2] === 'local' ? undefined : process.argv [2];
var mode   = process.argv [3];

var crypto = require ('crypto');
var fs     = require ('fs');
var Path   = require ('path');
var os     = require ('os');
var https  = require ('https');
Error.stackTraceLimit = Infinity;

var dale   = require ('dale');
var teishi = require ('teishi');
var lith   = require ('lith');
var cicek  = require ('cicek');
var redis  = require ('redis').createClient ({db: CONFIG.redisdb});
var redmin = require ('redmin');
redmin.redis = redis;
var giz    = require ('giz');
var hitit  = require ('hitit');
var a      = require ('./assets/astack.js');

var uuid     = require ('uuid').v4;
var mailer   = require ('nodemailer').createTransport (require ('nodemailer-ses-transport') (SECRET.ses));
var hash     = require ('murmurhash').v3;
var mime     = require ('mime');
var archiver = require ('archiver');
var jwt      = require ('jsonwebtoken');

var type   = teishi.type, clog = console.log, eq = teishi.eq, last = teishi.last, inc = teishi.inc, reply = cicek.reply, stop = function (rs, rules) {
   return teishi.stop (rules, function (error) {
      reply (rs, 400, {error: error});
   }, true);
}, astop = function (rs, path) {
   a.stop (path, function (s, error) {
      reply (rs, 500, {error: error});
   });
}, mexec = function (s, multi) {
   multi.exec (function (error, data) {
      if (error) return s.next (null, error);
      s.next (data);
   });
}

var debug = function () {clog.apply (null, ['DEBUG'].concat (dale.go (arguments, function (v) {return v})))};

// *** GIZ ***

giz.redis          = redis;
giz.config.expires = 7 * 24 * 60 * 60;

// TODO: add this to giz
giz.loginOAuth = function (user, callback) {
   require ('bcryptjs').genSalt (20, function (error, result) {
      if (error) return callback (error);
      giz.db.set ('session', result, user, function (error) {
         callback (error, result);
      });
   });
}

// *** REDIS EXTENSIONS ***

redis.keyscan = function (s, match, cursor, keys) {
   if (! cursor) cursor = 0;
   if (! keys)   keys   = {};
   redis.scan (cursor, 'MATCH', match, function (error, result) {
      if (error) return s.next (null, error);
      cursor = result [0];
      dale.go (result [1], function (key) {
         keys [key] = true;
      });
      if (cursor !== '0') return redis.keyscan (s, match, cursor, keys);
      s.next (dale.keys (keys));
   });
}

var Redis = function (s, action) {
   redis [action].apply (redis, [].slice.call (arguments, 2).concat (function (error, data) {
      if (error) s.next (null, error);
      else       s.next (data);
   }));
}

// *** NOTIFICATIONS ***

var aclog = {
   initialize: function (logProcessingFunction) {
      aclog.send = function (log, CB) {
         CB = CB || clog;
         var freshCookie;
         var login = function (cb) {
            freshCookie = true;
            hitit.one ({}, {
               host:   SECRET.aclog.host,
               https:  SECRET.aclog.https,
               method: 'post',
               path:   SECRET.aclog.basepath + '/auth/login',
               body: {username: SECRET.aclog.username, password: SECRET.aclog.password, timezone: new Date ().getTimezoneOffset ()}
            }, function (error, data) {
               if (error) return CB (error);
               aclog.cookie = data.headers ['set-cookie'] [0];
               aclog.csrf   = data.body.csrf;
               cb ();
            });
         }
         var send = function () {
            if (type (log) !== 'object') return CB ({error: 'Log must be an object but instead is of type ' + type (log), log: log});
            hitit.one ({}, {
               host:   SECRET.aclog.host,
               https:  SECRET.aclog.https,
               method: 'post',
               path:   SECRET.aclog.basepath + '/data',
               headers: {cookie: aclog.cookie},
               body:    {csrf: aclog.csrf, log: logProcessingFunction ? logProcessingFunction (log) : log}
            }, function (error) {
               if (error && error.code === 403 && ! freshCookie) return login (send);
               if (error) return CB (error);
               CB ();
            });
         }
         if (! aclog.cookie) login (send);
         else                send ();
      }
   }
}

aclog.initialize (function (log) {
   log = dale.obj (log, function (v, k) {
      var sv = type (v) === 'string' ? v : JSON.stringify (v);
      var length = (sv || '').length;
      if (length > 5000) v = sv.slice (0, 2500) + ' [' + (length - 5000) + ' CHARACTERS OMITTED' + '] ' + sv.slice (-2500);
      return [k, v];
   });
   log.application = 'ac;pic';
   log.environment = ENV;
   return log;
});

var notify = function (s, message) {
   if (! ENV || ! SECRET.aclog.username) {
      clog (new Date ().toISOString (), message);
      return s.next ();
   }
   aclog.send (message, function (error) {
      if (error) return s.next (null, error);
      else s.next ();
   });
}

// *** ON UNCAUGHT EXCEPTION, REPORT AND CLOSE SERVER ***

var server;

process.on ('uncaughtException', function (error, origin) {
   a.seq ([
      [notify, {priority: 'critical', type: 'server error', error: error, stack: error.stack, origin: origin}],
      function (s) {
         process.exit (1);
      }
   ]);
});

// *** SENDMAIL ***

var sendmail = function (s, o) {
   o.from1 = o.from1 || CONFIG.email.name;
   o.from2 = o.from2 || CONFIG.email.address;
   var parameters = {
      from:    o.from1 + ' <' + o.from2 + '>',
      to:      o.to1   + ' <' + o.to2   + '>',
      replyTo: o.from2,
      subject: o.subject,
      html:    lith.g (o.message),
   };
   if (! ENV) {
      clog (new Date ().toISOString (), 'sendmail', parameters);
      return s.next ();
   }
   mailer.sendMail (parameters, function (error) {
      if (error) notify (s, {priority: 'critical', type: 'mailer error', error: error, options: o});
      else       s.next ();
   });
}

// *** KABOOT ***

var k = function (s) {

   var command = [].slice.call (arguments, 1);

   var output = {stdout: '', stderr: '', command: command};

   var options = {};
   var commands = dale.fil (command.slice (1), undefined, function (command) {
      if (type (command) !== 'object' || ! command.env) return command;
      options.env = command.env;
   });

   var proc = require ('child_process').spawn (command [0], commands, options);

   var wait = 3;

   var done = function () {
      if (--wait > 0) return;
      if (output.code === 0) s.next (output);
      else                   s.next (0, output);
   }

   dale.go (['stdout', 'stderr'], function (v) {
      proc [v].on ('data', function (chunk) {
         output [v] += chunk;
      });
      proc [v].on ('end', done);
   });

   proc.on ('error', function (error) {
      output.err += error + ' ' + error.stack;
      done ();
   });
   proc.on ('exit',  function (code, signal) {
      output.code = code;
      output.signal = signal;
      done ();
   });
}

// *** S3 ***

var s3 = new (require ('aws-sdk')).S3 ({
   apiVersion:  '2006-03-01',
   sslEnabled:  true,
   credentials: {accessKeyId: SECRET.s3.accessKeyId, secretAccessKey: SECRET.s3.secretAccessKey},
   params:      {Bucket: SECRET.s3.piv.bucketName},
   region:      SECRET.s3.region
});

// *** HELPERS ***

var H = {};

// Adapted from https://www.regular-expressions.info/email.html
H.email = /^(?=[A-Z0-9][A-Z0-9@._%+-]{5,253}$)[A-Z0-9._%+-]{1,64}@(?:(?=[A-Z0-9-]{1,63}\.)[A-Z0-9]+(?:-[A-Z0-9]+)*\.){1,8}[A-Z]{2,63}$/i

H.trim = function (string) {
   return string.replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');
}

H.log = function (s, username, ev) {
   ev.t = Date.now ();
   Redis (s, 'lpush', 'ulog:' + username, teishi.str (ev));
}

H.hash = function (string) {
   return hash (string) + '';
}

H.isDateTag = function (tag) {
   return !! tag.match (/^d::/);
}

H.isGeoTag = function (tag) {
   return !! tag.match (/^g::/);
}

H.isUserTag = function (tag) {
   tag = H.trim (tag);
   return tag.length > 0 && ! tag.match (/^[a-z]::/);
}

H.shuffleArray = function (array) {
   if (array.length === 0) return array;
   dale.go (dale.times (array.length - 1, array.length - 1, -1), function (k) {
      var randomIndex = Math.floor (Math.random () * (k + 1));
      var temp = array [k];
      array [k] = array [randomIndex];
      array [randomIndex] = temp;
   });
   return array;
}

H.getGeotags = function (s, lat, lon) {
   var countryCodes = {'AF':'Afghanistan','AX':'Åland Islands','AL':'Albania','DZ':'Algeria','AS':'American Samoa','AD':'Andorra','AO':'Angola','AI':'Anguilla','AQ':'Antarctica','AG':'Antigua and Barbuda','AR':'Argentina','AM':'Armenia','AW':'Aruba','AU':'Australia','AT':'Austria','AZ':'Azerbaijan','BS':'Bahamas','BH':'Bahrain','BD':'Bangladesh','BB':'Barbados','BY':'Belarus','BE':'Belgium','BZ':'Belize','BJ':'Benin','BM':'Bermuda','BT':'Bhutan','BO':'Bolivia, Plurinational State of','BQ':'Bonaire, Sint Eustatius and Saba','BA':'Bosnia and Herzegovina','BW':'Botswana','BV':'Bouvet Island','BR':'Brazil','IO':'British Indian Ocean Territory','BN':'Brunei Darussalam','BG':'Bulgaria','BF':'Burkina Faso','BI':'Burundi','KH':'Cambodia','CM':'Cameroon','CA':'Canada','CV':'Cape Verde','KY':'Cayman Islands','CF':'Central African Republic','TD':'Chad','CL':'Chile','CN':'China','CX':'Christmas Island','CC':'Cocos (Keeling) Islands','CO':'Colombia','KM':'Comoros','CG':'Congo','CD':'Congo, the Democratic Republic of the','CK':'Cook Islands','CR':'Costa Rica','CI':'Côte d\'Ivoire','HR':'Croatia','CU':'Cuba','CW':'Curaçao','CY':'Cyprus','CZ':'Czech Republic','DK':'Denmark','DJ':'Djibouti','DM':'Dominica','DO':'Dominican Republic','EC':'Ecuador','EG':'Egypt','SV':'El Salvador','GQ':'Equatorial Guinea','ER':'Eritrea','EE':'Estonia','ET':'Ethiopia','FK':'Falkland Islands (Malvinas)','FO':'Faroe Islands','FJ':'Fiji','FI':'Finland','FR':'France','GF':'French Guiana','PF':'French Polynesia','TF':'French Southern Territories','GA':'Gabon','GM':'Gambia','GE':'Georgia','DE':'Germany','GH':'Ghana','GI':'Gibraltar','GR':'Greece','GL':'Greenland','GD':'Grenada','GP':'Guadeloupe','GU':'Guam','GT':'Guatemala','GG':'Guernsey','GN':'Guinea','GW':'Guinea-Bissau','GY':'Guyana','HT':'Haiti','HM':'Heard Island and McDonald Islands','VA':'Holy See (Vatican City State)','HN':'Honduras','HK':'Hong Kong','HU':'Hungary','IS':'Iceland','IN':'India','ID':'Indonesia','IR':'Iran, Islamic Republic of','IQ':'Iraq','IE':'Ireland','IM':'Isle of Man','IL':'Israel','IT':'Italy','JM':'Jamaica','JP':'Japan','JE':'Jersey','JO':'Jordan','KZ':'Kazakhstan','KE':'Kenya','KI':'Kiribati','KP':'Korea, Democratic People\'s Republic of','KR':'Korea, Republic of','KW':'Kuwait','KG':'Kyrgyzstan','LA':'Lao People\'s Democratic Republic','LV':'Latvia','LB':'Lebanon','LS':'Lesotho','LR':'Liberia','LY':'Libya','LI':'Liechtenstein','LT':'Lithuania','LU':'Luxembourg','MO':'Macao','MK':'Macedonia, the Former Yugoslav Republic of','MG':'Madagascar','MW':'Malawi','MY':'Malaysia','MV':'Maldives','ML':'Mali','MT':'Malta','MH':'Marshall Islands','MQ':'Martinique','MR':'Mauritania','MU':'Mauritius','YT':'Mayotte','MX':'Mexico','FM':'Micronesia, Federated States of','MD':'Moldova, Republic of','MC':'Monaco','MN':'Mongolia','ME':'Montenegro','MS':'Montserrat','MA':'Morocco','MZ':'Mozambique','MM':'Myanmar','NA':'Namibia','NR':'Nauru','NP':'Nepal','NL':'Netherlands','NC':'New Caledonia','NZ':'New Zealand','NI':'Nicaragua','NE':'Niger','NG':'Nigeria','NU':'Niue','NF':'Norfolk Island','MP':'Northern Mariana Islands','NO':'Norway','OM':'Oman','PK':'Pakistan','PW':'Palau','PS':'Palestine, State of','PA':'Panama','PG':'Papua New Guinea','PY':'Paraguay','PE':'Peru','PH':'Philippines','PN':'Pitcairn','PL':'Poland','PT':'Portugal','PR':'Puerto Rico','QA':'Qatar','RE':'Réunion','RO':'Romania','RU':'Russian Federation','RW':'Rwanda','BL':'Saint Barthélemy','SH':'Saint Helena, Ascension and Tristan da Cunha','KN':'Saint Kitts and Nevis','LC':'Saint Lucia','MF':'Saint Martin (French part)','PM':'Saint Pierre and Miquelon','VC':'Saint Vincent and the Grenadines','WS':'Samoa','SM':'San Marino','ST':'Sao Tome and Principe','SA':'Saudi Arabia','SN':'Senegal','RS':'Serbia','SC':'Seychelles','SL':'Sierra Leone','SG':'Singapore','SX':'Sint Maarten (Dutch part)','SK':'Slovakia','SI':'Slovenia','SB':'Solomon Islands','SO':'Somalia','ZA':'South Africa','GS':'South Georgia and the South Sandwich Islands','SS':'South Sudan','ES':'Spain','LK':'Sri Lanka','SD':'Sudan','SR':'Suriname','SJ':'Svalbard and Jan Mayen','SZ':'Swaziland','SE':'Sweden','CH':'Switzerland','SY':'Syrian Arab Republic','TW':'Taiwan, Province of China','TJ':'Tajikistan','TZ':'Tanzania, United Republic of','TH':'Thailand','TL':'Timor-Leste','TG':'Togo','TK':'Tokelau','TO':'Tonga','TT':'Trinidad and Tobago','TN':'Tunisia','TR':'Turkey','TM':'Turkmenistan','TC':'Turks and Caicos Islands','TV':'Tuvalu','UG':'Uganda','UA':'Ukraine','AE':'United Arab Emirates','GB':'United Kingdom','US':'United States','UM':'United States Minor Outlying Islands','UY':'Uruguay','UZ':'Uzbekistan','VU':'Vanuatu','VE':'Venezuela, Bolivarian Republic of','VN':'Viet Nam','VG':'Virgin Islands, British','VI':'Virgin Islands, U.S.','WF':'Wallis and Futuna','EH':'Western Sahara','YE':'Yemen','ZM':'Zambia','ZW':'Zimbabwe'};

   redis.georadius ('geo', lon, lat, 15, 'km', 'count', 100, 'asc', function (error, data) {
      if (error) return s.next (null, error);
      if (! data.length) return s.next ([]);
      var biggestPop = 0, geotags = [];
      dale.go (data, function (item) {
         item = item.split (':');
         var pop = parseInt (item [1]);
         if (pop <= biggestPop) return;
         biggestPop = pop;
         geotags = ['g::' + item [0], 'g::' + item [2]];
      });
      s.next (geotags);
   });
}

// General policy on async helpers: unless a specific error is caught, leave it to the calling context to decide whether to put an error handler or not.
// Note: this is not a recursive mkdir, if you want to make folder /a/b/c, both /a and /a/b must exist!
H.mkdirif = function (s, path) {
   a.stop (s, [k, 'test', '-d', path], function (s) {
      // TODO: check error code
      a.seq (s, [k, 'mkdir', path]);
   });
}

H.unlink = function (s, path, checkExistence) {
   if (! checkExistence) return a.seq (s, [a.make (fs.unlink), path]);
   a.seq (s, [
      [function (s) {
         fs.stat (path, function (error) {
            if (! error) return s.next (true);
            if (error.code === 'ENOENT') return s.next (false);
            s.next (undefined, error);
         });
      }],
      function (s) {
         if (s.last === true) a.make (fs.unlink) (s, path);
         else                 s.next ();
      }
   ]);
}

H.thumbPic = function (s, invalidHandler, piv, path, heic_path) {
   var max = Math.max (piv.dimw, piv.dimh);
   // If we have a gif, we only make a small thumbnail, since we'll show the full gif when opening the piv.
   if (piv.format === 'gif') s.thumbS = uuid ();
   else if (piv.format !== 'jpeg' || piv.deg) {
      // If piv is not a jpeg, we need to create a jpeg thumbnail to show in the browser.
      // Also, if piv has rotation metadata, we need to create a thumbnail with no rotation metadata, to have a thumbnail with no metadata and thus avoid some browsers doing double rotation (one done by the metadata, another one by our interpretation of it).
      s.thumbS = uuid ();
      // If piv has a dimension larger than CONFIG.thumbSizes.S, we'll also need a config.thumbSizes.M thumbnail.
      if (max > CONFIG.thumbSizes.S) s.thumbM = uuid ();
   }
   else {
      if (max > CONFIG.thumbSizes.S) s.thumbS = uuid ();
      if (max > CONFIG.thumbSizes.M) s.thumbM = uuid ();
   }
   var multiframeFormat = inc (['gif', 'tiff', 'webp'], piv.format);
   a.seq (s, dale.go (['S', 'M'], function (size) {
      if (! s ['thumb' + size]) return [];
      // In the case of thumbnails done for stripping rotation metadata or non jpeg/png formats, we don't go over 100% if the piv is smaller than the desired thumbnail size.
      var percentage = Math.min (Math.round (CONFIG.thumbSizes [size] / max * 100), 100);

      var targetFormat = 'jpeg';
      if (piv.format === 'gif' && size === 'M') targetFormat = 'gif';

      return [
         [invalidHandler, [k, 'convert', (heic_path || path) + (multiframeFormat ? '[0]' : ''), '-quality', 90, '-thumbnail', percentage + '%', Path.join (Path.dirname (path), s ['thumb' + size] + '.' + targetFormat)]],
         [a.make (fs.rename), Path.join (Path.dirname (path), s ['thumb' + size] + '.' + targetFormat), Path.join (Path.dirname (path), s ['thumb' + size])],
         [a.make (fs.stat), Path.join (Path.dirname (path), s ['thumb' + size])],
         function (s) {
            s ['bythumb' + size] = s.last.size;
            s.next ();
         }
      ];
   }));
}

H.thumbVid = function (s, invalidHandler, piv, path) {
   var askance = piv.deg === 90 || piv.deg === -90;
   var max = Math.max (piv.dimw, piv.dimh);
   s.thumbS = uuid ();
   // If video has a dimension larger than CONFIG.thumbSizes.S, we'll also need a CONFIG.thumbSizes.M thumbnail.
   if (max > CONFIG.thumbSizes.S) s.thumbM = uuid ();
   a.seq (s, dale.go (['S', 'M'], function (size) {
      if (! s ['thumb' + size]) return [];
      // In the case of thumbnails done for very small videos, do not go over 100%.
      var percentage = Math.min (Math.round (CONFIG.thumbSizes [size] / max * 100), 100);
      var width  = Math.round (piv.dimw * percentage / 100);
      var height = Math.round (piv.dimh * percentage / 100);
      return [
         // If picture is askance, switch width and height, otherwise the thumbnail will be deformed.
         [invalidHandler, [k, 'ffmpeg', '-i', path, '-vframes', '1', '-an', '-s', (askance ? height : width) + 'x' + (askance ? width : height), Path.join (Path.dirname (path), s ['thumb' + size] + '.jpg')]],
         [a.make (fs.rename), Path.join (Path.dirname (path), s ['thumb' + size] + '.jpg'), Path.join (Path.dirname (path), s ['thumb' + size])],
         [a.make (fs.stat), Path.join (Path.dirname (path), s ['thumb' + size])],
         function (s) {
            s ['bythumb' + size] = s.last.size;
            s.next ();
         }
      ];
   }));
}

H.encrypt = function (path, cb) {
   // https://github.com/luke-park/SecureCompatibleEncryptionExamples/blob/master/JavaScript/SCEE-Node.js
   fs.readFile (path, function (error, file) {
      if (error) return cb (error);
      var nonce = crypto.randomBytes (CONFIG.crypto.nonceLength);
      var cipher = crypto.createCipheriv (CONFIG.crypto.algorithm, SECRET.crypto.password, nonce);
      var ciphertext = Buffer.concat ([cipher.update (file), cipher.final ()]);
      cb (null, Buffer.concat ([nonce, ciphertext, cipher.getAuthTag ()]));
   });
}

H.decrypt = function (data) {
   var nonce      = data.slice (0, CONFIG.crypto.nonceLength);
   var ciphertext = data.slice (CONFIG.crypto.nonceLength, data.length - CONFIG.crypto.tagLength);
   var tag        = data.slice (- CONFIG.crypto.tagLength);

   var cipher = crypto.createDecipheriv (CONFIG.crypto.algorithm, SECRET.crypto.password, nonce);
   cipher.setAuthTag (tag);
   return Buffer.concat ([cipher.update (ciphertext), cipher.final ()]);
}

H.s3put = function (s, key, path) {
   a.stop (s, [
      [a.make (H.encrypt), path],
      function (s) {
         s.time = Date.now ();
         s.next ();
      },
      [a.get, a.make (s3.upload, s3), {Key: key, Body: '@last'}],
      function (s) {
         H.stat.w (s, 'max', 'ms-s3put', Date.now () - s.time);
      },
      [a.make (s3.headObject, s3), {Key: key}],
   ]);
}

H.s3get = function (s, key) {
   s3.getObject ({Key: key}, function (error, data) {
      if (error) return s.next (null, error);
      s.next (H.decrypt (data.Body));
   });
}

H.s3del = function (s, keys) {

   var counter = 0, t = Date.now ();
   if (type (keys) === 'string') keys = [keys];

   if (keys.length === 0) return s.next ();

   var batch = function () {
      s3.deleteObjects ({Delete: {Objects: dale.go (keys.slice (counter * 1000, (counter + 1) * 1000), function (key) {
         return {Key: key}
      })}}, function (error) {
         if (error) return s.next (null, error);
         if (++counter === Math.ceil (keys.length / 1000)) {
            H.stat.w (s, 'max', 'ms-s3del', Date.now () - t);
         }
         else batch ();
      });
   }

   batch ();
}

H.s3list = function (s, prefix) {
   var output = [];
   var fetch = function (marker) {
      s3.listObjects ({Prefix: prefix, Marker: marker}, function (error, data) {
         if (error) return s.next (null, error);
         output = output.concat (data.Contents);
         delete data.Contents;
         if (! data.IsTruncated) return s.next (dale.go (output, function (v) {return {key: v.Key, size: v.Size}}));
         fetch (output [output.length - 1].Key);
      });
   }
   fetch ();
}

H.s3queue = function (s, op, username, key, path) {
   a.seq (s, [
      [Redis, 'rpush', 's3:queue', JSON.stringify ({op: op, username: username, key: key, path: path, t: Date.now ()})],
      function (s) {
         if (s.error) return notify (s, {priority: 'critical', type: 'redis error s3queue', error: s.error});
         // We call the next function.
         s.next ();
         // We trigger s3exec.
         H.s3exec ();
      }
   ]);
}

// Up to 3600 simultaneous operations (actually, per second, but simultaneous will do, since it's more conservative and easier to measure). But it's conservative only if the greatest share of operations are over one second in length.
// We only do 50 simultaneous operations for the sake of the network card of the server.
// https://docs.aws.amazon.com/AmazonS3/latest/dev/optimizing-performance.html
// Queue items are processed in order with regards to the *start* of it, not the whole thing (otherwise, we would wait for each to be done - for implementing this, we can set LIMIT to 1).
H.s3exec = function () {
   // If there's no items on the queue, or if we're over the maximum: do nothing.
   // Otherwise, increment s3:proc and LPOP the first element of the queue
   redis.eval ('if redis.call ("llen", "s3:queue") == 0 then return nil end if (tonumber (redis.call ("get", "s3:proc")) or 0) >= 50 then return nil end redis.call ("incr", "s3:proc"); return redis.call ("lpop", "s3:queue")', 0, function (error, next) {
      if (error) return notify (a.creat (), {priority: 'critical', type: 'redis error s3exec', error: error});
      if (! next) return;
      next = JSON.parse (next);

      /* Possible valid sequences
         - delete -> put? No, because put would be started before delete, otherwise it would be a genuine 404.
         - put uploading -> delete: let the put delete the file it just uploaded.
         - put ready -> delete: delete is in charge of deleting the file.
      */

      var actions;
      if (next.op === 'put') actions = [
         [Redis, 'hset', 's3:files', next.key, 'true'],
         [a.set, 'upload', [H.s3put, next.key, next.path]],
         [Redis, 'hexists', 's3:files', next.key],
         function (s) {
            // If a delete operation removed the file while we were uploading it, we delete it from S3. No need to update the stats.
            if (! s.last) return a.seq (s, [H.s3del, next.key]);
            var bys3 = s.upload.ContentLength;
            a.seq (s, [
               // update S3 & the stats
               [Redis, 'hset', 's3:files', next.key, bys3],
               [H.stat.w, [
                  ['flow', 'bys3',                  bys3],
                  ['flow', 'bys3-' + next.username, bys3],
               ]]
            ]);
         }
      ];

      if (next.op === 'del') actions = [
         [Redis, 'hget', 's3:files', next.key],
         function (s) {
            // File is being uploaded or shouldn't be uploaded because it's invalid, just remove entry.
            if (s.last === 'true') return Redis (s, 'hdel', 's3:files', next.key);
            // File has already been uploaded.
            var bys3 = parseInt (s.last);
            a.seq (s, [
               [H.s3del, next.key],
               [Redis, 'hdel', 's3:files', next.key],
               [H.stat.w, [
                  ['flow', 'bys3',                  - bys3],
                  ['flow', 'bys3-' + next.username, - bys3],
               ]],
            ]);
         }
      ];

      a.stop ([
         actions,
         [Redis, 'decr', 's3:proc'],
         H.s3exec
      ], function (s, error) {
         if (error) notify (s, {priority: 'critical', type: 's3exec error', error: error, operation: next});
         redis.decr ('s3:proc', function (error) {
            if (error) return notify (a.creat (), {priority: 'critical', type: 'redis error s3exec', error: error});
            H.s3exec ();
         });
      });
   });
}

H.pad = function (v) {return v < 10 ? '0' + v : v}

H.deletePiv = function (s, id, username) {
   a.stop (s, [
      [function (s) {
         var multi = redis.multi ();
         multi.hgetall  ('piv:'  + id);
         multi.smembers ('pivt:' + id);
         multi.smembers ('sho:' + username);
         mexec (s, multi);
      }],
      function (s) {
         s.piv  = s.last [0];
         s.tags = s.last [1];
         s.sho  = s.last [2];
         if (! s.piv || username !== s.piv.owner) return s.next (0, 'nf');

         H.s3queue (s, 'del', username, Path.join (H.hash (username), id));
      },
      function (s) {
         var thumbs = [];
         if (s.piv.thumbS) thumbs.push (s.piv.thumbS);
         if (s.piv.thumbM) thumbs.push (s.piv.thumbM);
         a.fork (s, thumbs, function (v) {
            return [H.unlink, Path.join (CONFIG.basepath, H.hash (username), v)];
         });
      },
      [H.unlink, Path.join (CONFIG.basepath, H.hash (username), id)],
      function (s) {
         if (! s.piv.vid || s.piv.vid === '1' || s.piv.vid.match (/^pending/) || s.piv.vid.match (/^error/)) return s.next ();
         // Delete mp4 version of non-mp4 video
         H.unlink (s, Path.join (CONFIG.basepath, H.hash (username), s.piv.vid));
      },
      [a.set, 'sharedHashes', [H.getSharedHashes, username]],
      function (s) {
         var multi = redis.multi ();

         multi.del  ('piv:'  + s.piv.id);
         multi.del  ('pivt:' + s.piv.id);
         if (s.piv.thumbS) multi.del ('thu:' + s.piv.thumbS);
         if (s.piv.thumbM) multi.del ('thu:' + s.piv.thumbM);
         multi.hdel ('hash:'        + s.piv.owner, s.piv.hash);
         multi.hdel ('hashorig:'    + s.piv.owner, s.piv.originalHash);
         multi.sadd ('hashdel:'     + s.piv.owner, s.piv.hash);
         multi.sadd ('hashorigdel:' + s.piv.owner, s.piv.originalHash);
         multi.srem ('hashid:'     + s.piv.hash,  s.piv.id);
         if (s.piv.providerHash) {
            var providerHash = s.piv.providerHash.split (':');
            multi.srem ('hash:'    + s.piv.owner + ':' + providerHash [0], providerHash [1]);
            multi.sadd ('hashdel:' + s.piv.owner + ':' + providerHash [0], providerHash [1]);
         }

         // If the piv is deleted and the user has another piv shared with them that has the same hash, we will create hashtag and taghash entries (hashtag:USERNAME:HASH and taghash:USERNAME:TAG)
         if (inc (s.sharedHashes, s.piv.hash)) dale.go (s.tags, function (tag) {
            if (! H.isUserTag (tag)) return;
            multi.sadd ('hashtag:' + username + ':' + s.piv.hash, tag)
            multi.sadd ('taghash:' + username + ':' + tag, s.piv.hash);
         });

         dale.go (s.tags.concat (['a::', 'u::', 'o::', 'v::']), function (tag) {
            multi.srem ('tag:' + s.piv.owner + ':' + tag, s.piv.id);
         });

         multi.del ('querycache:' + username);
         mexec (s, multi);
      },
      [a.get, H.tagCleanup, username, '@tags', [id], '@sho'],
      function (s) {
         H.stat.w (s, [
            // The minus sign coerces the strings into numbers.
            ['flow', 'byfs',             - s.piv.byfs - (s.piv.bythumbS || 0) - (s.piv.bythumbM || 0) - (s.piv.bymp4 || 0)],
            ['flow', 'byfs-' + username, - s.piv.byfs - (s.piv.bythumbS || 0) - (s.piv.bythumbM || 0) - (s.piv.bymp4 || 0)],
            ['flow', s.piv.vid ? 'vids' : 'pics', -1],
            ['flow', 'format-' + s.piv.format, -1],
            s.piv.bythumbS ? ['flow', 'thumbS', -1] : [],
            s.piv.bythumbM ? ['flow', 'thumbM', -1] : [],
         ]);
      }
   ]);
}

// If it returns false, piv does not exist or user has no access; otherwise, returns the piv itself.
H.hasAccess = function (S, username, pivId) {
   a.stop ([
      [Redis, 'hgetall', 'piv:' + pivId],
      function (s) {
         if (! s.last) return S.next (false);
         s.piv = s.last;
         if (s.piv.owner === username) return S.next (s.piv);
         Redis (s, 'smembers', 'pivt:' + pivId);
      },
      function (s) {
         if (s.last.length === 0) return S.next (false);
         var multi = redis.multi ();
         dale.go (s.last, function (tag) {
            multi.sismember ('shm:' + username, s.piv.owner + ':' + tag);
         });
         mexec (s, multi);
      },
      function (s) {
         S.next (dale.stop (s.last, true, function (v) {
            return !! v
         }) ? s.piv : false);
      }
   ], function (s, error) {
      S.next (undefined, error);
   });
}

// Returns an output of the shape: {isVid: UNDEFINED|true, mimetype: STRING, dimw: INT, dimh: INT, format: STRING, deg: UNDEFINED|90|180|-90, dates: {...}, date: INTEGER, dateSource: STRING, loc: UNDEFINED|[INT, INT]}
// If onlyLocation flag is passed, output will only have the `loc` field.
H.getMetadata = function (s, path, onlyLocation, lastModified, name) {
   var output = {};

   a.seq (s, [
      [k, 'exiftool', path],
      function (s) {
         dale.stop (s.last.stdout.split ('\n'), true, function (line) {
            if (! line.match (/^GPS Position\s+:/)) return;
            var originalLine = line;
            line = (line.split (':') [1]).split (',');
            var lat = line [0].replace ('deg', '').replace ('\'', '').replace ('"', '').split (/\s+/);
            var lon = line [1].replace ('deg', '').replace ('\'', '').replace ('"', '').split (/\s+/);
            lat = (lat [4] === 'S' ? -1 : 1) * (parseFloat (lat [1]) + parseFloat (lat [2]) / 60 + parseFloat (lat [3]) / 3600);
            lon = (lon [4] === 'W' ? -1 : 1) * (parseFloat (lon [1]) + parseFloat (lon [2]) / 60 + parseFloat (lon [3]) / 3600);
            if (isNaN (lat) || lat <  -90 || lat >  90) lat = undefined;
            if (isNaN (lon) || lon < -180 || lon > 180) lon = undefined;
            // We set location only if both latitude and longitude are valid
            if (lat && lon) output.loc = [lat, lon];
            return true;
         });

         if (onlyLocation) s.next ();
         else              s.next (s.last.stdout.split ('\n'));
      },
      function (s) {
         if (onlyLocation) return s.next ();
         output.dates = {};
         // We first detect the mimetype to ascertain whether this is a vid or a pic
         dale.stopNot (s.last, undefined, function (line) {
            if (! line.match (/^MIME Type\s+:/)) return;
            output.mimetype = line.split (':') [1].trim ();
            if (line.match (/^MIME Type\s+:\s+video\//)) output.isVid = true;
            return true;
         });
         var error = dale.stopNot (s.last, undefined, function (line) {
            if (line.match (/^Warning\s+:/)) {
               var exceptions = new RegExp (['minor', 'Invalid EXIF text encoding', 'Bad IFD1 directory', 'Bad IFD2 directory', 'Bad length ICC_Profile', 'Invalid CanonCameraSettings data', 'Truncated', 'Invalid atom size', 'Non-standard header for APP1 XMP segment'].join ('|'));
               if (line.match (exceptions)) return;
               return line;
            }
            else if (line.match (/^Error\s+:/)) return line;
            else if (line.match (/date/i)) {
               var key = line.split (':') [0].trim ();
               if (! key.match (/\bdate\b/i)) return;
               if (key.match (/gps|profile|manufacture|extension|firmware/i)) return;
               // Ignore metadata fields related to the newly created file itself, because they have the same date as the upload itself and they are irrelevant for dating the piv
               if (inc (['File Modification Date/Time', 'File Access Date/Time', 'File Inode Change Date/Time'], key)) return;
               var value = line.split (':').slice (1).join (':').trim ();
               // If value doesn't start with a number or only contains zeroes, we ignore it.
               if (! value.match (/^\d/) || ! value.match (/[1-9]/)) return;
               output.dates [key] = value;
            }
            else if (line.match (/^File Type\s+:/)) {
               output.format = line.split (':') [1].trim ().toLowerCase ();
               if (output.format === 'extended webp') output.format = 'webp';
            }
            else if (! output.isVid && line.match (/^Image Width\s+:/))  output.dimw = parseInt (line.split (':') [1].trim ());
            else if (! output.isVid && line.match (/^Image Height\s+:/)) output.dimh = parseInt (line.split (':') [1].trim ());
            else if ((! output.isVid && line.match (/^Orientation\s+:/)) || (output.isVid && line.match (/Rotation\s+:/))) {
               if (line.match ('270')) output.deg = -90;
               if (line.match ('90'))  output.deg = 90;
               if (line.match ('180')) output.deg = 180;
            }
         });
         if (error) return s.next (null, {error: error});

         if (! output.isVid) return s.next ();

         a.seq (s, [
            [k, 'ffprobe', '-i', path, '-show_streams'],
            function (s) {
               var ffprobeMetadata = (s.last.stdout + '\n' + s.last.stderr).split ('\n');
               var formats = [];
               // ffprobe metadata is only used to detect width, height and the names of the codecs of the video & audio streams
               dale.go (ffprobeMetadata, function (line) {
                  if (line.match (/^width=\d+$/))  output.dimw = parseInt (line.split ('=') [1]);
                  if (line.match (/^height=\d+$/)) output.dimh = parseInt (line.split ('=') [1]);
                  if (line.match (/^codec_name=/)) {
                     var format = line.split ('=') [1];
                     if (format !== 'unknown') formats.push (format);
                  }
               });
               if (formats.length) output.format += ':' + formats.sort ().join ('/');
               s.next ();
            }
         ]);
      },
      function (s) {
         if (onlyLocation) return s.next (output);

         if (! output.format)   return s.next (null, {error: 'Missing format'});
         if (! output.mimetype) return s.next (null, {error: 'Missing mimetype'});
         // Despite our trust in exiftool and ffprobe, we make sure that the required output fields are present, but only for files that belong to supported formats
         if (inc (CONFIG.allowedFormats, output.mimetype)) {
            if (type (output.dimw) !== 'integer' || output.dimw < 1) return s.next (null, {error: 'Invalid width: '  + output.dimw});
            if (type (output.dimh) !== 'integer' || output.dimh < 1) return s.next (null, {error: 'Invalid height: ' + output.dimh});
         }

         // All dates are considered to be UTC, unless they explicitly specify a timezone.
         // The underlying server must be in UTC to not add a timezone offset to dates that specify no timezone.
         // The client also ignores timezones, except for applying a timezone offset for the `last modified` metadata of the piv in the filesystem when it is uploaded.
         output.dates ['upload:lastModified'] = lastModified;
         if (H.dateFromName (name) !== -1) output.dates ['upload:fromName'] = name;

         var validDates = dale.obj (output.dates, function (date, key) {
            var parsed = key.match ('fromName') ? H.dateFromName (date) : H.parseDate (date);
            // We ignore invalid dates (-1) or dates before the Unix epoch (< 0).
            if (parsed > -1) return [key, parsed];
         });

         // We first try to find a valid Date/Time Original, if it's the case, then we will use that date.
         if (validDates ['Date/Time Original']) {
            output.date       = validDates ['Date/Time Original'];
            output.dateSource = 'Date/Time Original';
         }
         // Otherwise, of all the valid dates, we will set the oldest one.
         else {
            dale.go (validDates, function (date, key) {
               if (output.date && output.date <= date) return;
               output.date = date;
               output.dateSource = key;
            });
         }

         // If the date source is upload:fromName and there's another valid date entry on the same date (but a later time), we use the latest one of them. This avoids files with a name that contains a date without time to override the date + time combination of another metadata tag.
         if (output.dateSource === 'upload:fromName') {
            var adjustedDate;
            dale.go (validDates, function (date, key) {
               if (date - output.date < 1000 * 60 * 60 * 24) {
                  if (! adjustedDate) adjustedDate = [key, date];
                  else {
                     if (date < adjustedDate [1]) adjustedDate = [key, date];
                  }
               }
            });
            if (adjustedDate) {
               output.dateSource = adjustedDate [0];
               output.date       = adjustedDate [1];
            }
         }

         s.next (output);
      }
   ]);
}

H.getUploads = function (s, username, filters, maxResults, listAlreadyUploaded) {
   filters = filters || {};
   a.seq (s, [
      // This function is very expensive because of the call below.
      [Redis, 'lrange', 'ulog:' + username, 0, -1],
      function (s) {
         var uploads = {}, completed = 0;
         if (filters.id) maxResults = 1;
         dale.stop (s.last, true, function (log) {
            log = JSON.parse (log);
            if (log.ev !== 'upload') return;

            // We can filter out uploads by id or provider.
            if (filters.id       && log.id        !== filters.id)       return;
            if (filters.provider && log.provider  !== filters.provider) return;
            if (filters.provider === null && log.provider !== undefined) return;

            if (! uploads [log.id]) {
               // If there are already enough results, don't add further results.
               if (maxResults && dale.keys (uploads).length === maxResults) return;
               uploads [log.id] = {id: log.id};
            }
            var upload = uploads [log.id];
            if (listAlreadyUploaded && ! upload.listAlreadyUploaded) upload.listAlreadyUploaded = [];
            if (log.provider && ! upload.provider) upload.provider = log.provider;
            if (log.type === 'complete' || log.type === 'cancel' || log.type === 'noCapacity' || log.type === 'error') {
               if (! upload.end) upload.end = log.t;
               // For complete and error, type of log equals upload.status
               // We check if status is already set in case an error comes after either a cancel or a completed
               if (! upload.status) upload.status = {cancel: 'cancelled', noCapacity: 'error'} [log.type] || log.type;
               if (log.type === 'noCapacity') upload.error = 'You have run out of space!';
               // If there's already another error for this upload, we keep it instead of overwriting to show the latest one
               if (log.type === 'error' && ! upload.error) upload.error = log.error;
            }
            else if (log.type === 'providerError') {
               if (! upload.providerErrors) upload.providerErrors = [];
               upload.providerErrors.push (log.error);
            }
            else if (log.type === 'wait') {
               if (! upload.lastActivity) upload.lastActivity = log.t;
            }
            else if (log.type === 'start') {
               if (! upload.status) {
                  // If current upload has had no activity in over ten minutes, we consider it stalled. For tests, we only wait three seconds.
                  var maxInactivity = ENV ? 1000 * 60 * 10 : 1000 * 3;
                  // We use log.t instead of log.id in case this is an import, because the id of the import might be quite older than the start of its upload process.
                  if (Date.now () > maxInactivity + (upload.lastActivity || log.t)) {
                     upload.status = 'stalled';
                     upload.end    = (upload.lastActivity || log.t) + maxInactivity;
                  }
                  else upload.status = 'uploading';
               }

               // We only put the tags added on the `start` event, instead of using those on the `ok` or `repeated` events.
               ['total', 'tooLarge', 'unsupported', 'alreadyImported', 'tags'].map (function (key) {
                  // If there are unsupported files that were attempted to be uploaded (and not detected by the client), we concatenate instead of overwriting what's already there.
                  if (key === 'unsupported' && upload.unsupported && log.unsupported) upload.unsupported = upload.unsupported.concat (log.unsupported);
                  else if (log [key] !== undefined) upload [key] = log [key];
               });
               completed++;
               // If we completed enough uploads as required, stop the process.
               if (maxResults && completed === maxResults) return true;
            }
            else if (log.type === 'ok') {
               if (! upload.lastPiv) upload.lastPiv = {id: log.pivId, deg: log.deg};
               if (! upload.lastActivity) upload.lastActivity = log.t;
               if (! upload.ok) upload.ok = 0;
               upload.ok++;
               // Uploaded files go into the alreadyUploaded list to properly track repeated vs alreadyUploaded within the upload
               if (listAlreadyUploaded) upload.listAlreadyUploaded.push (log.pivId);
            }
            else if (log.type === 'alreadyUploaded') {
               if (! upload.lastActivity) upload.lastActivity = log.t;
               if (! upload.alreadyUploaded) upload.alreadyUploaded = 0;
               upload.alreadyUploaded++;
               // alreadyUploaded files go into the alreadyUploaded list to properly track repeated vs alreadyUploaded within the upload
               if (listAlreadyUploaded) upload.listAlreadyUploaded.push (log.pivId);
            }
            else if (log.type === 'repeated' || log.type === 'invalid' || log.type === 'tooLarge' || log.type === 'unsupported') {
               if (! upload.lastActivity) upload.lastActivity = log.t;
               if (! upload [log.type]) upload [log.type] = [];
               upload [log.type].push (log.name);
               if (log.type === 'repeated') {
                  if (! upload.repeatedSize) upload.repeatedSize = 0;
                  upload.repeatedSize += log.size;
               }
            }
         });
         s.next (dale.go (uploads, function (v) {delete v.lastActivity; return v}).sort (function (a, b) {
            // We sort uploads by their end date. If they don't have an end date, we sort them by id.
            if (b.end && a.end)     return b.end - a.end;
            if (! b.end && ! a.end) return b.id - a.id;
            return a.end ? 1 : -1;
         }));
      },
      function (s) {
         s.uploads = s.last;
         var multi = redis.multi ();
         s.checkExists = dale.fil (s.uploads, undefined, function (upload) {
            if (! upload.lastPiv) return;
            multi.exists ('piv:' + upload.lastPiv.id);
            return upload.lastPiv.id;
         });
         mexec (s, multi);
      },
      function (s) {
         if (s.checkExists.length) {
            var exists = dale.obj (s.checkExists, function (v, k) {
               return [v, !! s.last [k]];
            });
            dale.go (s.uploads, function (upload) {
               if (upload.lastPiv && ! exists [upload.lastPiv.id]) delete upload.lastPiv;
            });
         }
         s.next (s.uploads);
      }
   ]);
}

H.getImports = function (s, rq, rs, provider, maxResults) {
   a.seq (s, [
      [a.stop, [H.getGoogleToken, rq.user.username], function (s, error) {
         if (! inc ([1, 2], error.errorCode)) return reply (rs, 500, {error: error});
         a.seq (s, [
            [H.log, rq.user.username, {ev: 'import', type: error.errorCode === 1 ? 'request' : 'requestAgain', provider: 'google'}],
            function (s) {
               s.redirect = {
                  redirect: [
                     'https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=' + encodeURIComponent (CONFIG.domain + 'import/oauth/google'),
                     'prompt=consent',
                     'response_type=code',
                     'client_id=' + SECRET.google.oauth.gdrive.webClientId,
                     // https://developers.google.com/identity/protocols/oauth2/scopes
                     '&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.photos.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.metadata.readonly',
                     'access_type=offline',
                     'state=' + rq.user.csrf
                  ].join ('&'),
                  provider: 'google'
               };
               s.next ();
            }
         ]);
      }],
      [a.set, 'current', [Redis, 'hgetall', 'imp:' + {google: 'g', dropbox: 'd'} [provider] + ':' + rq.user.username]],
      [a.set, 'uploads', [H.getUploads, rq.user.username, {provider: provider}, maxResults]],
      function (s) {
         // The only previous imports that are registered in the history are those that had an upload, otherwise they are not considered.
         if (s.current) {
            var id = parseInt (s.current.id);
            var currentUpload = s.uploads [0] && s.uploads [0].id === id ? s.uploads [0] : undefined;

            // If current import has no upload entry, create an entry for it.
            if (! currentUpload) {
               s.uploads.unshift ({
                  id:          id,
                  provider:    provider,
                  status:      s.current.status,
                  fileCount:   parseInt (s.current.fileCount)   || 0,
                  folderCount: parseInt (s.current.folderCount) || 0,
                  // We attempt to process error as JSON; if it fails, it's either a non-JSON string or undefined.
                  error:       teishi.parse (s.current.error) || s.current.error,
                  selection:   s.current.selection ? JSON.parse (s.current.selection) : undefined,
                  data:        s.current.data ? JSON.parse (s.current.data) : undefined,
                  // The current import might be finished with an error, so we need to send the `end` field to say when that happened
                  end:         s.current.end ? teishi.parse (s.current.end) : undefined
               });
               // Delete file data from import since it's not necessary in the client.
               if (s.uploads [0].data) delete s.uploads [0].data.files;
            }
         }
         if (s.redirect) s.uploads.unshift (s.redirect);
         s.next (s.uploads);
      }
   ]);
}

// Returns ms >= 0 if valid or -1 if not valid.
H.parseDate = function (date) {
   if (! date) return -1;
   // Range is years 1970-2100
   var minDate = 0, maxDate = 4133980799999;
   var d = new Date (date), ms = d.getTime ();
   if (! isNaN (ms) && ms >= minDate && ms <= maxDate) return ms;
   d = new Date (date.replace (':', '-').replace (':', '-'));
   ms = d.getTime ();
   if (! isNaN (ms) && ms >= minDate && ms <= maxDate) return ms;
   return -1;
}

H.addTags = function (s, tags, username, id) {
   // We add the tags of this piv to those of the identical piv already existing
   var multi = redis.multi ();
   dale.go (tags, function (tag) {
      multi.sadd ('pivt:' + id,       tag);
      multi.sadd ('tag:'  + username + ':' + tag, id);
      multi.sadd ('tags:' + username, tag);
   });
   if (tags.length > 0) multi.srem ('tag:' + username + ':u::', id);
   if (tags.length > 0) multi.del ('querycache:' + username);
   mexec (s, multi);
}

// Takes a piv, a new date and a multi redis operation.
H.updateDateTags = function (piv, oldDate, newDate, multi) {
   var oldYearTag  = 'd::'  + new Date (oldDate).getUTCFullYear ();
   var oldMonthTag = 'd::M' + (new Date (oldDate).getUTCMonth () + 1);
   var newYearTag  = 'd::'  + new Date (newDate).getUTCFullYear ();
   var newMonthTag = 'd::M' + (new Date (newDate).getUTCMonth () + 1);

   var tagsToCleanup = [];

   dale.go ([[oldYearTag, newYearTag], [oldMonthTag, newMonthTag]], function (pair) {
      if (pair [0] === pair [1]) return;
      multi.sadd ('pivt:' + piv.id, pair [1]);
      multi.srem ('pivt:' + piv.id, pair [0]);
      multi.sadd ('tag:'  + piv.owner + ':' + pair [1], piv.id);
      multi.srem ('tag:'  + piv.owner + ':' + pair [0], piv.id);
      multi.sadd ('tags:' + piv.owner, pair [1]);
      tagsToCleanup = tagsToCleanup.concat (pair [0], pair [1]);
   });
   return tagsToCleanup;
}

// Updates piv.dates if there are new dates that have different values than those already existing.
// Updates piv.date if any of the new dates in the existing piv date is not from a Date/Time Original metadata tag AND lower than the existing date of the piv. In that case, it also updates piv.dateSource and optionally the year tags for the piv.
H.updateDates = function (s, repeatedOrAlreadyUploaded, piv, name, lastModified, newDates) {
   var date = parseInt (piv.date), dates = JSON.parse (piv.dates), existingDates = dale.obj (dates, function (v) {return [H.parseDate (v), true]});
   var key = repeatedOrAlreadyUploaded + ':' + Date.now ();

   // newDates are the dates of the repeated or alreadyUploaded piv. It can be either an object or `undefined`.
   newDates = dale.obj (newDates, function (v, k) {
      return [key + ':' + k, v];
   });
   newDates [key + ':lastModified'] = lastModified;
   var dateFromName = H.dateFromName (name);
   if (dateFromName !== -1) newDates [key + ':fromName'] = name;

   var minDate = [null, Infinity];

   var updateDates;
   dale.obj (newDates, function (date, k) {
      var parsedDate = (k === key + ':fromName') ? dateFromName : H.parseDate (date);
      if (parsedDate === -1) return;
      if (! existingDates [parsedDate]) {
         updateDates = true;
         dates [k] = date;
         if (parsedDate < minDate [1]) minDate = [k, parsedDate];
         return [k, date];
      }
   });

   var multi = redis.multi ();
   // If there are new dates with different values than the ones already held, add them to the dates object.
   if (updateDates) multi.hset ('piv:' + piv.id, 'dates', JSON.stringify (dates));

   multi.del ('querycache:' + piv.owner);

   // If the picture has a valid Date/Time Original date, keep the date and move on.
   if (piv.dateSource === 'Date/Time Original') return mexec (s, multi);

   if (minDate [1] < date) {
      // If minDate is midnight of the same day of the current date, we ignore it. Otherwise, we set it.
      if (minDate [1] !== (date - date % (1000 * 60 * 60 * 24))) {
         piv.date = minDate [1];
         piv.dateSource = minDate [0];
         multi.hset ('piv:' + piv.id, 'date',       piv.date);
         multi.hset ('piv:' + piv.id, 'dateSource', piv.dateSource);
      }
   }

   var tagsToCleanup = H.updateDateTags (piv, date, parseInt (piv.date), multi);
   a.seq (s, [
      [mexec, multi],
      [H.tagCleanup, piv.owner, tagsToCleanup]
   ]);
}

H.dateFromName = function (name) {
   // Date example: 20220308
   if (name.match (/(19|20)\d{6}/)) {
      var date = name.match (/(19|20)\d{6}/g) [0];
      date = [date.slice (0, 4), date.slice (4, 6), date.slice (6)].join ('-');
      // Date with time acceptable format: date + 0 or more non digits + 1-2 digits (hour) + 0 or more non digits + 2 digits (minutes) + 0 or more non digits + optional two digits (seconds) + zero or more non letters plus optional am|AM|pm|PM
      var time = name.match (/(19|20)\d{6}[^\d]*(\d{1,2})[^\d]*(\d{2})[^\d]*(\d{2})?[^a-zA-Z]*(am|AM|pm|PM)?/);
   }
   // Date example: 2022-03-08
   else if (name.match (/(19|20)\d\d-\d\d-\d\d/)) {
      var date = name.match (/(19|20)\d\d-\d\d-\d\d/g) [0];
      date = [date.slice (0, 4), date.slice (5, 7), date.slice (8)].join ('-');
      // Date with time acceptable format: date + 0 or more non digits + 1-2 digits (hour) + 0 or more non digits + 2 digits (minutes) + 0 or more non digits + optional two digits (seconds) + zero or more non letters plus optional am|AM|pm|PM
      var time = name.match (/(19|20)\d\d-\d\d-\d\d[^\d]*(\d{1,2})[^\d]*(\d{2})[^\d]*(\d{2})?[^a-zA-Z]*(am|AM|pm|PM)?/);
   }
   else return -1;

   // Attempt to get the time from the date. If it fails, just return the date with no time.
   if (time && time [2] !== undefined && time [3] !== undefined) {
      var hour = parseInt (time [2]);
      if (time [5] && time [5].match (/pm/i) && hour > 0 && hour < 12) hour += 12;
      hour += '';
      var dateWithTime = date + 'T' + (hour.length === 1 ? '0' : '') + hour + ':' + time [3] + ':' + (time [4] || '00') + '.000Z';
      dateWithTime = H.parseDate (dateWithTime);
      if (dateWithTime !== -1) return dateWithTime;
   }
   return H.parseDate (date);
}

// *** BEGIN ANNOTATED SOURCE CODE ***

H.getSharedHashes = function (s, username) {
   a.seq (s, [
      [Redis, 'smembers', 'shm:' + username],
      function (s) {
         if (s.last.length === 0) return s.next ('empty');
         var multi = redis.multi (), qid = 'query:' + uuid ();
         multi.sunionstore (qid, dale.go (s.last, function (share) {
            return 'tag:' + share;
         }));
         multi.smembers (qid);
         multi.del (qid);
         mexec (s, multi);
      },
      function (s) {
         if (s.last === 'empty') return s.next ([]);
         var multi = redis.multi ();
         dale.go (s.last [1], function (id) {
            multi.hget ('piv:' + id, 'hash');
         });
         mexec (s, multi);
      }
   ]);
}

H.tagCleanup = function (s, username, tags, ids, sho, unshare) {
   a.seq (s, [
      [function (s) {
         if (unshare) return s.next ();
         var multi = redis.multi ();
         dale.go (tags, function (tag) {
            multi.exists ('tag:'     + username + ':' + tag);
            multi.exists ('taghash:' + username + ':' + tag);
         });
         dale.go (sho, function (user) {
            multi.del ('querycache:' + user.split (':') [0]);
         });
         multi.get ('hometags:' + username);
         mexec (s, multi);
      }],
      function (s) {
         if (unshare) return s.next ();
         var hometags = JSON.parse (teishi.last (s.last) || '[]');
         var multi = redis.multi ();
         var toRemove = dale.fil (tags, undefined, function (tag, k) {
            var tagExists = s.last [k * 2], taghashExists = s.last [k * 2 + 1];
            if (! tagExists && ! taghashExists) multi.srem ('tags:'     + username, tag);
            if (! tagExists && ! taghashExists) hometags = dale.fil (hometags, tag, function (v) {return v});
            if (! tagExists) return tag;
         });
         multi.set ('hometags:' + username, JSON.stringify (hometags));
         dale.go (sho, function (share) {
            var whom = share.split (':') [0], tag = share.split (':').slice (1).join (':');
            if (! inc (toRemove, tag)) return;
            multi.srem ('sho:' + username, whom + ':' + tag);
            multi.srem ('shm:' + whom, username + ':' + tag);
         });
         mexec (s, multi);
      },
      [a.set, 'hashes', function (s) {
         var multi = redis.multi ();
         dale.go (ids, function (id) {
            multi.hget ('piv:' + id, 'hash');
         });
         mexec (s, multi);
      }],
      function (s) {
         s.affectedUsers = [];
         dale.go (sho, function (share) {
            var username = share.split (':') [0], tag = share.split (':').slice (1).join (':');
            if (inc (tags, tag) && ! inc (s.affectedUsers, username)) s.affectedUsers.push (username);
         });
         // TODO: remove special case for no-op once a.fork returns an empty array for a no-op
         if (s.affectedUsers.length === 0) return s.next ([]);
         else a.fork (s, s.affectedUsers, function (v) {return [H.getSharedHashes, v]}, {max: 5});
      },
      function (s) {
         var multi = redis.multi ();
         s.toRemove = [];
         dale.go (s.last, function (hashes, k) {
            var username = s.affectedUsers [k];
            dale.go (hashes, function (hash) {
               if (inc (hashes, hash)) return;
               s.toRemove.push ([username, hash]);
               multi.smembers ('hashtag:' + username + ':' + hash);
            });
         });
         mexec (s, multi);
      },
      function (s) {
         var multi = redis.multi ();
         dale.go (s.toRemove, function (toRemove, k) {
            multi.del ('hashtag:' + toRemove [0] + ':' + toRemove [1]);
            dale.go (s.last [k], function (tag) {
               multi.srem ('taghash:' + toRemove [0] + ':' + tag, toRemove [1]);
            });
         });

         s.toRemove2 = [];
         dale.go (s.toRemove, function (toRemove, k) {
            dale.go (s.last [k], function (tag) {
               multi.exists ('tag:' + toRemove [0] + ':' + tag, 'taghash:' + toRemove [0] + ':' + tag);
               s.toRemove2.push ([toRemove [0], tag]);
            });
         });
         mexec (s, multi);
      },
      function (s) {
         var multi = redis.multi ();
         s.last = s.last.slice (- s.toRemove2.length);
         dale.go (s.toRemove2, function (toRemove2) {
            if (! s.last [k]) multi.srem ('tags:' + toRemove2 [0], toRemove2 [1]);
         });
         mexec (s, multi);
      }
   ]);
}

// *** END ANNOTATED SOURCE CODE FRAGMENT ***

// *** OAUTH HELPERS ***

// https://developers.google.com/identity/protocols/oauth2/web-server
H.getGoogleToken = function (S, username) {
   a.stop ([
      [Redis, 'get', 'oa:g:acc:' + username],
      function (s) {
         // There is an access token, return it.
         if (s.last) {
            S.token = s.last;
            return S.next (s.last);
         }
         // No access token, check if there's a refresh token.
         Redis (s, 'get', 'oa:g:ref:' + username);
      },
      function (s) {
         // No access or refresh token, report an error to (optionally) restart authentication with provider.
         if (! s.last) return S.next (null, {errorCode: 1, error: 'No access or refresh token.'});
         var body = [
            'client_id='     + SECRET.google.oauth.gdrive.webClientId,
            'client_secret=' + SECRET.google.oauth.gdrive.webSecret,
            'grant_type='    + 'refresh_token',
            'refresh_token=' + encodeURIComponent (s.last),
         ].join ('&');
         hitit.one ({}, {https: true, timeout: 15, host: 'oauth2.googleapis.com', method: 'post', path: 'token', headers: {'content-type': 'application/x-www-form-urlencoded'}, body: 'client_secret=' + encodeURIComponent (SECRET.google.oauth.gdrive.webSecret) + '&grant_type=refresh_token&refresh_token=' + encodeURIComponent (s.last) + '&client_id=' + SECRET.google.oauth.gdrive.webClientId, code: '*', apres: function (s, rq, rs) {
            // If the refresh token failed
            if (rs.code !== 200) return a.stop (S, [
               // Delete refresh token
               [Redis, 'del', 'oa:g:ref:' + username],
               function (s) {
                  // Report an error
                  s.next (null, {errorCode: 2, error: 'Refresh token failed.', code: rs.code, body: rs.body});
               }
            ]);
            // Refresh token was successful
            a.stop (S, [
               // Store access token
               [Redis, 'setex', 'oa:g:acc:' + username, rs.body.expires_in, rs.body.access_token],
               function (s) {
                  // Return access token
                  s.token = rs.body.access_token;
                  s.next (rs.body.access_token);
               }
            ]);
         }});
      }
   ], function (s, error) {
      S.next (null, error);
   });
}

H.getGooglePublicKeys = function (s) {
  hitit.one ({}, {timeout: 15, https: true, method: 'get', host: 'www.googleapis.com', path: 'oauth2/v3/certs', code: '*', apres: function (S, RQ, RS) {
     if (RS.code !== 200) return s.next (null, {code: RS.code, error: RS.body});
     return s.next (RS.body.keys);
  }});
}

H.getApplePublicKeys = function (s) {
  hitit.one ({}, {timeout: 15, https: true, method: 'get', host: 'appleid.apple.com', path: 'auth/keys', code: '*', apres: function (S, RQ, RS) {
     if (RS.code !== 200) return s.next (null, {code: RS.code, error: RS.body});
     return s.next (RS.body.keys);
  }});
}

// Apple: https://forums.developer.apple.com/forums/thread/132223
H.oauthSignin = function (rq, rs, provider, redirect) {

   var user = {
      id:        rs.oauthUser [{google: 'sub',         apple: 'sub'}   [provider]],
      email:     rs.oauthUser [{google: 'email',       apple: 'email'} [provider]],
      firstName: rs.oauthUser [{google: 'given_name'}  [provider]],
      lastName:  rs.oauthUser [{google: 'family_name'} [provider]],
   }

   if (provider === 'apple' && rs.oauthUser.email_verified !== true) return reply (rs, 401, {error: 'Email must be verified with Apple'});

   if (stop (rs, [
      ['provider', provider, ['google', 'apple'], teishi.test.equal, 'oneOf'],
      ['user', user, 'object'],
      function () {return [
         ['id', user.id, 'string'],
         ['email', user.email, H.email, teishi.test.match],
         ['firstName', user.firstName, ['string', 'undefined'], 'oneOf'],
         ['lastName', user.lastName, ['string', 'undefined'], 'oneOf'],
      ]},
   ])) return;

   var login = function (s, username, noLoginEvent) {
      s.username = username;
      a.seq (s, [
         [a.set, 'session', [a.make (giz.loginOAuth), s.username]],
         [a.set, 'csrf', [a.make (require ('bcryptjs').genSalt), 20]],
         function (s) {
            Redis (s, 'setex', 'csrf:' + s.session, giz.config.expires, s.csrf);
         },
         noLoginEvent ? [] : [a.get, H.log, '@username', {ev: 'auth', type: 'login', ip: rq.origin, userAgent: rq.headers ['user-agent'], provider: provider}],
         // Update names
         user.firstName && user.lastName ? [Redis, 'hmset', 'users:' + s.username, {firstName: user.firstName, lastName: user.lastName}] : [],
         ENV ? [] : function (s) {
            // Only for tests
            var multi = redis.multi ();
            multi.set ('oauth-cookie', cicek.cookie.write (CONFIG.cookieName, s.session, {httponly: true, samesite: 'Lax', path: '/', expires: new Date (Date.now () + 1000 * 60 * 60 * 24 * 365 * 10)}));
            multi.set ('oauth-csrf', s.csrf);
            mexec (s, multi);
         },
         function (s) {
            if (! redirect) reply (rs, 200, {csrf: s.csrf}, {'set-cookie': cicek.cookie.write (CONFIG.cookieName, s.session, {httponly: true, samesite: 'Lax', path: '/', expires: new Date (Date.now () + 1000 * 60 * 60 * 24 * 365 * 10)})});
            else            reply (rs, 302, {}, {location: CONFIG.domain + '#/pics', 'set-cookie': cicek.cookie.write (CONFIG.cookieName, s.session, {httponly: true, samesite: 'Lax', path: '/', expires: new Date (Date.now () + 1000 * 60 * 60 * 24 * 365 * 10)})});
         }
      ]);
   }

   a.seq ([
      // We set the oauthUser on a key so it can be reused directly by the test suite (which will go and get it from the DB)
      ENV ? [] : [Redis, 'set', 'oauth-token', JSON.stringify (rs.oauthUser)],
      [function (s) {
         var multi = redis.multi ();
         multi.get ('oauth:' + provider + ':' + user.id);
         multi.get ('email:' + user.email);
         mexec (s, multi);
      }],
      function (s) {
         var usernameOAuth = s.last [0];
         var usernameEmail = s.last [1];

         if (usernameOAuth && usernameEmail) {
            if (usernameOAuth !== usernameEmail) return a.seq ([
               [notify, {priority: 'important', type: 'Mismatch between username from oauth and username from email', usernameOAuth: usernameOAuth, usernameEmail: usernameEmail, oauthUser: user, provider: provider}],
               [reply, rs, 409, {error: 'Another user already exists with that email'}],
            ]);

            // User exists and had already previously logged in through oauth
            return a.seq ([login, usernameOAuth]);
         }

         // New user
         if (! usernameOAuth && ! usernameEmail) return a.seq ([
            [function (s) {
               s.username = uuid ();
               var multi = redis.multi ();
               var newUser = {
                  username:            s.username,
                  email:               user.email,
                  created:             Date.now (),
                  geo:                 1,
                  suggestSelection:    1,
                  onboarding:          1,
               };
               newUser [provider + 'Id'] = user.id;
               if (user.firstName) newUser.firstName = user.firstName;
               if (user.lastName)  newUser.lastName  = user.lastName;
               multi.hmset ('users:' + s.username, newUser);

               multi.sadd ('users', s.username);
               multi.set ('oauth:' + provider + ':' + user.id, s.username);
               multi.set ('email:'        + user.email, s.username);
               mexec (s, multi);
            }],
            [H.stat.w, 'flow', 'users', 1],
            function (s) {
               sendmail (s, {
                  to1:     s.username,
                  to2:     user.email,
                  subject: CONFIG.etemplates.welcome.subject,
                  message: CONFIG.etemplates.welcome.message (user.firstName || user.email)
               });
            },
            function (s) {
               H.log (s, s.username, {ev: 'auth', type: 'signup', ip: rq.origin, userAgent: rq.headers ['user-agent'], provider: provider});
            },
            function (s) {
               notify (s, {priority: 'important', type: 'New user', user: s.username, email: user.email, userAgent: rq.headers ['user-agent'], ip: rq.origin, provider: provider});
            },
            function (s) {
               login (s, s.username, true);
            },
         ]);

         // User had created username/password email and is now logging with oauth for the first time
         if (usernameEmail && ! usernameOAuth) return a.seq ([
            [function (s) {
               var multi = redis.multi ();
               multi.set ('oauth:' + provider + ':' + user.id, usernameEmail);
               multi.hset ('users:' + usernameEmail, provider + 'Id', user.id);
               mexec (s, multi);
            }],
            [login, usernameEmail],
         ]);

         // User changed email bound to their oauth provider and there's no conflict, so we can change it
         if (usernameOAuth && ! usernameEmail) return a.seq ([
            [Redis, 'hgetall', 'users:' + usernameOAuth],
            function (s) {
               var existingUser = s.last;

               var multi = redis.multi ();
               multi.hset ('users:' + usernameOAuth, 'email', user.email);
               multi.set ('email:' + user.email, usernameOAuth);
               multi.del ('email:' + existingUser.email);
               mexec (s, multi);
            },
            [login, usernameOAuth],
         ]);
      },
   ]);
}

// *** STATISTICS ***

H.stat = {
   zero: new Date ('2020-01-01T00:00:00.000Z').getTime (),
   shorten: function (ms) {
      return ((ms - (ms % 1000) - H.stat.zero) + '').slice (0, -3);
   }
};

redis.script ('load', [
   'local v = tonumber (redis.call ("get", KEYS [1]));',
   'if (v == nil or (v < tonumber (ARGV [1]))) then',
   '   redis.call ("set", KEYS [1], ARGV [1])',
   'end'
].join ('\n'), function (error, sha) {
   if (error) return notify (a.creat (), {priority: 'critical', type: 'Redis script loading error', error: error});
   H.stat.max = sha;
});

redis.script ('load', [
   'local v = tonumber (redis.call ("get", KEYS [1]));',
   'if (v == nil or (v > tonumber (ARGV [1]))) then',
   '   redis.call ("set", KEYS [1], ARGV [1])',
   'end'
].join ('\n'), function (error, sha) {
   if (error) return notify (a.creat (), {priority: 'critical', type: 'Redis script loading error', error: error});
   H.stat.min = sha;
});


H.stat.w = function (s) {
   var t = Date.now (), multi = redis.multi ();
   var ops = type (arguments [1]) !== 'array' ? [[arguments [1], arguments [2], arguments [3]]] : arguments [1];
   // TODO: validations, add when exposing as a service. For each of the ops:
      // op must be array of length 3 or 0 (for no-op)
      // type is one of: flow, max, min, unique
      // name must be a string and cannot contain a colon
      // if type is `unique`, value can be a string, integer or float
      // if type is not `unique`, value can only be an integer or float
   dale.go (ops, function (op) {
      if (op.length === 0) return;
      var type = op [0], name = op [1], value = op [2];
      if (type === 'unique') {
         var d = new Date (t);
         // year, month, day, hour, minute, second
         dale.go ({
            y: new Date (d.getUTCFullYear () + '-01-01T00:00:00.000Z').getTime (),
            M: new Date (d.getUTCFullYear () + '-' + H.pad (d.getUTCMonth () + 1) + '-01T00:00:00.000Z').getTime (),
            d: d - d % (1000 * 60 * 60 * 24),
            h: d - d % (1000 * 60 * 60),
            m: d - d % (1000 * 60),
            s: d
         }, function (date, period) {
            multi.pfadd ('stat:u:' + name + ':' + period + ':' + H.stat.shorten (date), value);
         });
      }
      else if (type === 'max' || type === 'min') {
         multi.evalsha (H.stat [type], 1, 'stat:' + (type === 'max' ? 'M' : 'm') + ':' + name + ':' + H.stat.shorten (t), value);
      }
      else if (type === 'flow') {
         multi.incrbyfloat ('stat:f:' + name + ':' + H.stat.shorten (t), value);
         multi.incrbyfloat ('stat:f:' + name,                            value);
      }
      else {
         throw new Error ('Unsupported stats type: ' + type);
      }
   });
   mexec (s, multi);
}

H.stat.r = function (s) {
   var ops = type (arguments [1]) !== 'array' ? [[arguments [1], arguments [2], arguments [3]]] : arguments [1];
   // TODO: validations, add when exposing as a service. For each of the ops:
      // op must be array of length 3 or 0 (for no-op)
      // type is one of: flow, max, min, unique
      // name must be a string and cannot contain a colon
      // options must be an object
      // options should be {min: *|INT, max: *|INT, aggregateBy: s|m|h|d|M|y}
   a.seq (s, [
      // Here we're reading all stats into memory. Definitely room for improvement, but probably it makes sense to offload most stats to disk first.
      [redis.keyscan, 'stat:*'],
      function (s) {
         var multi = redis.multi ();
         dale.go (s.last, function (key) {
            multi [key.match ('stat:u') ? 'pfcount' : 'get'] (key);
         });
         multi.exec (function (error, data) {
            if (error) return s.next (null, error);
            s.next (dale.obj (s.last, function (key, k) {
               return [key, parseInt (data [k])];
            }));
         });
      },
      function (s) {
         // CSV export of all
         var CSV = [];
         dale.go (s.last, function (v, k) {
            var type = {u: 'unique', f: 'flow', M: 'max', m: 'min'} [k [5]];
            k = k.slice (7);
            var name = k.split (':') [0];
            CSV.push ([type, name, k.replace (name + ':', ''), v]);
         });
         s.next (dale.go (CSV.sort (function (a, b) {
            if (a [0] !== b [0]) return a [0] > b [0] ? 1 : -1;
            if (a [1] !== b [1]) return a [1] > b [1] ? 1 : -1;
            if (a [2] !== b [2]) return a [2] > b [2] ? 1 : -1;
         }), function (v) {return v.join ('\t')}).join ('\n'));
         return;
         return s.next (dale.go (s.last, function (v, k) {
            return [k, v];
         }).sort (function (a, b) {
            return a [0] > b [0] ? 1 : -1;
         }));
         var output = [];
         dale.go (ops, function (op) {
            if (op.length === 0) return;
            var type = op [0], name = op [1], value = op [2];
            // min inclusive, max exclusive
            // TODO: implement My aggregation
            // get all keys
            // track for time range, min/max. if *, 0 or infinity
            // aggregate:
               // if unique, return all matching by specified, there's no aggregation
               // otherwise, aggregate (sum or min/max) by unit specified
            // if flow, also add current value
         });
      },
   ]);
}

// *** BEGIN ANNOTATED SOURCE CODE FRAGMENT ***

// The annotated source code for this script is in the section of the endpoint `POST /query`.

redis.script ('load', [
   'redis.call ("rpush", KEYS [1] .. "-perf", "init", unpack (redis.call ("time")));',
   'local query = cjson.decode (redis.call ("get", KEYS [1]));',
   'if #query.query.tags == 0 then',
   '   redis.call ("sunionstore", KEYS [1] .. "-ids", "tag:" .. query.username .. ":a::", unpack (query.sharedTagsPre));',
   'else',
   '   if #query.ownTagsPre > 0 then',
   '      redis.call ("sinterstore", KEYS [1] .. "-ids", unpack (query.ownTagsPre));',
   '   end',
   '   if not query.untagged then',
   '      for k, v in ipairs (query.relevantUsers) do',
   '         redis.call ("sinterstore", KEYS [1] .. "-ids-" .. k, redis.call ("sinter", unpack (v)));',
   '         for k2, v2 in ipairs (query.dateGeoTags) do',
   '            redis.call ("sinterstore", KEYS [1] .. "-ids-" .. k, KEYS [1] .. "-ids-" .. k, "tag:" .. k .. ":" .. v2);',
   '         end',
   '         redis.call ("sunionstore", KEYS [1] .. "-sharedIds", KEYS [1] .. "-sharedIds", KEYS [1] .. "-ids-" .. k);',
   '         redis.del (KEYS [1] .. "-ids-" .. k);',
   '      end',
   '      if #query.userTags > 0 then',
   '         for k, v in ipairs (query.userTags) do',
   '            if redis.call ("scard", "taghash:" .. query.username .. ":" .. v) > 0 then',
   '               redis.call ("sadd", KEYS [1] .. "-hashes", unpack (redis.call ("smembers", "taghash:" .. query.username .. ":" .. v)));',
   '            end',
   '         end',
   '         for k, v in ipairs (redis.call ("smembers", KEYS [1] .. "-hashes")) do',
   '            redis.sadd (KEYS [1] .. "-hashids", unpack (redis.smembers ("hashid:" .. v)));',
   '         end',
   '         redis.call ("sinterstore", KEYS [1] .. "-sharedIds", KEYS [1] .. "-sharedIds", KEYS [1] .. "-hashids");',
   '         redis.call ("del", KEYS [1] .. "-hashids", KEYS [1] .. "-hashes");',
   '      end',
   '      if query.toOrganize then',
   '         for k, v in ipairs (redis.call ("smembers", KEYS [1] .. "-sharedIds")) do',
   '            if redis.call ("sismember", "hashtag:" .. query.username .. ":" .. redis.call ("hget", "piv:" .. v, "hash"), "o::") then',
   '               redis.call ("srem", KEYS [1] .. "-sharedIds", v);',
   '            end',
   '         end',
   '      end',
   '      redis.call ("sunionstore", KEYS [1] .. "-ids", KEYS [1] .. "-ids", KEYS [1] .. "-sharedIds");',
   '      redis.call ("del", KEYS [1] .. "-sharedIds");',
   '   end',
   'end',
   'if query.toOrganize then',
   '   redis.call ("sdiffstore", KEYS [1] .. "-ids", KEYS [1] .. "-ids", "tag:" .. query.username .. ":o::");',
   'end',
   'if query.query.recentlyTagged and #query.query.recentlyTagged then',
   '   redis.call ("sadd", KEYS [1] .. "-recent", unpack (query.query.recentlyTagged));',
   '   redis.call ("sunionstore", KEYS [1] .. "-all", "tag:" .. query.username .. ":a::", unpack (query.sharedTagsPre));',
   '   redis.call ("sadd", KEYS [1] .. "-ids", unpack (redis.call ("sinter", KEYS [1] .. "-recent", KEYS [1] .. "-all")));',
   '   redis.call ("del", KEYS [1] .. "-recent", KEYS [1] .. "-all");',
   'end',
   'local ids = redis.call ("smembers", KEYS [1] .. "-ids");',
   'redis.call ("rpush", KEYS [1] .. "-perf", "ids", unpack (redis.call ("time")));',
   'local sortField = query.query.sort == "upload" and "dateup" or "date";',
   'for k, v in ipairs (ids) do',
   '   local dates = redis.call ("hmget", "piv:" .. v, sortField, "dateup");',
   '   if not ((query.query.mindate and tonumber (dates [1]) < query.query.mindate) or (query.query.maxdate and tonumber (dates [1]) > query.query.maxdate) or (query.query.updateLimit and tonumber (dates [2]) > query.query.updateLimit)) then',
   '      redis.call ("zadd", KEYS [1] .. "-sort", dates [1], v);',
   '   end',
   'end',
   'if #ids > redis.call ("zcard", KEYS [1] .. "-sort") then',
   '   ids = redis.call ("zrange", KEYS [1] .. "-sort", 0, -1);',
   '   redis.call ("del", KEYS [1] .. "-ids");',
   '   if #ids > 0 then redis.call ("sadd", KEYS [1] .. "-ids", unpack (ids)) end',
   'end',
   'redis.call ("rpush", KEYS [1] .. "-perf", "sort", unpack (redis.call ("time")));',
   'local output = {};',
   'if query.query.timeHeader then output ["timeHeader"] = {} end;',
   'if not query.query.idsOnly then',
   '   for k, v in ipairs (ids) do',
   '      local piv = redis.call ("hmget", "piv:" .. v, "hash", "owner");',
   '      local tags = redis.call ("smembers", "pivt:" .. v);',
   '      redis.call ("sadd", KEYS [1] .. "-hashes", piv [1]);',
   '      if piv [2] == query.username then',
   '         redis.call ("sadd", KEYS [1] .. "-tags-" .. piv [1], unpack (tags));',
   '      else',
   '         local hashtags = redis.call ("smembers", "hashtag:" .. query.username .. ":" .. piv [1]);',
   '         if #hashtags > 0 then redis.call ("sadd", KEYS [1] .. "-tags-" .. piv [1], unpack (hashtags)) end;',
   '         for k2, v2 in ipairs (tags) do',
   '            if query.sharedTags [piv [2] .. ":" .. v2] then',
   '               redis.call ("sadd", KEYS [1] .. "-tags-" .. piv [1], piv [2] .. ":" .. v2);',
   '            elseif string.sub (v2, 0, 3) == "d::" or string.sub (v2, 0, 3) == "g::" then',
   '               redis.call ("sadd", KEYS [1] .. "-tags-" .. piv [1], v2);',
   '            end',
   '         end',
   '      end',
   '      if query.query.timeHeader then',
   '         local month = "";',
   '         local year = "";',
   '         local organized = "t";',
   '         if piv [2] ~= query.username then tags = redis.call ("smembers", KEYS [1] .. "-tags-" .. piv [1]) end;',
   '         for k, tag in ipairs (tags) do',
   '            if string.sub (tag, 0, 3) == "d::" then',
   '               if #tag == 7 then year = string.sub (tag, 4) else month = string.sub (tag, 5) end',
   '            end',
   '            if tag == "o::" then organized = "o" end',
   '         end',
   '         output.timeHeader [year .. ":" .. month .. ":" .. organized] = output.timeHeader [year .. ":" .. month .. ":" .. organized] and output.timeHeader [year .. ":" .. month .. ":" .. organized] + 1 or 1;',
   '      end',
   '   end',
   '   redis.call ("rpush", KEYS [1] .. "-perf", "hashes", unpack (redis.call ("time")));',
   '   output.total = redis.call ("scard", KEYS [1] .. "-hashes");',
   '   for k, v in ipairs (redis.call ("smembers", KEYS [1] .. "-hashes")) do',
   '      for k2, v2 in ipairs (redis.call ("smembers", KEYS [1] .. "-tags-" .. v)) do',
   '         redis.call ("hincrby", KEYS [1] .. "-tags", v2, 1);',
   '      end',
   '     redis.call ("del", KEYS [1] .. "-tags-" .. v);',
   '   end',
   '   redis.call ("rpush", KEYS [1] .. "-perf", "usertags", unpack (redis.call ("time")));',
   '   if #query.query.tags == 0 and not query.query.mindate and not query.query.maxdate and not query.toOrganize then',
   '      redis.call ("hset", KEYS [1] .. "-tags", "a::", output.total);',
   '   else',
   '      for k, v in ipairs (redis.call ("sunion", "tag:" .. query.username .. ":a::", unpack (query.sharedTagsPre))) do',
   '         redis.call ("sadd", KEYS [1] .. "-allHashes", redis.call ("hget", "piv:" .. v, "hash"));',
   '      end',
   '      redis.call ("hset", KEYS [1] .. "-tags", "a::", redis.call ("scard", KEYS [1] .. "-allHashes"));',
   '      redis.call ("del", KEYS [1] .. "-allHashes");',
   '   end',
   '   redis.call ("hset", KEYS [1] .. "-tags", "u::", #redis.call ("sinter", KEYS [1] .. "-ids", "tag:" .. query.username .. ":u::"));',
   '   local organized = redis.call ("hget", KEYS [1] .. "-tags", "o::") or 0;',
   '   local videos    = redis.call ("hget", KEYS [1] .. "-tags", "v::") or 0;',
   '   redis.call ("hmset", KEYS [1] .. "-tags", "o::", organized, "t::", output.total - tonumber (organized), "v::", videos);',
   '   redis.call ("rpush", KEYS [1] .. "-perf", "systags", unpack (redis.call ("time")));',
   '   output.tags = redis.call ("hgetall", KEYS [1] .. "-tags");',
   '   redis.call ("del", KEYS [1] .. "-hashes", KEYS [1] .. "-tags");',
   'end',
   'if query.query.fromDate then',
   '   query.query.from = 1;',
   '   local fromPiv;',
   '   if query.query.sort == "oldest" then',
   '      fromPiv = redis.call ("zrevrangebyscore", KEYS [1] .. "-sort", 0, query.query.fromDate,      "LIMIT", 0, 1);',
   '   else',
   '      fromPiv = redis.call ("zrangebyscore",    KEYS [1] .. "-sort", query.query.fromDate, "+inf", "LIMIT", 0, 1);',
   '   end',
   '   if #fromPiv > 0 then',
   '      query.query.to = query.query.to + redis.call (query.query.sort == "oldest" and "zrank" or "zrevrank", KEYS [1] .. "-sort", fromPiv [1]);',
   '   end',
   'end',
   'if query.query.idsOnly then',
   '   output.ids = redis.call (query.query.sort == "oldest" and "zrange" or "zrevrange", KEYS [1] .. "-sort", query.query.from - 1, query.query.to - 1);',
   'else',
   '   local pivCount = 0;',
   '   local index    = 0;',
   '   local hashes   = {};',
   '   while pivCount < query.query.to - query.query.from + 1 do',
   '      local id = redis.call (query.query.sort == "oldest" and "zrange" or "zrevrange", KEYS [1] .. "-sort", query.query.from - 1 + index, query.query.from - 1 + index) [1];',
   '      if not id then break end',
   '      index = index + 1',
   '      local piv = redis.call ("hmget", "piv:" .. id, "hash", "owner", sortField);',
   '      if not hashes [piv [1]] then',
   '         hashes [piv [1]] = id;',
   '         redis.call ("zadd", KEYS [1] .. "-sortFiltered", piv [3], id);',
   '         pivCount = pivCount + 1;',
   '      else',
   '         if piv [2] == query.username or piv [2] < redis.call ("hget", "piv:" .. hashes [piv [1]], "owner") then',
   '            hashes [piv [1]] = id;',
   '            redis.call ("zrem", KEYS [1] .. "-sortFiltered", hashes [piv [1]]);',
   '            redis.call ("zadd", KEYS [1] .. "-sortFiltered", piv [3], id);',
   '         end',
   '      end',
   '   end',
   '   output.pivs = {};',
   '   for k, v in ipairs (redis.call (query.query.sort == "oldest" and "zrange" or "zrevrange", KEYS [1] .. "-sortFiltered", 0, -1)) do',
   '      local piv = redis.call ("hgetall", "piv:" .. v);',
   '      table.insert (piv, "tags");',
   '      local owner = redis.call ("hget", "piv:" .. v, "owner");',
   '      if owner == query.username then',
   '         table.insert (piv, redis.call ("smembers", "pivt:" .. v));',
   '      else',
   '         local tags = {};',
   '         for k2, v2 in ipairs (redis.call ("smembers", "pivt:" .. v)) do',
   '            if query.sharedTags [owner .. ":" .. v2] then',
   '               table.insert (tags, owner .. ":" .. v2);',
   '            elseif string.sub (v2, 0, 3) == "d::" or string.sub (v2, 0, 3) == "g::" then',
   '               table.insert (tags, v2);',
   '            end',
   '         end',
   '         table.insert (piv, tags);',
   '      end',
   '      table.insert (output.pivs, piv);',
   '   end',
   'end',
   'redis.call ("rpush", KEYS [1] .. "-perf", "pivs", unpack (redis.call ("time")));',
   'output.perf = redis.call ("lrange", KEYS [1] .. "-perf", 0, -1);',
   'redis.call ("del", KEYS [1], KEYS [1] .. "-ids", KEYS [1] .. "-sort", KEYS [1] .. "-sortFiltered", KEYS [1] .. "-tags", KEYS [1] .. "-perf");',
   'return cjson.encode (output);'
].join ('\n'), function (error, sha) {
   if (error) return notify (a.creat (), {priority: 'critical', type: 'Redis script loading error', error: error});
   H.query = sha;
});

// *** END ANNOTATED SOURCE CODE FRAGMENT ***

// *** ROUTES ***

var routes = [

   // *** DO NOT SERVE REQUESTS IF WE ARE PERFORMING CONSISTENCY OPERATIONS ***

   ['all', '*', function (rq, rs) {
      if (mode === 'makeConsistent') return reply (rs, 503, {error: 'Consistency operation in process'});
      rs.next ();
   }],

   // *** UPTIME ROBOT ***

   ['head', '*', function (rq, rs) {
      redis.info (function (error) {
         if (error) reply (rs, 500);
         reply (rs, inc (['/stats'], rq.url) ? 200 : 404);
      });
   }],

   // *** STATIC ASSETS ***

   ['get', 'favicon.ico', cicek.file, 'assets/img/favicon.ico'],

   ['get', 'img/*', cicek.file, ['markup']],

   ['get', 'assets/gotoB.min.js', cicek.file, 'node_modules/gotob/gotoB.min.js'],

   ['get', ['assets/*', 'client.js', 'channel.js', 'testclient.js', 'admin.js'], cicek.file],

   // TODO: remove after writing the backend for channels
   ['get', ['test/*'], cicek.file],

   dale.go ({'/': 'client.js', 'channel/*': 'channel.js'}, function (file, route) {
      return ['get', route, reply, lith.g ([
         ['!DOCTYPE HTML'],
         ['html', [
            ['head', [
               ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
               ['meta', {charset: 'utf-8'}],
               ['title', 'ac;pic'],
               ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat:400,400i,500,500i,600,600i&display=swap'}],
               ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Kadwa'}],
               ['link', {rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/tachyons/4.11.1/tachyons.min.css'}],
            ]],
            ['body', [
               dale.go (['murmurhash.js', 'gotoB.min.js'], function (v) {
                  return ['script', {src: CONFIG.domain + 'assets/' + v}];
               }),
               ['script', 'B.prod = ' + (ENV === 'prod') + ';'],
               ['script', 'window.allowedFormats = ' + JSON.stringify (CONFIG.allowedFormats) + ';'],
               ['script', 'window.maxFileSize    = ' + CONFIG.maxFileSize + ';'],
               ['script', {src: CONFIG.domain + file}]
            ]]
         ]]
      ])];
   }),

   ['get', 'admin', reply, lith.g ([
      ['!DOCTYPE HTML'],
      ['html', [
         ['head', [
            ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
            ['meta', {charset: 'utf-8'}],
            ['title', 'ac;pic admin'],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat'}],
            dale.go (['pure-min.css', 'ionicons.min.css'], function (v) {
               return ['link', {rel: 'stylesheet', href: 'assets/' + v}];
            })
         ]],
         ['body', [
            ['script', {src: 'assets/gotoB.min.js'}],
            ['script', {src: 'admin.js'}]
         ]]
      ]]
   ])],

   // *** CLIENT ERRORS (FROM NON-LOGGED IN USERS) ***

   ['post', 'error', function (rq, rs) {

      if (rq.data.cookie && rq.data.cookie [CONFIG.cookieName]) return rs.next ();

      var report = {priority: 'critical', type: 'client error in browser', ip: rq.origin, user: 'PUBLIC', userAgent: rq.headers ['user-agent'], error: rq.body};
      astop (rs, [
         [notify, report],
         [reply, rs, 200, ENV ? {} : report],
      ]);
   }],

   // *** PUBLIC STATS ***

   ['get', 'stats', function (rq, rs) {
      var split = function (n) {
         return n.toString ().replace (/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      // TODO: replace with H.stat.r
      var multi = redis.multi ();
      var keys = ['byfs', 'bys3', 'pivs', 'pics', 'vids', 'thumbS', 'thumbM', 'users'];
      dale.go (keys, function (key) {
         multi.get ('stat:f:' + key);
      });
      multi.exec (function (error, data) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 200, dale.obj (keys, function (key, k) {
            if (key === 'pivs') return [key, split (parseInt (data [3] || 0) + (parseInt (data [4]) || 0))];
            return [key, split (parseInt (data [k]) || 0)];
         }));
      });
   }],

   // *** LOGIN & SIGNUP ***

   ['post', 'auth/login', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['username', 'password', 'timezone'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.go (['username', 'password'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
            ['body.timezone', b.timezone, 'integer'],
            // UTC-12 to UTC+14
            ['body.timezone', b.timezone, {min: -840, max: 720}, teishi.test.range]
         ]},
      ])) return;

      b.username = H.trim (b.username.toLowerCase ());

      astop (rs, [
         [a.set, 'username', function (s) {
            if (! b.username.match ('@')) return s.next (b.username);
            a.cond (s, [Redis, 'get', 'email:' + b.username], {
               null: [reply, rs, 403, {error: 'auth'}],
            });
         }],
         [a.stop, [a.set, 'session', function (s) {
            a.make (giz.login) (s, s.username, b.password);
         }], function (s, error) {
            if (type (error) === 'string') reply (rs, 403, {error: 'auth'});
            else                           reply (rs, 500, {error: error});
         }],
         [a.cond, [a.get, Redis, 'hget', 'users:@username', 'verificationPending'], {
            true: [reply, rs, 403, {error: 'verify'}],
         }],
         [a.set, 'csrf', [a.make (require ('bcryptjs').genSalt), 20]],
         function (s) {
            Redis (s, 'setex', 'csrf:' + s.session, giz.config.expires, s.csrf);
         },
         [a.get, H.log, '@username', {ev: 'auth', type: 'login', ip: rq.origin, userAgent: rq.headers ['user-agent'], timezone: b.timezone}],
         function (s) {
            reply (rs, 200, {csrf: s.csrf}, {'set-cookie': cicek.cookie.write (CONFIG.cookieName, s.session, {httponly: true, samesite: 'Lax', path: '/', expires: new Date (Date.now () + 1000 * 60 * 60 * 24 * 365 * 10)})});
         }
      ]);
   }],

   ['post', 'auth/signup', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['username', 'password', 'email'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.go (['username', 'password', 'email'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
         ]},
         function () {return [
            ['body.username', b.username, /^[^@:]+$/, teishi.test.match],
            ['body.password length', b.password.length, {min: 6}, teishi.test.range],
            ['body.email',    b.email,    H.email, teishi.test.match],
         ]},
      ])) return;

      b.username = H.trim (b.username.toLowerCase ());
      if (b.username.length < 3)  return reply (rs, 400, {error: 'Trimmed username is less than three characters long.'});
      if (b.username.length > 40) return reply (rs, 400, {error: 'Trimmed username is more than forty characters long.'});
      b.email = H.trim (b.email.toLowerCase ());

      var multi = redis.multi ();
      multi.scard  ('users');
      multi.get    ('email:'   + b.email);
      multi.exists ('users:'   + b.username);
      astop (rs, [
         [mexec, multi],
         function (s) {
            if (CONFIG.maxUsers && s.last [0] >= CONFIG.maxUsers) {
               notify (a.creat (), {priority: 'important', type: 'User limit reached on signup', user: b.username, email: b.email, limit: CONFIG.maxUsers});
               return reply (rs, 418, {error: 'Too many users'});
            }
            if (s.last [1]) return reply (rs, 403, {error: 'email'});
            if (s.last [2]) return reply (rs, 403, {error: 'username'});
            s.next ();
         },
         // logs are deleted in case a deleted user with the same username existed, in which case there will be a `destroy` log.
         [Redis, 'del', 'ulog:' + b.username],
         [a.set, 'verifytoken', [a.make (require ('bcryptjs').genSalt), 20]],
         // TODO: don't do check to users, verify type of error returned by giz directly to distinguish 403 from 500
         [a.make (giz.signup), b.username, b.password],
         function (s) {
            // Even when URI encoded, users sometimes experience mangling of the verify token. Therefore, we just remove all non-alphanumeric characters from the token.
            s.verifytoken = s.verifytoken.replace (/[^a-z0-9]/gi, '');
            var multi = redis.multi ();
            multi.set ('verifytoken:' + s.verifytoken, b.email);
            multi.set ('email:' + b.email, b.username);
            multi.hmset ('users:' + b.username, {
               username:            b.username,
               email:               b.email,
               created:             Date.now (),
               verificationPending: true,
               geo:                 1,
               suggestSelection:    1,
               onboarding:          1,
            });
            multi.sadd ('users', b.username);
            mexec (s, multi);
         },
         [H.stat.w, 'flow', 'users', 1],
         function (s) {
            sendmail (s, {
               to1:     b.username,
               to2:     b.email,
               subject: CONFIG.etemplates.verify.subject,
               message: CONFIG.etemplates.verify.message (b.username, s.verifytoken)
            });
         },
         function (s) {
            H.log (s, b.username, {ev: 'auth', type: 'signup', ip: rq.origin, userAgent: rq.headers ['user-agent'], verifyToken: s.verifytoken});
         },
         function (s) {
            notify (s, {priority: 'important', type: 'New user', user: b.username, email: b.email, userAgent: rq.headers ['user-agent'], ip: rq.origin, verifyToken: s.verifytoken});
         },
         function (s) {
            reply (rs, 200, {token: ENV ? undefined : s.verifytoken});
         }
      ]);
   }],

   // *** EMAIL VERIFICATION ***

   ['get', 'auth/verify/(*)', function (rq, rs) {

      var token = rq.data.params [0];

      astop (rs, [
         [a.cond, [a.set, 'email', [Redis, 'get', 'verifytoken:' + token], true], {
            null: [
               [notify, {priority: 'important', type: 'bad verify token', token: token, ip: rq.origin, userAgent: rq.headers ['user-agent']}],
               [reply, rs, 302, '', {location: CONFIG.domain + '#/login/badtoken'}],
            ],
         }],
         [a.set, 'username', [a.get, Redis, 'get', 'email:@email']],
         [a.set, 'user', [a.get, Redis, 'hgetall', 'users:@username']],
         function (s) {
            var multi = redis.multi ();
            if (! s.user) return reply (rs, 403, {error: 'auth'});
            if (! s.user.verificationPending) return reply (rs, 302, '', {location: CONFIG.domain + '#/login/verified'});

            multi.hdel ('users:' + s.username, 'verificationPending');
            // We let the expire token live for another hour in case the user wants to re-verify, but not in test environments, where it will just live for a second
            multi.expire ('verifytoken:' + token, ENV ? 60 * 60 : 1);
            mexec (s, multi);
         },
         function (s) {
            sendmail (s, {
               to1: s.username,
               to2: s.email,
               subject: CONFIG.etemplates.welcome.subject,
               message: CONFIG.etemplates.welcome.message (s.username)
            });
         },
         function (s) {
            H.log (s, s.username, {ev: 'auth', type: 'verify', ip: rq.origin, userAgent: rq.headers ['user-agent']});
         },
         function (s) {
            notify (s, {type: 'verify', user: s.username});
         },
         [reply, rs, 302, '', {location: CONFIG.domain + '#/login/verified'}],
      ]);
   }],

   // *** PASSWORD RECOVER/RESET ***

   ['post', 'auth/recover', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['username'], 'eachOf', teishi.test.equal],
         function () {return [
            ['body.username', b.username, 'string']
         ]},
      ])) return;

      b.username = H.trim (b.username.toLowerCase ());

      astop (rs, [
         [a.set, 'username', function (s) {
            if (! b.username.match ('@')) return s.next (b.username);
            a.cond (s, [Redis, 'get', 'email:' + b.username], {
               null: [reply, rs, 403, {error: 'auth'}],
            });
         }],
         [a.stop, [a.set, 'token', [a.get, a.make (giz.recover), '@username']], function (s, error) {
            if (type (error) === 'string') reply (rs, 403, {error: 'auth'});
            else                           reply (rs, 500, {error: error});
         }],
         [a.set, 'user', [a.get, Redis, 'hgetall', 'users:@username']],
         function (s) {
            sendmail (s, {
               to1:     s.user.username,
               to2:     s.user.email,
               subject: CONFIG.etemplates.recover.subject,
               message: CONFIG.etemplates.recover.message (s.user.firstName || s.user.username, s.token)
            });
         },
         function (s) {
            H.log (s, s.username, {ev: 'auth', type: 'recover', ip: rq.origin, userAgent: rq.headers ['user-agent']});
         },
         [a.get, reply, rs, 200, ENV ? undefined : {token: '@token'}]
      ]);
   }],

   ['post', 'auth/reset', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['username', 'password', 'token'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.go (['username', 'password', 'token'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
         ]},
         function () {return ['body.password length', b.password.length, {min: 6}, teishi.test.range]}
      ])) return;

      // username is not trimmed because it is read from the token, which is generated by the server
      astop (rs, [
         [a.set, 'username', function (s) {
            if (! b.username.match ('@')) return s.next (b.username);
            a.cond (s, [Redis, 'get', 'email:' + b.username], {
               null: [reply, rs, 403, {error: 'auth'}],
            });
         }],
         [a.stop, [a.get, a.make (giz.reset), '@username', b.token, b.password], function (s, error) {
            if (type (error) === 'string') reply (rs, 403, {error: 'token'});
            else                           reply (rs, 500, {error: error});
         }],
         function (s) {
            a.seq (s, [a.set, 'user', [Redis, 'hgetall', 'users:' + s.username]]);
         },
         function (s) {
            H.log (s, s.user.username, {ev: 'auth', type: 'reset', ip: rq.origin, userAgent: rq.headers ['user-agent']});
         },
         function (s) {
            sendmail (s, {
               to1:     s.user.username,
               to2:     s.user.email,
               subject: CONFIG.etemplates.reset.subject,
               message: CONFIG.etemplates.reset.message (s.user.firstName || s.user.username)
            });
         },
         [reply, rs, 200],
      ]);
   }],

   // *** SIGNUP/LOGIN WITH GOOGLE ***

   ['get', 'auth/signin/credentials/google', function (rq, rs) {
      reply (rs, 200, {
         android: SECRET.google.oauth.login.androidClientId,
         ios: SECRET.google.oauth.login.iosClientId,
         web: SECRET.google.oauth.login.webClientId,
      });
   }],

   ['get', 'auth/signin/web/google', function (rq, rs) {

      var reportError = function (error) {
         notify (a.creat (), {priority: 'important', type: 'signin-google', ip: rq.origin, userAgent: rq.headers ['user-agent'], error: error});
         return reply (rs, 302, {}, {location: CONFIG.domain + '#/login/google/error'});
      }

      if (! rq.data.query || ! rq.data.query.code) return reportError ('No code in the query parameters');

      a.seq ([
         [function (s) {
            hitit.one ({}, {timeout: 15, https: true, method: 'post', host: 'oauth2.googleapis.com', path: 'token', code: '*', body: {
               code:          rq.data.query.code,
               client_id:     SECRET.google.oauth.login.webClientId,
               client_secret: SECRET.google.oauth.login.webSecret,
               redirect_uri:  CONFIG.domain + 'auth/signin/web/google',
               grant_type:    'authorization_code'
            }, apres: function (S, RQ, RS) {
               if (RS.code !== 200) return s.next (null, {code: RS.code, error: RS.body});
               return s.next (RS.body);
           }});
         }],
         function (s) {
            if (s.error) return reportError (s.error);

            s.idToken = s.last.id_token;

            if (! s.idToken) return reportError ('No id token');

            hitit.one ({}, {timeout: 15, https: true, method: 'get', host: 'oauth2.googleapis.com', path: 'tokeninfo?id_token=' + s.idToken, code: '*', apres: function (S, RQ, RS) {
               if (RS.code !== 200) return reportError (null, {code: RS.code, error: RS.body});

               if (RS.body.aud !== SECRET.google.oauth.login.webClientId) return reportError ('Audience mismatch: expected ' + SECRET.google.oauth.login.webClientId + ', got ' + RS.body.aud);

               rs.oauthUser = RS.body;
               H.oauthSignin (rq, rs, 'google', true);
           }});
         }
      ]);
   }],

   ['post', 'auth/signin/mobile/google', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ENV ? ['token', 'platform'] : ['token', 'platform', 'testToken'], 'eachOf', teishi.test.equal],
         ['body.token', b.token, 'string'],
         ENV ? [] : ['body.testToken', b.testToken, 'object'],
         ['body.platform', b.platform, ['android', 'ios'], 'oneOf', teishi.test.equal],
      ])) return;

      if (! ENV && b.testToken) {
         rs.oauthUser = b.testToken;
         return H.oauthSignin (rq, rs, 'google');
      }

      a.seq ([
         [H.getGooglePublicKeys],
         function (s) {
            if (s.error) return reply (rs, 500, {error: 'Could not retrieve the Google Auth keys', details: s.error});

            var keys = s.last;
            var decodedHeader = jwt.decode (b.token, {complete: true});
            var key = dale.stopNot (keys, undefined, function (key) {
               if (key.kid === decodedHeader.header.kid) return key;
            });

            if (! key) return reply (rs, 401, {error: 'Invalid token'});
            // <3 https://stackoverflow.com/questions/72616533/how-to-verify-an-apple-jwt-using-a-public-key/78652065#78652065
            key = crypto.createPublicKey ({key, format: 'jwk'});

            var user;
            try {
               // Yep, we need to use web, not android, for the android audience.
               user = jwt.verify (b.token, key, {algorithms: ['RS256'], audience: SECRET.google.oauth.login [(b.platform === 'android' ? 'web' : b.platform) + 'ClientId']});
            }
            catch (error) {
               reply (rs, 401, {error: 'Invalid user'});
            }

            if (! user) return reply (rs, 401, {error: 'Invalid user', user: user});

            rs.oauthUser = user;
            H.oauthSignin (rq, rs, 'google');
         }
      ]);
   }],

   // Apple only wants to use POST when sending an id_token, for security reasons.
   ['post', 'auth/signin/web/apple', function (rq, rs) {

      var reportError = function (error) {
         notify (a.creat (), {priority: 'important', type: 'signin-apple', ip: rq.origin, userAgent: rq.headers ['user-agent'], error: error});
         return reply (rs, 302, {}, {location: CONFIG.domain + '#/login/apple/error'});
      }

      if (! rq.data.fields || ! rq.data.fields.id_token) return reportError ('No id_token in the form');

      var token = rq.data.fields.id_token;

      // This is almost the same code that I wrote below for POST auth/signin/mobile/apple (minus the audience and the error reporting)
      // Implementing this oauth flow has been harrowingly demoralizing, so I'm not going to refactor it to avoid copy/paste, at least not for now.
      a.seq ([
         [H.getApplePublicKeys],
         function (s) {
            if (s.error) return reply (rs, 500, {error: 'Could not retrieve the Apple Auth keys', details: s.error});

            var keys = s.last;
            var decodedHeader = jwt.decode (token, {complete: true});
            var key = dale.stopNot (keys, undefined, function (key) {
               if (key.kid === decodedHeader.header.kid) return key;
            });

            if (! key) return reportError ('Invalid token');
            // <3 https://stackoverflow.com/questions/72616533/how-to-verify-an-apple-jwt-using-a-public-key/78652065#78652065
            key = crypto.createPublicKey ({key, format: 'jwk'});

            var user;
            try {
               user = jwt.verify (token, key, {algorithms: ['RS256'], audience: 'nl.altocode.tagaway.login'});
            }
            catch (error) {
               reportError (error);
            }

            if (! user) return reportError ('Invalid user');

            rs.oauthUser = user;
            H.oauthSignin (rq, rs, 'apple', true);
         }
      ]);
   }],


   ['post', 'auth/signin/mobile/apple', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ENV ? ['token'] : ['token', 'testToken'], 'eachOf', teishi.test.equal],
         ['body.token', b.token, 'string'],
         ENV ? [] : ['body.testToken', b.testToken, 'object'],
      ])) return;

      if (! ENV && b.testToken) {
         rs.oauthUser = b.testToken;
         return H.oauthSignin (rq, rs, 'apple');
      }

      a.seq ([
         [H.getApplePublicKeys],
         function (s) {
            if (s.error) return reply (rs, 500, {error: 'Could not retrieve the Apple Auth keys', details: s.error});

            var keys = s.last;
            var decodedHeader = jwt.decode (b.token, {complete: true});
            var key = dale.stopNot (keys, undefined, function (key) {
               if (key.kid === decodedHeader.header.kid) return key;
            });

            if (! key) return reply (rs, 401, {error: 'Invalid token'});
            // <3 https://stackoverflow.com/questions/72616533/how-to-verify-an-apple-jwt-using-a-public-key/78652065#78652065
            key = crypto.createPublicKey ({key, format: 'jwk'});

            var user;
            try {
               user = jwt.verify (b.token, key, {algorithms: ['RS256'], audience: 'nl.altocode.tagaway'});
            }
            catch (error) {
               reply (rs, 401, {error: 'Invalid user'});
            }

            if (! user) return reply (rs, 401, {error: 'Invalid user', user: user});

            rs.oauthUser = user;
            H.oauthSignin (rq, rs, 'apple');
         }
      ]);
   }],

   // *** GATEKEEPER FUNCTION ***

   ['all', '*', function (rq, rs) {

      if (rq.url.match (/^\/redmin/) && ! ENV) return rs.next ();

      if (rq.method === 'get'  && rq.url === '/stats') return rs.next ();

      if (! rq.data.cookie)                               return reply (rs, 403, {error: 'nocookie'});
      if (! rq.data.cookie [CONFIG.cookieName]) {
         if (rq.headers.cookie.match (CONFIG.cookieName)) return reply (rs, 403, {error: 'tampered'});
                                                          return reply (rs, 403, {error: 'nocookie'});
      }

      giz.auth (rq.data.cookie [CONFIG.cookieName], function (error, user) {
         if (error) {
            if (error === 'User not found') return reply (rs, 403, {error: 'session'});
            else                            return reply (rs, 500, {error: error});
         }
         if (! user) return reply (rs, 403, {error: 'session'});

         rs.log.username = user.username;
         rq.user         = user;

         if ((rq.url.match (/^\/admin/) || rq.url.match (/^\/redmin/)) && ! inc (SECRET.admins, rq.user.email)) return reply (rs, 403);

         astop (rs, [
            [H.stat.w, [
               ['unique', 'active',    user.username],
               ['flow',   'rq-user-' + user.username, 1],
            ]],
            [Redis, 'hset',   'users:' + user.username, 'lastActivity', Date.now ()],
            [Redis, 'expire', 'csrf:'  + rq.data.cookie [CONFIG.cookieName], giz.config.expires],
            [Redis, 'get',    'csrf:'  + rq.data.cookie [CONFIG.cookieName]],
            function (s) {
               rq.user.csrf = s.last;
               rs.next ();
            }
         ]);
      });
   }],

   // *** CSRF PROTECTION ***

   ['get', 'auth/csrf', function (rq, rs) {
      reply (rs, 200, {csrf: rq.user.csrf});
   }],

   ['post', '*', function (rq, rs) {

      if (rq.url.match (/^\/redmin/)) return rs.next ();

      var ctype = rq.headers ['content-type'] || '';
      if (ctype.match (/^multipart\/form-data/i)) {
         if (rq.data.fields.csrf !== rq.user.csrf) return reply (rs, 403, {error: 'csrf'});
         delete rq.data.fields.csrf;
      }
      else {
         if (type (rq.body) !== 'object') return reply (rs, 400, {error: 'body should have as type object but instead is ' + JSON.stringify (rq.body) + ' with type ' + type (rq.body)});
         if (rq.body.csrf !== rq.user.csrf)    return reply (rs, 403, {error: 'csrf'});
         delete rq.body.csrf;
      }
      rs.next ();
   }],

   // *** LOGOUT ***

   ['post', 'auth/logout', function (rq, rs) {
      astop (rs, [
         [a.make (giz.logout), rq.data.cookie [CONFIG.cookieName]],
         [H.log, rq.user.username, {ev: 'auth', type: 'logout', ip: rq.origin, userAgent: rq.headers ['user-agent']}],
         [Redis, 'del', 'csrf:' + rq.data.cookie [CONFIG.cookieName]],
         // Firefox throws a console error if it receives an empty body.
         [reply, rs, 200, {}, {'set-cookie': cicek.cookie.write (CONFIG.cookieName, false, {httponly: true, samesite: 'Lax', path: '/'})}],
      ]);
   }],

   // *** DELETE ACCOUNT ***

   ['post', 'auth/delete', function (rq, rs) {

      var b = rq.body;

      if (b.username !== undefined && type (b.username) !== 'string') return reply (rs, 400, 'body.user must be either undefined or a string.');

      // Only admins can delete another user.
      if (b.username !== undefined && ! inc (SECRET.admins, rq.user.email)) return reply (rs, 403);

      astop (rs, [
         [function (s) {
            if (b.username === undefined) return s.next (rq.user);
            Redis (s, 'hgetall', 'users:' + b.username);
         }],
         function (s) {
            if (! s.last) return reply (rs, 404);
            var user = s.last;
            a.seq (s, [
               [a.set, 'allPivs',   [Redis, 'smembers', 'tag:' + user.username + ':a::']],
               // TODO: add this logic back after enabling sharing! These lookups are expensive, so we temporarily turn them off. These will be replaced by sets of keys with hashtags and taghashes.
               ENV ? [] : [a.set, 'hashtags',  [redis.keyscan, 'hashtag:' + rq.user.username + ':*']],
               ENV ? [] : [a.set, 'taghashes', [redis.keyscan, 'taghash:' + rq.user.username + ':*']],
               [a.make (giz.destroy), user.username],
               function (s) {
                  a.fork (s, s.allPivs, function (piv) {
                     return [H.deletePiv, piv, user.username];
                  }, {max: os.cpus ().length});
               },
               [H.stat.w, 'flow', 'users', -1],
               function (s) {
                  var multi = redis.multi ();
                  if (b.username === undefined) multi.del ('csrf:' + rq.data.cookie [CONFIG.cookieName]);
                  multi.del ('email:'  + user.email);
                  multi.del ('oauth:google:'+ user.googleId);
                  multi.del ('oauth:apple:'+ user.appleId);
                  multi.del ('tags:' + user.username);
                  multi.del ('hometags:' + user.username);

                  // hash and hashorig entries are deleted incrementally when deleting each piv.
                  multi.del ('hashdel:'     + user.username);
                  multi.del ('hashorigdel:' + user.username);
                  dale.go (['g', 'd'], function (v) {
                     multi.del ('hashdel:' + user.username + ':' + v);
                     multi.del ('oa:' + v + ':acc:' + user.username);
                     multi.del ('oa:' + v + ':ref:' + user.username);
                     multi.del ('imp:' + v + ':' + user.username);
                  });
                  multi.del ('shm:'        + user.username);
                  multi.del ('sho:'        + user.username);
                  multi.del ('ulog:'       + user.username);
                  multi.del ('querycache:' + user.username);
                  multi.srem ('users', user.username);
                  // TODO: add this logic back after enabling sharing! These lookups are expensive, so we temporarily turn them off. These will be replaced by sets of keys with hashtags and taghashes.
                  if (! ENV) dale.go (s.hashtags.concat (s.taghashes), function (v) {multi.del (v)});
                  mexec (s, multi);
               },
               // TODO: delete all sessions and CSRF tokens belonging to the user
               b.username === undefined ? [a.make (giz.logout), rq.data.cookie [CONFIG.cookieName]] : [],
               [notify, {priority: 'important', type: 'delete', user: b.username || rq.user.username, ip: rq.origin, userAgent: rq.headers ['user-agent'], triggeredByAdmin: b.username !== undefined ? true : undefined}],
               [H.log, user.username, {ev: 'auth', type: 'delete', ip: rq.origin, userAgent: rq.headers ['user-agent'], triggeredByAdmin: b.username !== undefined ? true : undefined}],
               [reply, rs, 200, '', b.username === undefined ? {'set-cookie': cicek.cookie.write (CONFIG.cookieName, false, {httponly: true, samesite: 'Lax', path: '/'})} : {}],
            ]);
         }
      ]);
   }],

   // *** CHANGE PASSWORD ***

   ['post', 'auth/changePassword', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['old', 'new'], 'eachOf', teishi.test.equal],
         function () {return [
            ['body.old', b.old,     'string'],
            ['body.new', b ['new'], 'string']
         ]},
         function () {return ['password', b ['new'].length, {min: 6}, teishi.test.range]},
      ])) return;

      giz.db.hget ('users', rq.user.username, 'pass', function (error, hash) {
         if (error) return reply (rs, 500, {error: error});
         if (hash === null) return reply (rs, 500, {error: 'User doesn\'t exist.'});
         require ('bcryptjs').compare (b ['old'], hash, function (error, result) {
            if (error || ! result) return reply (rs, 403);
            giz.reset (rq.user.username, true, b ['new'], function (error) {
               if (error) return reply (rs, 500, {error: error});
               astop (rs, [
                  [H.log, rq.user.username, {ev: 'auth', type: 'passwordChange', ip: rq.origin, userAgent: rq.headers ['user-agent']}],
                  [reply, rs, 200],
               ]);
            });
         });
      });
   }],

   // *** CLIENT ERRORS (FROM LOGGED-IN USERS) ***

   ['post', 'error', function (rq, rs) {
      var report = {priority: 'critical', type: 'client error in browser', ip: rq.origin, user: rq.user.username, userAgent: rq.headers ['user-agent'], error: rq.body};
      astop (rs, [
         [notify, report],
         [reply, rs, 200, ENV ? {} : report],
      ]);
   }],

   // *** ACCOUNT ***

   ['get', 'account', function (rq, rs) {
      astop (rs, [
         [function (s) {
            var multi = redis.multi ();
            multi.get ('stat:f:byfs-' + rq.user.username);
            multi.get ('stat:f:bys3-' + rq.user.username);
            multi.get ('geo:'         + rq.user.username);
            // We only return logs for testing purposes
            if (! ENV) multi.lrange ('ulog:' + rq.user.username, 0, -1);
            mexec (s, multi);
         }],
         function (s) {
            var limit = parseInt (rq.user.spaceLimit) || CONFIG.freeSpace;
            if (ENV !== 'prod' && inc (SECRET.admins, rq.user.email)) limit = 1000 * 1000 * 1000 * 1000;

            reply (rs, 200, {
               username:  rq.user.username,
               email:     rq.user.email,
               firstName: rq.user.firstName,
               lastName:  rq.user.lastName,
               googleId:  rq.user.googleId,
               appleId:   rq.user.appleId,
               created:   parseInt (rq.user.created),
               usage:    {
                  limit:  limit,
                  byfs: parseInt (s.last [0]) || 0,
                  bys3: parseInt (s.last [1]) || 0,
               },
               geo:               rq.user.geo               ? true : undefined,
               geoInProgress:     s.last [2]                ? true : undefined,
               suggestSelection:  rq.user.suggestSelection  ? true : undefined,
               onboarding:        rq.user.onboarding        ? true : undefined,
               // We only return logs for testing purposes
               logs:              ENV ? undefined : dale.go (s.last [3], JSON.parse).reverse ()
            });
         }
      ]);
   }],

   // *** FEEDBACK COLLECTION ***

   ['post', 'feedback', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['message'], 'eachOf', teishi.test.equal],
         ['body.message', b.message, 'string'],
      ])) return;

      astop (rs, [
         [notify, {priority: 'important', type: 'feedback', user: rq.user.username, message: b.message}],
         [sendmail, {
            to1:     rq.user.username,
            to2:     rq.user.email,
            subject: CONFIG.etemplates.feedback.subject,
            message: CONFIG.etemplates.feedback.message (rq.user.username, b.message)
         }],
         [reply, rs, 200],
      ]);
   }],

   // *** RETRIEVE ORIGINAL PIV (FOR TESTING PURPOSES ONLY) ***

   ['get', 'original/:id', function (rq, rs) {
      if (ENV) return reply (rs, 400);
      a.seq ([
         [H.s3get, Path.join (H.hash (rq.user.username), rq.data.params.id)],
         function (s) {
            if (! s.error) return rs.end (s.last);
            if (s.error.code === 'NoSuchKey') return reply (rs, 404);
            reply (rs, 500, {error: s.error});
         }
      ]);
   }],

   // *** DOWNLOAD PIVS ***

   ['get', 'piv/:id', function (rq, rs) {
      astop (rs, [
         [a.cond, [a.set, 'piv', [H.hasAccess, rq.user.username, rq.data.params.id], true], {false: [reply, rs, 404]}],
         [Redis, 'hincrby', 'piv:' + rq.data.params.id, 'xp', 1],
         function (s) {
            // We base etags solely on the id of the file; this requires files to never be changed once created. This is the case here.
            var etag = cicek.etag (s.piv.id, true), headers = {etag: etag, 'content-type': mime.getType (s.piv.format.split (':') [0])};
            if (rq.headers ['if-none-match'] === etag) return reply (rs, 304, '', headers);

            // https://stackoverflow.com/questions/93551/how-to-encode-the-filename-parameter-of-content-disposition-header-in-http
            if (rq.data.query && rq.data.query.original) {
               headers ['content-disposition'] = 'attachment; filename=' + encodeURIComponent (s.piv.name);
               headers ['last-modified'] = new Date (JSON.parse (s.piv.dates) ['upload:lastModified']).toUTCString ();
            }

            if (s.piv.vid && s.piv.vid.match (/pending/)) return reply (rs, 404, 'pending');
            if (s.piv.vid && s.piv.vid.match (/error/))   return reply (rs, 500, 'error');

            // If there are no range headers, we directly serve the piv.
            if (! rq.headers.range) {
               // If the piv is not a video, or it is a mp4 video, or the original video is required, and no valid range header is present is required, we serve the file.
               if (! s.piv.vid || s.piv.vid === '1' || (rq.data.query && rq.data.query.original)) return cicek.file (rq, rs, Path.join (H.hash (s.piv.owner), s.piv.id), [CONFIG.basepath], headers);

               // We serve the mp4 version of the video.
               headers ['content-type'] = mime.getType ('mp4');
               return cicek.file (rq, rs, Path.join (H.hash (s.piv.owner), s.piv.vid), [CONFIG.basepath], headers);
            }

            var rangeHeader = rq.headers.range.replace ('bytes=', '').split ('-');
            if (rangeHeader.length !== 2) return reply (rs, 400, {error: 'Invalid range'});
            var start = parseInt (rangeHeader [0]), end = parseInt (rangeHeader [1]);
            if (type (start) !== 'integer' || start < 0 || (! isNaN (end) && end <= start)) return reply (rs, 400, {error: 'Invalid range'});

            // If this is a non-mp4 video and the original is not requested, we serve the mp4 version
            if (s.piv.vid && s.piv.vid !== '1' && ! (rq.data.query || {}).original) {
               var path = Path.join (CONFIG.basepath, H.hash (s.piv.owner), s.piv.vid),  size = s.piv.bymp4;
               headers ['content-type'] = mime.getType ('mp4');
            }
            else var path = Path.join (CONFIG.basepath, H.hash (s.piv.owner), s.piv.id), size = s.piv.byfs;

            if (start >= size) return reply (rs, 400, {error: 'Invalid range'});

            var defaultChunkSize = 3000000;
            if (isNaN (end)) end = Math.min (size - 1, start + defaultChunkSize - 1);
            if (end > size - 1)  end = size - 1;

            headers ['content-length'] = end - start + 1;
            headers ['accept-ranges']  = 'bytes';
            headers ['content-range']  = 'bytes ' + start + '-' + end + '/' + size;

            var stream = fs.createReadStream (path, {start: start, end: end}), error;
            // TODO: pass stream to cicek.file when it adds support for it
            stream.on ('error', function (error) {
               error = true;
               reply (rs, 500, {error: error});
            });
            rs.writeHead (206, headers);
            stream.on ('end', function () {
               if (! error) cicek.apres (rs);
            });
            stream.pipe (rs);
         }
      ]);
   }],

   ['get', 'thumb/:size/:id', function (rq, rs) {
      if (! inc (['S', 'M'], rq.data.params.size)) return reply (rs, 400);
      astop (rs, [
         [a.cond, [a.set, 'piv', [H.hasAccess, rq.user.username, rq.data.params.id], true], {false: [reply, rs, 404]}],
         [Redis, 'hincrby', 'piv:' + rq.data.params.id, rq.data.params.size === 'S' ? 'xthumbS' : 'xthumbM', 1],
         function (s) {
            // If there's no thumbnail of the specified size, we return the small thumbnail. If there's no small thumbnail of the requested size, we return the original piv instead.
            var id;
            // If the piv is a jpeg, serve the requested thumbnail; if it's not present, serve the original file.
            if (s.piv.format === 'jpeg') id = s.piv ['thumb' + rq.data.params.size] || s.piv.id;
            // If the piv is a gif and we request the medium one (M), serve the original file.
            else if (s.piv.format === 'gif' && rq.data.params.size === 'M') id = s.piv.id;
            // Else, serve the requested thumbnail, and if there's none, the small thumbnail.
            else id = s.piv ['thumb' + rq.data.params.size] || s.piv.thumbS;

            var format = 'jpeg';
            if (rq.data.params.size === 'M' && s.piv.format === 'gif') format = 'gif';

            // We base etags solely on the id of the file; this requires files to never be changed once created. This is the case here.
            var etag = cicek.etag (id, true), headers = {etag: etag, 'content-type': mime.getType (format)};
            if (rq.headers ['if-none-match'] === etag) return reply (rs, 304, '', headers);
            cicek.file (rq, rs, Path.join (H.hash (s.piv.owner), id), [CONFIG.basepath], headers);
         }
      ]);
   }],

   // *** UPLOAD ***

   ['get', 'uploads', function (rq, rs) {
      astop (rs, [
         [H.getUploads, rq.user.username, {provider: null}, 20],
         function (s) {
            reply (rs, 200, s.last);
         }
      ]);
   }],

   ['post', 'upload', function (rq, rs) {

      var b = rq.body, t = Date.now ();

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['op', 'provider'].concat ({start: ['tags', 'total', 'tooLarge', 'unsupported', 'alreadyImported'], error: ['id', 'error']} [b.op] || ['id']), 'eachOf', teishi.test.equal],
         ['body.op',  b.op,  ['start', 'complete', 'cancel', 'wait', 'error'], 'oneOf', teishi.test.equal],
         ['body.provider', b.provider, [undefined, 'google', 'dropbox'], 'oneOf', teishi.test.equal],
         b.op !== 'start' ? ['id', b.id, 'integer'] : [
            ['tags', 'tooLarge', 'unsupported'].map (function (key) {
               return [
                  ['body.' + key, b [key], ['undefined', 'array'], 'oneOf'],
                  ['body.' + key, b [key], 'string', 'each'],
               ];
            }),
            ['body.total', b.total, 'integer'],
            // Range is years 1970-2100
            ['body.total', b.total, {min: 0}, teishi.test.range],
            ['body.alreadyImported', b.alreadyImported, ['integer', 'undefined'], 'oneOf'],
            b.alreadyImported === undefined ? [] : ['body.alreadyImported', b.alreadyImported, {min: 1}, teishi.test.range],
         ],
         b.op !== 'error' ? [] : ['body.error', b.error, 'object']
      ])) return;

      if (b.provider && rq.origin !== '::ffff:127.0.0.1') return reply (rs, 403);

      var invalidTag;
      if (b.tags && b.tags.length) b.tags = dale.go (b.tags, function (tag) {
         if (! H.isUserTag (tag)) return invalidTag = true;
         return H.trim (tag);
      });

      if (invalidTag) return reply (rs, 400, {error: 'invalid tag'});

      if (b.op === 'start') b.id = t;

      astop (rs, [
         [H.getUploads, rq.user.username, {id: b.id}],
         function (s) {
            if (b.op === 'wait') {
               if (! s.last.length)                                     return reply (rs, 404, {error: 'upload'});
               if (! inc (['uploading', 'stalled'], s.last [0].status)) return reply (rs, 409, {error: 'status: ' + s.last [0].status});
            }
            else if (inc (['complete', 'cancel'], b.op)) {
               if (! s.last.length)                   return reply (rs, 404, {error: 'upload'});
               if (s.last [0].status !== 'uploading') return reply (rs, 409, {error: 'status: ' + s.last [0].status});
            }
            if (b.op === 'start') b.id = t;
            if (b.op === 'error') b.fromClient = true;
            b.ev   = 'upload';
            b.type = b.op;
            delete b.op;
            H.log (s, rq.user.username, b);
         },
         function (s) {
            reply (rs, 200, {id: b.id});
         }
      ]);
   }],

   ['post', 'uploadCheck', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['id', 'hash', 'name', 'size', 'lastModified', 'tags'], 'eachOf', teishi.test.equal],
         ['body.id',   b.id,   'integer'],
         ['body.hash', b.hash, 'string'],
         ['body.name', b.name, 'string'],
         ['body.size', b.size, 'integer'],
         ['body.size', b.size, {min: 0}, teishi.test.range],
         ['body.lastModified', b.lastModified, 'integer'],
         ['body.lastModified', b.lastModified, {min: 0}, teishi.test.range],
         ['body.tags', b.tags, ['undefined', 'array'], 'oneOf'],
         ['body.tags', b.tags, 'string', 'each'],
      ])) return;

      var invalidTag;

      b.tags = dale.go (b.tags, function (tag) {
         if (! H.isUserTag (tag)) invalidTag = true;
         return H.trim (tag);
      });

      if (invalidTag) return reply (rs, 400, {error: 'invalid tag'});

      astop (rs, [
         [H.getUploads, rq.user.username, {id: b.id}, null, true],
         function (s) {
            if (! s.last.length)                   return reply (rs, 404, {error: 'upload'});
            if (s.last [0].status !== 'uploading') return reply (rs, 409, {error: 'status: ' + s.last [0].status});
            s.upload = s.last [0];
            s.next ();
         },
         [a.cond, [Redis, 'hget', 'hashorig:' + rq.user.username, b.hash], {
            'null': [reply, rs, 200, {repeated: false}],
            'else': [
               [function (s) {
                  Redis (s, 'hgetall', 'piv:' + s.last);
               }],
               function (s) {
                  s.piv = s.last;
                  H.addTags (s, b.tags, rq.user.username, s.piv.id);
               },
               function (s) {
                  // An alreadyUploaded file is the first file in an upload for which the name and the original hash of an existing file is already in the system. The second file, if any, is considered as repeated.
                  s.alreadyUploaded = b.name === s.piv.name && ! inc (s.upload.listAlreadyUploaded, s.piv.id);
                  // Since the metadata of this piv is identical to that of an already uploaded piv, the only different date can be provided in the lastModified field.
                  H.updateDates (s, s.alreadyUploaded ? 'alreadyUploaded' : 'repeated', s.piv, b.name, b.lastModified);
               },
               function (s) {
                  if (s.alreadyUploaded) H.log (s, rq.user.username, {ev: 'upload', type: 'alreadyUploaded', id: b.id, pivId: s.piv.id, tags: b.tags && b.tags.length ? b.tags : undefined, lastModified: b.lastModified});
                  else                   H.log (s, rq.user.username, {ev: 'upload', type: 'repeated',        id: b.id, pivId: s.piv.id, tags: b.tags && b.tags.length ? b.tags : undefined, lastModified: b.lastModified, name: b.name, size: b.size, identical: true});
               },
               [reply, rs, 200, {repeated: true}]
            ]
         }]
      ]);
   }],

   ['post', 'piv', function (rq, rs) {

      if (! (rq.headers ['content-type'] || '').match (/^multipart\/form-data/i)) return reply (rs, 400, {error: 'multipart'});

      if (teishi.stop (['fields', dale.keys (rq.data.fields), ['id', 'lastModified', 'tags', 'importData'], 'eachOf', teishi.test.equal], function () {})) return reply (rs, 400, {error: 'invalidField'});

      if (! rq.data.fields.id)                 return reply (rs, 400, {error: 'id'});
      if (! rq.data.fields.id.match (/^\d+$/)) return reply (rs, 400, {error: 'id'});
      rq.data.fields.id = parseInt (rq.data.fields.id);

      if (! rq.data.fields.lastModified)                 return reply (rs, 400, {error: 'lastModified'});
      if (! rq.data.fields.lastModified.match (/^\d+$/)) return reply (rs, 400, {error: 'lastModified'});
      var lastModified = parseInt (rq.data.fields.lastModified);

      if (rq.data.fields.tags === undefined) rq.data.fields.tags = '[]';
      var tags = teishi.parse (rq.data.fields.tags), invalidTag;
      if (type (tags) !== 'array') return reply (rs, 400, {error: 'tags'});
      tags = dale.go (tags, function (tag) {
         if (type (tag) !== 'string' || ! H.isUserTag (tag)) {
            invalidTag = true;
            return;
         }
         return H.trim (tag);
      });
      if (invalidTag) return reply (rs, 400, {error: 'invalid tag'});

      var importData;
      if (rq.data.fields.importData !== undefined) {
         if (rq.origin !== '::ffff:127.0.0.1') return reply (rs, 403);
         importData = teishi.parse (rq.data.fields.importData);
      }

      if (! eq (dale.keys (rq.data.files), ['piv'])) return reply (rs, 400, {error: 'file'});
      if (type (rq.data.files.piv) !== 'string') return reply (rs, 400, {error: 'invalidFile'});

      var path = rq.data.files.piv;

      var piv = {
         id:     uuid (),
         owner:  rq.user.username,
         name:   importData ? importData.name : Path.basename (path).slice (Path.basename (path).indexOf ('_') + 1),
         dateup: Date.now (),
      };

      var newpath = Path.join (CONFIG.basepath, H.hash (rq.user.username), piv.id);

      var perf = [['init', Date.now ()]], perfTrack = function (s, label) {
         perf.push ([label, Date.now ()]);
         s.next (s.last);
      }
      // input can be either an async sequence (array) or an error per se (object)
      var invalidHandler = function (s, input) {
         var cbError = function (error) {
            astop (rs, [
               // We store invalid pivs in a folder for manual review if they are salvageable (review happens only if the owner grants us permission to do so)
               [H.mkdirif, Path.join (CONFIG.invalidPath, H.hash (rq.user.username))],
               [a.stop, [a.make (fs.stat), path], function (s, error) {
                  if (error.code === 'ENOENT') return s.next ('newpath');
                  s.next (null, error);
               }],
               function (s) {
                  var invalidPiv = s.last === 'newpath' ? newpath : path;
                  k (s, 'cp', invalidPiv, Path.join (CONFIG.invalidPath, H.hash (rq.user.username), Path.basename (path)));
               },
               // If there's a file at `path`, it will be removed by cicek automatically.
               [H.unlink, newpath, true],
               ! s.thumbS ? [] : [H.unlink, Path.join (Path.dirname (newpath), s.thumbS), true],
               ! s.thumbM ? [] : [H.unlink, Path.join (Path.dirname (newpath), s.thumbM), true],
               ! s.raceConditionHashorig ? [] : [Redis, 'del', 'raceConditionHashorig:' + rq.user.username + ':' + s.hashorig],
               ! s.raceConditionHash     ? [] : [Redis, 'del', 'raceConditionHash:'     + rq.user.username + ':' + s.hash],
               [H.log, rq.user.username, {ev: 'upload', type: 'invalid', id: rq.data.fields.id, provider: importData ? importData.provider : undefined, name: piv.name, error: error}],
               [reply, rs, 400, {error: 'Invalid piv', data: error, name: piv.name}],
            ]);
         }
         // If input is an async sequence, we return another async sequence
         if (type (input) === 'array') return a.stop (s, input, function (s, error) {
            cbError (error);
         });
         // Otherwise, we invoke cbError with the error directly
         else cbError (input);
      }

      a.stop ([
         [H.getUploads, rq.user.username, {id: rq.data.fields.id}, null, true],
         function (s) {
            if (! s.last.length)                   return reply (rs, 404, {error: 'upload'});
            if (s.last [0].status !== 'uploading') return reply (rs, 409, {error: 'status: ' + s.last [0].status});
            s.upload = s.last [0];
            s.next ();
         },
         // In case of an import, overwrite the dummy file with the actual piv
         ! importData ? [] : [
            [k, 'cp', importData.path, path],
            [H.unlink, importData.path]
         ],
         [a.set, 'byfs', [a.make (fs.stat), path]],
         function (s) {
            if (s.byfs.size <= CONFIG.maxFileSize) return s.next ();
            a.seq (s, [
               [H.log, rq.user.username, {ev: 'upload', type: 'tooLarge', id: rq.data.fields.id, provider: importData ? importData.provider : undefined, name: piv.name, size: s.byfs.size}],
               [reply, rs, 400, {error: 'tooLarge', name: piv.name}]
            ]);
         },
         [Redis, 'get', 'stat:f:byfs-' + rq.user.username],
         function (s) {
            var used = parseInt (s.last) || 0;
            var limit = parseInt (rq.user.spaceLimit) || CONFIG.freeSpace;
            if (ENV !== 'prod' && inc (SECRET.admins, rq.user.email)) limit = 1000 * 1000 * 1000 * 1000;
            if (used + s.byfs.size >= limit) return a.seq (s, [
               [H.log, rq.user.username, {ev: 'upload', type: 'noCapacity', id: rq.data.fields.id, provider: importData ? importData.provider : undefined}],
               [reply, rs, 409, {error: 'capacity'}]
            ]);
            s.next ();
         },
         [perfTrack, 'initial'],

         // *** METADATA ***

         [invalidHandler, [H.getMetadata, path, false, lastModified, piv.name]],
         function (s) {

            if (! inc (CONFIG.allowedFormats, s.last.mimetype)) return astop (rs, [
               [H.log, rq.user.username, {ev: 'upload', type: 'unsupported', id: rq.data.fields.id, provider: importData ? importData.provider : undefined, name: piv.name}],
               [reply, rs, 400, {error: 'format'}]
            ]);

            // Add fields: piv.dimw, piv.dimh, piv.format, piv.deg, piv.dates, piv.loc, piv.date, piv.dateSource
            dale.go (s.last, function (v, k) {
               if (k === 'isVid' || k === 'mimetype') return;
               piv [k] = v;
            });

            if (s.last.isVid) {
               // If the format is mp4, we put a truthy placeholder in piv.vid; otherwise, we create an id to point to the mp4 version of the video.
               if (s.last.format.slice (0, 3) === 'mp4') piv.vid = 1;
               else                                      piv.vid = uuid ();
            }

            // If we're working with a video, format is CONTAINER:STREAMFORMAT1:..., so we just keep the container format for the extension of the path we'll use for creating a copy of the piv without metadata.
            // Otherwise, we use the format itself for pictures.
            s.hashpath = path + '.' + piv.format.split (':') [0]

            // If date is earlier than 1990, report it but carry on.
            if (piv.date < new Date ('1990-01-01').getTime ()) notify (a.creat (), {priority: 'important', type: 'old date in piv', user: rq.user.username, dates: piv.dates, dateSource: piv.dateSource, name: piv.name});

            s.next ();
         },
         [perfTrack, 'metadata'],
         [a.set, 'hashorig', function (s) {
            fs.readFile (path, function (error, file) {
               if (error) return s.next (null, error);
               // hash is the actual hash concatenated with the size of the file, to avoid collisions on files of different lengths
               s.next (hash (file) + ':' + s.byfs.size);
               // We remove the reference to the buffer to free memory.
               file = null;
            });
         }],
         function (s) {
            var multi = redis.multi ();
            multi.hget  ('hashorig:' + rq.user.username, s.hashorig);
            multi.get   ('raceConditionHashorig:' + rq.user.username + ':' + s.hashorig);
            multi.setnx ('raceConditionHashorig:' + rq.user.username + ':' + s.hashorig, piv.id);
            mexec (s, multi);
         },
         function (s) {
            if (s.last [2]) s.raceConditionHashorig = true;
            if (! s.last [0] && ! s.last [1]) return s.next ();

            // If there's currently a piv being uploaded right now that is identical to this one, we consider this piv to be repeated. It could technically be alreadyUploaded instead of repeated if it came from a different simultaneous upload, but we can ignore this case because of how unlikely it is.
            // In the very unlikely case that this piv belongs to a different upload, we would be losing the tags from this piv. A future improvement could leave those tags in Redis temporarily so they could be picked up by the other identical piv once its upload is finished.
            if (! s.last [0] && s.last [1]) return a.seq (s, [
               [H.log, rq.user.username, {ev: 'upload', type: 'repeated', id: rq.data.fields.id, provider: importData ? importData.provider : undefined, pivId: s.last [1], tags: tags.length ? tags : undefined, lastModified: lastModified, name: piv.name, size: s.byfs.size, identical: true}],
               [reply, rs, 200, {id: s.last [1], repeated: true, hash: s.hashorig}]
            ]);

            // If we are here, this user already has an identical piv already uploaded.
            // The two modifications possible to the original piv are tags and dates.
            a.seq (s, [
               ! s.raceConditionHashorig ? [] : [Redis, 'del', 'raceConditionHashorig:' + rq.user.username + ':' + s.hashorig],
               [Redis, 'hgetall', 'piv:' + s.last [0]],
               function (s) {
                  s.piv = s.last;
                  H.addTags (s, tags, rq.user.username, s.piv.id);
               },
               function (s) {
                  // An alreadyUploaded file is the first file in an upload for which the name and the original hash of an existing file is already in the system, but not in the same upload. The second file, if any, is considered as repeated.
                  // In the case of an import, any repetition is considered a repetition, not an alreadyUploaded, since the mechanism for bringing the piv is not an upload.
                  s.alreadyUploaded = ! importData && piv.name === s.piv.name && ! inc (s.upload.listAlreadyUploaded, s.piv.id);
                  // Since the metadata of this piv is identical to that of an already uploaded piv, the only different date can be provided in the lastModified field.
                  H.updateDates (s, s.alreadyUploaded ? 'alreadyUploaded' : 'repeated', s.piv, piv.name, lastModified);
               },
               function (s) {
                  if (s.alreadyUploaded) H.log (s, rq.user.username, {ev: 'upload', type: 'alreadyUploaded', id: rq.data.fields.id, provider: importData ? importData.provider : undefined, pivId: s.piv.id, tags: tags.length ? tags : undefined, lastModified: lastModified});
                  else                   H.log (s, rq.user.username, {ev: 'upload', type: 'repeated',        id: rq.data.fields.id, provider: importData ? importData.provider : undefined, pivId: s.piv.id, tags: tags.length ? tags : undefined, lastModified: lastModified, name: piv.name, size: s.byfs.size, identical: true});
               },
               function (s) {
                  reply (rs, 200, {id: s.piv.id, alreadyUploaded: s.alreadyUploaded ? true : undefined, repeated: s.alreadyUploaded ? undefined : true, hash: s.hashorig});
               }
            ]);
         },
         function (s) {
            // We compute the hash of the piv with stripped metadata
            if (piv.vid) a.stop (s, [k, 'ffmpeg', '-i', path, '-map_metadata', '-1', '-c:v', 'copy', '-c:a', 'copy', s.hashpath], function (s, error) {
               // If the error wasn't on the 3gp format, it's an unknown error.
               if (piv.format !== '.3gp') return invalidHandler (s, error);
               // Some 3gp files have an issue with ffmpeg for stripping the metadata. For these files, use the original file to compute the hash.
               return a.make (fs.copyFile) (s, path, s.hashpath);
            });
            else {
               // exiftool doesn't support removing metadata from bmp files, so we use the original file to compute the hash.
               if (piv.format === 'bmp') return s.next ();
               a.seq (s, [
                  [a.make (fs.copyFile), path, s.hashpath],
                  // For webp files we use exiv2 for removing the metadata from the comparison file because exif doesn't support writing webp files
                  [invalidHandler, piv.format !== 'webp' ? [k, 'exiftool', '-all=', '-overwrite_original', s.hashpath] : [k, 'exiv2', 'rm', s.hashpath]],
               ]);
            }
         },
         [a.set, 'byhash', function (s) {
            a.make (fs.stat) (s, piv.format === 'bmp' ? path : s.hashpath);
         }],
         [a.set, 'hash', function (s) {
            fs.readFile (piv.format === 'bmp' ? path : s.hashpath, function (error, file) {
               if (error) return s.next (null, error);
               // hash is the actual hash concatenated with the size of the file, to avoid collisions on files of different lengths
               s.next (hash (file) + ':' + s.byhash.size);
               // We remove the reference to the buffer to free memory.
               file = null;
            });
         }],
         function (s) {
            if (piv.format === 'bmp') return s.next ();
            H.unlink (s, s.hashpath);
         },
         function (s) {
            var multi = redis.multi ();
            multi.hget  ('hash:' + rq.user.username, s.hash);
            multi.get   ('raceConditionHash:' + rq.user.username + ':' + s.hash);
            multi.setnx ('raceConditionHash:' + rq.user.username + ':' + s.hash, piv.id);
            mexec (s, multi);
         },
         function (s) {
            if (s.last [2]) s.raceConditionHash = true;
            if (! s.last [0] && ! s.last [1]) return s.next ();

            // If there's currently a piv being uploaded right now that is identical to this one in its content but not its metadata, we consider this piv to be repeated.
            // In the very unlikely case that this piv belongs to a different upload, we would be losing the tags from this piv. More importantly, we could be losing valuable date metadata. A future improvement could leave those dates in Redis temporarily so they could be picked up by the other content-identical piv once its upload is finished.
            if (! s.last [0] && s.last [1]) return a.seq (s, [
               ! s.raceConditionHashorig ? [] : [Redis, 'del', 'raceConditionHashorig:' + rq.user.username + ':' + s.hashorig],
               [H.log, rq.user.username, {ev: 'upload', type: 'repeated', id: rq.data.fields.id, provider: importData ? importData.provider : undefined, pivId: s.last [1], tags: tags.length ? tags : undefined, lastModified: lastModified, name: piv.name, size: s.byfs.size, identical: true}],
               [reply, rs, 200, {id: s.last [1], repeated: true, hash: s.hashorig}],

            ]);

            // If we are here, this user already has a piv that is identical in its content, but not in its metadata.
            // As with identical pivs, the two modifications possible to the original piv are tags and dates.
            a.seq (s, [
               ! s.raceConditionHashorig ? [] : [Redis, 'del', 'raceConditionHashorig:' + rq.user.username + ':' + s.hashorig],
               ! s.raceConditionHash ? [] : [Redis, 'del', 'raceConditionHash:' + rq.user.username + ':' + s.hash],
               [Redis, 'hgetall', 'piv:' + s.last [0]],
               function (s) {
                  s.piv = s.last;
                  H.addTags (s, tags, rq.user.username, s.piv.id);
               },
               function (s) {
                  H.updateDates (s, 'repeated', s.piv, piv.name, lastModified, piv.dates);
               },
               function (s) {
                  H.log (s, rq.user.username, {ev: 'upload', type: 'repeated', id: rq.data.fields.id, provider: importData ? importData.provider : undefined, pivId: s.piv.id, tags: tags.length ? tags : undefined, lastModified: lastModified, name: piv.name, size: s.byfs.size, identical: false, dates: piv.dates});
               },
               function (s) {
                  reply (rs, 200, {id: s.piv.id, repeated: true, hash: s.hashorig});
               }
            ]);
         },
         [perfTrack, 'hash'],
         [H.mkdirif, Path.dirname (newpath)],
         [k, 'cp', path, newpath],
         [H.unlink, path],
         [perfTrack, 'fs'],
         // This function converts non-mp4 videos to mp4.
         function (s) {
            if (! piv.vid || piv.vid === 1) return s.next ();
            var id = piv.vid, start = Date.now ();
            piv.vid = 'pending:' + id;
            // Don't wait for conversion process, run it in new astack thread.
            s.next ();

            a.stop ([
               [Redis, 'hset', 'proc:vid', piv.id, Date.now ()],
               // TODO: add queuing to allow a maximum of N simultaneous conversions.
               // The AAC codec and the audio rate of 48000 seem to have the most compatibility with the mobile devices we tested
               [k, 'ffmpeg', '-i', newpath, '-vcodec', 'h264', '-brand', 'mp42', '-ar', '48000', '-codec:a', 'aac', Path.join (Path.dirname (newpath), id + '.mp4')],
               [a.make (fs.rename), Path.join (Path.dirname (newpath), id + '.mp4'), Path.join (Path.dirname (newpath), id)],
               [a.set, 'bymp4', [a.make (fs.stat), Path.join (Path.dirname (newpath), id)]],
               [Redis, 'hdel', 'proc:vid', piv.id],
               // Wait one second in case the conversion was done so quickly that the piv object hasn't been created yet.
               [function (s) {
                  setTimeout (function () {s.next ()}, 1000);
               }],
               [Redis, 'exists', 'piv:' + piv.id],
               function (s) {
                  if (! s.last) return a.stop (a.creat (), [H.unlink, Path.join (Path.dirname (newpath), id)], function (s, error) {
                     notify (a.creat (), {priority: 'important', type: 'video conversion deletion of mp4', error: error, user: rq.user.username, piv: piv.id});
                  });
                  s.bymp4 = s.bymp4.size;
                  var multi = redis.multi ();
                  multi.hmset ('piv:' + piv.id, {vid: id, bymp4: s.bymp4});
                  multi.del ('querycache:' + rq.user.username);
                  mexec (s, multi);
               },
               function (s) {
                  H.stat.w (s, [
                     ['flow', 'byfs',                     s.bymp4],
                     ['flow', 'byfs-' + rq.user.username, s.bymp4],
                     ['flow', 'ms-video-convert', Date.now () - start],
                     ['flow', 'ms-video-convert:' + piv.format.split (':') [0], Date.now () - start]
                  ]);
               }
            ], function (s, error) {
               a.seq (s, [
                  [notify, {priority: 'important', type: 'video conversion to mp4 error', error: error, user: rq.user.username, piv: piv.id}],
                  [H.unlink, Path.join (Path.dirname (newpath), id), true],
                  [H.unlink, Path.join (Path.dirname (newpath), id + '.mp4'), true],
                  [Redis, 'hdel', 'proc:vid', piv.id],
                  // Wait one second in case the conversion failed so quickly that the piv object hasn't been created yet.
                  [function (s) {
                     setTimeout (function () {s.next ()}, 1000);
                  }],
                  [Redis, 'exists', 'piv:' + piv.id],
                  // If the piv was deleted, ignore the error.
                  function (s) {
                     if (s.last) Redis (s, 'hset', 'piv:' + piv.id, 'vid', 'error:' + id);
                  }
               ]);
            });
         },
         function (s) {
            // If heic, convert to jpg to later make the thumbnails
            if (piv.format !== 'heic') return s.next ();
            s.heic_jpg = Path.join ((os.tmpdir || os.tmpDir) (), piv.id + '.jpeg');
            invalidHandler (s, [
               [k, 'heif-convert', '-q', '100', newpath, s.heic_jpg],
               // In versions of heif-convert (libheif) after October 2022, pivs with Orientation metadata will be rotated when converted, which throws off our assertions. The code expects the jpg to be converted with the same dimensions and the same orientation header.
               // This is intended by the author, see: https://github.com/strukturag/libheif/issues/227#issuecomment-1281283463
               // For this reason, we need to rotate the piv again to make it respect the original rotation of the picture
               ! piv.deg ? [] : [k, 'mogrify', '-rotate', {90: -90, '-90': 90, 180: 180} [piv.deg], s.heic_jpg]
            ]);
         },
         function (s) {
            a.seq (s, piv.vid ? [H.thumbVid, invalidHandler, piv, newpath] : [H.thumbPic, invalidHandler, piv, newpath, s.heic_jpg]);
         },
         function (s) {
            if (piv.format !== 'heic') return s.next ();
            H.unlink (s, s.heic_jpg);
         },
         [perfTrack, 'thumb'],
         // We store only the original pivs in S3, not the thumbnails. We do this only after the piv has been considered valid and the thumbnails have been created.
         [H.s3queue, 'put', rq.user.username, Path.join (H.hash (rq.user.username), piv.id), newpath],
         // Freshly get whether geotagging is enabled or not, in case the flag was changed during an upload.
         [Redis, 'hget', 'users:' + rq.user.username, 'geo'],
         [a.set, 'geotags', function (s) {
            if (piv.loc) {
               // We remove piv.loc if geotagging is disabled
               if (! s.last) delete piv.loc;
               else {
                  var loc = piv.loc;
                  piv.loc = JSON.stringify (piv.loc);
                  return H.getGeotags (s, loc [0], loc [1]);
               }
            }
            return s.next ([]);
         }],
         [a.set, 'hashtags', function (s) {
            Redis (s, 'smembers', 'hashtag:' + rq.user.username + ':' + s.hash);
         }],
         function (s) {
            var multi = redis.multi ();

            piv.byfs         = s.byfs.size;
            piv.hash         = s.hash;
            piv.originalHash = s.hashorig;
            piv.dates        = JSON.stringify (piv.dates);

            if (s.thumbS) piv.thumbS  = s.thumbS;
            if (s.thumbM) piv.thumbM  = s.thumbM;
            if (s.thumbS) piv.bythumbS = s.bythumbS;
            if (s.thumbM) piv.bythumbM = s.bythumbM;
            if (s.thumbS) multi.set ('thu:' + piv.thumbS, piv.id);
            if (s.thumbM) multi.set ('thu:' + piv.thumbM, piv.id);

            multi.del  ('raceConditionHashorig:' + rq.user.username + ':' + piv.originalHash);
            multi.del  ('raceConditionHash:'     + rq.user.username + ':' + piv.hash);
            multi.hset ('hash:'     + rq.user.username, piv.hash,         piv.id);
            multi.hset ('hashorig:' + rq.user.username, piv.originalHash, piv.id);
            multi.srem ('hashdel:'     + rq.user.username, piv.hash);
            multi.srem ('hashdelorig:' + rq.user.username, piv.originalHash);
            multi.sadd ('hashid:'     + piv.hash, piv.id);

            if (importData) {
               var providerKey = {google: 'g', dropbox: 'd'} [importData.provider];
               var providerHash = H.hash (importData.id + ':' + importData.modifiedTime);
               multi.sadd ('hash:'    + rq.user.username  + ':' + providerKey, providerHash);
               multi.srem ('hashdel:' + rq.user.username  + ':' + providerKey, providerHash);
               piv.providerHash = providerKey + ':' + providerHash;
            }
            multi.sadd ('tag:' + rq.user.username + ':a::', piv.id);
            if (piv.vid) {
               multi.sadd ('tag:' + rq.user.username + ':v::', piv.id);
               multi.sadd ('pivt:' + piv.id, 'v::');
            }

            dale.go (tags.concat (['d::' + new Date (piv.date).getUTCFullYear (), 'd::M' + (new Date (piv.date).getUTCMonth () + 1)]).concat (s.geotags), function (tag) {
               multi.sadd ('pivt:' + piv.id, tag);
               multi.sadd ('tags:' + rq.user.username, tag);
               multi.sadd ('tag:'  + rq.user.username + ':' + tag, piv.id);
               multi.sadd ('tags:' + rq.user.username, tag);
            });
            if (tags.length === 0 && s.hashtags.length === 0) multi.sadd ('tag:' + rq.user.username + ':u::', piv.id);

            multi.hmset ('piv:' + piv.id, piv);

            dale.go (s.hashtags, function (hashtag) {
               multi.sadd ('pivt:' + piv.id, hashtag);
               multi.sadd ('tag:'  + rq.user.username + ':' + hashtag, piv.id);
               multi.sadd ('tags:' + rq.user.username, hashtag);
               multi.srem ('hashtag:' + rq.user.username + ':' + s.hash, hashtag);
               multi.srem ('taghash:' + rq.user.username + ':' + hashtag, s.hash);
            });

            multi.del ('querycache:' + rq.user.username);

            mexec (s, multi);
         },
         function (s) {
            H.log (s, rq.user.username, {ev: 'upload', type: 'ok', id: rq.data.fields.id, provider: importData ? importData.provider : undefined, pivId: piv.id, tags: tags.length ? tags : undefined, deg: piv.deg});
         },
         [perfTrack, 'db'],
         function (s) {
            H.stat.w (s, [
               ['flow', 'byfs',                     piv.byfs + (piv.bythumbS || 0) + (piv.bythumbM || 0)],
               ['flow', 'byfs-' + rq.user.username, piv.byfs + (piv.bythumbS || 0) + (piv.bythumbM || 0)],
               ['flow', piv.vid ? 'vids' : 'pics', 1],
               ['flow', 'format-' + piv.format.split (':') [0], 1],
               piv.bythumbS ? ['flow', 'thumbS', 1] : [],
               piv.bythumbM ? ['flow', 'thumbM', 1] : [],
            ].concat (dale.fil (perf, undefined, function (item, k) {
               if (k > 0) return ['flow', 'ms-upload-' + item [0], item [1] - perf [k - 1] [1]];
            })));
         },
         function (s) {
            reply (rs, 200, {id: piv.id, deg: piv.deg, hash: s.hashorig});
         }
      ], function (s, error) {
         a.seq (s, [
            ! s.raceConditionHashorig ? [] : [Redis, 'del', 'raceConditionHashorig:' + rq.user.username + ':' + s.hashorig],
            ! s.raceConditionHash     ? [] : [Redis, 'del', 'raceConditionHash:'     + rq.user.username + ':' + s.hash],
            [H.log, rq.user.username, {ev: 'upload', type: 'error', id: rq.data.fields.id, provider: importData ? importData.provider : undefined, name: piv.name, error: error}],
           [reply, rs, 500, {error: error}]
         ]);
      });
   }],

   // *** DELETE PIVS ***

   ['post', 'delete', function (rq, rs) {
      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['ids'], 'eachOf', teishi.test.equal],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
      ])) return;

      if (dale.keys (dale.obj (b.ids, function (id) {
         return [id, true];
      })).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});

      a.stop ([
         [a.fork, b.ids, function (id) {
            return [H.deletePiv, id, rq.user.username];
         }, {max: os.cpus ().length}],
         [H.log, rq.user.username, {ev: 'delete', ids: b.ids}],
         [reply, rs, 200],
      ], function (s, error) {
         error === 'nf' ? reply (rs, 404) : reply (rs, 500, {error: error});
      });
   }],

   // *** ROTATE ***

   ['post', 'rotate', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['ids', 'deg'], 'eachOf', teishi.test.equal],
         ['body.deg', b.deg, [90, 180, -90], 'oneOf', teishi.test.equal],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
         function () {return ['body.ids length', b.ids.length, {min: 1}, teishi.test.range]},
      ])) return;

      var multi = redis.multi (), seen = dale.obj (b.ids, function (id) {
         multi.hgetall ('piv:' + id);
         return [id, true];
      });

      if (dale.keys (seen).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});

      astop (rs, [
         [mexec, multi],
         function (s) {
            var multi = redis.multi ();
            multi.del ('querycache:' + rq.user.username);

            if (dale.stop (s.last, true, function (piv) {
               if (piv === null || piv.owner !== rq.user.username) {
                  reply (rs, 404);
                  return true;
               }
               // We ignore rotation of videos
               if (piv.vid) return;

               var deg = (parseInt (piv.deg) || 0) + b.deg;
               if (deg === -180) deg = 180;
               if (deg === 270)  deg = -90;
               if (deg === 360)  deg = 0;

               if (deg) multi.hset ('piv:' + piv.id, 'deg', deg);
               else     multi.hdel ('piv:' + piv.id, 'deg');
            })) return;

            mexec (s, multi);
         },
         [H.log, rq.user.username, {ev: 'rotate', ids: b.ids, deg: b.deg}],
         [reply, rs, 200],
      ]);
   }],

   // *** CHANGE DATE ***

   ['post', 'date', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['ids', 'date'], 'eachOf', teishi.test.equal],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
         function () {return ['body.ids length', b.ids.length, {min: 1}, teishi.test.range]},
         ['body.date', b.date, 'integer'],
         ['body.date', b.date, {min: 0, max: 4133980799999}, teishi.test.range],
      ])) return;

      var multi = redis.multi (), seen = dale.obj (b.ids, function (id) {
         multi.hgetall ('piv:' + id);
         return [id, true];
      });

      if (dale.keys (seen).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});

      astop (rs, [
         [mexec, multi],
         function (s) {
            var multi = redis.multi ();
            multi.del ('querycache:' + rq.user.username);

            if (dale.stop (s.last, true, function (piv) {
               if (piv === null || piv.owner !== rq.user.username) {
                  reply (rs, 404);
                  return true;
               }

               var dates = JSON.parse (piv.dates);
               // We respect the existing offset from midnight to avoid setting multiple pivs in the exact same moment.
               var offset = parseInt (piv.date) % 86400000;
               dates.userDate = b.date;
               multi.hmset ('piv:' + piv.id, {date: b.date + offset, dateSource: 'userDate', dates: JSON.stringify (dates)});

               H.updateDateTags (piv, parseInt (piv.date), b.date, multi);

            })) return;

            mexec (s, multi);
         },
         [H.log, rq.user.username, {ev: 'date', ids: b.ids, date: b.date}],
         [reply, rs, 200],
      ]);
   }],

   // *** BEGIN ANNOTATED SOURCE CODE FRAGMENT ***

   // *** TAGGING ***

   ['post', 'tag', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tag', 'ids', 'del', 'autoOrganize'], 'eachOf', teishi.test.equal],
         ['body.tag', b.tag, 'string'],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
         function () {return ['body.ids length', b.ids.length, {min: 1}, teishi.test.range]},
         ['body.del', b.del, [true, false, undefined], 'oneOf', teishi.test.equal],
         ['body.autoOrganize', b.autoOrganize, [true, false, undefined], 'oneOf', teishi.test.equal],
      ])) return;

      b.tag = H.trim (b.tag);
      if (! H.isUserTag (b.tag) && b.tag !== 'o::') return reply (rs, 400, {error: 'tag'});

      var seen = dale.obj (b.ids, function (id) {return [id, true]});
      if (dale.keys (seen).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});

      astop (rs, [
         [a.fork, b.ids, function (id) {
            return [H.hasAccess, rq.user.username, id];
         }, {max: 5}],
         function (s) {
            if (dale.stop (s.last, true, function (piv) {return piv === false})) return reply (rs, 404);
            s.pivs = s.last;

            var sharedPivs = dale.fil (s.pivs, undefined, function (piv, k) {
               piv.k = k;
               if (piv.owner !== rq.user.username) return piv;
            });

            if (! sharedPivs.length) return s.next ();

            a.seq (s, [
               [Redis, 'hmget', 'hash:' + rq.user.username, dale.go (sharedPivs, function (piv) {return piv.hash})],
               function (s) {
                  dale.go (sharedPivs, function (piv, k) {
                     if (! s.last [piv.hash]) return;
                     s.pivs [piv.k].id    = s.last [piv.hash];
                     s.pivs [piv.k].owner = rq.user.username;
                  });
                  s.next ();
               }
            ]);
         },
         ! b.del ? [Redis, 'smembers', 'sho:' + rq.user.username] : function (s) {
            var multi = redis.multi ();
            dale.go (s.pivs, function (piv) {
               if (piv.owner === rq.user.username) multi.smembers ('pivt:' + piv.id);
               else                                multi.smembers ('hashtag:' + rq.user.username + ':' + piv.hash);
            });
            multi.smembers ('sho:' + rq.user.username);
            mexec (s, multi);
         },
         function (s) {
            var multi = redis.multi ();
            multi.del ('querycache:' + rq.user.username);
            if (b.del) {
               s.sho = teishi.last (s.last);
               s.ids = [];
            }
            else s.sho = s.last;

            dale.go (s.sho, function (userAndTag) {
               multi.del ('querycache:' + userAndTag.split (':') [0]);
            });

            dale.go (s.pivs, function (piv, k) {
               if (! b.del) {
                  multi.sadd ('tags:' + rq.user.username, b.tag);
                  if (piv.owner !== rq.user.username) {
                     multi.sadd ('hashtag:' + rq.user.username + ':' + piv.hash, b.tag);
                     multi.sadd ('taghash:' + rq.user.username + ':' + b.tag,    piv.hash);
                     if (b.autoOrganize) multi.sadd ('hashtag:' + rq.user.username + ':' + piv.hash, 'o::');
                     if (b.autoOrganize) multi.sadd ('taghash:' + rq.user.username + ':' + 'o::',    piv.hash);
                  }
                  else {
                     multi.sadd ('pivt:' + piv.id, b.tag);
                     multi.sadd ('tag:'  + rq.user.username + ':' + b.tag, piv.id);
                     if (b.autoOrganize) multi.sadd ('pivt:' + piv.id, 'o::');
                     if (b.autoOrganize) multi.sadd ('tag:'  + rq.user.username + ':' + 'o::', piv.id);
                     if (b.tag !== 'o::') multi.srem ('tag:'  + rq.user.username + ':u::', piv.id);
                  }
                  return;
               }

               if (! inc (s.last [k], b.tag)) return;
               var autoOrganize = b.autoOrganize && dale.fil (s.last [k], undefined, function (v) {if (H.isUserTag (v)) return v}).length === 1;
               if (piv.owner !== rq.user.username) {
                  multi.srem ('hashtag:' + rq.user.username + ':' + piv.hash, b.tag);
                  multi.srem ('taghash:' + rq.user.username + ':' + b.tag,    piv.hash);
                  if (autoOrganize) multi.srem ('hashtag:' + rq.user.username + ':' + piv.hash, 'o::');
                  if (autoOrganize) multi.srem ('taghash:' + rq.user.username + ':' + 'o::',    piv.hash);
               }
               else {
                  s.ids.push (piv.id);
                  multi.srem ('pivt:' + piv.id, b.tag);
                  multi.srem ('tag:'  + rq.user.username + ':' + b.tag, piv.id);
                  if (autoOrganize) multi.srem ('pivt:' + piv.id, 'o::');
                  if (autoOrganize) multi.srem ('tag:'  + rq.user.username + ':' + 'o::', piv.id);
                  if (b.tag !== 'o::' && dale.fil (s.last [k], false, H.isUserTag).length === 1) multi.sadd ('tag:' + rq.user.username + ':u::', piv.id);
               }
            });

            if (rq.user.onboarding && ! b.del && b.tag !== 'o::') multi.hdel ('users:' + rq.user.username, 'onboarding');

            mexec (s, multi);
         },
         ! b.del ? [] : [a.get, H.tagCleanup, rq.user.username, [b.tag], '@ids', '@sho'],
         [H.log, rq.user.username, {ev: 'tag', type: b.del ? 'untag' : 'tag', ids: b.ids, tag: b.tag}],
         [reply, rs, 200],
      ]);
   }],

   ['get', 'tags', function (rq, rs) {
      astop (rs, [
         [function (s) {
            var multi = redis.multi ();
            multi.smembers ('tags:'     + rq.user.username);
            multi.smembers ('shm:'      + rq.user.username);
            multi.get      ('hometags:' + rq.user.username);
            multi.scard    ('tag:'      + rq.user.username + ':o::');
            mexec (s, multi);
         }],
         function (s) {
            dale.go (s.last [1], function (share) {
               s.last [0].push ('s::' + share);
            });
            var output = {
               tags: s.last [0].sort (function (a, b) {
                  return a.toLowerCase ().localeCompare (b.toLowerCase ());
               }),
               hometags: JSON.parse (s.last [2] || '[]'),
               organized: parseInt (s.last [3]),
               // TODO: rename to thumbs
               homeThumbs: {}
            };

            if (output.tags.length === 0) return reply (rs, 200, output);

            var multi = redis.multi ();
            dale.go (output.tags, function (tag) {
               multi.srandmember ('tag:' + rq.user.username + ':' + tag);
            });
            s.output = output;
            mexec (s, multi);
         },
         function (s) {
            s.output.homeThumbs = s.last;
            var multi = redis.multi ();
            dale.go (s.output.homeThumbs, function (id) {
               multi.hmget ('piv:' + id, ['deg', 'date', 'vid']);
               multi.smembers ('pivt:' + id);
            });
            mexec (s, multi);
         },
         function (s) {
            s.output.homeThumbs = dale.obj (s.output.homeThumbs, function (homeThumb, k) {
               if (s.output.tags [k].match (/^s::/)) return;
               return [s.output.tags [k], {
                  id: homeThumb,
                  deg: s.last [k * 2] [0] ? parseInt (s.last [k * 2] [0]) : undefined,
                  date: parseInt (s.last [k * 2] [1]),
                  tags: s.last [k * 2 + 1].sort (),
                  vid: s.last [k * 2] [2] ? true : undefined,
                  currentMonth: dale.fil (s.last [k * 2 + 1], undefined, function (tag) {
                     if (tag.match (/d::M/)) return parseInt (tag.slice (4));
                     if (tag.match (/d::/)) return parseInt (tag.slice (3));
                  }).sort (function (a, b) {return b - a})
               }];
            });
            reply (rs, 200, s.output);
         }
      ]);
   }],

   ['post', 'hometags', function (rq, rs) {
      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['hometags'], 'eachOf', teishi.test.equal],
         ['body.hometags', b.hometags, 'array'],
         ['body.hometags', b.hometags, 'string', 'each']
      ])) return;

      var multi = redis.multi (), seen = {};
      b.hometags = dale.go (b.hometags, H.trim);
      var invalidTag = dale.stopNot (b.hometags, undefined, function (hometag) {
         seen [hometag] = true;
         if (! H.isUserTag (hometag)) return hometag;
         multi.exists ('tag:' + rq.user.username + ':' + hometag);
      });
      if (invalidTag) return reply (rs, 400, {error: 'tag', tag: invalidTag});

      if (dale.keys (seen).length < b.hometags.length) return reply (rs, 400, {error: 'repeated'});

      astop (rs, [
         [mexec, multi],
         function (s) {
            var missingTag = dale.stopNot (s.last, undefined, function (exists, k) {
               if (! exists) return b.hometags [k];
            });
            if (missingTag) return reply (rs, 404, {tag: missingTag});
            Redis (s, 'set', 'hometags:' + rq.user.username, JSON.stringify (b.hometags));
         },
         [reply, rs, 200]
      ]);
   }],

   // *** QUERY ***

   ['post', 'idsFromHashes', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['hashes'], 'eachOf', teishi.test.equal],
         ['body.hashes', b.hashes, 'array'],
         ['body.hashes', b.hashes, 'string', 'each'],
      ])) return;

      if (b.hashes.length === 0) return reply (rs, 200, {});

      a.seq ([
         [Redis, 'hmget', 'hashorig:' + rq.user.username, b.hashes],
         function (s) {
            reply (rs, 200, dale.obj (s.last, function (v, k) {
               return [b.hashes [k], v];
            }));
         }
      ]);
   }],

   ['post', 'organized', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['ids'], 'eachOf', teishi.test.equal],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
      ])) return;

      b.ids = dale.obj (b.ids, function (id) {
         return [id, true];
      });

      a.seq ([
         [Redis, 'smembers', 'tag:' + rq.user.username + ':o::'],
         function (s) {
            reply (rs, 200, dale.fil (s.last.sort (), undefined, function (v, k) {
               if (b.ids [v]) return v;
            }));
         }
      ]);
   }],

   ['post', 'query', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tags', 'mindate', 'maxdate', 'sort', 'from', 'fromDate', 'to', 'recentlyTagged', 'idsOnly', 'timeHeader', 'refresh', 'updateLimit', 'limit'], 'eachOf', teishi.test.equal],
         ['body.tags',    b.tags, 'array'],
         ['body.tags',    b.tags, 'string', 'each'],
         ['body.mindate', b.mindate,  ['undefined', 'integer'], 'oneOf'],
         ['body.maxdate', b.maxdate,  ['undefined', 'integer'], 'oneOf'],
         ['body.sort',    b.sort, ['newest', 'oldest', 'upload', 'random'], 'oneOf', teishi.test.equal],
         ['body.from',    b.from, ['undefined', 'integer'], 'oneOf'],
         ['body.to',      b.to, 'integer'],
         b.from === undefined ? [
            ['body.fromDate', b.fromDate, 'integer'],
            ['body.fromDate', b.fromDate, {min: 1}, teishi.test.range],
            ['body.to',       b.to,       {min: 1}, teishi.test.range]
         ] : [
            ['body.fromDate', b.fromDate, 'undefined'],
            ['body.from', b.from, {min: 1},      teishi.test.range],
            ['body.to',   b.to,   {min: b.from}, teishi.test.range]
         ],
         ['body.recentlyTagged', b.recentlyTagged, ['undefined', 'array'], 'oneOf'],
         ['body.recentlyTagged', b.recentlyTagged, 'string', 'each'],
         ['body.idsOnly', b.idsOnly, ['undefined', 'boolean'], 'oneOf'],
         ['body.timeHeader', b.timeHeader, ['undefined', 'boolean'], 'oneOf'],
         ['body.refresh', b.refresh, ['undefined', 'boolean'], 'oneOf'],
         ['body.updateLimit', b.updateLimit, ['undefined', 'integer'], 'oneOf'],
         b.updateLimit === undefined ? [] : ['body.updateLimit', b.updateLimit, {min: 1}, teishi.test.range],
         ['body.limit',   b.limit, ['undefined', 'integer'], 'oneOf'],
         b.limit === undefined ? [] : ['body.limit', b.limit, {min: 0}, teishi.test.range],
      ])) return;

      if (inc (b.tags, 'a::')) return reply (rs, 400, {error: 'all'});
      if (b.recentlyTagged && ! inc (b.tags, 'u::')) return reply (rs, 400, {error: 'recentlyTagged'});

      var seen = dale.obj (b.tags, function (id) {return [id, true]});
      if (dale.keys (seen).length < b.tags.length) return reply (rs, 400, {error: 'repeated'});

      var qid = 'query-' + uuid ();

      astop (rs, [
         // TODO: remove the refreshQuery functionality. This section is not annotated since it won't last and is merely kept for compatibility purposes.
         rq.headers ['user-agent'] && rq.headers ['user-agent'].match (/^Dart/) ? [] : [
            [Redis, 'get', 'geo:' + rq.user.username],
            function (s) {
               // If geotagging is ongoing, refreshQuery will be already set to true so there's no need to query uploads to determine it.
               if (s.last) {
                  s.refreshQuery = true;
                  return s.next ();
               }
               var data = s.last;
               a.seq (s, [
                  // We assume that any ongoing uploads must be found in the first 20
                  [H.getUploads, rq.user.username, {}, 20],
                  function (s) {
                     s.refreshQuery = dale.stop (s.last, true, function (v) {
                        return v.status === 'uploading';
                     });
                     s.next (data);
                  }
               ]);
            },
            // End of the refreshQuery functionality
         ],
         [Redis, 'hget', 'querycache:' + rq.user.username, teishi.str (b)],
         function (s) {
            if (s.last) return s.next ([null, s.last]);
            a.seq (s, [
               [Redis, 'smembers', 'shm:' + rq.user.username],
               function (s) {
                  var forbidden = dale.stopNot (b.tags, undefined, function (tag) {
                     if (tag.match (/^s::/) && ! inc (s.last, tag.replace ('s::', ''))) return tag;
                  });
                  if (forbidden) return reply (rs, 403, {tag: forbidden});

                  var query = {
                     username: rq.user.username,
                     query:    b,
                     dateGeoTags: dale.fil (b.tags, undefined, function (tag) {
                        if (H.isGeoTag (tag) || H.isDateTag (tag)) return tag;
                     }),
                     userTags: dale.fil (b.tags, undefined, function (tag) {
                        if (inc (['u::', 'o::'], tag) || H.isUserTag (tag)) return tag;
                     }),
                     ownTagsPre:    dale.fil (b.tags, undefined, function (tag) {
                        if (! tag.match (/^s::/) && tag !== 't::') return 'tag:' + rq.user.username + ':' + tag;
                     }),
                     sharedTags:    dale.obj (s.last, function (v)   {return [v, true]}),
                     sharedTagsPre: dale.go  (s.last, function (tag) {return 'tag:' + tag}),
                     relevantUsers: {},
                     untagged:      inc (b.tags, 'u::'),
                     toOrganize:    inc (b.tags, 't::')
                  };

                  b.tags = dale.fil (b.tags, 't::', function (v) {return v});

                  if (! query.untagged) dale.go (b.tags, function (tag) {
                     if (! tag.match (/^s::/)) return;
                     tag = tag.replace ('s::', '').split (':');
                     if (! query.relevantUsers [tag [0]]) query.relevantUsers [tag [0]] = [];
                     query.relevantUsers [tag [0]].push ('tag:' + tag.join (':'));
                  });
                  if (! query.untagged && ! dale.keys (query.relevantUsers).length) dale.go (s.last, function (tag) {
                     tag = tag.split (':');
                     if (! query.relevantUsers [tag [0]]) query.relevantUsers [tag [0]] = [];
                     query.relevantUsers [tag [0]].push ('tag:' + tag.join (':'));
                  });

                  var multi = redis.multi ();
                  s.startLua = Date.now ();
                  multi.set (qid, JSON.stringify (query));
                  multi.evalsha (H.query, 1, qid);
                  mexec (s, multi);
               },
               function (s) {
                  var result = s.last;
                  a.seq (s, [
                     [Redis, 'hset', 'querycache:' + rq.user.username, teishi.str (b), result [1]],
                     function (s) {
                        s.next (result);
                     }
                  ]);
               }
            ]);
         },
         function (s) {
            var output = teishi.parse (s.last [1]);
            if (output === false) {
               notify (a.creat (), {priority: 'important', type: 'Redis query error', user: rq.user.username, body: b, error: s.last [1]});
               return reply (rs, 500, {error: 'Query error'});
            }
            var lastTimeEntry = s.startLua;
            var perf = dale.obj (output.perf, {total: Date.now () - s.startLua}, function (v, k) {
               if (k % 3 !== 0) return;
               var date = parseInt (output.perf [k + 1] + output.perf [k + 2].slice (0, 3));
               var total = date - lastTimeEntry;
               lastTimeEntry = date;
               return [v, total];
            });
            if (b.idsOnly) return reply (rs, 200, teishi.eq (output.ids, {}) ? [] : output.ids);
            output.tags = dale.obj (output.tags, function (v, k) {
               if (k % 2 === 0) return [v, parseInt (output.tags [k + 1])];
            });
            output.pivs = dale.go (output.pivs, function (piv) {
               return dale.obj (piv, function (v, k) {
                  if (k % 2 === 0) return [v, piv [k + 1]];
               });
            });

            if (b.sort === 'random') H.shuffleArray (output.pivs);
            if (b.limit !== undefined) output.pivs = output.pivs.slice (0, b.limit);

            output.pivs = dale.go (output.pivs, function (piv) {
               var vid = piv.vid ? true : undefined;
               if (piv.vid && piv.vid.match ('pending')) vid = 'pending';
               if (piv.vid && piv.vid.match ('error'))   vid = 'error';
               // TODO: remove this line after removing refreshQuery
               if (vid === 'pending') s.refreshQuery = true;

               return {
                  id:      piv.id,
                  name:    piv.name,
                  owner:   piv.owner,
                  tags:    dale.fil (piv.tags, 'v::', function (v) {return v}).sort (),
                  date:    parseInt (piv.date),
                  dateup:  parseInt (piv.dateup),
                  dimh:    parseInt (piv.dimh),
                  dimw:    parseInt (piv.dimw),
                  vid:     vid,
                  deg:     vid ? undefined : (parseInt (piv.deg) || undefined),
                  loc:     piv.loc ? teishi.parse (piv.loc) : undefined,
                  // Fields returned only during tests
                  thumbS:     ! ENV ? piv.thumbS             : undefined,
                  thumbM:     ! ENV ? piv.thumbM             : undefined,
                  dates:      ! ENV ? JSON.parse (piv.dates) : undefined,
                  dateSource: ! ENV ? piv.dateSource         : undefined,
                  format:     ! ENV ? piv.format             : undefined
               };
            });
            if (b.timeHeader) {
               var lastMonth = [0, 1];
               dale.go (output.timeHeader, function (v, k) {
                  k = k.split (':');
                  k = [parseInt (k [0]), parseInt (k [1])];
                  if (lastMonth [0] < k [0]) return lastMonth = k;
                  if (lastMonth [0] == k [0] && lastMonth [1] < k [1]) lastMonth = k;
               });
               if (! eq (lastMonth, [0, 1])) {
                  var totalPivs = (output.timeHeader [lastMonth.join (':') + ':t'] || 0) + (output.timeHeader [lastMonth.join (':') + ':o'] || 0);
                  output.lastMonth = [lastMonth.join (':'), totalPivs];
               }
            }
            reply (rs, 200, {
               refreshQuery: s.refreshQuery || undefined,
               total:        output.total,
               tags:         output.tags,
               pivs:         output.pivs,
               lastMonth:    output.lastMonth,
               timeHeader:   ! b.timeHeader ? undefined : dale.obj (output.timeHeader, function (v, k) {
                  if (k.slice (-1) === 't') return [k.slice (0, -2), false];
                  if (! output.timeHeader [k.replace ('o', 't')]) return [k.slice (0, -2), true];
               }),
               perf:         {total: Date.now () - rs.log.startTime, node: Date.now () - perf.total - rs.log.startTime, lua: perf}
            });
         }
      ]);
   }],

   // *** SHARE & RENAME ***

   ['post', /sho|shm/, function (rq, rs) {

      // We temporarily disable sharing until the server tests are finished.
      if (ENV) return reply (rs, 503);

      var b = rq.body, action = rq.url.replace ('/', '');

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tag', 'whom', 'del'], 'eachOf', teishi.test.equal],
         ['body.tag',  b.tag, 'string'],
         ['body.whom', b.whom, 'string'],
         ['body.del', b.del, [true, false, undefined], 'oneOf', teishi.test.equal],
      ])) return;

      b.tag = H.trim (b.tag);
      if (! H.isUserTag (b.tag)) return reply (rs, 400, {error: 'tag'});

      astop (rs, [
         [Redis, 'get', 'email:' + b.whom],
         [function (s) {
            s.email = b.whom;
            b.whom = s.last;
            if (! b.whom)                    return reply (rs, 404, {error: 'user'});
            if (b.whom === rq.user.username) return reply (rs, 400, {error: 'self'});
            s.next ();
         }],
         function (s) {
            if (action === 'sho') Redis (s, 'exists',    'tag:' + rq.user.username + ':' + b.tag);
            if (action === 'shm') Redis (s, 'sismember', 'sho:' + b.whom, rq.user.username + ':' + b.tag);
         },
         function (s) {
            if (! s.last && action === 'sho') return reply (rs, 404, {error: 'tag'});
            if (! s.last && action === 'shm') return reply (rs, 403);
            var multi = redis.multi ();
            multi.del ('querycache:' + rq.user.username);
            multi [b.del ? 'srem' : 'sadd'] (action + ':' + rq.user.username, b.whom + ':' + b.tag);
            if (action === 'sho' && b.del) multi.srem ('shm:' + b.whom, rq.user.username + ':' + b.tag);
            if (b.del) multi.smembers ('tag:' + (action === 'sho' ? rq.user.username : b.whom) + ':' + b.tag);
            mexec (s, multi);
         },
         function (s) {
            if (! s.last [1]) return reply (rs, 200);
            s.next ();
         },
         ! b.del ? [] : [
            [Redis, 'smembers', 'tag:' + action === 'sho' ? rq.user.username : b.whom],
            [a.get, H.tagCleanup, rq.user.username, [b.tag], '@last', [(action === 'sho' ? b.whom : rq.user.username) + ':' + b.tag]],
         ],
         function (s) {
            var eventType;
            if (action === 'sho') eventType = b.del ? 'unshare' : 'share';
            if (action === 'shm') eventType = b.del ? 'remove'  : 'accept';
            H.log (s, rq.user.username, {ev: 'share', type: eventType, tag: b.tag, whom: b.whom});
         },
         ENV && action === 'sho' && ! b.del ? function (s) {
            sendmail (s, {
               to1:     b.whom,
               to2:     s.email,
               subject: CONFIG.etemplates.share.subject,
               message: CONFIG.etemplates.share.message (b.whom, rq.user.username, b.tag)
            });
         } : [],
         [reply, rs, 200],
      ]);
   }],

   ['get', 'share', function (rq, rs) {
      var multi = redis.multi ();
      multi.smembers ('sho:' + rq.user.username);
      multi.smembers ('shm:' + rq.user.username);
      astop (rs, [
         [mexec, multi],
         function (s) {
            reply (rs, 200, {
               sho: dale.go (s.last [0], function (v) {
                  return [v.split (':') [0], v.split (':').slice (1).join (':')];
               }),
               shm: dale.go (s.last [1], function (v) {
                  return [v.split (':') [0], v.split (':').slice (1).join (':')];
               })
            });
         }
      ]);
   }],

   ['post', 'rename', function (rq, rs) {
      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['from', 'to'], 'eachOf', teishi.test.equal],
         ['body.from', b.from, 'string'],
         ['body.to', b.to, 'string'],
      ])) return;

      b.to = H.trim (b.to);
      if (! H.isUserTag (b.to)) return reply (rs, 400, {error: 'tag'});

      astop (rs, [
         [function (s) {
            var multi = redis.multi ();
            multi.smembers ('tag:'        + rq.user.username + ':' + b.from);
            multi.smembers ('sho:'        + rq.user.username);
            multi.get      ('hometags:'   + rq.user.username);
            multi.del      ('querycache:' + rq.user.username);
            mexec (s, multi);
         }],
         function (s) {
            if (! s.last [0].length) return reply (rs, 404, {error: 'tag'});

            var tagIsShared = dale.stop (s.last [1], true, function (shared) {
               return b.from === shared.split (':').slice (1).join (':');
            });
            if (tagIsShared) return reply (rs, 409, {error: 'shared'});

            var multi = redis.multi ();
            multi.del ('tag:' + rq.user.username + ':' + b.from);
            multi.srem ('tags:' + rq.user.username, b.from);
            multi.sadd ('tags:' + rq.user.username, b.to);
            dale.go (s.last [0], function (id) {
               multi.sadd ('tag:' + rq.user.username + ':' + b.to, id);
               multi.srem ('pivt:' + id, b.from);
               multi.sadd ('pivt:' + id, b.to);
            });

            var hometags = teishi.parse (s.last [2]) || [];
            if (inc (hometags, b.from) && ! inc (hometags, b.to)) hometags [hometags.indexOf (b.from)] = b.to;
            multi.set ('hometags:' + rq.user.username, JSON.stringify (hometags));
            mexec (s, multi);
         },
         [reply, rs, 200]
      ]);
   }],

   ['post', 'deleteTag', function (rq, rs) {
      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tag'], 'eachOf', teishi.test.equal],
         ['body.tag', b.tag, 'string'],
      ])) return;

      if (! H.isUserTag (b.tag)) return reply (rs, 400, {error: 'tag'});

      astop (rs, [
         [function (s) {
            var multi = redis.multi ();
            multi.smembers ('tag:'        + rq.user.username + ':' + b.tag);
            multi.smembers ('sho:'        + rq.user.username);
            multi.get      ('hometags:'   + rq.user.username);
            multi.del      ('querycache:' + rq.user.username);
            mexec (s, multi);
         }],
         function (s) {
            if (! s.last [0].length) return reply (rs, 404, {error: 'tag'});

            var tagIsShared = dale.stop (s.last [1], true, function (shared) {
               return b.tag === shared.split (':').slice (1).join (':');
            });
            if (tagIsShared) return reply (rs, 409, {error: 'shared'});

            var multi = redis.multi ();
            multi.del ('tag:' + rq.user.username + ':' + b.tag);
            multi.srem ('tags:' + rq.user.username, b.tag);
            dale.go (s.last [0], function (id) {
               multi.srem     ('pivt:' + id, b.tag);
               multi.smembers ('pivt:' + id);
            });
            s.pivsToCheck = s.last [0];

            var hometags = dale.fil (teishi.parse (s.last [2]) || [], undefined, function (hometag) {
                if (hometag !== b.tag) return hometag;
            });
            multi.set ('hometags:' + rq.user.username, JSON.stringify (hometags));
            mexec (s, multi);
         },
         function (s) {
            var multi = redis.multi ();
            dale.go (s.pivsToCheck, function (id, k) {
               var hasUserTag = dale.stop (s.last [2 + (k * 2) + 1], true, H.isUserTag);
               if (! hasUserTag) multi.sadd ('tag:' + rq.user.username + ':u::', id);
            });
            mexec (s, multi);
         },
         [reply, rs, 200]
      ]);
   }],

   // *** END ANNOTATED SOURCE CODE FRAGMENT ***

   // *** DOWNLOAD MULTIPLE PIVS ***

   ['get', 'download/(*)', function (rq, rs) {

      redis.get ('download:' + rq.data.params [0].replace ('.zip', ''), function (error, download) {
         if (error) return reply (rs, 500, {error: error});
         if (! download) return reply (rs, 404);
         download = JSON.parse (download);

         if (download.username !== rq.user.username) return reply (rs, 404);

         var archive = archiver ('zip');
         archive.on ('error', function (error) {
            reply (rs, 500, {error: error})
         });

         var names = {};

         var unrepeatName = function (name) {
            if (! names [name]) {
               names [name] = true;
               return name;
            }
            return unrepeatName (name + ' (copy)');
         }

         a.seq ([
            [a.fork, download.pivs, function (piv) {
               return [a.make (fs.stat), Path.join (CONFIG.basepath, H.hash (piv.owner), piv.id)];
            }, {max: os.cpus ().length}],
            function (s) {
               if (s.error) return reply (rs, 500, {error: error});
               dale.go (download.pivs, function (piv, k) {
                  var stat = s.last [k];
                  stat.mtime = new Date (piv.mtime - new Date ().getTimezoneOffset () * 60 * 1000);
                  // https://www.archiverjs.com/docs/archiver#entry-data
                  archive.append (fs.createReadStream (Path.join (CONFIG.basepath, H.hash (piv.owner), piv.id)), {name: unrepeatName (piv.name), stats: stat});
               });

               archive.pipe (rs);
               archive.finalize ();
               archive.on ('finish', function () {
                  cicek.apres (rs);
               });
            }
         ]);
      });
   }],

   ['post', 'download', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['ids'], 'eachOf', teishi.test.equal],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
      ])) return;

      var ids = dale.obj (b.ids, function (id) {
         return [id, true];
      });

      if (dale.keys (ids).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});
      if (b.ids.length < 2) return reply (rs, 400, {error: 'single'});

      astop (rs, [
         [function (s) {
            var multi = redis.multi ();
            dale.go (b.ids, function (id) {
               multi.hgetall ('piv:' + id);
            });
            mexec (s, multi);
         }],
         function (s) {
            if (dale.stop (s.last, true, function (piv, k) {
               // No such piv or piv is not owned by user
               return ! piv || piv.owner !== rq.user.username;
            })) return reply (rs, 404);

            var downloadId = uuid (), expiresIn = ENV ? 5 : 1;
            redis.setex ('download:' + downloadId, expiresIn, JSON.stringify ({username: rq.user.username, pivs: dale.go (s.last, function (piv) {
               return {owner: piv.owner, id: piv.id, name: piv.name, mtime: JSON.parse (piv.dates) ['upload:lastModified']};
            })}), function (error) {
               if (error) return reply (rs, 500, {error: error});
               reply (rs, 200, {id: downloadId + '.zip'});
            });
         },
      ]);
   }],

   // *** DISMISS SUGGESTIONS ***

   ['post', 'dismiss', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['operation'], 'eachOf', teishi.test.equal],
         ['operation', b.operation, ['geotagging', 'selection'], 'oneOf', teishi.test.equal]
      ])) return;

      var suggest = 'suggest' + b.operation.charAt (0).toUpperCase () + b.operation.slice (1);

      if (! rq.user [suggest]) return reply (rs, 200);

      return astop (rs, [
         [Redis, 'hdel', 'users:' + rq.user.username, suggest],
         [H.log, rq.user.username, {ev: 'dismiss', type: b.operation}],
         [reply, rs, 200]
      ]);
   }],

   // *** GEOTAGGING ***

   ['post', 'geo', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['operation'], 'eachOf', teishi.test.equal],
         ['operation', b.operation, ['enable', 'disable'], 'oneOf', teishi.test.equal]
      ])) return;

      astop (rs, [
         [Redis, 'get', 'geo:' + rq.user.username],
         function (s) {
            if (s.last) return reply (rs, 409);
            if (rq.user.geo   && b.operation === 'enable')  return reply (rs, 200);
            if (! rq.user.geo && b.operation === 'disable') return reply (rs, 200);
            s.next ();
         },
         b.operation === 'disable' ? [
            [Redis, 'smembers', 'tag:' + rq.user.username + ':a::'],
            function (s) {
               var multi = redis.multi ();
               s.allPivs = s.last;
               dale.go (s.last, function (pivId) {
                  multi.smembers ('pivt:' + pivId);
               });
               mexec (s, multi);
            },
            function (s) {
               var multi = redis.multi ();
               multi.del ('querycache:' + rq.user.username);
               dale.go (s.last, function (tags, k) {
                  multi.hdel ('piv:' + s.allPivs [k], 'loc');
                  dale.go (tags, function (tag) {
                     if (! H.isGeoTag (tag)) return;
                     multi.srem ('pivt:' + s.allPivs [k], tag);
                     multi.del ('tag:' + rq.user.username + ':' + tag);
                     multi.srem ('tags:' + rq.user.username, tag);
                  });
               });
               multi.hdel ('users:' + rq.user.username, 'geo');
               mexec (s, multi);
            },
            [H.log, rq.user.username, {ev: 'geotagging', type: b.operation}],
            [reply, rs, 200]
         ] : [
            [function (s) {
               var multi = redis.multi ();
               multi.set ('geo:' + rq.user.username, Date.now ());
               multi.hset ('users:' + rq.user.username, 'geo', 1);
               mexec (s, multi);
            }],
            [H.log, rq.user.username, {ev: 'geotagging', type: b.operation}],
            function (s) {
               // We don't wait for the process to be completed to respond to the request.
               reply (rs, 200);
               s.next ();
            },
            [Redis, 'smembers', 'tag:' + rq.user.username + ':a::'],
            function (s) {
               var pivs = s.last;
               // TODO: replace by a.fork when bug is fixed: f7cdb4f4381c85dae1e6282d39348e260c3cafce
               var asyncFork = function (data, simult, fun, cb) {
                  if (data.length === 0) return cb (null, []);
                  var counter = 0, done = 0, results = [], fire = function () {
                     if (counter === false) return;
                     if (counter === data.length) return;
                     var c = counter++;
                     fun (data [c], c, function (error, result) {
                        if (counter === false) return;
                        if (error) {
                           counter = false;
                           return cb (error);
                        }
                        results [c] = result;
                        if (++done === data.length) return cb (null, results);
                        fire ();
                     });
                  }
                  dale.go (dale.times (simult), fire);
               }
               asyncFork (pivs, os.cpus ().length, function (piv, K, cb) {
                  var path = Path.join (CONFIG.basepath, H.hash (rq.user.username), piv);
                  a.stop ([
                     [H.getMetadata, path, true],
                     function (s) {
                        if (! s.last.loc) return s.next ([]);
                        s.loc = s.last.loc;
                        H.getGeotags (s, s.loc [0], s.loc [1]);
                     },
                     function (s) {
                        if (! s.loc) return cb ();
                        var loc = JSON.stringify (s.loc);
                        var multi = redis.multi ();
                        multi.hset ('piv:'  + piv, 'loc', loc);
                        dale.go (s.last, function (tag) {
                           multi.sadd ('tag:'  + rq.user.username + ':' + tag, piv);
                           multi.sadd ('pivt:' + piv,                          tag);
                           multi.sadd ('tags:' + rq.user.username, tag);
                        });
                        multi.del ('querycache:' + rq.user.username);
                        multi.exec (cb);
                     }
                  ], function (s, error) {
                     cb (error);
                  });
               }, function (error) {
                  if (error) notify (s, {priority: 'important', type: 'geotagging error', user: rq.user.username, error: error});
                  else       s.next ();
               });
            },
            [Redis, 'del', 'geo:' + rq.user.username],
         ],
      ]);
   }],

   // *** IMPORT ***

   ['get', 'imports/:provider', function (rq, rs) {
      if (! inc (['google', 'dropbox'], rq.data.params.provider)) return reply (rs, 400);
      astop (rs, [
         [H.getImports, rq, rs, rq.data.params.provider, 20],
         function (s) {
            reply (rs, 200, s.last);
         }
      ]);
   }],

   // This route is executed after the OAuth flow, the provider redirects here.
   ['get', 'import/oauth/google', function (rq, rs) {
      if (! rq.data.query) return reply (rs, 400, {error: 'No query parameters.', query: rq.data.query});
      if (! rq.data.query.code) return reply (rs, 403, {error: 'No code parameter.', query: rq.data.query});
      if (rq.data.query.state !== rq.user.csrf) return reply (rs, 403, {error: 'Invalid state parameter.', query: rq.data.query});
      if (! rq.data.query.scope) reply (rs, 403, {error: 'No scope parameter.', query: rq.data.query});
      if (! eq (rq.data.query.scope.split (' ').sort (), ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/drive.photos.readonly', 'https://www.googleapis.com/auth/drive.readonly'])) {
         return astop (rs, [
            [notify, {priority: 'important', type: 'import scope error', provider: 'google', user: rq.user.username, error: 'Insufficient scopes', query: rq.data.query}],
            [reply, rs, 302, {}, {location: CONFIG.domain + '#/import/error/google'}]
         ]);
      }
      var body = [
         'code='          + rq.data.query.code,
         'client_id='     + SECRET.google.oauth.gdrive.webClientId,
         'client_secret=' + SECRET.google.oauth.gdrive.webSecret,
         'grant_type='    + 'authorization_code',
         'redirect_uri='  + encodeURIComponent (CONFIG.domain + 'import/oauth/google')
      ].join ('&');
      hitit.one ({}, {timeout: 15, https: true, method: 'post', host: 'oauth2.googleapis.com', path: 'token', headers: {'content-type': 'application/x-www-form-urlencoded'}, body: body, code: '*', apres: function (s, RQ, RS) {
         if (RS.code !== 200) return reply (rs, 403, {code: RS.code, error: RS.body});
         var multi = redis.multi ();
         multi.setex ('oa:g:acc:' + rq.user.username, RS.body.expires_in, RS.body.access_token);
         multi.set   ('oa:g:ref:' + rq.user.username, RS.body.refresh_token);
         multi.exec (function (error) {
            if (error) return reply (rs, 500, {error: error});
            reply (rs, 302, {}, {location: CONFIG.domain + '#/import/success/google'});
            H.log (a.creat (), rq.user.username, {ev: 'import', type: 'grant', provider: 'google'});
         });
      }});
   }],

   ['post', 'import/list/google', function (rq, rs) {

      a.stop ([
         [a.stop, [H.getGoogleToken, rq.user.username], function (s, error) {
            reply (rs, 401, {code: error.code || 500, error: error.body || error});
         }],
         [Redis, 'hgetall', 'imp:g:' + rq.user.username],
         function (s) {
            if (! s.last) return s.next ();
            if (s.last.status === 'error') return Redis (s, 'del', 'imp:g:' + rq.user.username);
            reply (rs, 409);
         },
         function (s) {
            s.id = Date.now ();
            a.seq (s, [
               [Redis, 'hmset', 'imp:g:' + rq.user.username, {id: s.id, status: 'listing'}],
               [H.log, rq.user.username, {ev: 'import', type: 'listStart', provider: 'google', id: s.id}],
               function (s) {
                  reply (rs, 200);
                  s.next ();
               }
            ]);
         },
         function (s) {

            var PAGESIZE = 1000, PAGES = 10000;

            var files = [], page = 1, folders = {}, roots = {}, children = {}, parentsToRetrieve = [];
            var limits = [], setLimit = function (n) {
               var d = Date.now ();
               limits.unshift ([d - d % 1000, n || 1]);
            }

            var getFilePage = function (s, nextPageToken) {
               a.seq (s, [
                  [H.log, rq.user.username, {ev: 'importDebug', type: 'getFilePage start', nextPageToken: nextPageToken}],
                  [H.getGoogleToken, rq.user.username],
                  function (s) {
                     var fields = ['id', 'name', 'size', 'mimeType', 'createdTime', 'modifiedTime', 'owners', 'parents', 'originalFilename', 'trashed'];

                     // https://developers.google.com/drive/api/v3/reference/files/list
                     // https://developers.google.com/drive/api/v3/reference/files#resource
                     var path = 'drive/v3/files?' + [
                        // https://stackoverflow.com/questions/38853938/google-drive-api-v3-invalid-field-selection#comment70761539_38865620
                        'fields=' + ['nextPageToken'].join (',') + ',' + dale.go (fields, function (v) {
                           return 'files/' + v;
                        }).join (','),
                        'corpora=user',
                        'includeItemsFromAllDrives=true',
                        'orderBy=modifiedTime',
                        'pageSize=' + PAGESIZE,
                        // https://developers.google.com/drive/api/guides/search-files
                        // We search for all images and videos, except for SVGs
                        'q=' + 'mimeType%20!%3D%20%27image%2Fsvg%2Bxml%27%20and%20(mimeType%20contains%20%27image%2F%27%20or%20mimeType%20contains%20%27video%2F%27)',
                        'supportsAllDrives=true',
                        'spaces=drive,photos',
                     ].join ('&') + (! nextPageToken ? '' : '&pageToken=' + nextPageToken);

                     page++;
                     setLimit ();

                     hitit.one ({}, {timeout: 30, https: true, method: 'get', host: 'www.googleapis.com', path: path, headers: {authorization: 'Bearer ' + s.token, 'content-type': 'application/x-www-form-urlencoded'}, body: '', code: '*', apres: function (S, RQ, RS) {

                        if (RS.code !== 200) {
                           // If we hit a rate limit error, wait 0.5 seconds and try again.
                           if (RS.body.code === 403 && type (RS.body.message) === 'string' && RS.body.message.match ('User Rate Limit Exceeded')) return setTimeout (function () {
                              getFilePage (s, nextPageToken);
                           }, 500);

                           return s.next (null, RS.body);
                        }

                        a.seq (s, [
                           [H.log, rq.user.username, {ev: 'importDebug', type: 'getFilePage got page', nfiles: dale.keys (RS.body.files).length}],
                           [Redis, 'hget', 'imp:g:' + rq.user.username, 'id'],
                           function (s) {
                              // If there is no import process ongoing or this import was cancelled and a new one was started, don't do anything else.
                              if (s.last !== s.id + '') return;
                              Redis (s, 'hincrby', 'imp:g:' + rq.user.username, 'fileCount', RS.body.files.length);
                           },
                           function (s) {
                              var allowedFiles = dale.fil (RS.body.files, undefined, function (file) {
                                 file.size = parseInt (file.size);
                                 // We mark unsupported files
                                 if (! inc (CONFIG.allowedFormats, file.mimeType)) file.unsupported = true;
                                 // Ignore trashed files!
                                 if (file.trashed) return;
                                 return file;
                              });

                              dale.go (allowedFiles, function (v) {
                                 dale.go (v.parents, function (v2) {
                                    if (! folders [v2] && ! inc (parentsToRetrieve, v2)) parentsToRetrieve.push (v2);
                                    if (! children [v2]) children [v2] = [];
                                    children [v2].push (v.id);
                                 });
                              });

                              files = files.concat (allowedFiles);

                              // Bring a maximum of PAGES pages.
                              if (page > PAGES) return s.next ();

                              if (RS.body.nextPageToken) getFilePage (s, RS.body.nextPageToken);
                              else {
                                 // We shuffle the list of parents to retrieve to try to get as few overlaps as possible of the same parents retrieved within the same batch request.
                                 H.shuffleArray (parentsToRetrieve);
                                 s.next ();
                              }
                           }
                        ]);
                     }});
                  }
               ]);
            }

            var getParentBatch = function (s, maxRequests) {
               a.seq (s, [
                  [H.getGoogleToken, rq.user.username],
                  [H.log, rq.user.username, {ev: 'importDebug', type: 'getParentBatch start', maxRequests: maxRequests, limits: limits}],
                  function (s) {
                     // QUERY LIMITS: daily: 1000m; per 100 seconds: 10k; per 100 seconds per user: 1k.
                     // don't extrapolate over user limit: 10 requests/second.
                     // We lower it to 5 requests every second to avoid hitting rate limits.
                     // Dashboard: https://console.developers.google.com/apis/dashboard
                     var requestLimit = 5, timeWindow = 1;

                     var boundary = Math.floor (Math.random () * Math.pow (10, 16));
                     var batch = parentsToRetrieve.splice (0, maxRequests || requestLimit);
                     if (batch.length === 0) return s.next ();

                     var body = '--' + boundary + '\r\n';
                     // https://developers.google.com/drive/api/v3/batch
                     dale.go (batch, function (id) {
                        var path = 'https://www.googleapis.com/drive/v3/files/' + id + '?' + [
                           'fields=id,name,parents'
                        ].join ('&');

                        body += 'Content-Type: application/http' + '\r\n\r\n';
                        // The double \r\n is critical for the request to return meaningful results.
                        body += 'GET ' + path + '\r\n\r\n';
                        body += '--' + boundary + '\r\n';
                     });
                     body += '--';

                     setLimit (batch.length);
                     hitit.one ({}, {timeout: 30, https: true, method: 'post', host: 'www.googleapis.com', path: 'batch/drive/v3', headers: {authorization: 'Bearer ' + s.token, 'content-type': 'multipart/mixed; boundary=' + boundary}, body: body, code: '*', apres: function (S, RQ, RS) {
                        H.log (a.creat (), rq.user.username, {ev: 'importDebug', type: 'getParentBatch got folders', code: RS.code, message: RS.body && RS.body.message});
                        if (RS.code !== 200) {
                           // If we hit a rate limit error, wait 0.5 seconds and try again.
                           if (RS.body.code === 403 && type (RS.body.message) === 'string' && RS.body.message.match ('User Rate Limit Exceeded')) {
                              dale.go (batch, function (id) {
                                 parentsToRetrieve.unshift (id);
                              });
                              return getParentBatch (s, maxRequests);
                           }
                           return s.next (null, RS.body);
                        }

                        if (! RS.headers ['content-type'] || ! RS.headers ['content-type'].match ('boundary')) return s.next (null, 'No boundary in request: ' + JSON.stringify (RS.headers));
                        var boundary = RS.headers ['content-type'].match (/boundary=.+$/g) [0].replace ('boundary=', '');
                        var parts = RS.body.split (boundary);
                        var error;
                        dale.stopNot (parts.slice (1, -1), undefined, function (part) {
                           var json = JSON.parse (part.match (/^{[\s\S]+^}/gm) [0]);
                           if (json.error) return error = json.error;

                           folders [json.id] = {name: json.name, parents: json.parents, count: 0};
                           if (! json.parents) roots [json.id] = true;
                           dale.go (json.parents, function (id) {
                              if (! children [id]) children [id] = [];
                              if (! inc (children [id], json.id)) children [id].push (json.id);
                              // If parent is not already retrieved and not in the list to be retrieved, add it to the list.
                              if (! folders [id] && ! inc (parentsToRetrieve, id)) parentsToRetrieve.push (id);
                           });
                        });
                        if (error) {
                           if (error.code === 403 && type (error.message) === 'string' && error.message.match ('User Rate Limit Exceeded')) {
                              dale.go (batch, function (id) {
                                 parentsToRetrieve.unshift (id);
                              });
                              return getParentBatch (s, maxRequests);
                           }
                           return s.next (null, error);
                        }

                        a.seq (s, [
                           [H.log, rq.user.username, {ev: 'importDebug', type: 'getParentBatch OK', maxRequests: maxRequests, limits: limits}],
                           [Redis, 'hget', 'imp:g:' + rq.user.username, 'id'],
                           function (s) {
                              // If there is no import process ongoing or this import was cancelled and a new one was started, don't do anything else.
                              if (s.last !== s.id + '') return;
                              Redis (s, 'hincrby', 'imp:g:' + rq.user.username, 'folderCount', batch.length);
                           },
                           function (s) {
                              if (parentsToRetrieve.length === 0) return s.next ();

                              var d = Date.now ();
                              d = d - d % 1000;
                              var lastPeriodTotal = 0, lastPeriodRequest;
                              dale.go (limits, function (limit) {
                                 if (((d - limit [0]) / 1000) < timeWindow) {
                                    lastPeriodTotal += limit [1];
                                    lastPeriodRequest = limit;
                                 }
                              });

                              var timeNow = new Date (d).toISOString ();

                              // If absolutely no capacity, must wait.
                              if (lastPeriodTotal >= requestLimit) {
                                 setTimeout (function () {
                                    getParentBatch (s, lastPeriodRequest [1]);
                                 }, timeWindow * 1000 - (d - lastPeriodRequest [0]));
                              }
                              // If some capacity but not unrestricted, send a limited request immediately.
                              else if (parentsToRetrieve.length > (requestLimit - lastPeriodTotal)) {
                                 getParentBatch (s, requestLimit - lastPeriodTotal);
                              }
                              else {
                                 getParentBatch (s);
                              }
                           }
                        ]);
                     }});
                  }
               ]);
            }

            a.seq (s, [
               [getFilePage],
               getParentBatch,
               function (s) {
                  // Count how many supported pivs per folder there are.
                  var porotoSum = function (id) {
                     folders [id].count++;
                     dale.go (folders [id].parents, porotoSum);
                  }

                  // Convert files into an object with their ids as keys
                  files = dale.obj (files, function (file) {
                     // If file is supported, increment count for all parent folders
                     if (! file.unsupported) dale.go (file.parents, porotoSum);
                     return [file.id, file];
                  });

                  var data = {roots: dale.keys (roots), folders: {}, files: files};

                  dale.go (folders, function (folder, id) {
                     data.folders [id] = {name: folder.name, count: folder.count, parent: (folders [id].parents || []) [0], children: children [id]};
                  });

                  /* FINAL OBJECT IS OF THE FORM:
                  {roots: [ID, ...], folders: {
                     ID: {id: ID, name: '...', count: ..., parent: ..., children: [...]},
                     ...
                  }, files: {
                     ID: {id: ID, ...}
                  }}
                  */

                  a.seq (s, [
                     [Redis, 'hget', 'imp:g:' + rq.user.username, 'id'],
                     function (s) {
                        // If there is no import process ongoing or this import was cancelled and a new one was started, don't do anything else.
                        if (s.last !== s.id + '') return;
                        Redis (s, 'hmset', 'imp:g:' + rq.user.username, {status: 'ready', data: JSON.stringify (data)});
                     },
                     [H.log, rq.user.username, {ev: 'import', type: 'listEnd', provider: 'google', id: s.id}],
                     function (s) {
                        var email = CONFIG.etemplates.importList ('Google', rq.user.username);
                        sendmail (s, {
                           to1:     rq.user.username,
                           to2:     rq.user.email,
                           subject: email.subject,
                           message: email.message
                        });
                     }
                  ]);
               }
            ]);
         }
      ], function (s, error) {
         a.stop (s, [
            [function (s) {
               // If there is an auth error, delete the credentials
               if (error.error && error.error.code === 401) Redis (s, 'del', 'oa:g:acc:' + rq.user.username, 'oa:g:ref:' + rq.user.username);
               else s.next ();
            }],
            [Redis, 'hget', 'imp:g:' + rq.user.username, 'id'],
            [function (s) {
               // If there is no import process ongoing or this import was cancelled and a new one was started, don't do anything else.
               if (s.last !== s.id + '') return;
               Redis (s, 'hmset', 'imp:g:' + rq.user.username, {status: 'error', error: teishi.complex (error) ? JSON.stringify (error) : error, end: Date.now ()});
            }],
            [H.log, rq.user.username, {ev: 'import', type: 'listError', provider: 'google', id: s.id, error: error}],
            [notify, {priority: 'important', type: 'import list error', provider: 'google', user: rq.user.username, error: error}],
            function (s) {
               var email = CONFIG.etemplates.importError ('Google', rq.user.username);
               sendmail (s, {
                  to1:     rq.user.username,
                  to2:     rq.user.email,
                  subject: email.subject,
                  message: email.message
               });
            },
         ], function (s, error) {
            notify (a.creat (), {priority: 'important', type: 'import list error handling error', provider: 'google', user: rq.user.username, error: error});
         });
      });
   }],

   ['post', 'import/cancel/google', function (rq, rs) {
      astop (rs, [
         [Redis, 'hgetall', 'imp:g:' + rq.user.username],
         function (s) {
            if (! s.last) return reply (rs, 200);
            a.seq (s, [
               s.last.status === 'uploading' ?
                  [H.log, rq.user.username, {ev: 'upload', type: 'cancel', id: parseInt (s.last.id), provider: 'google'}] :
                  [H.log, rq.user.username, {ev: 'import', type: 'cancel', id: parseInt (s.last.id), provider: 'google', status: s.last.status}],
               [Redis, 'del', 'imp:g:' + rq.user.username],
               [reply, rs, 200]
            ]);
         }
      ]);
   }],

   ['post', 'import/select/google', function (rq, rs) {
      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['ids'], 'eachOf', teishi.test.equal],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
      ])) return;

      b.ids = b.ids.sort ();

      astop (rs, [
         [Redis, 'hgetall', 'imp:g:' + rq.user.username],
         function (s) {
            if (! s.last) return reply (rs, 404);
            if (s.last.status !== 'ready') return reply (rs, 409);

            var data = JSON.parse (s.last.data);

            var invalidId = dale.stopNot (b.ids, undefined, function (id) {
               if (! data.folders [id]) return id;
            });
            if (invalidId) return reply (rs, 400, {error: 'No folder with id: ' + invalidId});

            s.id = parseInt (s.last.id);
            Redis (s, 'hset', 'imp:g:' + rq.user.username, 'selection', JSON.stringify (b.ids));
         },
         function (s) {
            H.log (s, rq.user.username, {ev: 'import', type: 'selection', provider: 'google', id: s.id, folders: b.ids});
         },
         [reply, rs, 200]
      ]);
   }],

   ['post', 'import/upload/google', function (rq, rs) {
      a.stop ([
         [a.stop, [H.getGoogleToken, rq.user.username], function (s, error) {
            reply (rs, 401, {code: error.code || 500, error: error.body || error});
         }],
         [a.set, 'hashes', [Redis, 'smembers', 'hash:'  + rq.user.username + ':g']],
         [a.set, 'import', [Redis, 'hgetall',  'imp:g:' + rq.user.username]],
         function (s) {
            if (! s.import) return reply (rs, 404);
            if (s.import.status !== 'ready') return reply (rs, 409);

            s.id = parseInt (s.import.id);

            var data = JSON.parse (s.import.data);

            var hashes = dale.obj (s.hashes, function (hash) {
               return [hash, true];
            });

            // filesToUpload: keys are file ids, values is the file plus a list of folder names to be used as tags (direct parent and parent of parents all the way to the root).
            // alreadyImported is a counter of already imported files. There's no need to store their names, just how many of them there are.
            var filesToUpload = {}, alreadyImported = 0, tooLarge = [], unsupported = [];

            var recurseUp = function (childId, folderId) {
               var folder = data.folders [folderId];
               // We only consider folder names as tags if they are valid tags.
               if (H.isUserTag (folder.name)) filesToUpload [childId].tags.push (folder.name);
               if (folder.parent) recurseUp (childId, folder.parent);
            }

            var recurseDown = function (folderId) {
               var folder = data.folders [folderId];
               dale.go (folder.children, function (childId) {
                  // If child of folder is a folder, invoke recursively
                  if (data.folders [childId]) return recurseDown (childId);
                  // Else, it is a piv
                  // We check whether we already have the file. If we do, we ignore it and not have into account at all, not even on the total count.
                  var file = data.files [childId];
                  if (hashes [H.hash (childId + ':' + file.modifiedTime)]) return alreadyImported++;
                  if (file.size > CONFIG.maxFileSize)                      return tooLarge.push (file.originalFilename);
                  if (! inc (CONFIG.allowedFormats, mime.getType (file.originalFilename))) return unsupported.push (file.originalFilename);

                  file.tags = [];
                  filesToUpload [childId] = file;
                  recurseUp (childId, folderId);
               });
            }

            dale.go (s.import.selection ? JSON.parse (s.import.selection) : [], recurseDown);

            // If there are no files to import, we delete the import key and set the user logs.
            if (dale.keys (filesToUpload).length === 0) return a.seq (s, [
               [Redis, 'del', 'imp:g:' + rq.user.username],
               [H.log, rq.user.username, {ev: 'upload', type: 'start',    id: s.id, provider: 'google', total: 0, tooLarge: tooLarge.length ? tooLarge : undefined, unsupported: unsupported.length ? unsupported : undefined, alreadyImported: alreadyImported}],
               [H.log, rq.user.username, {ev: 'upload', type: 'complete', id: s.id, provider: 'google'}],
               [reply, rs, 200]
            ]);

            s.filesToUpload = filesToUpload;
            s.ids = dale.keys (s.filesToUpload);

            // If we're here, there are files to be imported.
            H.log (s, rq.user.username, {ev: 'upload', type: 'start', id: s.id, provider: 'google', total: s.ids.length, tooLarge: tooLarge.length ? tooLarge : undefined, unsupported: unsupported.length ? unsupported : undefined, alreadyImported: alreadyImported});
         },
         [Redis, 'hset', 'imp:g:' + rq.user.username, 'status', 'uploading'],
         [a.set, 'session', [a.make (require ('bcryptjs').genSalt), 20]],
         [a.set, 'csrf',    [a.make (require ('bcryptjs').genSalt), 20]],
         function (s) {
            // We use s.Cookie instead of s.cookie to avoid it being overwritten by the call to the notify function
            s.Cookie = cicek.cookie.write (CONFIG.cookieName, s.session);
            Redis (s, 'setex', 'session:' + s.session, giz.config.expires, rq.user.username);
         },
         function (s) {
            Redis (s, 'setex', 'csrf:' + s.session, giz.config.expires, s.csrf);
         },
         function (s) {

            // We return a 200 since the rest of the process will be done asynchronously.
            reply (rs, 200);

            var check = function (cb) {
               redis.hexists ('imp:g:' + rq.user.username, 'upload', function (error, exists) {
                  if (error) return s.next (null, error);
                  if (exists) cb ();
               });
            }

            var importFile = function (s, index) {
               var Error, lastActivity = Date.now (), currentStatus = 'initial';
               // We only set the interval if there are files still left to upload.
               if (index < s.ids.length) var waitInterval = setInterval (function () {
                  // If the last activity (either the beginning of the process or the last wait event) was 9 minutes ago or more, send a wait event to avoid the upload being stalled.
                  // If we are in the test environment, do it every two seconds.
                  var maxInactivity = ENV ? 1000 * 60 * (10 - 1) : 1000 * (3 - 1);
                  if (Date.now () - lastActivity > maxInactivity) {
                     a.seq (s, [
                        [notify, {priority: 'important', type: 'import wait event', currentStatus: currentStatus, user: rq.user.username, provider: 'google', file: s.filesToUpload [s.ids [index]]}],
                        function (s) {
                           hitit.one ({}, {host: 'localhost', port: CONFIG.port, method: 'post', path: 'upload', headers: {cookie: s.Cookie}, body: {op: 'wait', id: s.id, provider: 'google', csrf: s.csrf}, code: '*', apres: function (S, RQ, RS, next) {
                              if (RS.code !== 200) {
                                 Error = true;
                                 clearInterval (waitInterval);
                                 return s.next (null, {code: RS.code, error: RS.body});
                              }
                              lastActivity = Date.now ();
                           }});
                        }
                     ]);
                  }
               }, 1000);
               a.seq (s, [
                  [H.getGoogleToken, rq.user.username],
                  [Redis, 'hget', 'imp:g:' + rq.user.username, 'id'],
                  [function (s) {
                     // If there is no import process ongoing or this import was cancelled and a new one was started, don't do anything else.
                     if (s.last !== (s.id + '')) return;
                     s.next ();
                  }],
                  function (s) {
                     currentStatus = 'auth-ok';
                     // If we reached the end of the list, we're done.
                     if (index === s.ids.length) return a.seq (s, [
                        [Redis, 'del', 'imp:g:' + rq.user.username],
                        [H.log, rq.user.username, {ev: 'upload', type: 'complete', id: s.id, provider: 'google'}],
                        function (s) {
                           var email = CONFIG.etemplates.importUpload ('Google', rq.user.username);
                           sendmail (s, {
                              to1:     rq.user.username,
                              to2:     rq.user.email,
                              subject: email.subject,
                              message: email.message
                           });
                        }
                     ]);

                     var file = s.filesToUpload [s.ids [index]], providerError = function (code, error) {
                        if (Error) return;
                        Error = true;
                        clearInterval (waitInterval);
                        a.seq (s, code === 401 ? [
                           [Redis, 'del', 'oa:g:acc:' + rq.user.username, 'oa:g:ref:' + rq.user.username],
                           [Redis, 'hmset', 'imp:g:' + rq.user.username, {status: 'error', error: teishi.complex (error) ? JSON.stringify (error) : error, end: Date.now ()}],
                           [H.log, rq.user.username, {ev: 'import', type: 'error', provider: 'google', id: s.id, error: error}],
                           [H.log, rq.user.username, {ev: 'upload', type: 'error', id: s.id, provider: 'google', name: file.name, error: error}],
                        ] : [
                           [H.log, rq.user.username, {ev: 'upload', type: 'providerError', id: s.id, provider: 'google', error: {code: code, error: error}, name: file.name}],
                           [importFile, index + 1]
                        ]);
                     }

                     currentStatus = 'before-google';
                     // We stream the response body directly into a file.
                     // https://developers.google.com/drive/api/v3/reference/files/export
                     https.request ({host: 'www.googleapis.com', path: '/drive/v3/files/' + file.id + '?alt=media', headers: {authorization: 'Bearer ' + s.token, 'content-type': 'application/x-www-form-urlencoded'}}, function (response) {
                        currentStatus = 'after-google';

                        response.on ('error', function (error) {
                           providerError (null, error);
                        });
                        if (response.statusCode !== 200) {
                           response.setEncoding ('utf8');
                           response.body = '';
                           response.on ('data', function (buffer) {
                              response.body += buffer.toString ();
                           });
                           response.on ('end', function () {
                              providerError (response.statusCode, response.body);
                           });
                           return;
                        }

                        var tempPath = Path.join ((os.tmpdir || os.tmpDir) (), cicek.pseudorandom (24));
                        var wstream = fs.createWriteStream (tempPath);
                        wstream.on ('error', function (error) {
                           Error = true;
                           clearInterval (waitInterval);
                           s.next (null, error);
                        });
                        response.pipe (wstream);
                        currentStatus = 'before-write';
                        wstream.on ('finish', function () {
                           currentStatus = 'before-upload';
                           if (Error) return;
                           // UPLOAD THE FILE
                           hitit.one ({}, {host: 'localhost', port: CONFIG.port, method: 'post', path: 'piv', headers: {cookie: s.Cookie}, body: {multipart: [
                              // This `file` field is a dummy one to pass validation. The actual file information goes inside importData
                              {type: 'file',  name: 'piv', value: 'foobar', filename: 'foobar' + Path.extname (file.name)},
                              {type: 'field', name: 'id', value: s.id},
                              // Use oldest date, whether createdTime or updatedTime
                              {type: 'field', name: 'lastModified', value: Math.min (new Date (file.createdTime).getTime (), new Date (file.modifiedTime).getTime ())},
                              {type: 'field', name: 'tags', value: JSON.stringify (file.tags.concat ('Google Drive'))},
                              {type: 'field', name: 'importData', value: JSON.stringify ({
                                 provider:     'google',
                                 id:           file.id,
                                 name:         file.originalFilename,
                                 modifiedTime: file.modifiedTime,
                                 path:         tempPath
                              })},
                              {type: 'field', name: 'csrf', value: s.csrf}
                           ]}, code: '*', apres: function (S, RQ, RS, next) {
                              currentStatus = 'after-upload';
                              clearInterval (waitInterval);

                              // UNEXPECTED ERROR
                              if (RS.code !== 200 && RS.code !== 400) return s.next (null, {error: RS.body, code: RS.code, file: file});

                              // NO MORE SPACE
                              // 409 errors for capacity limit reached are considered critical now in the beginning phases. This behavior will be changed as that becomes a more normal occurrence.
                              if (RS.code === 409) return s.next (null, {error: 'No more space in your ac;pic account.', code: RS.code});

                              // INVALID FILE (CANNOT BE TOO LARGE OR INVALID FORMAT BECAUSE WE PREFILTER THEM ABOVE)
                              // OR
                              // SUCCESSFUL UPLOAD OR REPEATED PIV, KEEP ON GOING
                              importFile (s, index + 1);
                           }});
                        });
                     }).on ('error', function (error) {
                        clearInterval (waitInterval);
                        s.next (null, error);
                     }).end ();
                  }
               ]);
            }
            importFile (s, 0);
         }
      ], function (s, error) {
         a.seq (s, [
            [function (s) {
               // If error happens before replying to the request, send it directly to the response.
               if (! rs.writableEnded) reply (rs, 500, {error: error});
               s.next ();
            }],
            function (s) {
               // If there is an auth error, delete the credentials
               if (error.error && error.error.code === 401) Redis (s, 'del', 'oa:g:acc:' + rq.user.username, 'oa:g:ref:' + rq.user.username);
               else s.next ();
            },
            [H.log, rq.user.username, {ev: 'import', type: 'error', provider: 'google', id: s.id, error: error}],
            [notify, {priority: 'important', type: 'import upload error', error: error, user: rq.user.username, provider: 'google', id: s.id}],
            function (s) {
               var email = CONFIG.etemplates.importError ('Google', rq.user.username);
               sendmail (s, {
                  to1:     rq.user.username,
                  to2:     rq.user.email,
                  subject: email.subject,
                  message: email.message
               });
            },
            [a.cond, [Redis, 'exists', 'imp:g:' + rq.user.username], {'1': function () {
               redis.hmset ('imp:g:' + rq.user.username, {status: 'error', error: teishi.complex (error) ? JSON.stringify (error) : error, end: Date.now ()});
            }}]
         ]);
      });
   }],

   // *** ADMIN AREA ***

   // *** REDMIN ***

   ['get', 'redmin', reply, redmin.html ()],
   ['post', 'redmin', function (rq, rs) {
      redmin.api (rq.body, function (error, data) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 200, data);
      });
   }],
   ['get', 'redmin/client.js',    cicek.file, 'node_modules/redmin/client.js'],
   ['get', 'redmin/gotoB.min.js', cicek.file, 'node_modules/gotob/gotoB.min.js'],

   ['get', 'admin/users', function (rq, rs) {
      astop (rs, [
         [Redis, 'smembers', 'users'],
         function (s) {
            var multi = redis.multi ();
            dale.go (s.last, function (username) {
               multi.hgetall ('users:' + username);
               multi.scard ('tag:' + username + ':a::');
               multi.scard ('tags:' + username);
               multi.get ('stat:f:byfs-' + username);
            });
            mexec (s, multi);
         },
         function (s) {
            var users = dale.fil (s.last, undefined, function (user, k) {
               if (k % 4 !== 0) return;
               delete user.pass;
               user.pivs = s.last [k + 1];
               user.tags = s.last [k + 2];
               user.bytes = s.last [k + 3];
               return user;
            });
            users.sort (function (A, B) {
               var a = A.lastActivity;
               var b = B.lastActivity;
               if (! a && ! b) return parseInt (B.created) - parseInt (A.created);
               if (! a && b) return 1;
               if (a && ! b) return -1;
               if (a && b) return parseInt (b) - parseInt (a);
            });
            reply (rs, 200, users);
         }
      ]);
   }],

   // *** ADMIN: STATS ***

   ['post', 'admin/stats', function (rq, rs) {
      astop (rs, [
         [H.stat.r, rq.body],
         [a.get, reply, rs, 200, '@last'],
      ]);
   }],

   // *** ADMIN: DEPLOY CLIENT FROM ADMIN ***

   ['post', 'admin/deploy', function (rq, rs) {

      if (! rq.data.files || ! rq.data.files.file) return reply (rs, 400);
      if (['client.js', 'channel.js'].indexOf (rq.data.fields.name) === -1) return reply (rs, 400);

      astop (rs, [
         [a.make (fs.rename), rq.data.files.file, rq.data.fields.name],
         [reply, rs, 200]
      ]);
   }],

   // *** ADMIN: DEBUG PIV ***

   ['get', 'admin/debug/:id', function (rq, rs) {
      astop (rs, [
         [Redis, 'hgetall', 'piv:' + rq.data.params.id],
         function (s) {
            if (! s.last) return reply (rs, 200, {});
            s.db = s.last;
            s.db.dates = JSON.parse (s.db.dates);
            s.file = Path.join (CONFIG.basepath, H.hash (s.last.owner), s.last.id);
            H.getMetadata (s, s.file, false, s.last.dates ['upload:lastModified'], s.last.name);
         },
         function (s) {
            reply (rs, 200, {file: s.file, db: s.db, metadata: s.last});
         }
      ]);
   }],

   // *** ADMIN: USER LOGS ***

   ['get', 'admin/logs/:username', function (rq, rs) {

      var processLog = function (log, username, abbreviate) {
         if (type (log) === 'string') log = JSON.parse (log);
         log.username = username;
         if (abbreviate && log.ev === 'upload' && inc (['ok', 'alreadyUploaded', 'repeated'], log.type)) return;
         if (log.ids) log.ids = log.ids.length;
         if (log.unsupported) {
            var extensions = [];
            dale.go (log.unsupported, function (v) {
               v = teishi.last (v.split ('.'));
               if (! inc (extensions, v)) extensions.push (v);
            });
            log.unsupported = {n: log.unsupported.length, extensions: extensions};
         }
         if (ENV === 'prod') {
            if (log.tag) delete log.tag;
            if (log.tags) log.tags = log.tags.length
         }
         return log;
      }

      astop (rs, [
         [function (s) {
            if (rq.data.params.username !== 'all') a.seq (s, [
               [Redis, 'lrange', 'ulog:' + rq.data.params.username, 0, -1],
               function (s) {
                  s.next (dale.fil (s.last, undefined, function (log) {
                     return processLog (log, rq.data.params.username);
                  }));
               }
            ]);
            else a.seq (s, [
               [redis.keyscan, 'ulog:*'],
               function (s) {
                  s.users = [];
                  var multi = redis.multi ();
                  dale.go (s.last, function (key) {
                     s.users.push (key.split (':') [1]);
                     multi.lrange (key, 0, -1);
                  });
                  mexec (s, multi);
               },
               function (s) {
                  var output = [];
                  dale.go (s.last, function (logs, k) {
                     dale.go (logs, function (log) {
                        log = processLog (log, s.users [k], true);
                        if (log) output.push (log);
                     });
                  });
                  s.next (output);
               },
               function (s) {
                  s.next (s.last);
               }
            ]);
         }],
         function (s) {
            reply (rs, 200, s.last.sort (function (a, b) {
               return b.t - a.t;
            }));
         }
      ]);
   }],

   // *** ADMIN: PIV DATES ***

   ['get', 'admin/dates', function (rq, rs) {

      astop (rs, [
         // Get list of pivs and thumbs
         [redis.keyscan, 'piv:*'],
         function (s) {
            var multi = redis.multi ();
            dale.go (s.last, function (id) {
               multi.hgetall (id);
            });
            dale.go (s.last, function (id) {
               multi.sinter (id.replace ('piv', 'pivt'));
            });
            mexec (s, multi);
         },
         function (s) {
            var output = [];
            // id, owner, name, tags, date effective (sorted by, earliest at the top), s.dates
            dale.go (s.last, function (piv, k) {
               if (k >= s.last.length / 2) return;
               output.push ([piv.id, piv.owner, piv.name, s.last [s.last.length / 2 + k].join (' // '), parseInt (piv.date), new Date (parseInt (piv.date)).toISOString ()].concat (dale.go (JSON.parse (piv.dates), function (v2, k2) {return k2 + ': ' + v2})));
            });
            output.sort (function (a, b) {
               return a [4] - b [4];
            });
            reply (rs, 200, dale.go (output, function (v) {return v.join ('\t')}).join ('\n'), {'content-disposition': 'attachment; filename=dates-' + Date.now () + '.csv'});
         }
      ]);
   }],

   // *** ADMIN: MEASURE SPACE USAGE BY KEY TYPE ***

   ['get', 'admin/space', function (rq, rs) {

      astop (rs, [
         [a.set, 'keys', [redis.keyscan, '*']],
         function (s) {
            var multi = redis.multi ();
            dale.go (s.keys, function (key) {
               multi.memory ('usage', key, 'samples', 0);
            });
            mexec (s, multi);
         },
         function (s) {
            var totals = {}, total = 0;
            dale.go (s.keys, function (key, k) {
               key = key.split (':');
               if (key [0] === 'stat') key = key [0] + ':' + key [1];
               else key = key [0];
               if (key === 'hashorig') key = 'hash';
               if (! totals [key]) totals [key] = 0;
               totals [key] += s.last [k];
               total += s.last [k];
            });
            totals.total = total;
            totals = dale.go (totals, function (v, k) {
               return [k, (Math.round (v / 100000) / 10), Math.round (100 * v / total) + '%'];
            }).sort (function (a, b) {
               return b [1] - a [1];
            });
            reply (rs, 200, JSON.stringify (totals, null, '   '));
         }
      ]);
   }],

   // *** ADMIN: LIST UPLOAD INFORMATION (FOR DEBUGGING) ***

   ['get', 'admin/uploads/:username', function (rq, rs) {
      astop (rs, [
         [H.getUploads, rq.data.params.username],
         function (s) {
            dale.go (s.last, function (v) {
               v.id = new Date (v.id).toISOString ();
               if (v.end) v.end = new Date (v.end).toISOString ();
            });
            reply (rs, 200, JSON.stringify (s.last, null, '   '));
         }
      ]);
   }],

   // *** ADMIN: SEE USER ACTIVITY (FOR DEBUGGING) ***

   ['get', 'admin/activity/:username', function (rq, rs) {
      astop (rs, [
         [redis.keyscan, 'stat:f:rq-user-' + rq.data.params.username + ':*'],
         function (s) {
            var keys = dale.go (s.last, function (key) {
               return H.stat.zero + parseInt (key.split (':') [3] + '000');
            }).sort ().reverse ();
            var chunks = [];
            dale.go (keys, function (key) {
               if (! chunks.length) return chunks.push ([key]);
               // We consider contiguous activity two requests within 30 seconds
               if (last (last (chunks)) - 30000 <= key) {
                  return last (chunks).length === 1 ? last (chunks).push (key) : last (chunks) [1] = key;
               }
               chunks.push ([key]);
            });
            chunks = dale.go (chunks, function (chunk) {
               return [
                  chunk [0] ? new Date (chunk [0]).toISOString () : undefined,
                  chunk [1] ? new Date (chunk [1]).toISOString () : undefined,
               ];
            });
            reply (rs, 200, JSON.stringify (chunks, null, '   '));
         }
      ]);
   }],

];

// *** SERVER CONFIGURATION ***

cicek.options.cookieSecret = SECRET.cookieSecret;
cicek.options.log.console  = false;

cicek.apres = function (rs) {
   var t = Date.now ();
   if (rs.log.url.match (/^\/auth/)) {
      if (rs.log.requestBody && rs.log.requestBody.password) rs.log.requestBody.password = 'REDACTED';
   }

   var logs = [
      ['flow', 'rq-' + rs.log.code, 1],
   ];

   if (rs.log.code >= 400) {
      logs.push (['flow', 'rq-bad', 1]);
      var ignore = dale.stop ([
         ['/auth/csrf',   403],
         ['/favicon.ico', 403],
         ['/auth/signup', 418],
      ], true, function (toIgnore) {
         return rs.log.url === toIgnore [0] && rs.log.code === toIgnore [1];
      });
      if (! ignore) notify (a.creat (), {priority: rs.log.code >= 500 ? 'critical' : 'important', type: 'response error', code: rs.log.code, method: rs.log.method, url: rs.log.url, ip: rs.log.origin, userAgent: rs.log.requestHeaders ['user-agent'], headers: rs.log.requestHeaders, body: rs.log.requestBody, data: rs.log.data, user: rs.request.user ? rs.request.user.username : null, rbody: teishi.parse (rs.log.responseBody) || rs.log.responseBody});
   }
   else {
      logs.push (['flow', 'rq-all', 1]);
      logs.push (['flow', 'ms-all', t - rs.log.startTime]);
      logs.push (['max',  'ms-all', t - rs.log.startTime]);
      dale.go (['auth', 'piv', 'thumb', 'upload', 'delete', 'rotate', 'tag', 'query', 'share', 'geo'], function (path) {
         if (path === 'piv' && rs.log.url === 'post') path = 'pivup';
         if (rs.log.method !== ((path === 'piv' || path === 'thumb') ? 'get' : 'post')) return;
         if (! rs.log.url.match (new RegExp ('^\/' + path))) return;
         if (path === 'query') var rqpath = path + (rs.log.requestBody.refresh ? 'r' : 'm');
         else                  var rqpath = path;
         logs.push (['flow', 'rq-' + rqpath, 1]);
         logs.push (['flow', 'ms-' + path, t - rs.log.startTime]);
         logs.push (['max',  'ms-' + path, t - rs.log.startTime]);
      });
   }

   H.stat.w (a.creat (), logs);

   cicek.Apres (rs);
}

cicek.log = function (message) {
   if (type (message) !== 'array' || message [0] !== 'error') return;
   var notification;
   if (message [1] === 'client error') {
      if (message [2] === 'Error: read ECONNRESET') return;
      if (message [2].match ('Error: Parse Error:')) return;
      notification = {
         priority: 'important',
         type:    'client error in server',
         from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
         error:   message [2]
      }
   }
   else if (message [1] === 'Invalid signature in cookie') {
      // TODO: re-add notification once cicek ignores attributes in cookies
      return;
      /*
      notification = {
         priority: 'important',
         type: 'invalid signature in cookie',
         from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
         error:   message [2]
      }
      */
   }
   else if (message [1].match (/cicek\.(reply|file) validation error/) && message [2].match (/response.connection.writable passed to cicek.(reply|file) should be equal to true but instead is false/)) notification = {
      priority: 'normal',
      type:    'client error',
      subtype: message [1],
      from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
      error:   message [2]
   }
   else if (message [1] === 'worker error') notification = {
      priority: 'critical',
      type:    'server error',
      subtype: message [1],
      from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
      error:   message [2]
   }
   else notification = {
      priority: 'critical',
      type:    'server error',
      subtype: message [1],
      from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
      error:   message [2]
   }

   notify (a.creat (), notification);
}

cicek.cluster ();

if (inc ([undefined, 'makeConsistent'], mode)) {
   server = cicek.listen ({port: CONFIG.port}, routes);

   if (cicek.isMaster) a.seq ([
      [k, 'git', 'rev-parse', 'HEAD'],
      function (s) {
         if (s.error) return notify (a.creat (), {priority: 'critical', type: 'server start', error: s.error});
         notify (a.creat (), {priority: 'important', type: 'server start', sha: s.last.stdout.slice (0, -1)});
      }
   ]);
}

// *** REDIS ERROR HANDLER ***

var lastRedisErrorNotification = 0;

redis.on ('error', function (error) {
   // Notify maximum once every 60 seconds.
   if ((Date.now () - lastRedisErrorNotification) < (1000 * 60)) return;
   lastRedisErrorNotification = Date.now ();
   notify (a.creat (), {priority: 'critical', type: 'redis error', error: error});
});

// *** DB BACKUPS ***

if (cicek.isMaster && ENV && ! mode) setInterval (function () {
   var s3 = new (require ('aws-sdk')).S3 ({
      apiVersion:  '2006-03-01',
      sslEnabled:  true,
      credentials: {accessKeyId: SECRET.s3.accessKeyId, secretAccessKey: SECRET.s3.secretAccessKey},
      params:      {Bucket:      SECRET.s3.db.bucketName},
   });

   a.stop ([
      [a.make (H.encrypt), CONFIG.backup.path],
      [a.get, a.make (s3.upload, s3), {Key: new Date ().toISOString () + '-dump.rdb', Body: '@last'}],
   ], function (s, error) {
      notify (s, {priority: 'critical', type: 'backup error', error: error});
   });
}, CONFIG.backup.frequency * 60 * 1000);

// *** CHECK OS RESOURCES ***

if (cicek.isMaster && ENV && ! mode) setInterval (function () {
   a.seq ([
      [a.fork, ['mpstat', 'free'], function (v) {return [k, v]}],
      function (s) {
         if (s.error) return notify (s, {priority: 'critical', type: 'resources check error', error: s.error});
         var cpu  = s.last [0].stdout;
         cpu = cpu.split ('\n') [3].split (/\s+/);
         cpu = Math.round (parseFloat (cpu [cpu.length - 1].replace (',', '.')));

         var free = s.last [1].stdout.split ('\n') [1].split (/\s+/);
         free = Math.round (100 * parseInt (free [6]) / parseInt (free [1]));

         a.seq (s, [
            cpu  < 20 ? [notify, {priority: 'critical', type: 'high CPU usage', usage: (100 - cpu)  / 100}] : [],
            free < 20 ? [notify, {priority: 'critical', type: 'high RAM usage', usage: (100 - free) / 100}] : [],
         ]);
      },
   ]);
}, 1000 * 60);

// *** CHECK CONSISTENCY OF FILES BETWEEN DB, FS AND S3 ***

if (cicek.isMaster && ENV && inc (['checkConsistency', 'makeConsistent'], mode)) var doneChecks = 0;

if (cicek.isMaster && ENV && mode !== 'script') a.stop ([
   [function (s) {
      s.start = Date.now ();
      s.next ();
   }],
   [a.fork, [
      [
         // Get list of files from S3
         // Final shape will be {PATH: SIZE, ...}
         [H.s3list, ''],
         function (s) {
            s.s3Files = dale.obj (s.last, function (v) {
               return [v.key, v.size];
            });
            s.next ();
         },
      ],
      [
         // Get list of files from FS
         // Final shape will be {PATH: SIZE, ...}
         [a.make (fs.readdir), CONFIG.basepath],
         [a.get, a.fork, '@last', function (dir) {
            return [
               // Read all files. Important assumption: inside CONFIG.basepath, there are folders and inside them, there are files.
               // There should be no nested folders inside these folders.
               [a.stop, [a.make (fs.readdir), Path.join (CONFIG.basepath, dir)], function (s, error) {
                  if (ENV) return s.next (null, error);
                  // Errors can happen when running the script locally. Ignore them and continue.
                  return s.next (false);
               }],
               function (s) {
                  if (s.last === false) s.next ([]);
                  s.next (dale.go (s.last, function (file) {
                     return Path.join (dir, file);
                  }));
               }
            ];
         }, {max: os.cpus ().length}],
         function (s) {
            var files = [];
            dale.go (s.last, function (dir) {
               dale.go (dir, function (file) {
                  files.push (file);
               });
            });
            var fsFiles = {};
            a.seq ([
               [a.fork, files, function (file) {
                  return [
                     [a.make (fs.stat), Path.join (CONFIG.basepath, file)],
                     function (s) {
                        if (s.error) return s.next (null, s.error);
                        fsFiles [file] = s.last.size;
                        s.next ();
                     }
                  ];
               }, {max: os.cpus ().length}],
               function (S) {
                  s.fsFiles = fsFiles;
                  s.next ();
               }
            ]);
         },
      ],
      [
         // Get list of pivs from DB (which include also thumb information)
         // Final shape will be {'PATH': [SIZE, piv|thumb|mp4], ...}
         [redis.keyscan, 'piv:*'],
         function (s) {
            var multi = redis.multi ();
            dale.go (s.last, function (id) {
               multi.hgetall (id);
            });
            mexec (s, multi);
         },
         function (s) {
            s.dbFiles = {};
            dale.go (s.last, function (piv) {
               var prefix = H.hash (piv.owner) + '/';
               s.dbFiles [prefix + piv.id] = [parseInt (piv.byfs), 'piv'];
               if (piv.thumbS) s.dbFiles [prefix + piv.thumbS] = [parseInt (piv.bythumbS), 'thumb'];
               if (piv.thumbM) s.dbFiles [prefix + piv.thumbM] = [parseInt (piv.bythumbM), 'thumb'];
               // piv.vid will point to a mp4 video only if 1) the original video is not a mp4; 2) the conversion didn't end up in error.
               if (piv.vid && piv.vid !== '1') s.dbFiles [prefix + piv.vid] = [parseInt (piv.bymp4), 'mp4'];
            });
            s.next ();
         },
      ]
   ], function (v) {return v}],
   // Check consistency. DB data is the measure of everything, the single source of truth.
   function (s) {
      // Note: All file lists (s.s3Files, s.fsFiles, s.dbFiles) were initialized as objects for quick lookups; if stored as arrays instead, we'd be iterating the array N times when performing the checks below.

      s.fsExtra     = [];
      s.fsMissing   = [];
      s.fsWrongSize = [];
      s.s3Extra     = [];
      s.s3Missing   = [];
      s.s3WrongSize = [];

      dale.go (s.dbFiles, function (data, dbFile) {
         // Omit errored mp4 conversions
         if (data [1] === 'mp4' && dbFile.match (/error/)) return;
         // S3 only holds original pivs
         if (data [1] === 'piv') {
            if (! s.s3Files [dbFile]) s.s3Missing.push (dbFile);
            // The H.encrypt function, used to encrypt files before uploading them to S3, increases file size by 32 bytes.
            else if (s.s3Files [dbFile] - data [0] !== 32) s.s3WrongSize.push (dbFile);
         }
            // FS holds both original pivs and thumbnails.
         if (! s.fsFiles [dbFile]) s.fsMissing.push (dbFile);
         else if (s.fsFiles [dbFile] !== data [0]) s.fsWrongSize.push (dbFile);
      });

      dale.go (s.s3Files, function (v, s3file) {
         if (! s.dbFiles [s3file]) s.s3Extra.push (s3file);
      });
      dale.go (s.fsFiles, function (v, fsfile) {
         // Ignore folders with invalid files, or errored mp4 conversions
         if (fsfile.match (/^invalid/) || fsfile.match (/^error/)) return;
         if (! s.dbFiles [fsfile]) s.fsExtra.push (fsfile);
      });

      // We only show the first 100 items to avoid making the email too big.
      if (s.s3Extra.length)   notify (a.creat (), {priority: 'critical', type: 'extraneous files in S3 error', n: s.s3Extra.length,   files: s.s3Extra.slice (0, 100)});
      if (s.fsExtra.length)   notify (a.creat (), {priority: 'critical', type: 'extraneous files in FS error', n: s.fsExtra.length,   files: s.fsExtra.slice (0, 100)});
      if (s.s3Missing.length) notify (a.creat (), {priority: 'critical', type: 'missing files in S3 error',    n: s.s3Missing.length, files: s.s3Missing.slice (0, 100)});
      if (s.fsMissing.length) notify (a.creat (), {priority: 'critical', type: 'missing files in FS error',    n: s.fsMissing.length, files: s.fsMissing.slice (0, 100)});
      if (s.s3WrongSize.length) notify (a.creat (), {priority: 'critical', type: 'Files of incorrect size in S3 error', n: s.s3WrongSize.length,   files: s.s3WrongSize.slice (0, 100)});
      if (s.fsWrongSize.length) notify (a.creat (), {priority: 'critical', type: 'Files of incorrect size in FS error', n: s.fsWrongSize.length,   files: s.fsWrongSize.slice (0, 100)});

      // We delete the list of pivs from the stack so that it won't be copied by a.fork below in case there are extraneous FS files to delete.
      s.last = undefined;
      var notOK = [];
      if (mode !== 'makeConsistent') notify (s, {priority: 'normal', type: 'File consistency check done.', ms: Date.now () - s.start});
      else a.seq (s, [
         // Extraneous S3 files: delete. Don't update the statistics.
         [function (s) {
            H.s3del (s, s.s3Extra);
         }],
         function (s) {
            // Extraneous FS files: delete. Don't update the statistics.
            a.fork (s, s.fsExtra, function (v) {
               return [H.unlink, Path.join (CONFIG.basepath, v)];
            }, {max: os.cpus ().length});
         },
         function (s) {
            // Missing S3 files or S3 files of incorrect size: upload them to S3 if they are in the FS and have the right size
            a.fork (s, s.s3Missing.concat (s.s3WrongSize), function (file) {
               if (inc (s.fsMissing.concat (s.fsWrongSize), file)) {
                  notOK.push (file);
                  return [];
               }
               return [H.s3put, file, Path.join (CONFIG.basepath, file)];
            }, {max: os.cpus ().length});
         },
         function (s) {
            // Missing FS files or FS files of incorrect size: download them from S3 if they are there and have the right size
            a.fork (s, s.fsMissing.concat (s.fsWrongSize), function (file) {
               if (inc (s.s3Missing.concat (s.s3WrongSize), file)) {
                  notOK.push (file);
                  return [];
               }
               return [
                  [H.s3get, file],
                  [a.get, a.make (fs.writeFile), Path.join (CONFIG.basepath, file), '@last', {encoding: 'binary'}]
               ];
            }, {max: os.cpus ().length});
         },
         function (s) {
            var messageType = notOK.length === 0 ? 'File consistency operation success.' : 'File consistency operation failure: missing S3 and/or FS files.';
            var message = dale.obj (['s3Extra', 'fsExtra', 's3Missing', 'fsMissing', 's3WrongSize', 'fsWrongSize'], {priority: notOK.length === 0 ? 'important' : 'critical', type: messageType}, function (k) {
               if (s [k].length) return [k, s [k]];
            });
            message.ms = Date.now () - s.start;
            notify (s, message);
         },
      ]);
   },
   function (s) {
      if (! mode) return s.next ();
      console.log ('Done with file consistency check.');
      if (++doneChecks === 2) setTimeout (function () {
         process.exit (0);
      }, 100);
   }
], function (s, error) {
   notify (s, {priority: 'critical', type: 'File consistency check error.', error: error});
});

// *** CHECK CONSISTENCY OF STORED SIZES IN DB ***

if (cicek.isMaster && ENV && mode !== 'script') a.stop ([
   [function (s) {
      s.start = Date.now ();
      s.next ();
   }],
   // Get list of all S3 sizes
   [a.set, 's3:files', [Redis, 'hgetall', 's3:files']],
   [redis.keyscan, 'stat:f:by*'],
   function (s) {
      s.statkeys = s.last;
      var multi = redis.multi ();
      dale.go (s.last, function (key) {
         multi.get (key);
      });
      mexec (s, multi);
   },
   function (s) {
      s.stats = dale.obj (s.last, function (n, k) {
         // Ignore flow:TIME, we want only the final numbers
         if (s.statkeys [k].match (/:\d+$/)) return;
         return [s.statkeys [k], parseInt (n)];
      });
      s.next ();
   },
   // Get list of pivs and thumbs
   [redis.keyscan, 'piv:*'],
   function (s) {
      var multi = redis.multi ();
      dale.go (s.last, function (id) {
         multi.hgetall (id);
      });
      mexec (s, multi);
   },
   function (s) {
      // The source of truth are the piv entries
      var actual = {TOTAL: {s3: 0, fs: 0}};
      if (! s ['s3:files']) s ['s3:files'] = {};
      var extraneousS3 = teishi.copy (s ['s3:files']), missingS3 = {}, invalidS3 = {}, proper = {};
      dale.go (s.last, function (piv) {
         if (! actual [piv.owner]) actual [piv.owner] = {s3: 0, fs: 0};
         actual [piv.owner].fs += parseInt (piv.byfs) + parseInt (piv.bythumbS || 0) + parseInt (piv.bythumbM || 0) + parseInt (piv.bymp4 || 0);
         actual.TOTAL.fs       += parseInt (piv.byfs) + parseInt (piv.bythumbS || 0) + parseInt (piv.bythumbM || 0) + parseInt (piv.bymp4 || 0);
         var key = H.hash (piv.owner) + '/' + piv.id;
         var s3entry = s ['s3:files'] [key];
         delete extraneousS3 [key];

         // The H.encrypt function, used to encrypt files before uploading them to S3, increases file size by 32 bytes.
         actual [piv.owner].s3 += parseInt (piv.byfs) + 32;
         actual.TOTAL.s3       += parseInt (piv.byfs) + 32;

         if (s3entry === undefined) {
            proper [key] = parseInt (piv.byfs) + 32;
            missingS3 [key] = true;
         }
         else if (! (type (parseInt (s3entry)) === 'integer' && parseInt (s3entry) === parseInt (piv.byfs) + 32)) {
            proper [key] = parseInt (piv.byfs) + 32;
            invalidS3 [key] = s3entry;
         }
      });
      var mismatch = [];
      dale.go (actual, function (v, k) {
         if (k === 'TOTAL') var stats = {fs: s.stats ['stat:f:byfs']      || 0, s3: s.stats ['stat:f:bys3']      || 0};
         else               var stats = {fs: s.stats ['stat:f:byfs-' + k] || 0, s3: s.stats ['stat:f:bys3-' + k] || 0};
         if (v.fs !== stats.fs) mismatch.push (['byfs' + (k === 'TOTAL' ? '' : '-' + k), v.fs - stats.fs]);
         if (v.s3 !== stats.s3) mismatch.push (['bys3' + (k === 'TOTAL' ? '' : '-' + k), v.s3 - stats.s3]);
      });

      if (dale.keys (missingS3).length)    notify (a.creat (), {priority: 'critical', type: 'Missing s3:files entries',    missingS3: missingS3});
      if (dale.keys (extraneousS3).length) notify (a.creat (), {priority: 'critical', type: 'Extraneous s3:files entries', extraneousS3: extraneousS3});
      if (dale.keys (invalidS3).length)    notify (a.creat (), {priority: 'critical', type: 'Invalid s3:files entries',    invalidS3: invalidS3});

      if (mismatch.length !== 0)           notify (a.creat (), {priority: 'critical', type: 'Stored sizes consistency mismatch', mismatch: mismatch});

      if (mode !== 'makeConsistent') return notify (s, {priority: 'normal', type: 'Stored sizes consistency check done.', ms: Date.now () - s.start});
      else a.seq (s, [
         [H.stat.w, dale.go (mismatch, function (v) {
            return ['flow', v [0], v [1]];
         })],
         function (s) {
            var multi = redis.multi ();
            dale.go (dale.keys (missingS3).concat (dale.keys (invalidS3)), function (v) {
               multi.hset ('s3:files', v, proper [v]);
            });
            mexec (s, multi);
         },
         function (s) {
            var multi = redis.multi ();
            dale.go (extraneousS3, function (v, k) {multi.hdel ('s3:files', k)});
            mexec (s, multi);
         },
         function (s) {
            var message = dale.obj (['missingS3', 'extraneousS3', 'invalidS3', 'mismatch'], {priority: 'important', type: 'Stored sizes consistency operation success.'}, function (k) {
               if (dale.keys (s [k]).length) return [k, s [k]];
            });
            message.ms = Date.now () - s.start;
            notify (s, message);
         }
      ]);
   },
   function (s) {
      if (! mode) return s.next ();
      console.log ('Done with sizes consistency check.');
      if (++doneChecks === 2) setTimeout (function () {
         process.exit (0);
      }, 100);
   }
], function (s, error) {
   notify (s, {priority: 'critical', type: 'Stored sizes consistency check error.', error: error});
});

// *** RUN SCRIPT ***

if (cicek.isMaster && ENV && mode === 'script') (function () {
   var script = fs.readFileSync (process.argv [4], 'utf8');
   // Finally I found a valid use case for `eval`!
   eval (script);
}) ();

// *** CHECK S3 QUEUE ON STARTUP ***

if (cicek.isMaster && ENV && mode !== 'script') a.stop ([
   [Redis, 'get', 's3:proc'],
   function (s) {
      if (! s.last || s.last === '0') return s.next ();
      a.seq (s, [
         [notify, {priority: 'critical', type: 'Non-empty S3 process counter on startup.', n: s.last}],
         mode === 'makeConsistent' ? [Redis, 'del', 's3:proc'] : [],
      ]);
   },
   [Redis, 'llen', 's3:queue'],
   function (s) {
      if (! s.last) return;
      // Resume S3 operations if the queue is not empty, but after we are done with consistency operations.
      if (! mode) H.s3exec ();
      notify (s, {priority: 'critical', type: 'Non-empty S3 queue on startup.', n: s.last});
   }
], function (error) {
   notify (s, {priority: 'critical', type: 'Non-empty S3 queue DB check error.', error: error});
});

// *** CHECK INTERRUPTED GEOTAGGING PROCESSES ON STARTUP ***

if (cicek.isMaster && ENV && mode !== 'script') a.stop ([
   [redis.keyscan, 'geo:*'],
   function (s) {
      if (s.last.length > 0) return notify (s, {priority: 'critical', type: 'Interrupted geotagging processes found on startup.', users: dale.go (s.last, function (key) {
         return key.replace ('geo:', '');
      })});
   }
], function (error) {
   notify (s, {priority: 'critical', type: 'Interrupted geotagging processes check DB error.', error: error});
});

// *** CHECK INTERRUPTED MP4 CONVERSIONS ON STARTUP ***

if (cicek.isMaster && ENV && mode !== 'script') a.stop ([
   [Redis, 'hkeys', 'proc:vid'],
   function (s) {
      if (s.last.length) notify (s, {priority: 'critical', type: 'Incomplete mp4 conversions', n: s.last.length});
   }
], function (error) {
   notify (s, {priority: 'critical', type: 'Incomplete mp4 conversions check error.', error: error});
});

// *** CHECK LEFTOVER UPLOAD RACE CONDITION KEYS ON STARTUP ***

if (cicek.isMaster && ENV && mode !== 'script') a.stop ([
   [redis.keyscan, 'raceConditionHash*'],
   function (s) {
      s.toClean = s.last;
      if (s.last.length > 0) return notify (s, {priority: 'critical', type: 'Leftover upload race conditions found on startup.', keys: s.toClean});
   },
   function (s) {
      if (mode !== 'makeConsistent') return;
      var multi = redis.multi ();
      dale.go (s.toClean, function (key) {
         multi.del (key);
      });
      mexec (s, multi);
   },
   function (s) {
      notify (s, {priority: 'critical', type: 'Leftover upload race conditions cleanup success.', keys: s.toClean});
   }
], function (error) {
   notify (s, {priority: 'critical', type: 'Leftover upload race condition keys check check error.', error: error});
});

// *** LOAD GEODATA ***

if (cicek.isMaster && ! mode) a.stop ([
   [Redis, 'exists', 'geo'],
   function (s) {
      if (! s.last) return s.next ();
   },
   function (s) {
      s.t = Date.now ();
      try {
         var lines = fs.readFileSync (CONFIG.geodataPath, 'utf8').split ('\n');
      }
      catch (error) {
         s.next (null, 'Geodata file error: ' + error.toString ());
      }
      var multi = redis.multi ();
      dale.go (lines, function (line) {
         line = line.split ('\t');
         // name 1, lat 4, lon 5, country 8, pop 14
         // https://redis.io/commands/geoadd - latitudes close to the pole cannot be added, so we ignore them.
         if (Math.abs (parseFloat (line [4])) > 85.05112878) return;
         multi.geoadd ('geo', line [5], line [4], line [8] + ':' + line [14] + ':' + line [1]);
      });
      mexec (s, multi);
   },
   function (s) {
      notify (s, {priority: 'normal', type: 'Geodata loaded correctly in ' + (Date.now () - s.t) + 'ms.'});
   }
], function (s, error) {
   notify (s, {priority: 'critical', type: 'Geodata load error', error: error});
});
