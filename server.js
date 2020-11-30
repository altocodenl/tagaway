/*
ac;pic - v0.1.0

Written by Altocode (https://altocode.nl) and released into the public domain.

Please refer to readme.md to read the annotated source (but not yet!).
*/

// *** SETUP ***

var CONFIG = require ('./config.js');
var SECRET = require ('./secret.js');
var ENV    = process.argv [2] === 'local' ? undefined : process.argv [2];

var crypto = require ('crypto');
var fs     = require ('fs');
var Path   = require ('path');
var os     = require ('os');
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

var uuid     = require ('uuid/v4');
var mailer   = require ('nodemailer').createTransport (require ('nodemailer-ses-transport') (SECRET.ses));
var hash     = require ('murmurhash').v3;
var mime     = require ('mime');
var archiver = require ('archiver');

var type = teishi.type, clog = console.log, eq = teishi.eq, reply = function () {
   var rs = dale.stopNot (arguments, undefined, function (arg) {
      if (arg && type (arg.log) === 'object') return arg;
   });
   // TODO remove this when fixed in cicek
   if (! rs.connection || ! rs.connection.writable) return notify (a.creat (), {type: 'client dropped connection', method: rs.log.method, url: rs.log.url, headers: rs.log.requestHeaders});
   cicek.reply.apply (null, dale.fil (arguments, undefined, function (v, k) {
      if (k === 0 && v && v.path && v.last && v.vars) return;
      return v;
   }));
}, stop = function (rs, rules) {
   return teishi.stop (rules, function (error) {
      reply (rs, 400, {error: error});
   }, true);
}, astop = function (rs, path) {
   a.stop (path, function (s, error) {
      reply (rs, 500, {error: error});
   });
}, mexec = function (s, multi) {
   multi.exec (function (error, data) {
      if (error) return s.next (0, error);
      s.next (data);
   });
}

// *** GIZ ***

giz.redis          = redis;
giz.config.expires = 24 * 60 * 60;

// *** REDIS EXTENSIONS ***

redis.keyscan = function (s, match, cursor, keys) {
   if (! cursor) cursor = 0;
   if (! keys)   keys   = {};
   redis.scan (cursor, 'MATCH', match, function (error, result) {
      if (error) return s.next (0, error);
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
      if (error) s.next (0, error);
      else       s.next (data);
   }));
}

// *** NOTIFICATIONS ***

SECRET.ping.send = function (payload, CB) {
   CB = CB || clog;
   var login = function (cb) {
      hitit.one ({}, {
         host:   SECRET.ping.host,
         port:   SECRET.ping.port,
         https:  SECRET.ping.https,
         method: 'post',
         path:   require ('path').join (SECRET.ping.path || '', 'auth/login'),
         body: {username: SECRET.ping.username, password: SECRET.ping.password, tz: new Date ().getTimezoneOffset ()}
      }, function (error, data) {
         if (error) return CB (error);
         SECRET.ping.cookie = data.headers ['set-cookie'] [0];
         cb ();
      });
   }
   var send = function (retry) {
      hitit.one ({}, {
         host:   SECRET.ping.host,
         port:   SECRET.ping.port,
         https:  SECRET.ping.https,
         method: 'post',
         path: require ('path').join (SECRET.ping.path || '', 'data'),
         headers: {cookie: SECRET.ping.cookie},
         body:    payload,
      }, function (error) {
         if (error && error.code === 403 && ! retry) return login (function () {send (true)});
         if (error) return CB (error);
         CB ();
      });
   }
   if (SECRET.ping.cookie) {
      payload.cookie = SECRET.ping.cookie;
      send ();
   }
   else login (function () {
      payload.cookie = SECRET.ping.cookie;
      send (true);
   });
}

var notify = function (s, message) {
   if (type (message) !== 'object') return clog ('NOTIFY: message must be an object but instead is', message, s);
   if (! ENV) {
      clog (new Date ().toUTCString (), message);
      return s.next ();
   }
   message.environment = ENV;
   SECRET.ping.send (message, function (error) {
      if (error) return s.next (null, error);
      else s.next ();
   });
}

// *** SENDMAIL ***

var sendmail = function (s, o) {
   o.from1 = o.from1 || CONFIG.email.name;
   o.from2 = o.from2 || CONFIG.email.address;
   mailer.sendMail ({
      from:    o.from1 + ' <' + CONFIG.email.address + '>',
      to:      o.to1   + ' <' + o.to2 + '>',
      replyTo: o.from2,
      subject: o.subject,
      html:    lith.g (o.message),
   }, function (error, rs) {
      if (! error) notify (s, {type: 'email sent', to: o.to2, subject: o.subject});
      else         notify (s, {priority: 'critical', type: 'mailer error', error: error, options: o});
   });
}

// *** KABOOT ***

var k = function (s) {

   var command = [].slice.call (arguments, 1);

   var output = {stdout: '', stderr: '', command: command};

   var proc = require ('child_process').spawn (command [0], command.slice (1));

   var wait = 3;

   var done = function () {
      if (--wait > 0) return;
      if (! output.stderr && output.code === 0) s.next (output);
      else                                      s.next (0, output);
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
   params:      {Bucket: SECRET.s3.pic.bucketName},
});

// *** HELPERS ***

var H = {};

H.email = /^(([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})\s*)$/;

H.trim = function (string) {
   return string.replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');
}

H.log = function (s, username, ev) {
   ev.t = Date.now ();
   Redis (s, 'lpush', 'ulog:' + username, teishi.str (ev));
}

H.size = function (s, path) {
   if (s.size) return s.next ();
   a.seq (s, [
      [a.stop, [k, 'identify', path], function (s, error) {
         s.next (0, 'Invalid image #1.');
      }],
      [a.set, 'size', function (s) {
         var info = s.last.stdout.split (' ') [2];
         if (! info)                                        return s.next (0, 'Invalid image #2.');
         info = info.split ('x');
         if (info.length !== 2)                             return s.next (0, 'Invalid image #3.');
         s.next ({w: parseInt (info [0]), h: parseInt (info [1])});
      }]
   ]);
}

H.hash = function (string) {
   return hash (string) + '';
}

H.isYear = function (tag) {
   return tag.match (/^[0-9]{4}$/) && parseInt (tag) >= 1900 && parseInt (tag) <= 2100;
}

H.isGeo = function (tag) {
   return !! tag.match (/^g::/);
}

H.getGeotags = function (s, metadata) {
   var countryCodes = {'AF':'Afghanistan','AX':'Åland Islands','AL':'Albania','DZ':'Algeria','AS':'American Samoa','AD':'Andorra','AO':'Angola','AI':'Anguilla','AQ':'Antarctica','AG':'Antigua and Barbuda','AR':'Argentina','AM':'Armenia','AW':'Aruba','AU':'Australia','AT':'Austria','AZ':'Azerbaijan','BS':'Bahamas','BH':'Bahrain','BD':'Bangladesh','BB':'Barbados','BY':'Belarus','BE':'Belgium','BZ':'Belize','BJ':'Benin','BM':'Bermuda','BT':'Bhutan','BO':'Bolivia, Plurinational State of','BQ':'Bonaire, Sint Eustatius and Saba','BA':'Bosnia and Herzegovina','BW':'Botswana','BV':'Bouvet Island','BR':'Brazil','IO':'British Indian Ocean Territory','BN':'Brunei Darussalam','BG':'Bulgaria','BF':'Burkina Faso','BI':'Burundi','KH':'Cambodia','CM':'Cameroon','CA':'Canada','CV':'Cape Verde','KY':'Cayman Islands','CF':'Central African Republic','TD':'Chad','CL':'Chile','CN':'China','CX':'Christmas Island','CC':'Cocos (Keeling) Islands','CO':'Colombia','KM':'Comoros','CG':'Congo','CD':'Congo, the Democratic Republic of the','CK':'Cook Islands','CR':'Costa Rica','CI':'Côte d\'Ivoire','HR':'Croatia','CU':'Cuba','CW':'Curaçao','CY':'Cyprus','CZ':'Czech Republic','DK':'Denmark','DJ':'Djibouti','DM':'Dominica','DO':'Dominican Republic','EC':'Ecuador','EG':'Egypt','SV':'El Salvador','GQ':'Equatorial Guinea','ER':'Eritrea','EE':'Estonia','ET':'Ethiopia','FK':'Falkland Islands (Malvinas)','FO':'Faroe Islands','FJ':'Fiji','FI':'Finland','FR':'France','GF':'French Guiana','PF':'French Polynesia','TF':'French Southern Territories','GA':'Gabon','GM':'Gambia','GE':'Georgia','DE':'Germany','GH':'Ghana','GI':'Gibraltar','GR':'Greece','GL':'Greenland','GD':'Grenada','GP':'Guadeloupe','GU':'Guam','GT':'Guatemala','GG':'Guernsey','GN':'Guinea','GW':'Guinea-Bissau','GY':'Guyana','HT':'Haiti','HM':'Heard Island and McDonald Islands','VA':'Holy See (Vatican City State)','HN':'Honduras','HK':'Hong Kong','HU':'Hungary','IS':'Iceland','IN':'India','ID':'Indonesia','IR':'Iran, Islamic Republic of','IQ':'Iraq','IE':'Ireland','IM':'Isle of Man','IL':'Israel','IT':'Italy','JM':'Jamaica','JP':'Japan','JE':'Jersey','JO':'Jordan','KZ':'Kazakhstan','KE':'Kenya','KI':'Kiribati','KP':'Korea, Democratic People\'s Republic of','KR':'Korea, Republic of','KW':'Kuwait','KG':'Kyrgyzstan','LA':'Lao People\'s Democratic Republic','LV':'Latvia','LB':'Lebanon','LS':'Lesotho','LR':'Liberia','LY':'Libya','LI':'Liechtenstein','LT':'Lithuania','LU':'Luxembourg','MO':'Macao','MK':'Macedonia, the Former Yugoslav Republic of','MG':'Madagascar','MW':'Malawi','MY':'Malaysia','MV':'Maldives','ML':'Mali','MT':'Malta','MH':'Marshall Islands','MQ':'Martinique','MR':'Mauritania','MU':'Mauritius','YT':'Mayotte','MX':'Mexico','FM':'Micronesia, Federated States of','MD':'Moldova, Republic of','MC':'Monaco','MN':'Mongolia','ME':'Montenegro','MS':'Montserrat','MA':'Morocco','MZ':'Mozambique','MM':'Myanmar','NA':'Namibia','NR':'Nauru','NP':'Nepal','NL':'Netherlands','NC':'New Caledonia','NZ':'New Zealand','NI':'Nicaragua','NE':'Niger','NG':'Nigeria','NU':'Niue','NF':'Norfolk Island','MP':'Northern Mariana Islands','NO':'Norway','OM':'Oman','PK':'Pakistan','PW':'Palau','PS':'Palestine, State of','PA':'Panama','PG':'Papua New Guinea','PY':'Paraguay','PE':'Peru','PH':'Philippines','PN':'Pitcairn','PL':'Poland','PT':'Portugal','PR':'Puerto Rico','QA':'Qatar','RE':'Réunion','RO':'Romania','RU':'Russian Federation','RW':'Rwanda','BL':'Saint Barthélemy','SH':'Saint Helena, Ascension and Tristan da Cunha','KN':'Saint Kitts and Nevis','LC':'Saint Lucia','MF':'Saint Martin (French part)','PM':'Saint Pierre and Miquelon','VC':'Saint Vincent and the Grenadines','WS':'Samoa','SM':'San Marino','ST':'Sao Tome and Principe','SA':'Saudi Arabia','SN':'Senegal','RS':'Serbia','SC':'Seychelles','SL':'Sierra Leone','SG':'Singapore','SX':'Sint Maarten (Dutch part)','SK':'Slovakia','SI':'Slovenia','SB':'Solomon Islands','SO':'Somalia','ZA':'South Africa','GS':'South Georgia and the South Sandwich Islands','SS':'South Sudan','ES':'Spain','LK':'Sri Lanka','SD':'Sudan','SR':'Suriname','SJ':'Svalbard and Jan Mayen','SZ':'Swaziland','SE':'Sweden','CH':'Switzerland','SY':'Syrian Arab Republic','TW':'Taiwan, Province of China','TJ':'Tajikistan','TZ':'Tanzania, United Republic of','TH':'Thailand','TL':'Timor-Leste','TG':'Togo','TK':'Tokelau','TO':'Tonga','TT':'Trinidad and Tobago','TN':'Tunisia','TR':'Turkey','TM':'Turkmenistan','TC':'Turks and Caicos Islands','TV':'Tuvalu','UG':'Uganda','UA':'Ukraine','AE':'United Arab Emirates','GB':'United Kingdom','US':'United States','UM':'United States Minor Outlying Islands','UY':'Uruguay','UZ':'Uzbekistan','VU':'Vanuatu','VE':'Venezuela, Bolivarian Republic of','VN':'Viet Nam','VG':'Virgin Islands, British','VI':'Virgin Islands, U.S.','WF':'Wallis and Futuna','EH':'Western Sahara','YE':'Yemen','ZM':'Zambia','ZW':'Zimbabwe'};

   var position = dale.stopNot (metadata.split ('\n'), undefined, function (line) {
      if (! line.match (/gps position/i)) return;
      line = line.split (':') [1];
      line = line.split (',');
      var lat = line [0].replace ('deg', '').replace ('\'', '').replace ('"', '').split (/\s+/);
      var lon = line [1].replace ('deg', '').replace ('\'', '').replace ('"', '').split (/\s+/);
      lat = (lat [4] === 'S' ? -1 : 1) * (parseFloat (lat [1]) + parseFloat (lat [2]) / 60 + parseFloat (lat [3]) / 3600);
      lon = (lon [4] === 'W' ? -1 : 1) * (parseFloat (lon [1]) + parseFloat (lon [2]) / 60 + parseFloat (lon [3]) / 3600);
      return [lat, lon];
   });
   if (! position) return s.next ([]);
   redis.georadius ('geo', position [1], position [0], 15, 'km', 'count', 100, 'asc', function (error, data) {
      if (error) return s.next (null, error);
      if (! data.length) return s.next ([position [0], position [1]]);
      var biggestPop = 0, geotags = [];
      dale.go (data, function (item) {
         item = item.split (':');
         var pop = parseInt (item [1]);
         if (pop <= biggestPop) return;
         biggestPop = pop;
         geotags = ['g::' + item [0], 'g::' + item [2]];
      });
      s.next ([position [0], position [1]].concat (geotags));
   });
}

H.mkdirif = function (s, path) {
   a.stop (s, [k, 'test', '-d', path], function (s) {
      a.seq (s, [k, 'mkdir', path]);
   });
}

H.thumbPic = function (s, path, thumbSize, pic) {
   a.stop (s, [
      [H.size, path],
      function (s) {
         var picMax = Math.max (s.size.w, s.size.h);
         if (picMax <= thumbSize) {
            if (! pic.deg) return s.next (true);
            // if picture has rotation metadata, we need to create a thumbnail, which has no metadata, to have a thumbnail with no metadata and thus avoid some browsers doing double rotation (one done by the metadata, another one by our interpretation of it).
            // If picture is smaller than 200px and we're deciding whether to do the 900px thumb, we skip it since we don't need it.
            if (picMax < 200 && thumbSize === 900) return s.next (true);
         }
         s ['t' + thumbSize] = uuid ();
         // In the case of thumbnails done for stripping rotation metadata, we don't go over 100% if the picture is smaller than the desired thumbnail size.
         var perc = Math.min (Math.round (thumbSize / picMax * 100), 100);
         k (s, 'convert', path, '-quality', 75, '-thumbnail', perc + '%', Path.join (Path.dirname (path), s ['t' + thumbSize]));
      },
      function (s) {
         if (s.last === true) return s.next (true);
         a.make (fs.stat) (s, Path.join (Path.dirname (path), s ['t' + thumbSize]));
      },
      function (s) {
         if (s.last === true) return s.next ();
         s ['t' + thumbSize + 'size'] = s.last.size;
         s.next ();
      }
   ]);
}

H.thumbVid = function (s, path) {
   var max = Math.max (s.size.h, s.size.w);
   s.t200 = uuid (), s.t900 = max > 200 ? uuid () : undefined;
   // small video: make t200 and t200 will be smaller or equal than 200
   if (max <= 200) var t200dim = s.size;
   // medium video: make t200 and t900 but t900 will be smaller or equal than 900
   else if (max <= 900) {
      var t200dim = {h: Math.round (s.size.h * 200 / max), w: Math.round (s.size.w * 200 / max)};
      var t900dim = s.size;
   }
   // large video: make t200 and t900
   else {
      var t200dim = {h: Math.round (s.size.h * 200 / max), w: Math.round (s.size.w * 200 / max)};
      var t900dim = {h: Math.round (s.size.h * 900 / max), w: Math.round (s.size.w * 900 / max)};
   }
   a.stop (s, [
      [
         [a.stop, [k, 'ffmpeg', '-i', path, '-vframes', '1', '-an', '-s', t200dim.w + 'x' + t200dim.h, Path.join (Path.dirname (path), s.t200 + '.png')], function (s, error) {
            if (error.code === 0) s.next ();
            else                  s.next (null, error);
         }],
         [a.make (fs.rename), Path.join (Path.dirname (path), s.t200 + '.png'), Path.join (Path.dirname (path), s.t200)],
         [a.make (fs.stat), Path.join (Path.dirname (path), s.t200)],
         function (s) {
            s.t200size = s.last.size;
            s.next ();
         },
      ],
      ! s.t900 ? [] : [
         [a.stop, [k, 'ffmpeg', '-i', path, '-vframes', '1', '-an', '-s', t900dim.w + 'x' + t900dim.h, Path.join (Path.dirname (path), s.t900 + '.png')], function (s, error) {
            if (error.code === 0) s.next ();
            else                  s.next (null, error);
         }],
         [a.make (fs.rename), Path.join (Path.dirname (path), s.t900 + '.png'), Path.join (Path.dirname (path), s.t900)],
         [a.make (fs.stat), Path.join (Path.dirname (path), s.t900)],
         function (s) {
            s.t900size = s.last.size;
            s.next ();
         },
      ]
   ]);
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
         if (error) return s.next (0, error);
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
         if (error) return s.next (0, error);
         output = output.concat (data.Contents);
         delete data.Contents;
         if (! data.IsTruncated) return s.next (dale.go (output, function (v) {return v.Key}));
         fetch (output [output.length - 1].Key);
      });
   }
   fetch ();
}

H.s3queue = function (s, op, username, key, path) {
   a.seq (s, [
      [Redis, 'rpush', 's3:queue', JSON.stringify ({op: op, username: username, key: key, path: path})],
      function (s) {
         if (s.error) return notify (s, {priority: 'critical', type: 'redis error s3queue', error: s.error});
         // We call the next function.
         s.next ();
         // We trigger s3exec.
         H.s3exec ();
      }
   ]);
}

// Up to 3500 simultaneous operations (actually, per second, but simultaneous will do, since it's more conservative and easier to measure). But it's conservative only if the greatest share of operations are over one second in length.
// https://docs.aws.amazon.com/AmazonS3/latest/dev/optimizing-performance.html
// Queue items are processed in order with regards to the *start* of it, not the whole thing (otherwise, we would wait for each to be done - for implementing this, we can set LIMIT to 1).
H.s3exec = function () {
   // If there's no items on the queue, or if we're over the maximum: do nothing.
   // Otherwise, increment s3:proc and LPOP the first element of the queue
   redis.eval ('if redis.call ("llen", "s3:queue") == 0 then return nil end if (tonumber (redis.call ("get", "s3:proc")) or 0) >= 3500 then return nil end redis.call ("incr", "s3:proc"); return redis.call ("lpop", "s3:queue")', 0, function (error, next) {
      if (error) return notify (a.creat (), {priority: 'critical', type: 'redis error s3exec', error: error});
      if (! next) return;
      next = JSON.parse (next);

      /* Possible valid sequences
         - delete -> put? No, because put would be started before delete, otherwise it would be a genuine 404.
         - put uploading -> delete: let the put delete the file it just uploaded.
         - put ready -> delete: delete is in charge of deleting the file.
      */

      var actions = next.op === 'put' ? [
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
                  ['stock', 'bys3',                  bys3],
                  ['stock', 'bys3-' + next.username, bys3],
               ]],
            ]);
         }
      ] : [
         [Redis, 'hget', 's3:files', next.key],
         function (s) {
            // File is being uploaded, just remove entry.
            if (s.last === 'true') return Redis (s, 'hdel', 's3:files', next.key);
            // File has already been uploaded.
            var bys3 = parseInt (s.last);
            a.seq (s, [
               [H.s3del, next.key],
               [Redis, 'hdel', 's3:files', next.key],
               [H.stat.w, [
                  ['stock', 'bys3',                  - bys3],
                  ['stock', 'bys3-' + next.username, - bys3],
               ]],
            ]);
         }
      ];

      a.stop ([
         actions,
         [Redis, 'decr', 's3:proc'],
      ], function (s, error) {
         if (error) return notify (s, {priority: 'critical', type: 'redis error s3exec', error: error});
         H.s3exec ();
      });
   });
}

H.pad = function (v) {return v < 10 ? '0' + v : v}

H.deletePic = function (s, id, username) {
   a.stop (s, [
      [function (s) {
         var multi = redis.multi ();
         multi.hgetall  ('pic:'  + id);
         multi.smembers ('pict:' + id);
         mexec (s, multi);
      }],
      function (s) {
         s.pic  = s.last [0];
         s.tags = s.last [1];
         if (! s.pic || username !== s.pic.owner) return s.next (0, 'nf');

         H.s3queue (s, 'del', username, Path.join (H.hash (username), id));
      },
      function (s) {
         var thumbs = [];
         if (s.pic.t200) thumbs.push (s.pic.t200);
         if (s.pic.t900) thumbs.push (s.pic.t900);
         a.fork (s, thumbs, function (v) {
            return [a.make (fs.unlink), Path.join (CONFIG.basepath, H.hash (username), v)];
         });
      },
      [a.make (fs.unlink), Path.join (CONFIG.basepath, H.hash (username), id)],
      function (s) {
         var multi = redis.multi ();

         multi.del  ('pic:'  + s.pic.id);
         multi.del  ('pict:' + s.pic.id);
         if (s.pic.t200) multi.del ('thu:' + s.pic.t200);
         if (s.pic.t900) multi.del ('thu:' + s.pic.t900);
         multi.srem ('upic:'  + s.pic.owner, s.pic.hash);
         multi.sadd ('upicd:' + s.pic.owner, s.pic.hash);

         dale.go (s.tags.concat (['all', 'untagged']), function (tag) {
            multi.srem ('tag:' + s.pic.owner + ':' + tag, s.pic.id);
         });

         mexec (s, multi);
      },
      function (s) {
         H.stat.w (s, [
            ['stock', 'byfs',             - s.pic.byfs - (s.pic.by200 || 0) - (s.pic.by900 || 0)],
            ['stock', 'byfs-' + username, - s.pic.byfs - (s.pic.by200 || 0) - (s.pic.by900 || 0)],
            ['stock', s.pic.vid ? 'vids' : 'pics', -1],
            s.pic.by200 ? ['stock', 't200', -1] : [],
            s.pic.by900 ? ['stock', 't900', -1] : [],
         ]);
      }
   ]);
}

H.hasAccess = function (S, username, picId) {
   a.stop ([
      [a.set, 'pic', [Redis, 'hgetall', 'pic:' + picId], true],
      function (s) {
         if (! s.last)             return S.next (false);
         S.pic = s.pic;
         s.owner = s.last.owner;
         if (s.owner === username) return S.next (s.pic);
         Redis (s, 'smembers', 'pict:' + picId);
      },
      function (s) {
         if (s.last.length === 0) return S.next (false);
         var multi = redis.multi ();
         dale.go (s.last, function (tag) {
            multi.sismember ('shm:' + username, s.owner + ':' + tag);
         });
         mexec (s, multi);
      },
      function (s) {
         S.next (dale.stop (s.last, true, function (v) {return !! v}) ? s.pic : false);
      }
   ], function (s, error) {
      S.next (undefined, error);
   });
}

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
            'client_id='     + SECRET.google.oauth.client,
            'client_secret=' + SECRET.google.oauth.secret,
            'grant_type='    + 'refresh_token',
            'refresh_token=' + encodeURIComponent (s.last),
         ].join ('&');
         hitit.one ({}, {https: true, timeout: 15, host: 'oauth2.googleapis.com', method: 'post', path: 'token', headers: {'content-type': 'application/x-www-form-urlencoded'}, body: 'client_secret=' + encodeURIComponent (SECRET.google.oauth.secret) + '&grant_type=refresh_token&refresh_token=' + encodeURIComponent (s.last) + '&client_id=' + SECRET.google.oauth.client, code: '*', apres: function (s, rq, rs) {
            // If the refresh token failed
            if (rs.code !== 200) return a.stop (S, [
               // Delete refresh token
               [Redis, 'del', 'oa:g:ref:' + username],
               function (s) {
                  // Report an error
                  s.next (null, {errorCode: 2, code: rs.code, error: 'Refresh token failed', body: rs.body});
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

// *** STATISTICS ***

H.stat = {};

redis.script ('load', [
   'local v = tonumber (redis.call ("get", KEYS [1]));',
   'if (v == nil or (v < tonumber (ARGV [1]))) then',
      'redis.call ("set", KEYS [1], ARGV [1])',
      'return 1',
      'else return 0',
      'end'
].join ('\n'), function (error, sha) {
   H.stat.max = sha;
});

redis.script ('load', [
   'local v = tonumber (redis.call ("get", KEYS [1]));',
   'if (v == nil or (v > tonumber (ARGV [1]))) then',
      'redis.call ("set", KEYS [1], ARGV [1])',
      'return 1',
      'else return 0',
      'end'
].join ('\n'), function (error, sha) {
   H.stat.min = sha;
});

H.stat.w = function (s) {
   var ops = type (arguments [1]) !== 'array' ? [[arguments [1], arguments [2], arguments [3]]] : arguments [1];
   var t = Date.now (), multi = redis.multi ();
   t = t - t % 1000;
   // TODO: validations, add when exposing as a service. For each of the ops:
      // op must be array of length 3 or 0 (for no-op)
      // type is one of: flow, max, min, stock, unique
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
            s: t,
         }, function (date, period) {
            multi.pfadd ('stat:u:' + name + ':' + (date + '').slice (0, -3) + ':' + period, value);
         });
      }
      else if (type === 'stock') {
         multi.incrbyfloat ('stat:s:' + name,                                value);
         multi.incrbyfloat ('stat:s:' + name + ':' + (t + '').slice (0, -3), value);
      }
      else if (type === 'max' || type === 'min') {
         multi.evalsha (H.stat [type], 1, 'stat:' + (type === 'max' ? 'M' : 'm') + ':' + name + ':' + (t + '').slice (0, -3), value);
      }
      else {
         multi.incrbyfloat ('stat:f:' + name + ':' + (t + '').slice (0, -3), value);
      }
   });
   mexec (s, multi);
}

H.stat.r = function (s) {
   var ops = type (arguments [1]) !== 'array' ? [[arguments [1], arguments [2], arguments [3]]] : arguments [1];
   // TODO: validations, add when exposing as a service. For each of the ops:
      // op must be array of length 3 or 0 (for no-op)
      // type is one of: flow, max, min, stock, unique
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
            var type = {u: 'unique', f: 'flow', s: 'stock', M: 'max', m: 'min'} [k [5]];
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
            // if stock, also add current value
         });
      },
   ]);
}

// *** ROUTES ***

var routes = [

   // *** UPTIME ROBOT ***

   ['head', '*', function (rq, rs) {
      redis.info (function (error) {
         if (error) reply (rs, 500);
         reply (rs, ['/stats'].indexOf (rq.url) !== -1 ? 200 : 404);
      });
   }],

   // *** STATIC ASSETS ***

   ['get', 'favicon.ico', cicek.file, 'assets/img/favicon.ico'],

   ['get', 'img/*', cicek.file, ['markup']],

   ['get', ['assets/*', 'client.js', 'testclient.js', 'admin.js'], cicek.file],

   ['get', '/', reply, lith.g ([
      ['!DOCTYPE HTML'],
      ['html', [
         ['head', [
            ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
            ['meta', {charset: 'utf-8'}],
            ['title', 'ac;pic'],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat:400,400i,500,500i,600,600i&display=swap'}],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Kadwa'}],
         ]],
         ['body', [
            dale.go (['gotoB.min'], function (v) {
               return ['script', {src: 'assets/' + v + '.js'}];
            }),
            ['script', 'window.allowedFormats = ' + JSON.stringify (CONFIG.allowedFormats) + ';'],
            ['script', {src: 'client.js'}]
         ]]
      ]]
   ])],

   ['get', 'admin', reply, lith.g ([
      ['!DOCTYPE HTML'],
      ['html', [
         ['head', [
            ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
            ['meta', {charset: 'utf-8'}],
            ['title', 'ac;pic admin'],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat'}],
            dale.go (['pure-min', 'ionicons.min'], function (v) {
               return ['link', {rel: 'stylesheet', href: 'assets/' + v + '.css'}];
            })
         ]],
         ['body', [
            dale.go (['gotoB.min'], function (v) {
               return ['script', {src: 'assets/' + v + '.js'}];
            }),
            ['script', {src: 'admin.js'}]
         ]]
      ]]
   ])],

   // *** REQUEST INVITE ***

   ['post', 'requestInvite', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['email'], 'eachOf', teishi.test.equal],
         function () {return [
            ['body.email', b.email, 'string'],
            ['body.email', b.email, H.email, teishi.test.match],
         ]},
      ])) return;

      astop (rs, [
         [sendmail, {to1: 'Altocode', to2: CONFIG.email.address, subject: 'Request for ac;pic invite', message: ['p', [new Date ().toUTCString (), ' ', b.email]]}],
         [reply, rs, 200],
      ]);
   }],

   // *** CLIENT ERRORS ***

   ['post', 'error', function (rq, rs) {
      astop (rs, [
         [notify, {priority: 'critical', type: 'client error in browser', ip: rq.origin, user: (rq.user || {}).username, error: rq.body, ua: rq.headers ['user-agent']}],
         [reply, rs, 200],
      ]);
   }],

   // *** PUBLIC STATS ***

   ['get', 'stats', function (rq, rs) {
      // TODO: replace with H.stat.r
      var multi = redis.multi ();
      var keys = ['byfs', 'bys3', 'pics', 'vids', 't200', 't900', 'users'];
      dale.go (keys, function (key) {
         multi.get ('stat:s:' + key);
      });
      multi.exec (function (error, data) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 200, dale.obj (keys, function (key, k) {
            return [key, parseInt (data [k]) || 0];
         }));
      });
   }],

   // *** LOGIN & SIGNUP ***

   ['post', 'auth/login', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['username', 'password', 'tz'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.go (['username', 'password'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
            ['body.tz', b.tz, 'integer'],
         ]},
      ])) return;

      b.username = H.trim (b.username.toLowerCase ());

      astop (rs, [
         [a.set, 'username', function (s) {
            if (! b.username.match ('@')) return s.next (b.username);
            a.cond (s, [Redis, 'hget', 'emails', b.username], {
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
            else: function (s) {a.seq (s, [
               [function (s) {
                  require ('bcryptjs').genSalt (20, function (error, csrf) {
                     if (error) return s.next (null, error);
                     s.csrf = csrf;
                     a.seq (s, [Redis, 'setex', 'csrf:' + s.session, giz.config.expires, csrf]);
                  });
               }],
               [H.log, s.username, {a: 'log', ip: rq.origin, ua: rq.headers ['user-agent'], tz: b.tz}],
               function (s) {
                  reply (rs, 200, {csrf: s.csrf}, {'set-cookie': cicek.cookie.write (CONFIG.cookiename, s.session, {httponly: true, samesite: 'Lax', path: '/', expires: new Date (Date.now () + 1000 * 60 * 60 * 24 * 365 * 10)})});
               }
            ])}
         }],
      ]);
   }],

   ['post', 'auth/signup', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['username', 'password', 'email', 'token'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.go (['username', 'password', 'email', 'token'], function (key) {
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
      if (b.username.length < 3) return reply (rs, 400, {error: 'Trimmed username is less than three characters long.'});
      b.email = H.trim (b.email.toLowerCase ());

      var multi = redis.multi ();
      multi.hget   ('invites', b.email);
      multi.hget   ('emails',  b.email);
      multi.exists ('users:' + b.username);
      astop (rs, [
         [mexec, multi],
         function (s) {
            s.invite = teishi.parse (s.last [0]);
            if (! s.invite || s.invite.token !== b.token) return reply (rs, 403, {error: 'token'});
            if (s.last [1]) return reply (rs, 403, {error: 'email'});
            if (s.last [2]) return reply (rs, 403, {error: 'username'});
            s.next ();
         },
         [a.set, 'emailtoken', [a.make (require ('bcryptjs').genSalt), 20]],
         [a.make (giz.signup), b.username, b.password],
         function (s) {
            var multi = redis.multi ();
            multi.hset  ('emailtoken', s.emailtoken, b.email);
            multi.hset  ('emails',  b.email, b.username);
            multi.hmset ('users:' + b.username, {
               username:            b.username,
               email:               b.email,
               type:                'tier1',
               created:             Date.now (),
            });
            if (! ENV) multi.hmset ('users:' + b.username, 'verificationPending', true);
            s.invite.accepted = Date.now ();
            multi.hset  ('invites', b.email, JSON.stringify (s.invite));
            mexec (s, multi);
         },
         [H.stat.w, 'stock', 'users', 1],
         [H.log, b.username, {a: 'sig', ip: rq.origin, ua: rq.headers ['user-agent']}],
         ! ENV ? [
            [a.get, reply, rs, 200, {token: '@emailtoken'}],
         ] : [
            [sendmail, {
               to1:     b.username,
               to2:     b.email,
               subject: CONFIG.etemplates.welcome.subject,
               message: CONFIG.etemplates.welcome.message (b.username)
            }],
            [a.set, 'session', [a.make (giz.login), b.username, b.password]],
            [function (s) {
               require ('bcryptjs').genSalt (20, function (error, csrf) {
                  if (error) return s.next (null, error);
                  s.csrf = csrf;
                  a.seq (s, [Redis, 'setex', 'csrf:' + s.session, giz.config.expires, csrf]);
               });
            }],
            function (s) {
               reply (rs, 200, {csrf: s.csrf}, {'set-cookie': cicek.cookie.write (CONFIG.cookiename, s.session, {httponly: true, samesite: 'Lax', path: '/', expires: new Date (Date.now () + 1000 * 60 * 60 * 24 * 365 * 10)})});
            },
         ],
      ]);
   }],

   // *** EMAIL VERIFICATION ***

   ['get', 'auth/verify/(*)', function (rq, rs) {

      var token = rq.data.params [0];

      astop (rs, [
         [a.cond, [a.set, 'emailtoken', [Redis, 'hget', 'emailtoken', token], true], {
            null: [
               [notify, {priority: 'important', type: 'bad emailtoken', token: token, ip: rq.origin, ua: rq.headers ['user-agent']}],
               [reply, rs, 302, '', {location: 'https://' + CONFIG.server + '#/login/badtoken'}],
            ],
         }],
         [a.set, 'username', [a.get, Redis, 'hget', 'emails', '@emailtoken']],
         function (s) {
            var multi = redis.multi ();
            multi.hdel ('users:' + s.username, 'verificationPending');
            multi.hdel ('emailtoken', token);
            mexec (s, multi);
         },
         function (s) {
            notify (s, {type: 'verify', user: s.username});
         },
         ! ENV ? [] : [sendmail, {to1: username, to2: email, subject: CONFIG.etemplates.welcome.subject, message: CONFIG.etemplates.welcome.message (username)}],
         [reply, rs, 302, {location: '/#auth/login/verified'}],
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
            a.cond (s, [Redis, 'hget', 'emails', b.username], {
               null: [reply, rs, 403, {error: 'auth'}],
            });
         }],
         [a.stop, [a.set, 'token', [a.get, a.make (giz.recover), '@username']], function (s, error) {
            if (type (error) === 'string') reply (rs, 403, {error: 'auth'});
            else                           reply (rs, 500, {error: error});
         }],
         ENV ? [] : [a.get, reply, rs, 200, {token: '@token'}],
         [a.set, 'user', [a.get, Redis, 'hgetall', 'users:@username']],
         function (s) {
            sendmail (s, {
               to1:     s.user.username,
               to2:     s.user.email,
               subject: CONFIG.etemplates.recover.subject,
               message: CONFIG.etemplates.recover.message (s.user.username, s.token)
            });
         },
         function (s) {
            H.log (s, s.user.username, {a: 'rec', ip: rq.origin, ua: rq.headers ['user-agent'], token: s.token});
         },
         [reply, rs, 200],
      ]);
   }],

   ['post', 'auth/reset', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['body', b, 'string', 'each'],
         ['keys of body', dale.keys (b), ['username', 'password', 'token'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.go (['username', 'password', 'token'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
         ]},
         function () {return ['body.password length', b.password.length, {min: 6}, teishi.test.range]}
      ])) return;

      astop (rs, [
         [a.stop, [a.set, 'token', [a.make (giz.reset), b.username, b.token, b.password]], function (s, error) {
            if (type (error) === 'string') reply (rs, 403, {error: 'token'});
            else                           reply (rs, 500, {error: error});
         }],
         [a.set, 'user', [Redis, 'hgetall', 'users:' + b.username]],
         ! ENV ? [] : function (s) {
            sendmail (s, {
               to1:     s.user.username,
               to2:     s.user.email,
               subject: CONFIG.etemplates.reset.subject,
               message: CONFIG.etemplates.reset.message (s.user.username)
            });
         },
         function (s) {
            H.log (s, s.user.username, {a: 'res', ip: rq.origin, ua: rq.headers ['user-agent'], token: b.token});
         },
         [reply, rs, 200],
      ]);
   }],

   // *** GATEKEEPER FUNCTION ***

   ['all', '*', function (rq, rs) {

      if (rq.url.match (/^\/redmin/) && ! ENV) return rs.next ();

      if (rq.method === 'post' && rq.url === '/error') return rs.next ();
      if (rq.method === 'get'  && rq.url === '/stats') return rs.next ();
      if (rq.method === 'post' && rq.url === '/admin/invites') {
         if (! ENV)                                                        return rs.next ();
         if (eq (rq.body, {email: SECRET.admins [0], firstName: 'admin'})) return rs.next ();
      }

      if (! rq.data.cookie)                               return reply (rs, 403, {error: 'nocookie'});
      if (! rq.data.cookie [CONFIG.cookiename]) {
         if (rq.headers.cookie.match (CONFIG.cookiename)) return reply (rs, 403, {error: 'tampered'});
                                                          return reply (rs, 403, {error: 'noappcookie'});
      }

      giz.auth (rq.data.cookie [CONFIG.cookiename], function (error, user) {
         if (error)  return reply (rs, 500, {error: error});
         if (! user) return reply (rs, 403, {error: 'session'});

         rs.log.username = user.username;
         rq.user         = user;

         if ((rq.url.match (/^\/admin/) || rq.url.match (/^\/redmin/)) && SECRET.admins.indexOf (rq.user.email) === -1) return reply (rs, 403);

         astop (rs, [
            [H.stat.w, [
               ['unique', 'active',    user.username],
               ['flow',   'rq-user-' + user.username, 1],
            ]],
            [Redis, 'expire', 'csrf:' + rq.data.cookie [CONFIG.cookiename], giz.config.expires],
            [Redis, 'get',    'csrf:' + rq.data.cookie [CONFIG.cookiename]],
            function (s) {
               rq.csrf = s.last;
               rs.next ();
            }
         ]);
      });
   }],

   // *** CSRF PROTECTION ***

   ['get', 'csrf', function (rq, rs) {
      reply (rs, 200, {csrf: rq.csrf});
   }],

   ['post', '*', function (rq, rs) {

      if (rq.url.match (/^\/redmin/)) return rs.next ();
      if (rq.method === 'post' && rq.url === '/admin/invites' && ! ENV) return rs.next ();

      var ctype = rq.headers ['content-type'] || '';
      if (ctype.match (/^multipart\/form-data/i)) {
         if (rq.data.fields.csrf !== rq.csrf) return reply (rs, 403, {error: 'csrf'});
         delete rq.data.fields.csrf;
      }
      else {
         if (type (rq.body) !== 'object') return reply (rs, 400);
         if (rq.body.csrf !== rq.csrf)    return reply (rs, 403, {error: 'csrf'});
         delete rq.body.csrf;
      }
      rs.next ();
   }],

   // *** LOGOUT ***

   ['post', 'auth/logout', function (rq, rs) {
      astop (rs, [
         [a.make (giz.logout), rq.data.cookie [CONFIG.cookiename]],
         [Redis, 'del', 'csrf:' + rq.data.cookie [CONFIG.cookiename]],
         // Firefox throws a console error if it receives an empty body.
         [reply, rs, 200, {}, {'set-cookie': cicek.cookie.write (CONFIG.cookiename, false, {httponly: true, samesite: 'Lax', path: '/'})}],
      ]);
   }],

   // *** DELETE ACCOUNT ***

   ['post', 'auth/delete', function (rq, rs) {

      var b = rq.body;

      if (type (b) !== 'object') return reply (rs, 400, 'body must be an object.');

      if (b.username !== undefined && type (b.username) !== 'string') return reply (rs, 400, 'body.user must be either undefined or a string.');

      // We temporarily disable own account deletions in non-local environments.
      if (ENV && ! b.username) return reply (rs, 501);

      // Only admins can delete another user.
      if (b.username !== undefined && SECRET.admins.indexOf (rq.user.email) === -1) return reply (rs, 403);

      astop (rs, [
         [function (s) {
            if (b.username === undefined) return s.next (rq.user);
            Redis (s, 'hgetall', 'users:' + b.username);
         }],
         function (s) {
            if (! s.last) return reply (rs, 404);
            var multi = redis.multi (), user = s.last;
            multi.smembers ('tag:'  + user.username + ':all');
            multi.smembers ('tags:' + user.username);
            a.seq (s, [
               [a.set, 'data', [mexec, multi]],
               [a.make (giz.destroy), user.username],
               function (s) {
                  a.fork (s, s.data [0], function (pic) {
                     return [H.deletePic, pic, user.username];
                  }, {max: os.cpus ().length});
               },
               [H.stat.w, 'stock', 'users', -1],
               function (s) {
                  var multi = redis.multi ();
                  if (b.username === undefined) multi.del ('csrf:' + rq.data.cookie [CONFIG.cookiename]);
                  multi.hdel ('emails',  user.email);
                  multi.hdel ('invites', user.email);
                  dale.go (s.data [1].concat (['all', 'untagged']), function (tag) {
                     multi.del ('tag:' + user.username + ':' + tag);
                  });
                  multi.del ('tags:'  + user.username);
                  multi.del ('upic:'  + user.username);
                  multi.del ('upicd:' + user.username);
                  multi.del ('shm:'   + user.username);
                  multi.del ('sho:'   + user.username);
                  multi.del ('ulog:'  + user.username);
                  mexec (s, multi);
               },
               b.username === undefined ? [a.make (giz.logout), rq.data.cookie [CONFIG.cookiename]] : [],
               [H.log, user.username, {a: 'des', ip: rq.origin, ua: rq.headers ['user-agent'], admin: b.username !== undefined ? true : undefined}],
               [reply, rs, 200, '', b.username === undefined ? {'set-cookie': cicek.cookie.write (CONFIG.cookiename, false, {httponly: true, samesite: 'Lax', path: '/'})} : {}],
            ]);
         }
      ]);
   }],

   // *** CHANGE PASSWORD ***

   ['post', 'auth/changePassword', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
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
                  [H.log, rq.user.username, {a: 'chp', ip: rq.origin, ua: rq.headers ['user-agent']}],
                  [reply, rs, 200],
               ]);
            });
         });
      });
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
         ENV ? [] : [reply, rs, 200],
         [sendmail, {
            to1:     rq.user.username,
            to2:     rq.user.email,
            subject: CONFIG.etemplates.feedback.subject,
            message: CONFIG.etemplates.feedback.message (rq.user.username, b.message)
         }],
         [reply, rs, 200],
      ]);
   }],

   // *** RETRIEVE ORIGINAL IMAGE (FOR TESTING PURPOSES) ***

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

   // *** DOWNLOAD PICS ***

   ['get', 'pic/:id', function (rq, rs) {
      astop (rs, [
         [a.cond, [H.hasAccess, rq.user.username, rq.data.params.id], {false: [reply, rs, 404]}],
         [Redis, 'hincrby', 'pic:' + rq.data.params.id, 'xp', 1],
         function (s) {
            // We base etags solely on the id of the file; this requires files to never be changed once created. This is the case here.
            var etag = cicek.etag (s.pic.id, true), headers = {etag: etag, 'content-type': mime.lookup (s.pic.name)};
            if (rq.headers ['if-none-match'] === etag) return reply (rs, 304, '', headers);
            cicek.file (rq, rs, Path.join (H.hash (s.pic.owner), s.pic.id), [CONFIG.basepath], headers);
         }
      ]);
   }],

   ['get', 'thumb/:size/:id', function (rq, rs) {
      if (['200', '900'].indexOf (rq.data.params.size) === -1) return reply (rs, 400);
      astop (rs, [
         [a.cond, [H.hasAccess, rq.user.username, rq.data.params.id], {false: [reply, rs, 404]}],
         [Redis, 'hincrby', 'pic:' + rq.data.params.id, rq.data.params.size === '200' ? 'xt2' : 'xt9', 1],
         function (s) {
            var id = s.pic ['t' + rq.data.params.size] || s.pic.id;
            // We base etags solely on the id of the file; this requires files to never be changed once created. This is the case here.
            var etag = cicek.etag (id, true), headers = {etag: etag, 'content-type': mime.lookup (s.pic.name)};
            if (rq.headers ['if-none-match'] === etag) return reply (rs, 304, '', headers);
            cicek.file (rq, rs, Path.join (H.hash (s.pic.owner), id), [CONFIG.basepath], headers);
         }
      ]);
   }],

   // *** UPLOAD PICTURES ***

   ['post', 'upload', function (rq, rs) {

      if (! rq.data.fields)      return reply (rs, 400, {error: 'field'});
      if (! rq.data.files)       return reply (rs, 400, {error: 'file'});
      if (! rq.data.fields.uid)  return reply (rs, 400, {error: 'uid'});
      if (! rq.data.fields.tags) rq.data.fields.tags = '[]';
      if (! eq (dale.keys (rq.data.fields).sort (), ['uid', 'lastModified', 'tags'].sort ())) return reply (rs, 400, {error: 'invalidField'});
      if (! eq (dale.keys (rq.data.files),  ['pic'])) return reply (rs, 400, {error: 'invalidFile'});

      var tags = teishi.parse (rq.data.fields.tags), error;
      if (type (tags) !== 'array') return reply (rs, 400, {error: 'tags'});
      tags = dale.go (tags, function (tag) {
         if (type (tag) !== 'string') return error = teishi.str (tag);
         tag = H.trim (tag);
         if (['all', 'untagged'].indexOf (tag.toLowerCase ()) !== -1) return error = tag;
         if (H.isYear (tag) || H.isGeo (tag)) error = tag;
         return tag;
      });
      if (error) return reply (rs, 400, {error: 'tag: ' + error});

      if (type (parseInt (rq.data.fields.lastModified)) !== 'integer') return reply (rs, 400, {error: 'lastModified'});

      if (CONFIG.allowedFormats.indexOf (mime.lookup (rq.data.files.pic)) === -1) return reply (rs, 400, {error: 'fileFormat'});

      var path = rq.data.files.pic, lastModified = parseInt (rq.data.fields.lastModified);
      var hashpath = Path.join (Path.dirname (path), Path.basename (path).replace (Path.extname (path), '') + 'hash' + Path.extname (path));

      var pic = {
         id:     uuid (),
         owner:  rq.user.username,
         name:   path.slice (path.indexOf ('_') + 1),
         dateup: Date.now (),
      };

      if (mime.lookup (rq.data.files.pic) === 'video/mp4') pic.vid = 1;

      var newpath = Path.join (CONFIG.basepath, H.hash (rq.user.username), pic.id);

      var perf = [['init', Date.now ()]], perfTrack = function (s, label) {
         perf.push ([label, Date.now ()]);
         s.next (s.last);
      }

      astop (rs, [
         [Redis, 'get', 'stat:s:byfs-' + rq.user.username],
         function (s) {
            var used = parseInt (s.last) || 0;
            var limit = CONFIG.storelimit [rq.user.type];
            // TODO: remove
            // Temporarily override limit for admins until we roll out paid accounts.
            if (SECRET.admins.indexOf (rq.user.email) !== -1) limit = 40 * 1000 * 1000 * 1000;
            if (used >= limit) return reply (rs, 409, {error: 'capacity'});
            s.next ();
         },
         [perfTrack, 'capacity'],
         [a.stop, ! pic.vid ? [k, 'exiftool', path] : [k, 'ffprobe', '-i', path, '-show_streams'], function (s, error) {
            if (error.code !== 0) return reply (rs, 400, {error: 'Invalid ' + (pic.vid ? 'video' : 'image') + ': ' + error.stderr});
            // ffprobe always logs to stderr, so we need to put stderr onto s.last
            s.last = s.next (error);
         }],
         function (s) {
            s.metadata = s.last [pic.vid ? 'stderr' : 'stdout'];
            var metadata = s.metadata.split ('\n');
            if (! pic.vid) {
               var error = dale.stopNot (metadata, undefined, function (line) {
                  if (line.match (/^Warning/)) {
                     if (! line.match ('minor') && ! line.match ('Invalid EXIF text encoding')) return line.replace (/^Warning\s+:\s+/, '');
                  }
                  if (line.match (/^Error/))   return line.replace (/^Error\s+:\s+/, '');
               });
               if (error) return reply (rs, 400, {error: 'Invalid image: ' + error});

               var rotation = dale.stopNot (metadata, undefined, function (line) {
                  if (line.match (/^Orientation/)) return line;
               }) || '';

               if      (rotation.match ('270')) pic.deg = -90;
               else if (rotation.match ('90'))  pic.deg = 90;
               else if (rotation.match ('180')) pic.deg = 180;

               s.dates = dale.obj (metadata, function (line) {
                  if (! line.match (/date/i)) return;
                  var key = line.split (':') [0].trim ();
                  return [key, line.replace (key, '').replace (':', '').trim ()];
               });
            }
            else {
               var rotation;
               dale.go (metadata, function (line) {
                  if (line.match (/\s+rotate\s+:/)) rotation = line.replace (/rotate\s+:/, '').trim ();
                  if (! line.match (/h264/)) return;
                  var size = line.match (/\d{2,4}x\d{2,4}/);
                  if (! size) return s.size = false;
                  s.size = {w: parseInt (size [0].split ('x') [0]), h: parseInt (size [0].split ('x') [1])};
                  if (type (s.size.h) !== 'integer' || type (s.size.w) !== 'integer') s.size = false;
                  return true;
               });
               if (! s.size) return reply (rs, 400, {error: 'Invalid video size.', metadata: metadata});
               if (rotation === '90' || rotation === '270') s.size = {w: s.size.h, h: s.size.w};
               s.dates = dale.obj (metadata, function (line) {
                  if (line.match (/time/i)) return [line.split (':') [0].trim (), line.replace (/.*: /, '')];
               });
            }
            s.next ();
         },
         [perfTrack, 'format'],
         pic.vid ? [a.stop, [k, 'ffmpeg', '-i', path, '-map_metadata', '-1', '-c:v', 'copy', '-c:a', 'copy', hashpath], function (s, error) {
            if (error.code !== 0) return reply (rs, 500, {error: error});
            s.next ();
         }] : [
            [a.make (fs.copyFile), path, hashpath],
            [k, 'exiftool', '-all=', '-overwrite_original', hashpath],
         ],
         [a.set, 'hash', function (s) {
            fs.readFile (hashpath, function (error, file) {
               if (error) return s.next (0, error);
               s.next (hash (file.toString ()));
            });
         }],
         [a.make (fs.unlink), hashpath],
         [a.cond, [a.get, Redis, 'sismember', 'upic:' + rq.user.username, '@hash'], {'1': [reply, rs, 409, {error: 'repeated'}]}],
         [perfTrack, 'hash'],
         [H.mkdirif, Path.dirname (newpath)],
         [k, 'cp', path, newpath],
         [a.set, 'byfs', [a.make (fs.stat), newpath]],
         [a.make (fs.unlink), path],
         // We store only the original pictures in S3, not the thumbnails
         [H.s3queue, 'put', rq.user.username, Path.join (H.hash (rq.user.username), pic.id), newpath],
         [perfTrack, 'fs'],
         ! pic.vid ? [a.fork, [
            [[H.thumbPic, newpath, 200, pic], [perfTrack, 'resize200']],
            [[H.thumbPic, newpath, 900, pic], [perfTrack, 'resize900']],
         ], function (v) {return v}] : [H.thumbVid, newpath],
         // Freshly get whether geotagging is enabled or not, in case the flag was changed during an upload.
         [Redis, 'hget', 'users:' + rq.user.username, 'geo'],
         function (s) {
            if (! s.last) return s.next ([]);
            H.getGeotags (s, s.metadata);
         },
         function (s) {
            s.geotags = s.last;
            if (s.geotags.length) {
               pic.loc = JSON.stringify ([s.last [0], s.last [1]]);
               s.geotags = s.geotags.slice (2);
            }

            var multi = redis.multi ();

            pic.dimw = s.size.w;
            pic.dimh = s.size.h;
            pic.byfs = s.byfs.size;
            pic.hash = s.hash;

            s.dates ['upload:date'] = lastModified;
            pic.dates = JSON.stringify (s.dates);

            // All dates are considered to be UTC, unless they explicitly specify a timezone.
            // The underlying server must be in UTC to not add a timezone offset to dates that specify no timezone.
            // The client also ignores timezones, except for applying a timezone offset for the `last modified` metadata of the picture in the filesystem when it is uploaded.
            pic.date = dale.fil (s.dates, undefined, function (v, k) {
               if (! v) return;
               // Ignore GPS date stamp
               if (k.match (/gps/i)) return;
               // Ignore profile date stamp
               if (k.match (/profile/i)) return;
               var d = new Date (v);
               if (d.getTime ()) return d.getTime ();
               d = new Date (v.replace (':', '-').replace (':', '-'));
               if (d.getTime ()) return d.getTime ();
            }).sort (function (a, b) {
               return a - b;
            });

            pic.date = pic.date [0];

            if (s.t200) pic.t200  = s.t200;
            if (s.t900) pic.t900  = s.t900;
            if (s.t200) pic.by200 = s.t200size;
            if (s.t900) pic.by900 = s.t900size;
            if (s.t200) multi.set ('thu:' + pic.t200, pic.id);
            if (s.t900) multi.set ('thu:' + pic.t900, pic.id);

            multi.sadd ('upic:'  + rq.user.username, pic.hash);
            multi.srem ('upicd:' + rq.user.username, pic.hash);
            multi.sadd ('tag:' + rq.user.username + ':all', pic.id);

            dale.go (tags.concat (new Date (pic.date).getUTCFullYear ()).concat (s.geotags), function (tag) {
               multi.sadd ('pict:' + pic.id,                       tag);
               multi.sadd ('tags:' + rq.user.username,             tag);;
               multi.sadd ('tag:'  + rq.user.username + ':' + tag, pic.id);
            });

            if (tags.length === 0) multi.sadd ('tag:' + rq.user.username + ':untagged', pic.id);

            multi.hmset ('pic:' + pic.id, pic);
            mexec (s, multi);
         },
         function (s) {
            H.log (s, rq.user.username, {a: 'upl', uid: rq.data.fields.uid, id: pic.id, tags: tags.length ? tags : undefined, deg: pic.deg});
         },
         [perfTrack, 'db'],
         function (s) {
            H.stat.w (s, [
               ['stock', 'byfs',                     pic.byfs + (pic.by200 || 0) + (pic.by900 || 0)],
               ['stock', 'byfs-' + rq.user.username, pic.byfs + (pic.by200 || 0) + (pic.by900 || 0)],
               ['stock', pic.vid ? 'vids' : 'pics', 1],
               pic.by200 ? ['stock', 't200', 1] : [],
               pic.by900 ? ['stock', 't900', 1] : [],
            ].concat (dale.fil (perf, undefined, function (item, k) {
               if (k > 0) return ['flow', 'ms-upload-' + item [0], item [1] - perf [k - 1] [1]];
            })));
         },
         function (s) {
            reply (rs, 200, {id: pic.id, deg: pic.deg});
         }
      ]);
   }],

   // *** DELETE PICS ***

   ['post', 'delete', function (rq, rs) {
      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['ids'], 'eachOf', teishi.test.equal],
         ['body.ids', b.ids, 'array'],
         ['body', b.ids, 'string', 'each'],
      ])) return;

      if (dale.keys (dale.obj (b.ids, function (id) {
         return [id, true];
      })).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});

      a.stop ([
         [a.fork, b.ids, function (id) {
            return [H.deletePic, id, rq.user.username];
         }, {max: os.cpus ().length}],
         [H.log, rq.user.username, {a: 'del', ids: b.ids}],
         [reply, rs, 200],
      ], function (s, error) {
         error === 'nf' ? reply (rs, 404) : reply (rs, 500, {error: error});
      });
   }],

   // *** ROTATE IMAGE ***

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
         multi.hgetall ('pic:' + id);
         return [id, true];
      });

      if (dale.keys (seen).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});

      astop (rs, [
         [mexec, multi],
         function (s) {
            var multi = redis.multi ();

            if (dale.stopNot (s.last, undefined, function (pic) {
               if (pic === null || pic.owner !== rq.user.username) {
                  reply (rs, 404);
                  return true;
               }
               // We ignore rotation of videos
               if (pic.vid) return;

               var deg = parseInt (pic.deg) || 0;
               if (deg === 0) deg = b.deg;
               else if (deg === -90) {
                  if (b.deg === -90) deg = 180;
                  if (b.deg === 90)  deg = 0;
                  if (b.deg === 180) deg = 90;
               }
               else if (deg === 90) {
                  if (b.deg === -90) deg = 0;
                  if (b.deg === 90)  deg = 180;
                  if (b.deg === 180) deg = -90;
               }
               else {
                  if (b.deg === -90) deg = 90;
                  if (b.deg === 90)  deg = -90;
                  if (b.deg === 180) deg = 0;
               }

               if (deg) multi.hset ('pic:' + pic.id, 'deg', deg);
               else     multi.hdel ('pic:' + pic.id, 'deg');
            })) return;

            mexec (s, multi);
         },
         [H.log, rq.user.username, {a: 'rot', ids: b.ids, deg: b.deg}],
         [reply, rs, 200],
      ]);
   }],

   // *** TAGGING ***

   ['post', 'tag', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['ids', 'tag', 'del'], 'eachOf', teishi.test.equal],
         ['body.tag', b.tag, 'string'],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
         function () {return ['body.ids length', b.ids.length, {min: 1}, teishi.test.range]},
         ['body.del', b.del, [true, false, undefined], 'oneOf', teishi.test.equal],
      ])) return;

      b.tag = H.trim (b.tag);
      if (['all', 'untagged'].indexOf (b.tag.toLowerCase ()) !== -1) return reply (rs, 400, {error: 'tag'});
      if (H.isYear (b.tag) || H.isGeo (b.tag)) return reply (rs, 400, {error: 'tag'});

      var multi = redis.multi (), seen = {};
      dale.go (b.ids, function (id) {
         seen [id] = true;
         multi.hget     ('pic:'  + id, 'owner');
         multi.smembers ('pict:' + id);
      });

      if (dale.keys (seen).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});

      astop (rs, [
         [mexec, multi],
         function (s) {
            var multi = redis.multi ();

            if (dale.stopNot (s.last, undefined, function (owner, k) {
               if (k % 2 !== 0) return;
               if (owner !== rq.user.username) {
                  reply (rs, 404);
                  return true;
               }

               var id = b.ids [k / 2];

               var extags = dale.acc (s.last [k + 1], 0, function (a, b) {
                  return a + ((H.isYear (b) || H.isGeo (b)) ? 0 : 1);
               });

               if (b.del) {
                  if (s.last [k + 1].indexOf (b.tag) === -1) return;
                  multi.srem ('pict:' + id, b.tag);
                  multi.srem ('tag:'  + rq.user.username + ':' + b.tag, id);
                  if (extags === 1) multi.sadd ('tag:' + rq.user.username + ':untagged', id);
               }

               else {
                  if (s.last [k + 1].indexOf (b.tag) !== -1) return;
                  multi.sadd ('pict:' + id, b.tag);
                  multi.sadd ('tags:' + rq.user.username, b.tag);
                  multi.sadd ('tag:'  + rq.user.username + ':' + b.tag, id);
                  multi.srem ('tag:'  + rq.user.username + ':untagged', id);
               }
            })) return;

            mexec (s, multi);
         },
         [H.log, rq.user.username, {a: 'tag', tag: b.tag, d: b.del ? true : undefined, ids: b.ids}],
         [reply, rs, 200],
      ]);
   }],

   ['get', 'tags', function (rq, rs) {
      astop (rs, [
         [a.set, 'tags', [Redis, 'smembers', 'tags:' + rq.user.username]],
         function (s) {
            var multi = redis.multi ();
            s.tags = ['all', 'untagged'].concat (s.tags);
            dale.go (s.tags, function (tag) {
               multi.scard ('tag:' + rq.user.username + ':' + tag);
            });
            mexec (s, multi);
         },
         function (s) {
            var multi = redis.multi ();
            s.output = dale.obj (s.last, function (card, k) {
               if (card || s.tags [k] === 'all') return [s.tags [k], card];
               else {
                  // We cleanup tags from tags:USERID if the tag set is empty.
                  if (k >= 2) multi.srem ('tags:' + rq.user.username, s.tags [k]);
               }
            });
            mexec (s, multi);
         },
         [a.get, reply, rs, 200, '@output'],
      ]);
   }],

   // *** SEARCH ***

   ['post', 'query', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tags', 'mindate', 'maxdate', 'sort', 'from', 'to', 'recentlyTagged'], 'eachOf', teishi.test.equal],
         ['body.tags',    b.tags, 'array'],
         ['body.tags',    b.tags, 'string', 'each'],
         ['body.mindate', b.mindate,  ['undefined', 'integer'], 'oneOf'],
         ['body.maxdate', b.maxdate,  ['undefined', 'integer'], 'oneOf'],
         ['body.sort',    b.sort, ['newest', 'oldest', 'upload'], 'oneOf', teishi.test.equal],
         ['body.from',    b.from, 'integer'],
         ['body.to',      b.to,   'integer'],
         ['body.from',    b.from, {min: 1},      teishi.test.range],
         ['body.to',      b.to,   {min: b.from}, teishi.test.range],
         b.recentlyTagged === undefined ? [] : [
            ['body.recentlyTagged', b.recentlyTagged, 'array'],
            ['body.recentlyTagged', b.recentlyTagged, 'string', 'each'],
         ],
      ])) return;

      if (b.tags.indexOf ('all') !== -1) return reply (rs, 400, {error: 'all'});
      if (b.recentlyTagged && b.tags.indexOf ('untagged') === -1) return reply (rs, 400, {error: 'recentlyTagged'});

      var ytags = [];

      var tags = dale.obj (b.tags, function (tag) {
         if (! H.isYear (tag)) return [tag, [rq.user.username]];
         ytags.push (tag);
      });

      astop (rs, [
         [Redis, 'smembers', 'shm:' + rq.user.username],
         function (s) {
            var allMode = b.tags.length === 0;

            if (allMode) tags.all = [rq.user.username];

            dale.go (s.last, function (sharedTag) {
               var tag = sharedTag.replace (/[^:]+:/, '');
               if (! tags [tag] && ! allMode) return;
               if (! tags [tag]) tags [tag] = [];
               tags [tag].push (sharedTag.match (/[^:]+/) [0]);
            });

            var multi = redis.multi (), qid = 'query:' + uuid ();
            if (ytags.length) multi.sunionstore (qid, dale.go (ytags, function (ytag) {
               return 'tag:' + rq.user.username + ':' + ytag;
            }));

            dale.go (tags, function (users, tag) {
               multi.sunionstore (qid + ':' + tag, dale.go (users, function (user) {
                  return 'tag:' + user + ':' + tag;
               }));
            });

            multi [allMode ? 'sunion' : 'sinter'] (dale.go (tags, function (users, tag) {
               return qid + ':' + tag;
            }).concat (ytags.length ? qid : []));

            multi.del (qid);
            dale.go (tags, function (users, tag) {
               multi.del (qid + ':' + tag);
            });

            mexec (s, multi);
         },
         function (s) {
            s.pics = s.last [(ytags.length ? 1 : 0) + dale.keys (tags).length];
            var multi = redis.multi (), ids = {};
            dale.go (s.pics, function (id) {
               multi.hgetall ('pic:' + id);
               if (b.recentlyTagged) ids [id] = true;
            });
            s.recentlyTagged = dale.fil (b.recentlyTagged, undefined, function (id) {
               if (ids [id]) return;
               multi.hgetall ('pic:' + id);
               return id;
            });
            mexec (s, multi);
         },
         function (s) {
            var recentlyTagged = dale.fil (s.recentlyTagged, undefined, function (v, k) {
               if (! s.last [s.pics.length + k] || s.last [s.pics.length + k].owner !== rq.user.username) return;
               return s.last [s.pics.length + k];
            });
            s.pics = s.last.slice (0, s.pics.length).concat (recentlyTagged);

            if (s.pics.length === 0) return reply (rs, 200, {total: 0, pics: [], tags: []});

            var output = {pics: []};

            var mindate = b.mindate || 0, maxdate = b.maxdate || new Date ('2101-01-01T00:00:00Z').getTime ();

            dale.go (s.pics, function (pic) {
               var d = parseInt (pic [b.sort === 'upload' ? 'dateup' : 'date']);
               if (d >= mindate && d <= maxdate) output.pics.push (pic);
            });

            // Sort own pictures first.
            output.pics.sort (function (a, b) {
               if (a.owner === rq.user.username) return -1;
               if (b.owner === rq.user.username) return 1;
               return (a.owner < b.owner ? -1 : (a.owner > b.owner ? 1 : 0));
            });

            // To avoid returning duplicated picture if someone shares a picture you already have with you. Own picture has priority.
            var hashes = {};
            output.pics = dale.fil (output.pics, undefined, function (pic, k) {
               if (! hashes [pic.hash]) {
                  hashes [pic.hash] = true;
                  return pic;
               }
            });

            // Sort pictures by criteria.
            output.pics.sort (function (a, B) {
               var d1 = parseInt (a [b.sort === 'upload' ? 'dateup' : 'date']);
               var d2 = parseInt (B [b.sort === 'upload' ? 'dateup' : 'date']);
               return b.sort === 'oldest' ? d1 - d2 : d2 - d1;
            });

            output.total = output.pics.length;

            output.pics = output.pics.slice (b.from - 1, b.to);

            var multi = redis.multi ();
            dale.go (output.pics, function (pic) {
               multi.smembers ('pict:' + pic.id);
            });
            multi.sunion (dale.go (s.pics, function (pic) {
               return 'pict:' + pic.id;
            }));
            s.output = output;
            mexec (s, multi);
         },
         function (s) {
            s.output.tags = teishi.last (s.last).sort ();
            dale.go (s.output.pics, function (pic, k) {
               s.output.pics [k] = {id: pic.id, t200: ! ENV ? pic.t200 : undefined, t900: ! ENV ? pic.t900 : undefined, owner: pic.owner, name: pic.name, tags: s.last [k].sort (), date: parseInt (pic.date), dateup: parseInt (pic.dateup), dimh: parseInt (pic.dimh), dimw: parseInt (pic.dimw), deg: parseInt (pic.deg) || undefined, vid: pic.vid ? true : undefined, loc: pic.loc ? teishi.parse (pic.loc) : undefined};
            });
            reply (rs, 200, s.output);
         },
      ]);
   }],

   // *** SHARING ***

   ['post', 'share', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tag', 'who', 'del'], 'eachOf', teishi.test.equal],
         ['body.tag', b.tag, 'string'],
         ['body.who', b.who, 'string'],
         ['body.del', b.del, ['boolean', 'undefined'], 'oneOf']
      ])) return;

      b.tag = H.trim (b.tag);
      if (['all', 'untagged'].indexOf (b.tag) !== -1) return reply (rs, 400, {error: 'tag'});
      if (H.isYear (b.tag) || H.isGeo (b.tag))        return reply (rs, 400, {error: 'tag'});
      if (b.who === rq.user.username)                 return reply (rs, 400, {error: 'self'});

      astop (rs, [
         [a.cond, [Redis, 'exists', 'users:' + b.who], {'0': [reply, rs, 404]}],
         function (s) {
            var multi = redis.multi ();

            multi [b.del ? 'srem' : 'sadd'] ('sho:' + rq.user.username, b.who            + ':' + b.tag);
            multi [b.del ? 'srem' : 'sadd'] ('shm:' + b.who,            rq.user.username + ':' + b.tag);
            mexec (s, multi);
         },
         [H.log, rq.user.username, {a: 'sha', tag: b.tag, d: b.del ? true : undefined, u: b.who}],
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
               sho: dale.go (s.last [0], function (i) {
                  return [i.split (':') [0], i.split (':').slice (1).join (':')];
               }),
               shm: dale.go (s.last [1], function (i) {
                  return [i.split (':') [0], i.split (':').slice (1).join (':')];
               }),
            });
         }
      ]);
   }],

   // *** DOWNLOAD ***

   ['get', 'download/(*)', function (rq, rs) {

      redis.get ('download:' + rq.data.params [0], function (error, download) {
         if (error) return reply (rs, 500, {error: error});
         if (! download) return reply (rs, 404);
         download = JSON.parse (download);

         if (download.username !== rq.user.username) return reply (rs, 403);

         var archive = archiver ('zip');
         archive.on ('error', function (error) {
            reply (rs, 500, {error: error})
         });
         dale.go (download.pics, function (pic) {
            archive.append (fs.createReadStream (Path.join (CONFIG.basepath, H.hash (pic.owner), pic.id)), {name: pic.id + Path.extname (pic.name)});
         });

         archive.pipe (rs);
         archive.finalize ();
         archive.on ('finish', function () {
            cicek.apres (rs);
         });
       });
   }],

   ['post', 'download', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['ids'], 'eachOf', teishi.test.equal],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
      ])) return;

      if (b.ids.length < 2) return reply (rs, 400);

      astop (rs, [
         [function (s) {
            var multi = redis.multi ();
            dale.go (b.ids, function (id) {
               multi.hgetall ('pic:' + id);
            });
            dale.go (b.ids, function (id) {
               multi.smembers ('pict:' + id);
            });
            multi.smembers ('shm:' + rq.user.username);
            mexec (s, multi);
         }],
         function (s) {
            var sharedWithUser = teishi.last (s.last);

            var hasAccess = dale.stopNot (s.last.slice (0, b.ids.length), true, function (pic, k) {
               // No such picture
               if (! pic) return false;
               if (pic.owner === rq.user.username) return true;
               var tags = s.last [b.ids.length + k];
               return dale.stop (tags, true, function (tag) {
                  return sharedWithUser.indexOf (pic.owner + ':' + tag) > -1;
               });
            });

            if (! hasAccess) return reply (rs, 404);

            var downloadId = uuid ();
            redis.setex ('download:' + downloadId, 5, JSON.stringify ({username: rq.user.username, pics: dale.go (b.ids, function (id, k) {
               var pic = s.last [k];
               return {owner: pic.owner, id: pic.id, name: pic.name};
            })}), function (error) {
               if (error) return reply (rs, 500, {error: error});
               reply (rs, 200, {id: downloadId});
            });

         },
      ]);
   }],

   // *** ACCOUNT ***

   ['get', 'account', function (rq, rs) {
      astop (rs, [
         [function (s) {
            var multi = redis.multi ();
            multi.lrange ('ulog:' + rq.user.username, 0, -1);
            multi.get    ('stat:s:byfs-' + rq.user.username);
            multi.get    ('stat:s:bys3-' + rq.user.username);
            multi.get    ('geo:'         + rq.user.username);
            mexec (s, multi);
         }],
         function (s) {
            // TODO: remove
            // Temporarily override limit for admins until we roll out paid accounts.
            var limit = CONFIG.storelimit [rq.user.type];
            if (SECRET.admins.indexOf (rq.user.email) !== -1) limit = 40 * 1000 * 1000 * 1000;
            reply (rs, 200, {
               username: rq.user.username,
               email:    rq.user.email,
               type:     rq.user.type === 'tier1' ? 'free' : 'paid',
               created:  parseInt (rq.user.created),
               usage:    {
                  //limit:  CONFIG.storelimit [rq.user.type],
                  limit:  limit,
                  fsused: parseInt (s.last [1]) || 0,
                  s3used: parseInt (s.last [2]) || 0
               },
               logs:          dale.go (s.last [0], JSON.parse),
               geo:           rq.user.geo ? true : undefined,
               geoInProgress: s.last [3]  ? true : undefined,
            });
         }
      ]);
   }],

   // *** ENABLE/DISABLE GEOTAGGING ***

   ['post', 'geo', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['operation'], 'eachOf', teishi.test.equal],
         ['operation', b.operation, ['enable', 'disable', 'dismiss'], 'oneOf', teishi.test.equal]
      ])) return;

      if (b.operation === 'dismiss') return astop (rs, [
         [H.log, rq.user.username, {a: 'geo', op: b.operation}],
         [reply, rs, 200]
      ]);

      astop (rs, [
         [Redis, 'get', 'geo:' + rq.user.username],
         function (s) {
            if (s.last) return reply (rs, 409);
            if (rq.user.geo   && b.operation === 'enable')  return reply (rs, 200);
            if (! rq.user.geo && b.operation === 'disable') return reply (rs, 200);
            s.next ();
         },
         b.operation === 'disable' ? [
            [a.set, 'allPics', [Redis, 'smembers', 'tag:' + rq.user.username + ':all']],
            [Redis, 'smembers', 'tags:' + rq.user.username],
            function (s) {
               var multi = redis.multi ();
               s.geotags = dale.fil (s.last, undefined, function (tag) {
                  if (! H.isGeo (tag)) return;
                  multi.smembers ('tag:' + rq.user.username + ':' + tag);
                  return tag;
               });
               mexec (s, multi);
            },
            function (s) {
               var multi = redis.multi ();
               dale.go (s.allPics, function (pic) {
                  multi.hdel ('pic:' + pic, 'loc');
               });
               dale.go (s.geotags, function (tag, k) {
                  if (! H.isGeo (tag)) return;
                  multi.srem ('tags:' + rq.user.username, tag);
                  multi.del ('tag:' + rq.user.username + ':' + tag);
                  dale.go (s.last [k], function (pic) {
                     multi.srem ('pict:' + pic, tag);
                  });
               });
               multi.hdel ('users:' + rq.user.username, 'geo');
               mexec (s, multi);
            },
            [H.log, rq.user.username, {a: 'geo', op: b.operation}],
            [reply, rs, 200]
         ] : [
            [Redis, 'set', 'geo:' + rq.user.username, Date.now ()],
            [Redis, 'hset', 'users:' + rq.user.username, 'geo', 1],
            [H.log, rq.user.username, {a: 'geo', op: b.operation}],
            function (s) {
               // We don't wait for the process to be completed to respond to the request.
               reply (rs, 200);
               s.next ();
            },
            [Redis, 'smembers', 'tag:' + rq.user.username + ':all'],
            function (s) {
               s.pics = s.last;
               var multi = redis.multi ();
               dale.go (s.last, function (pic) {
                  multi.hget ('pic:' + pic, 'vid');
               });
               mexec (s, multi);
            },
            function (s) {
               // TODO: replace by a.fork when bug is fixed: f7cdb4f4381c85dae1e6282d39348e260c3cafce
               var asyncFork = function (data, simult, fun, cb) {
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
               asyncFork (s.pics, os.cpus ().length, function (pic, K, cb) {
                  var path = Path.join (CONFIG.basepath, H.hash (rq.user.username), pic);
                  var vid = s.last [K];
                  a.stop ([
                     [a.stop, ! pic.vid ? [k, 'exiftool', path] : [k, 'ffprobe', '-i', path, '-show_streams'], function (s, error) {
                        // ffprobe always logs to stderr, so we need to put stderr onto s.last
                        if (error.code !== 0) return s.next (null, {id: pic.id, call: s.last});
                        s.next (error);
                     }],
                     function (s) {
                        var metadata = ! vid ? s.last.stdout : s.last.stderr;
                        H.getGeotags (s, metadata);
                     },
                     function (s) {
                        if (! s.last.length) return cb ();
                        var loc = JSON.stringify ([s.last [0], s.last [1]]);
                        var multi = redis.multi ();
                        multi.hset ('pic:'  + pic, 'loc', loc);
                        dale.go (s.last.slice (2), function (tag) {
                           multi.sadd ('tags:' + rq.user.username,             tag);
                           multi.sadd ('tag:'  + rq.user.username + ':' + tag, pic);
                           multi.sadd ('pict:' + pic,                          tag);
                        });
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

   // *** INTEGRATION WITH OTHER APIS ***

   // This route is executed after the OAuth flow, the provider redirects here.
   ['get', 'import/oauth/google', function (rq, rs) {
      if (! rq.data.query) return reply (rs, 400, {error: 'No query parameters.'});
      if (! rq.data.query.code) return reply (rs, 403, {error: 'No code parameter.'});
      if (rq.data.query.state !== rq.csrf) return reply (rs, 403, {error: 'Invalid state parameter.'});
      var body = [
         'code='          + rq.data.query.code,
         'client_id='     + SECRET.google.oauth.client,
         'client_secret=' + SECRET.google.oauth.secret,
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
            H.log (a.creat (), rq.user.username, {a: 'imp', s: 'grant', pro: 'google'});
         });
      }});
   }],

   ['post', 'import/delete/google', function (rq, rs) {
      astop (rs, [
         [Redis, 'del', 'imp:g:' + rq.user.username],
         function (s) {
            reply (rs, 200);
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

      b.ids = dale.keys (b.ids).sort ();

      astop (rs, [
         [Redis, 'hgetall', 'imp:g:' + rq.user.username],
         function (s) {
            var data = s.last;
            if (! data || ! data.end) return reply (rs, 404);
            if (data.error)           return reply (rs, 409);
            var list = JSON.parse (list.list);
            var folderIds = dale.obj (list.folders, function (folder) {
               return [folder.id, true];
            });

            var invalidId = dale.stop (b.ids, function (id) {
               if (! folderIds [id]) return id;
            });
            if (invalidId) return reply (rs, 409, {error: 'No such id: ' + invalidId});

            Redis (s, 'hset', 'imp:g:' + rq.user.username, 'selected', JSON.stringify (b.ids));
         },
         function (s) {
            reply (rs, 200);
         }
      ]);
   }],

   ['get', 'import/list/google', function (rq, rs) {

      a.stop ([
         [a.stop, [H.getGoogleToken, rq.user.username], function (s, error) {
            if (error.errorCode === 1) return reply (rs, 200, {error: error, redirect: [
               'https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=' + encodeURIComponent (CONFIG.domain + 'import/oauth/google'),
               'prompt=consent',
               'response_type=code',
               'client_id=' + SECRET.google.oauth.client,
               '&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.photos.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.readonly',
               'access_type=offline',
               'state=' + rq.csrf
            ].join ('&')});

            reply (rs, error.code ? error.code : 500, error);
         }],
         [Redis, 'hgetall', 'imp:g:' + rq.user.username],
         function (s) {
            if (s.last) {
               if (s.last.list) {
                  s.last.list = JSON.parse (s.last.list);
                  // We don't return the full list of pictures to the client.
                  delete s.last.list.pics;
               }
               var output = {
                  start: parseInt (s.last.start),
                  end: parseInt (s.last.end || 0),
                  fileCount: parseInt (s.last.fileCount) || 0,
                  folderCount: parseInt (s.last.folderCount) || 0,
                  error: s.last.error,
                  list: s.last.list || {}
               };
               dale.go (output.list.folders, function (folder, id) {
                  output.list.folders [id].children = dale.fil (folder.children, undefined, function (child) {
                     // Filter out pictures (those ids that have no entry in list.folders)
                     if (output.list.folders [child]) return child;
                  });
               });
               return reply (rs, 200, output);
            }
            // If no process ongoing, we start the process only if the query parameter `startList` is present
            if (rq.data.query && rq.data.query.startList) {
               reply (rs, 200, {start: Date.now (), fileCount: 0, folderCount: 0});
               s.next ();
            }
            else reply (rs, 200, {});
         },
         [H.log, rq.user.username, {a: 'imp', s: 'request', pro: 'google'}],
         [Redis, 'hset', 'imp:g:' + rq.user.username, 'start', Date.now ()],
         function (s) {

            // TODO: change PAGES to a large number after debugging client flows
            var PAGESIZE = 1000, PAGES = 3;

            var pics = [], page = 1, folders = {}, roots = {}, children = {}, parentsToRetrieve = [];
            var limits = [], setLimit = function (n) {
               var d = Date.now ();
               limits.unshift ([d - d % 1000, n || 1]);
            }

            var getFilePage = function (s, nextPageToken) {

               var fields = ['id', 'name', 'mimeType', 'createdTime', 'modifiedTime', 'owners', 'parents', 'originalFilename'];

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
                  'q=' + 'mimeType%20contains%20%27image%2F%27%20or%20mimeType%20contains%20%27video%2F%27',
                  'supportsAllDrives=true',
                  'spaces=drive,photos',
               ].join ('&') + (! nextPageToken ? '' : '&pageToken=' + nextPageToken);

               console.log ('DEBUG request image page', page++);

               setLimit ();
               hitit.one ({}, {timeout: 30, https: true, method: 'get', host: 'www.googleapis.com', path: path, headers: {authorization: 'Bearer ' + s.token, 'content-type': 'application/x-www-form-urlencoded'}, body: '', code: '*', apres: function (S, RQ, RS) {

                  if (RS.code !== 200) return s.next (null, RS.body);

                  redis.exists ('imp:g:' + rq.user.username, function (error, exists) {
                     if (error) return s.next (null, error);
                     // If key was deleted, process was cancelled. The process stops.
                     if (! exists) return;
                     redis.hincrby ('imp:g:' + rq.user.username, 'fileCount', RS.body.files.length, function (error) {
                        if (error) return s.next (null, error);

                        dale.go (RS.body.files, function (v) {
                           dale.go (v.parents, function (v2) {
                              if (! folders [v2] && parentsToRetrieve.indexOf (v2) === -1) parentsToRetrieve.push (v2);
                              if (! children [v2]) children [v2] = [];
                              children [v2].push (v.id);
                           });
                        });

                        pics = pics.concat (RS.body.files);

                        // TODO: remove after debugging
                        // Bring a maximum of PAGES pages.
                        if (page > PAGES) return s.next (pics);

                        if (RS.body.nextPageToken) getFilePage (s, RS.body.nextPageToken);
                        else s.next (pics);
                     });
                  });
               }});
            }

            var getParentBatch = function (s, maxRequests) {
               console.log ('GET PARENT BATCH, MAXREQUESTS:', maxRequests, parentsToRetrieve.length);
               // QUERY LIMITS: daily: 1000m; per 100 seconds: 10k; per 100 seconds per user: 1k.
               // don't extrapolate over user limit: 10 requests/second.
               var requestLimit = 10, timeWindow = 2;

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

               console.log ('DEBUG request parents', batch.length, 'remaining afterwards', parentsToRetrieve.length);
               setLimit (batch.length);
               hitit.one ({}, {timeout: 30, https: true, method: 'post', host: 'www.googleapis.com', path: 'batch/drive/v3', headers: {authorization: 'Bearer ' + s.token, 'content-type': 'multipart/mixed; boundary=' + boundary}, body: body, code: '*', apres: function (S, RQ, RS) {
                  if (RS.code !== 200) return s.next (null, RS.body);

                  redis.exists ('imp:g:' + rq.user.username, function (error, exists) {
                     if (error) return s.next (null, error);
                     // If key was deleted, process was cancelled. The process stops.
                     if (! exists) return;
                     redis.hincrby ('imp:g:' + rq.user.username, 'folderCount', batch.length, function (error) {
                        if (error) return s.next (null, error);

                        if (! RS.headers ['content-type'] || ! RS.headers ['content-type'].match ('boundary')) return s.next (null, 'No boundary in request: ' + JSON.stringify (RS.headers));
                        var boundary = RS.headers ['content-type'].match (/boundary=.+$/g) [0].replace ('boundary=', '');
                        var parts = RS.body.split (boundary);
                        var error;
                        dale.stopNot (parts.slice (1, -1), undefined, function (part) {
                           var json = JSON.parse (part.match (/^{[\s\S]+^}/gm) [0]);
                           if (json.error) return error = json.error;

                           folders [json.id] = {name: json.name, parents: json.parents};
                           if (! json.parents) roots [json.id] = true;
                           dale.go (json.parents, function (id) {
                              if (! children [id]) children [id] = [];
                              if (children [id].indexOf (json.id) === -1) children [id].push (json.id);
                              // If parent is not already retrieved and not in the list to be retrieved, add it to the list.
                              if (! folders [id] && parentsToRetrieve.indexOf (id) === -1) parentsToRetrieve.push (id);
                           });
                        });
                        if (error) return s.next (null, error);

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
                           console.log (timeNow, 'no capacity at all, waiting', timeWindow * 1000 - (d - lastPeriodRequest [0]), 'ms to make', lastPeriodRequest [1], 'requests');
                           setTimeout (function () {
                              getParentBatch (s, lastPeriodRequest [1]);
                           }, timeWindow * 1000 - (d - lastPeriodRequest [0]));
                        }
                        // If some capacity but not unrestricted, send a limited request immediately.
                        else if (parentsToRetrieve.length > (requestLimit - lastPeriodTotal)) {
                           console.log (timeNow, 'limited capacity', 'make only', requestLimit - lastPeriodTotal, 'requests');
                           getParentBatch (s, requestLimit - lastPeriodTotal);
                        }
                        else {
                           console.log (timeNow, 'give it mantec', 'second offset', Date.now () - Date.now () % 60000);
                           getParentBatch (s);
                        }
                     });
                  });
               }});
            }

            a.stop (s, [
               [getFilePage],
               getParentBatch,
               function (s) {
                  console.log ('DONE RETRIEVING DATA');
                  var porotoSum = function (id) {
                     if (! folders [id].count) folders [id].count = 0;
                     folders [id].count++;
                     dale.go (folders [id].parents, porotoSum);
                  }

                  dale.go (pics, function (pic) {
                     dale.go (pic.parents, porotoSum);
                  });

                  var output = {roots: dale.keys (roots), folders: {}, pics: pics};

                  dale.go (folders, function (folder, id) {
                     output.folders [id] = {name: folder.name, count: folder.count, parent: (folders [id].parents || []) [0], children: children [id]};
                  });

                  /* FINAL OBJECT IS OF THE FORM:
                  {roots: [...], folders: [
                     {id: '...', name: '...', count: ..., parent: ..., children: [...]},
                     ...
                  ], pics: [...]}
                  */
                  //console.log ('OUTPUT', JSON.stringify (output, null, '   '));

                  redis.exists ('imp:g:' + rq.user.username, function (error, exists) {
                     if (error) return s.next (null, error);
                     // If key was deleted, process was cancelled. The process stops.
                     if (! exists) return;
                     redis.hmset ('imp:g:' + rq.user.username, {list: JSON.stringify (output), end: Date.now ()}, function (error) {
                        if (error) return s.next (null, error);
                     });
                  });
               }
            ]);
         }
      ], function (s, error) {
         console.log ('IMPORT ERROR', error);
         notify (s, {priority: 'critical', type: 'Import error.', data: {error: teishi.complex (error) ? JSON.stringify (error) : error, user: rq.user.username, provider: 'google'}});
         redis.exists ('imp:g:' + rq.user.username, function (Error, exists) {
            if (Error) return notify (s, {priority: 'critical', type: 'Redis error.', redisError: Error, data: {error: teishi.complex (error) ? JSON.stringify (error) : error, user: rq.user.username, provider: 'google'}});
            // If key was deleted, process was cancelled. The process stops.
            if (! exists) return;
            redis.hmset ('imp:g:' + rq.user.username, {error: teishi.complex (error) ? JSON.stringify (error) : error, end: Date.now ()}, function (error) {
               if (error) return s.next (null, error);
            });
         });
      });
   }],

   // https://developers.google.com/drive/api/v2/reference/files/export
   ['post', 'import/file/google/:username/:id', function (rq, rs) {
      reply (rs, 409);
   }],

   // *** ADMIN AREA ***

   // *** REDMIN ***

   ['get', 'redmin', reply, redmin.html ()],
   ['post', 'redmin', function (rq, rs) {
      redmin.api (rq.body, function (error, data) {
         if (error) return cicek.reply (rs, 500, {error: error});
         cicek.reply (rs, 200, data);
      });
   }],
   ['get', 'redmin/client.js',    cicek.file, 'node_modules/redmin/client.js'],
   ['get', 'redmin/gotoB.min.js', cicek.file, 'node_modules/gotob/gotoB.min.js'],

   // *** ADMIN: INVITES ***

   ['get', 'admin/invites', function (rq, rs) {
      astop (rs, [
         [Redis, 'hgetall', 'invites'],
         function (s) {
            reply (rs, 200, ! s.last ? [] : dale.obj (s.last, function (value, key) {
               return [key, teishi.parse (value)];
            }));
         },
      ]);
   }],

   ['post', 'admin/invites/delete', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['email', 'firstName'], 'eachOf', teishi.test.equal],
         ['body.email', b.email, 'string'],
         ['body.email', b.email, H.email, teishi.test.match],
      ])) return;

      astop (rs, [
         [Redis, 'hdel', 'invites', rq.body.email],
         [reply, rs, 200],
      ]);
   }],

   ['post', 'admin/invites', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['email', 'firstName'], 'eachOf', teishi.test.equal],
         ['body.email', b.email, 'string'],
         ['body.email', b.email, H.email, teishi.test.match],
         ['body.firstName', b.firstName, 'string'],
      ])) return;

      b.email = H.trim (b.email.toLowerCase ());

      astop (rs, [
         [a.set, 'user', [Redis, 'hget', 'emails', b.email]],
         function (s) {
            if (s.user) return reply (rs, 400, {error: 'User already exists'});
            s.next ();
         },
         [a.set, 'token', [a.make (require ('bcryptjs').genSalt), 20]],
         function (s) {
            Redis (s, 'hset', 'invites', b.email, JSON.stringify ({firstName: b.firstName, token: s.token, sent: Date.now ()}));
         },
         // When running locally, the token is returned instead of being sent to the associated email address. This also avoids the bootstrap invite being sent when running the server locally.
         ENV ? [] : [a.get, reply, rs, 200, {token: '@token'}],
         function (s) {
            sendmail (s, {
               to1:     b.firstName,
               to2:     b.email,
               subject: CONFIG.etemplates.invite.subject,
               message: CONFIG.etemplates.invite.message (b.firstName, s.token, b.email)
            });
         },
         [reply, rs, 200],
      ]);
   }],

   ['get', 'admin/users', function (rq, rs) {
      astop (rs, [
         [Redis, 'hgetall', 'emails'],
         function (s) {
            var multi = redis.multi ();
            dale.go (s.last, function (username) {
               multi.hgetall ('users:' + username);
            });
            mexec (s, multi);
         },
         function (s) {
            reply (rs, 200, dale.go (s.last, function (user) {
               delete user.password;
               return user;
            }));
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

      astop (rs, [
         [a.make (fs.rename), rq.data.files.file, 'client.js'],
         [reply, rs, 200]
      ]);
   }],

];

// *** SERVER CONFIGURATION ***

cicek.options.cookieSecret = SECRET.cookieSecret;
cicek.options.log.console  = false;

cicek.apres = function (rs) {
   var t = Date.now ();
   if (rs.log.url.match (/^\/auth/)) {
      if (rs.log.requestBody && rs.log.requestBody.password) rs.log.requestBody.password = 'OMITTED';
   }

   var logs = [
      ['flow', 'rq-' + rs.log.code, 1],
   ];

   if (rs.log.code >= 400) {
      logs.push (['flow', 'rq-bad', 1]);
      var report = function () {
         if (['/assets/normalize.min.css.map', '/csrf'].indexOf (rs.log.url) !== -1) return false;
         return true;
      }
      if (report ()) notify (a.creat (), {priority: 'important', type: 'response error', code: rs.log.code, method: rs.log.method, url: rs.log.url, ip: rs.log.origin, ua: rs.log.requestHeaders ['user-agent'], headers: rs.log.requestHeaders, body: rs.log.requestBody, rbody: teishi.parse (rs.log.responseBody) || rs.log.responseBody});
   }
   else {
      logs.push (['flow', 'rq-all', 1]);
      logs.push (['flow', 'ms-all', t - rs.log.startTime]);
      logs.push (['max',  'ms-all', t - rs.log.startTime]);
      dale.go (['auth', 'pic', 'thumb', 'upload', 'delete', 'rotate', 'tag', 'query', 'share', 'geo'], function (path) {
         if (rs.log.method !== ((path === 'pic' || path === 'thumb') ? 'get' : 'post')) return;
         if (! rs.log.url.match (new RegExp ('^\/' + path))) return;
         logs.push (['flow', 'rq-' + path, 1]);
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
   if (message [1] === 'Invalid signature in cookie') notification = {
      priority: 'important',
      type: 'invalid signature in cookie',
      from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
      error:   message [2]
   }
   else if (message [1] === 'client error') notification = {
      priority: 'important',
      type:    'client error in server',
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
      priority: 'important',
      type:    'server error',
      subtype: message [1],
      from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
      error:   message [2]
   }

   notify (a.creat (), notification);
}

cicek.cluster ();

cicek.listen ({port: CONFIG.port}, routes);

if (cicek.isMaster) a.seq ([
   [k, 'git', 'rev-parse', 'HEAD'],
   function (s) {
      if (s.error) return notify (a.creat (), {priority: 'critical', type: 'server start', error: s.error});
      // TODO: remove timeout after implementing separate log service
      setTimeout (function () {
         notify (a.creat (), {priority: 'important', type: 'server start', sha: s.last.stdout.slice (0, -1)});
      }, ENV === 'dev' ? 1500 : 0);
   }
]);

process.on ('uncaughtException', function (error, origin) {
   a.seq ([
      [notify, {priority: 'critical', type: 'server error', error: error, stack: error.stack, origin: origin}],
      function () {
         process.exit (1);
      }
   ]);
});

// *** REDIS ERROR HANDLER ***

var lastRedisErrorNotification = 0;

redis.on ('error', function (error) {
   // Notify maximum once every 60 seconds.
   if ((Date.now () - lastRedisErrorNotification) < (1000 * 60)) return;
   lastRedisErrorNotification = Date.now ();
   notify (a.creat (), {priority: 'critical', type: 'redis error', error: error});
});

// *** DB BACKUPS ***

if (cicek.isMaster && ENV) setInterval (function () {
   var s3 = new (require ('aws-sdk')).S3 ({
      apiVersion:  '2006-03-01',
      sslEnabled:  true,
      credentials: {accessKeyId: SECRET.s3.accessKeyId, secretAccessKey: SECRET.s3.secretAccessKey},
      params:      {Bucket:      SECRET.s3.db.bucketName},
   });

   a.stop ([
      [a.make (H.encrypt), CONFIG.backup.path],
      [a.get, a.make (s3.upload, s3), {Key: new Date ().toUTCString () + '-dump.rdb', Body: '@last'}],
   ], function (s, error) {
      notify (s, {priority: 'critical', type: 'backup error', error: error});
   });
}, CONFIG.backup.frequency * 60 * 1000);

// *** CHECK OS RESOURCES ***

if (cicek.isMaster) setInterval (function () {
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

// *** BOOTSTRAP FIRST ADMIN USER ***

if (cicek.isMaster) setTimeout (function () {
   a.stop ([
      [Redis, 'hget', 'invites', SECRET.admins [0]],
      function (s) {
         if (s.last) return;
         a.make (hitit.one) (s, {}, {timeout: 15, port: CONFIG.port, method: 'post', path: 'admin/invites', body: {email: SECRET.admins [0], firstName: 'admin'}});
      },
   ], function (s, error) {
      notify (s, {priority: 'critical', type: 'bootstrap invite error', error: error});
   });
}, 3000);

// *** CHECK CONSISTENCY OF FILES BETWEEN DB, FS AND S3 ***

if (cicek.isMaster) a.stop ([
   // Get list of files from S3
   [H.s3list, ''],
   function (s) {
      s.s3files = dale.obj (s.last, function (path) {
         return [path, true];
      });
      s.next ();
   },
   // Get list of files from FS
   [a.make (fs.readdir), CONFIG.basepath],
   [a.get, a.fork, '@last', function (dir) {
      return [
         [a.stop, [a.make (fs.readdir), Path.join (CONFIG.basepath, dir)], function (s, error) {
            if (ENV) return s.next (null, error);
            // If errors happen locally, ignore them.
            if (error) return s.next (false);
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
      s.fsfiles = {};
      dale.go (s.last, function (folder) {
         dale.go (folder, function (file) {
            s.fsfiles [file] = true;
         });
      });
      s.next ();
   },
   // Get list of pics and thumbs
   [redis.keyscan, 'pic:*'],
   function (s) {
      var multi = redis.multi ();
      dale.go (s.last, function (id) {
         multi.hgetall (id);
      });
      mexec (s, multi);
   },
   function (s) {
      s.dbfiles = {};
      dale.go (s.last, function (pic) {
         var prefix = H.hash (pic.owner) + '/';
         s.dbfiles [prefix + pic.id] = 'pic';
         if (pic.t200) s.dbfiles [prefix + pic.t200] = 'thumb';
         if (pic.t900) s.dbfiles [prefix + pic.t900] = 'thumb';
      });
      s.next ();
   },
   // Check consistency. DB data is the measure of everything, the single source of truth.
   function (s) {
      // Note: All file lists (s.s3files, s.fsfiles, s.dbfiles) were initialized as objects for quick lookups; if stored as arrays instead, we'd be iterating the array N times when performing the checks below.

      s.fsextra   = [];
      s.fsmissing = [];
      s.s3extra   = [];
      s.s3missing = [];

      dale.go (s.dbfiles, function (type, dbfile) {
         // S3 only holds original pictures
         if (type === 'pic' && ! s.s3files [dbfile]) s.s3missing.push (dbfile);
         // FS holds both original pictures and thumbnails
         if (! s.fsfiles [dbfile]) s.fsmissing.push (dbfile);
      });
      dale.go (s.s3files, function (v, s3file) {
         if (! s.dbfiles [s3file]) s.s3extra.push (s3file);
      });
      dale.go (s.fsfiles, function (v, fsfile) {
         if (! s.dbfiles [fsfile]) s.fsextra.push (fsfile);
      });

      if (s.s3extra.length)   notify (a.creat (), {priority: 'important', type: 'extraneous files in S3 error', n: s.s3extra.length,   files: s.s3extra});
      if (s.fsextra.length)   notify (a.creat (), {priority: 'critical', type: 'extraneous files in FS error', n: s.fsextra.length,   files: s.fsextra});
      if (s.s3missing.length) notify (a.creat (), {priority: 'critical', type: 'missing files in S3 error',    n: s.s3missing.length, files: s.s3missing});
      if (s.fsmissing.length) notify (a.creat (), {priority: 'critical', type: 'missing files in FS error',    n: s.fsmissing.length, files: s.fsmissing});

      if (process.argv [3] !== 'makeConsistent') return;
      if (s.s3extra.length || s.fsextra.length || s.s3missing.length || s.fsmissing.length) s.next ();
   },
   // Extraneous S3 files: delete. Don't update the statistics.
   // s3:files entries should be deleted manually if needed.
   function (s) {
      H.s3del (s, s.s3extra);
   },
   // Extraneous FS files: delete. Don't update the statistics.
   [a.get, a.fork, '@fsextra', function (v) {
      return [a.make (fs.unlink), Path.join (CONFIG.basepath, v)];
   }, {max: os.cpus ().length}],
   // Missing FS files: nothing to do but report.
   function (s) {
      var message = dale.obj (['s3extra', 'fsextra', 's3missing', 'fsmissing'], {priority: 'critical', type: 'File consistency check success.'}, function (k) {
         if (s [k]) return [k, s [k]];
      });
      notify (s, message);
   },
], function (s, error) {
   notify (s, {priority: 'critical', type: 'File consistency check error.', error: error});
});

// *** CHECK CONSISTENCY OF STORED SIZES IN DB ***

if (cicek.isMaster) a.stop ([
   // Get list of all S3 sizes
   [a.set, 's3:files', [Redis, 'hgetall', 's3:files']],
   [redis.keyscan, 'stat:s:by*'],
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
         // Ignore stock:TIME, we want only the final numbers
         if (s.statkeys [k].match (/:\d+$/)) return;
         return [s.statkeys [k], parseInt (n)];
      });
      s.next ();
   },
   // Get list of pics and thumbs
   [redis.keyscan, 'pic:*'],
   function (s) {
      var multi = redis.multi ();
      dale.go (s.last, function (id) {
         multi.hgetall (id);
      });
      mexec (s, multi);
   },
   function (s) {
      var actual = {TOTAL: {s3: 0, fs: 0}};
      dale.go (s.last, function (pic) {
         if (! actual [pic.owner]) actual [pic.owner] = {s3: 0, fs: 0};
         actual [pic.owner].fs += parseInt (pic.byfs) + parseInt (pic.by200 || 0) + parseInt (pic.by900 || 0);
         actual.TOTAL.fs       += parseInt (pic.byfs) + parseInt (pic.by200 || 0) + parseInt (pic.by900 || 0);
         actual [pic.owner].s3 += parseInt (s ['s3:files'] [H.hash (pic.owner) + '/' + pic.id]);
         actual.TOTAL.s3       += parseInt (s ['s3:files'] [H.hash (pic.owner) + '/' + pic.id]);
      });
      var mismatch = [];
      dale.go (actual, function (v, k) {
         if (k === 'TOTAL') var stats = {fs: s.stats ['stat:s:byfs']      || 0, s3: s.stats ['stat:s:bys3']      || 0};
         else               var stats = {fs: s.stats ['stat:s:byfs-' + k] || 0, s3: s.stats ['stat:s:bys3-' + k] || 0};
         if (v.fs !== stats.fs) mismatch.push (['byfs' + (k === 'TOTAL' ? '' : '-' + k), v.fs - stats.fs]);
         if (v.s3 !== stats.s3) mismatch.push (['bys3' + (k === 'TOTAL' ? '' : '-' + k), v.s3 - stats.s3]);
      });

      if (mismatch.length === 0) return;

      notify (a.creat (), {priority: 'critical', type: 'Stored sizes consistency mismatch', mismatch: mismatch});

      if (process.argv [3] !== 'makeConsistent') return;

      H.stat.w (s, dale.go (mismatch, function (v) {
         return ['stock', v [0], v [1]];
      }));
   },
   [notify, {priority: 'critical', type: 'Stored sizes consistency check success.'}]
], function (s, error) {
   notify (s, {priority: 'critical', type: 'Stored sizes consistency check error.', error: error});
});

// *** LOAD GEODATA ***

if (cicek.isMaster && process.argv [3] === 'geodata') a.stop ([
   [function (s) {
      var path = process.argv [4];
      var file = fs.createReadStream (path);
      var errorCb = function (error) {
         notify (a.creat (), {priority: 'critical', type: 'Geodata file error.', error: error});
      }
      var output = [], lines = require ('readline').createInterface ({input: file});
      file.on  ('error', errorCb);
      lines.on ('error', errorCb);
      redis.del ('geo', function (error) {
         if (error) return errorCb (error);
         lines.on ('line', function (line) {
            line = line.split ('\t');
            // name 1, lat 4, lon 5, country 8, pop 14
            // https://redis.io/commands/geoadd - latitudes close to the pole cannot be added.
            if (Math.abs (parseFloat (line [4])) > 85.05112878) return;
            redis.geoadd ('geo', line [5], line [4], line [8] + ':' + line [14] + ':' + line [1], function (error) {
               if (error) throw error;
            });
         });
         lines.on ('close', function () {
            notify (s, {priority: 'critical', type: 'Geodata loaded correctly.'});
         });
      });
   }],
]);

// *** TEMPORARY SCRIPT TO DETECT FORMAT OF PICTURES ***

if (cicek.isMaster && process.argv [3] === 'addFormatInfo') a.stop ([
   // Get all picture data from the DB
   [redis.keyscan, 'pic:*'],
   function (s) {
      var multi = redis.multi ();
      dale.go (s.last, function (id) {
         multi.hgetall (id);
      });
      mexec (s, multi);
   },
   function (s) {
      var pics = s.last;
      delete s.last;
      // For each picture/video
      a.fork (s, pics, function (pic) {
         var path = Path.join (CONFIG.basepath, H.hash (pic.owner), pic.id);
         return [
            [a.stop, ! pic.vid ? [k, 'exiftool', path] : [k, 'ffprobe', '-i', path, '-show_streams'], function (s, error) {
               if (error.code !== 0) return s.next (null, {id: pic.id, call: s.last});
               // ffprobe always logs to stderr, so we need to put stderr onto s.last
               s.next (error);
            }],
            function (s) {
               var metadata = (pic.vid ? s.last.stderr + '\n' + s.last.stdout : s.last.stdout).split ('\n');
               var format;
               if (! pic.vid) {
                  format = dale.stopNot (metadata, undefined, function (line) {
                     if (line.match (/^File Type\s+:/)) return line.split (':') [1].replace (/\s/g, '');
                  });
                  if (! format) return s.next (null, {id: pic.id, type: 'pic', error: 'no format', metadata: metadata});
                  format = format.toLowerCase ();
               }
               else {
                  format = dale.fil (metadata, undefined, function (line) {
                     if (line.match (/^codec_name/)) return line.split ('=') [1];
                  });
                  if (format.length === 0) return s.next (null, {id: pic.id, type: 'vid', error: 'no format', metadata: metadata});
                  format = format.join ('/');
               }
               console.log ('format', pic.id, format);
               s.next ();
            }
         ];
      }, {max: os.cpus ().length});
   },
], function (s, error) {
   notify (s, {priority: 'critical', type: 'Script to add format information.', error: error});
});
