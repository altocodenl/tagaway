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
   if (! rs.connection || ! rs.connection.writable) {
      return notify (a.creat (), {type: 'client dropped connection', method: rs.log.method, url: rs.log.url, headers: rs.log.requestHeaders});
   }
   cicek.reply.apply (null, dale.fil (arguments, undefined, function (v, k) {
      // We ignore the astack stack if it's there. Note that this means that reply will also interrupt the asynchronous sequences. This is on purpose, since replying is usually the last thing to be done.
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
      if (error) return s.next (null, error);
      s.next (data);
   });
}

// *** GIZ ***

giz.redis          = redis;
giz.config.expires = 7 * 24 * 60 * 60;

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
   if (type (message) !== 'object') return s.next (undefined, 'Notify error - Message must be an object but instead is ' + message);
   if (JSON.stringify (message).length > 50000) return s.next (undefined, 'Notify error - Message is too big: ' + JSON.stringify (message).slice (0, 50000));
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
   params:      {Bucket: SECRET.s3.pic.bucketName},
   region:      SECRET.s3.region
});

// *** HELPERS ***

var H = {};

H.email = /^(([_\da-zA-Z\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})\s*)$/;

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

H.isYear = function (tag) {
   return tag.match (/^[0-9]{4}$/) && parseInt (tag) >= 1900 && parseInt (tag) <= 2100;
}

H.isGeo = function (tag) {
   return !! tag.match (/^g::/);
}

H.shuffleArray = function (array) {
   dale.go (dale.times (array.length - 1, array.length - 1, -1), function (k) {
      var randomIndex = Math.floor (Math.random () * (k + 1));
      var temp = array [k];
      array [k] = array [randomIndex];
      array [randomIndex] = temp;
   });
   return array;
}

H.isUserTag = function (tag) {
   tag = H.trim (tag.toLowerCase ());
   if (tag.length === 0) return false;
   if (tag === 'all' || tag === 'untagged') return false;
   return ! H.isYear (tag) && ! H.isGeo (tag);
}

H.getGeotags = function (s, metadata) {
   var countryCodes = {'AF':'Afghanistan','AX':'Åland Islands','AL':'Albania','DZ':'Algeria','AS':'American Samoa','AD':'Andorra','AO':'Angola','AI':'Anguilla','AQ':'Antarctica','AG':'Antigua and Barbuda','AR':'Argentina','AM':'Armenia','AW':'Aruba','AU':'Australia','AT':'Austria','AZ':'Azerbaijan','BS':'Bahamas','BH':'Bahrain','BD':'Bangladesh','BB':'Barbados','BY':'Belarus','BE':'Belgium','BZ':'Belize','BJ':'Benin','BM':'Bermuda','BT':'Bhutan','BO':'Bolivia, Plurinational State of','BQ':'Bonaire, Sint Eustatius and Saba','BA':'Bosnia and Herzegovina','BW':'Botswana','BV':'Bouvet Island','BR':'Brazil','IO':'British Indian Ocean Territory','BN':'Brunei Darussalam','BG':'Bulgaria','BF':'Burkina Faso','BI':'Burundi','KH':'Cambodia','CM':'Cameroon','CA':'Canada','CV':'Cape Verde','KY':'Cayman Islands','CF':'Central African Republic','TD':'Chad','CL':'Chile','CN':'China','CX':'Christmas Island','CC':'Cocos (Keeling) Islands','CO':'Colombia','KM':'Comoros','CG':'Congo','CD':'Congo, the Democratic Republic of the','CK':'Cook Islands','CR':'Costa Rica','CI':'Côte d\'Ivoire','HR':'Croatia','CU':'Cuba','CW':'Curaçao','CY':'Cyprus','CZ':'Czech Republic','DK':'Denmark','DJ':'Djibouti','DM':'Dominica','DO':'Dominican Republic','EC':'Ecuador','EG':'Egypt','SV':'El Salvador','GQ':'Equatorial Guinea','ER':'Eritrea','EE':'Estonia','ET':'Ethiopia','FK':'Falkland Islands (Malvinas)','FO':'Faroe Islands','FJ':'Fiji','FI':'Finland','FR':'France','GF':'French Guiana','PF':'French Polynesia','TF':'French Southern Territories','GA':'Gabon','GM':'Gambia','GE':'Georgia','DE':'Germany','GH':'Ghana','GI':'Gibraltar','GR':'Greece','GL':'Greenland','GD':'Grenada','GP':'Guadeloupe','GU':'Guam','GT':'Guatemala','GG':'Guernsey','GN':'Guinea','GW':'Guinea-Bissau','GY':'Guyana','HT':'Haiti','HM':'Heard Island and McDonald Islands','VA':'Holy See (Vatican City State)','HN':'Honduras','HK':'Hong Kong','HU':'Hungary','IS':'Iceland','IN':'India','ID':'Indonesia','IR':'Iran, Islamic Republic of','IQ':'Iraq','IE':'Ireland','IM':'Isle of Man','IL':'Israel','IT':'Italy','JM':'Jamaica','JP':'Japan','JE':'Jersey','JO':'Jordan','KZ':'Kazakhstan','KE':'Kenya','KI':'Kiribati','KP':'Korea, Democratic People\'s Republic of','KR':'Korea, Republic of','KW':'Kuwait','KG':'Kyrgyzstan','LA':'Lao People\'s Democratic Republic','LV':'Latvia','LB':'Lebanon','LS':'Lesotho','LR':'Liberia','LY':'Libya','LI':'Liechtenstein','LT':'Lithuania','LU':'Luxembourg','MO':'Macao','MK':'Macedonia, the Former Yugoslav Republic of','MG':'Madagascar','MW':'Malawi','MY':'Malaysia','MV':'Maldives','ML':'Mali','MT':'Malta','MH':'Marshall Islands','MQ':'Martinique','MR':'Mauritania','MU':'Mauritius','YT':'Mayotte','MX':'Mexico','FM':'Micronesia, Federated States of','MD':'Moldova, Republic of','MC':'Monaco','MN':'Mongolia','ME':'Montenegro','MS':'Montserrat','MA':'Morocco','MZ':'Mozambique','MM':'Myanmar','NA':'Namibia','NR':'Nauru','NP':'Nepal','NL':'Netherlands','NC':'New Caledonia','NZ':'New Zealand','NI':'Nicaragua','NE':'Niger','NG':'Nigeria','NU':'Niue','NF':'Norfolk Island','MP':'Northern Mariana Islands','NO':'Norway','OM':'Oman','PK':'Pakistan','PW':'Palau','PS':'Palestine, State of','PA':'Panama','PG':'Papua New Guinea','PY':'Paraguay','PE':'Peru','PH':'Philippines','PN':'Pitcairn','PL':'Poland','PT':'Portugal','PR':'Puerto Rico','QA':'Qatar','RE':'Réunion','RO':'Romania','RU':'Russian Federation','RW':'Rwanda','BL':'Saint Barthélemy','SH':'Saint Helena, Ascension and Tristan da Cunha','KN':'Saint Kitts and Nevis','LC':'Saint Lucia','MF':'Saint Martin (French part)','PM':'Saint Pierre and Miquelon','VC':'Saint Vincent and the Grenadines','WS':'Samoa','SM':'San Marino','ST':'Sao Tome and Principe','SA':'Saudi Arabia','SN':'Senegal','RS':'Serbia','SC':'Seychelles','SL':'Sierra Leone','SG':'Singapore','SX':'Sint Maarten (Dutch part)','SK':'Slovakia','SI':'Slovenia','SB':'Solomon Islands','SO':'Somalia','ZA':'South Africa','GS':'South Georgia and the South Sandwich Islands','SS':'South Sudan','ES':'Spain','LK':'Sri Lanka','SD':'Sudan','SR':'Suriname','SJ':'Svalbard and Jan Mayen','SZ':'Swaziland','SE':'Sweden','CH':'Switzerland','SY':'Syrian Arab Republic','TW':'Taiwan, Province of China','TJ':'Tajikistan','TZ':'Tanzania, United Republic of','TH':'Thailand','TL':'Timor-Leste','TG':'Togo','TK':'Tokelau','TO':'Tonga','TT':'Trinidad and Tobago','TN':'Tunisia','TR':'Turkey','TM':'Turkmenistan','TC':'Turks and Caicos Islands','TV':'Tuvalu','UG':'Uganda','UA':'Ukraine','AE':'United Arab Emirates','GB':'United Kingdom','US':'United States','UM':'United States Minor Outlying Islands','UY':'Uruguay','UZ':'Uzbekistan','VU':'Vanuatu','VE':'Venezuela, Bolivarian Republic of','VN':'Viet Nam','VG':'Virgin Islands, British','VI':'Virgin Islands, U.S.','WF':'Wallis and Futuna','EH':'Western Sahara','YE':'Yemen','ZM':'Zambia','ZW':'Zimbabwe'};

   var position = dale.stopNot (metadata.split ('\n'), undefined, function (line) {
      if (! line.match (/gps position/i)) return;
      var originalLine = line;
      line = line.split (':') [1];
      line = line.split (',');
      var lat = line [0].replace ('deg', '').replace ('\'', '').replace ('"', '').split (/\s+/);
      var lon = line [1].replace ('deg', '').replace ('\'', '').replace ('"', '').split (/\s+/);
      lat = (lat [4] === 'S' ? -1 : 1) * (parseFloat (lat [1]) + parseFloat (lat [2]) / 60 + parseFloat (lat [3]) / 3600);
      lon = (lon [4] === 'W' ? -1 : 1) * (parseFloat (lon [1]) + parseFloat (lon [2]) / 60 + parseFloat (lon [3]) / 3600);

      // We filter out invalid latitudes and latitudes over 85 degrees.
      if (['float', 'integer'].indexOf (type (lat)) === -1 || Math.abs (lat) > 85) {
         notify (a.creat (), {priority: 'important', type: 'invalid geotagging data', data: originalLine});
         return;
      }
      // We filter out invalid longitudes.
      if (['float', 'integer'].indexOf (type (lat)) === -1) {
         notify (a.creat (), {priority: 'important', type: 'invalid geotagging data', data: originalLine});
         return;
      }
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

// General policy on async helpers: unless a specific error is caught, leave it to the calling context to decide whether to put an error handler or not.
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

H.thumbPic = function (s, invalidHandler, path, thumbSize, pic, alwaysMakeThumb, heic_path) {
   var format = pic.format === 'png' ? '.png' : '.jpeg';
   var multiframeFormat = ['gif', 'tiff'].indexOf (pic.format) !== -1;
   a.seq (s, [
      [function (s) {
         var picMax = Math.max (s.size.w, s.size.h);
         if (! alwaysMakeThumb && picMax <= thumbSize) {
            if (! pic.deg) return s.next (true);
            // if picture has rotation metadata, we need to create a thumbnail, which has no metadata, to have a thumbnail with no metadata and thus avoid some browsers doing double rotation (one done by the metadata, another one by our interpretation of it).
            // If picture is smaller than 200px and we're deciding whether to do the 900px thumb, we skip it since we don't need it.
            if (picMax < 200 && thumbSize === 900) return s.next (true);
         }
         s ['t' + thumbSize] = uuid ();
         // In the case of thumbnails done for stripping rotation metadata, we don't go over 100% if the picture is smaller than the desired thumbnail size.
         var perc = Math.min (Math.round (thumbSize / picMax * 100), 100);
         a.seq (s, invalidHandler (s, [k, 'convert', (heic_path || path) + (multiframeFormat ? '[0]' : ''), '-quality', 90, '-thumbnail', perc + '%', Path.join (Path.dirname (path), s ['t' + thumbSize] + format)]));
      }],
      function (s) {
         if (s.last === true) return s.next (true);
         a.make (fs.rename) (s, Path.join (Path.dirname (path), s ['t' + thumbSize] + format), Path.join (Path.dirname (path), s ['t' + thumbSize]));
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

H.thumbVid = function (s, invalidHandler, path) {
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
         invalidHandler (s, [k, 'ffmpeg', '-i', path, '-vframes', '1', '-an', '-s', t200dim.w + 'x' + t200dim.h, Path.join (Path.dirname (path), s.t200 + '.png')]),
         [a.make (fs.rename), Path.join (Path.dirname (path), s.t200 + '.png'), Path.join (Path.dirname (path), s.t200)],
         [a.make (fs.stat), Path.join (Path.dirname (path), s.t200)],
         function (s) {
            s.t200size = s.last.size;
            s.next ();
         },
      ],
      ! s.t900 ? [] : [
         invalidHandler (s, [k, 'ffmpeg', '-i', path, '-vframes', '1', '-an', '-s', t900dim.w + 'x' + t900dim.h, Path.join (Path.dirname (path), s.t900 + '.png')]),
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
         if (! data.IsTruncated) return s.next (dale.go (output, function (v) {return v.Key}));
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
                  ['stock', 'bys3',                  bys3],
                  ['stock', 'bys3-' + next.username, bys3],
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
                  ['stock', 'bys3',                  - bys3],
                  ['stock', 'bys3-' + next.username, - bys3],
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
            return [H.unlink, Path.join (CONFIG.basepath, H.hash (username), v)];
         });
      },
      [H.unlink, Path.join (CONFIG.basepath, H.hash (username), id)],
      function (s) {
         if (! s.pic.vid || s.pic.vid === '1' || s.pic.vid.match (/^pending/) || s.pic.vid.match (/^error/)) return s.next ();
         H.unlink (s, Path.join (CONFIG.basepath, H.hash (username), s.pic.vid));
      },
      function (s) {
         var multi = redis.multi ();

         multi.del  ('pic:'  + s.pic.id);
         multi.del  ('pict:' + s.pic.id);
         if (s.pic.t200) multi.del ('thu:' + s.pic.t200);
         if (s.pic.t900) multi.del ('thu:' + s.pic.t900);
         multi.hdel ('hash:'        + s.pic.owner, s.pic.hash);
         multi.hdel ('hashorig:'    + s.pic.owner, s.pic.originalHash);
         multi.sadd ('hashdel:'     + s.pic.owner, s.pic.hash);
         multi.sadd ('hashorigdel:' + s.pic.owner, s.pic.originalHash);
         if (s.pic.providerHash) {
            var providerHash = s.pic.providerHash.split (':');
            multi.srem ('hash:'    + s.pic.owner + ':' + providerHash [0], providerHash [1]);
            multi.sadd ('hashdel:' + s.pic.owner + ':' + providerHash [0], providerHash [1]);
         }

         dale.go (s.tags.concat (['all', 'untagged']), function (tag) {
            multi.srem ('tag:' + s.pic.owner + ':' + tag, s.pic.id);
         });

         mexec (s, multi);
      },
      function (s) {
         H.stat.w (s, [
            // The minus sign coerces the strings into numbers.
            ['stock', 'byfs',             - s.pic.byfs - (s.pic.by200 || 0) - (s.pic.by900 || 0) - (s.pic.bymp4 || 0)],
            ['stock', 'byfs-' + username, - s.pic.byfs - (s.pic.by200 || 0) - (s.pic.by900 || 0) - (s.pic.bymp4 || 0)],
            ['stock', s.pic.vid ? 'vids' : 'pics', -1],
            ['stock', 'format-' + s.pic.format, -1],
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

H.getMetadata = function (s, path, vidFormat) {
   a.seq (s, ! vidFormat ? [k, 'exiftool', path] : [k, 'ffprobe', '-i', path, '-show_streams']);
}

H.detectFormat = function (s, metadata, vidFormat) {
   metadata = (vidFormat ? metadata.stderr + '\n' + s.last.stdout : s.last.stdout).split ('\n');
   var format;
   if (! vidFormat) {
      format = dale.stopNot (metadata, undefined, function (line) {
         if (line.match (/^File Type\s+:/)) return line.split (':') [1].replace (/\s/g, '');
      });
      if (! format) return s.next (null, {type: 'pic', error: 'no format detected', metadata: metadata});
      format = format.toLowerCase ();
   }
   else {
      format = dale.fil (metadata, undefined, function (line) {
         if (line.match (/^codec_name/)) return line.split ('=') [1];
      });
      if (format.length === 0) return s.next (null, {type: 'vid', error: 'no format', container: vidFormat, metadata: metadata});
      format = vidFormat + ':' + format.sort ().join ('/').toLowerCase ();
   }
   s.next (format);
}

H.getUploads = function (s, username, filters, maxResults) {
   filters = filters || {};
   a.seq (s, [
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
            if (log.provider && ! upload.provider) upload.provier = log.provider;
            if (log.type === 'complete' || log.type === 'cancel' || log.type === 'noCapacity' || log.type === 'error') {
               upload.end = log.t;
               // For complete and error, type of log equals upload.status
               // We check if status is already set in case an error comes after either a cancel or a completed
               if (! upload.status) upload.status = {cancel: 'cancelled', noCapacity: 'error'} [log.type] || log.type;
               if (log.type === 'noCapacity') upload.error = 'You have run out of space!';
               if (log.type === 'error')      upload.error = log.error;
            }
            else if (log.type === 'providerError') {
               if (! upload.providerErrors) upload.providerErrors = [];
               upload.providerErrors.push (log.error);
            }
            else if (log.type === 'wait') {
               if (! upload.lastActivity) upload.lastActivity = log.t;
            }
            else if (log.type === 'start') {
               // If current upload has had no activity in over ten minutes, we consider it stalled.
               if (! upload.status) {
                  // We use log.t instead of log.id in case this is an import, because the id of the import might be quite older than the start of its upload process.
                  if (Date.now () > 1000 * 60 * 10 + (upload.lastActivity || log.t)) {
                     upload.status = 'stalled';
                     upload.end    = (upload.lastActivity || log.t) + 1000 * 60 * 10;
                  }
                  else upload.status = 'uploading';
               }

               // We only put the tags added on the `start` event, instead of using those on the `ok` or `repeated` events.
               ['total', 'tooLarge', 'unsupported', 'alreadyImported', 'tags'].map (function (key) {
                  if (log [key] !== undefined) upload [key] = log [key];
               });
               completed++;
               // If we completed enough uploads as required, stop the process.
               if (maxResults && completed === maxResults) return true;
            }
            else if (log.type === 'ok') {
               if (! upload.lastActivity) upload.lastActivity = log.t;
               if (! upload.ok) upload.ok = 0;
               upload.ok++;
               if (! upload.lastPic) upload.lastPic = {id: log.fileId, deg: log.deg};
            }
            else if (log.type === 'alreadyUploaded') {
               if (! upload.lastActivity) upload.lastActivity = log.t;
               if (! upload.alreadyUploaded) upload.alreadyUploaded = 0;
               upload.alreadyUploaded++;
            }
            else if (log.type === 'repeated' || log.type === 'invalid' || log.type === 'tooLarge') {
               if (! upload.lastActivity) upload.lastActivity = log.t;
               if (! upload [log.type]) upload [log.type] = [];
               upload [log.type].push (log.filename);
               if (log.type === 'repeated') {
                  if (! upload.repeatedSize) upload.repeatedSize = 0;
                  upload.repeatedSize += log.fileSize;
               }
            }
         });
         s.next (dale.go (uploads, function (v) {delete v.lastActivity; return v}).sort (function (a, b) {
            // We sort uploads by their end date. If they don't have an end date, they go to the top of the list.
            return (b.end || Infinity) - (a.end || Infinity);
         }));
      }
   ]);
}

H.getImports = function (s, rq, rs, provider, maxResults) {
   a.seq (s, [
      [a.stop, [H.getGoogleToken, rq.user.username], function (s, error) {
         if (error.errorCode === 1) return a.seq (s, [
            [H.log, rq.user.username, {ev: 'import', type: 'request', provider: 'google'}],
            [reply, rs, 200, [{
               redirect: [
                  'https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=' + encodeURIComponent (CONFIG.domain + 'import/oauth/google'),
                  'prompt=consent',
                  'response_type=code',
                  'client_id=' + SECRET.google.oauth.client,
                  '&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.photos.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.readonly',
                  'access_type=offline',
                  'state=' + rq.csrf
               ].join ('&'),
               provider: 'google'
            }]],
         ]);

         reply (rs, 403, {code: error.code || 500, error: error.body || error});
      }],
      [a.set, 'current', [Redis, 'hgetall', 'imp:' + {google: 'g', dropbox: 'd'} [provider] + ':' + rq.user.username]],
      [a.set, 'uploads', [H.getUploads, rq.user.username, {provider: provider}, maxResults]],
      function (s) {
         // The only previous imports that are registered in the history are those that had an upload, otherwise they are not considered.
         if (! s.current) return s.next (s.uploads);
         var id = parseInt (s.current.id);
         var currentUpload = dale.stopNot (s.uploads, undefined, function (upload) {
            if (upload.id === id) return upload;
         });

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
               data:        s.current.data ? JSON.parse (s.current.data) : undefined
            });
            // Delete file data from import since it's not necessary in the client.
            if (s.uploads [0].data) delete s.uploads [0].data.files;
         }
         s.next (s.uploads);
      }
   ]);
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
                  s.next (null, {errorCode: 2, error: 'Refresh token failed', code: rs.code, body: rs.body});
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
            dale.go (['murmurhash.js', 'gotoB.min.js'], function (v) {
               return ['script', {src: 'assets/' + v}];
            }),
            ['script', 'window.allowedFormats = ' + JSON.stringify (CONFIG.allowedFormats) + ';'],
            ['script', 'window.maxFileSize    = ' + CONFIG.maxFileSize + ';'],
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
            dale.go (['pure-min.css', 'ionicons.min.css'], function (v) {
               return ['link', {rel: 'stylesheet', href: 'assets/' + v}];
            })
         ]],
         ['body', [
            ['script', {src: 'assets/gotoB.min.js'}]
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
         [notify, {priority: 'critical', type: 'client error in browser', ip: rq.origin, user: (rq.user || {}).username, error: rq.body, userAgent: rq.headers ['user-agent']}],
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
         ['keys of body', dale.keys (b), ['username', 'password', 'timezone'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.go (['username', 'password'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
            ['body.timezone', b.timezone, 'integer'],
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
               [H.log, s.username, {ev: 'auth', type: 'login', ip: rq.origin, userAgent: rq.headers ['user-agent'], timezone: b.timezone}],
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
               suggestGeotagging:   1,
               suggestSelection:    1
            });
            if (! ENV) multi.hmset ('users:' + b.username, 'verificationPending', true);
            s.invite.accepted = Date.now ();
            multi.hset  ('invites', b.email, JSON.stringify (s.invite));
            mexec (s, multi);
         },
         [H.stat.w, 'stock', 'users', 1],
         [H.log, b.username, {ev: 'auth', type: 'signup', ip: rq.origin, userAgent: rq.headers ['user-agent']}],
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
               [notify, {priority: 'important', type: 'bad emailtoken', token: token, ip: rq.origin, userAgent: rq.headers ['user-agent']}],
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
            H.log (s, s.user.username, {ev: 'auth', type: 'recover', ip: rq.origin, userAgent: rq.headers ['user-agent']});
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
            H.log (s, s.user.username, {ev: 'auth', type: 'reset', ip: rq.origin, userAgent: rq.headers ['user-agent']});
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
         [H.log, rq.user.username, {ev: 'auth', type: 'logout', ip: rq.origin, userAgent: rq.headers ['user-agent']}],
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
                  multi.del ('tags:'        + user.username);

                  // hash and hashorig entries are deleted incrementally when deleting each picture.
                  multi.del ('hashdel:'     + user.username);
                  multi.del ('hashorigdel:' + user.username);
                  dale.go ([':g', ':d'], function (v) {
                     multi.del ('hashdel:' + user.username + v);
                  });
                  multi.del ('shm:'   + user.username);
                  multi.del ('sho:'   + user.username);
                  multi.del ('ulog:'  + user.username);
                  mexec (s, multi);
               },
               b.username === undefined ? [a.make (giz.logout), rq.data.cookie [CONFIG.cookiename]] : [],
               [H.log, user.username, {ev: 'auth', type: 'destroy', ip: rq.origin, userAgent: rq.headers ['user-agent'], triggeredByAdmin: b.username !== undefined ? true : undefined}],
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
                  [H.log, rq.user.username, {ev: 'auth', type: 'passwordChange', ip: rq.origin, userAgent: rq.headers ['user-agent']}],
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
            var etag = cicek.etag (s.pic.id, true), headers = {etag: etag, 'content-type': mime.getType (s.pic.format.split (':') [0])};
            if (rq.headers ['if-none-match'] === etag) return reply (rs, 304, '', headers);

            // https://stackoverflow.com/questions/93551/how-to-encode-the-filename-parameter-of-content-disposition-header-in-http
            if (rq.data.query && rq.data.query.original) {
               headers ['content-disposition'] = 'attachment; filename=' + encodeURIComponent (s.pic.name);
               headers ['last-modified'] = new Date (JSON.parse (s.pic.dates) ['upload:date']).toUTCString ();
            }
            // If the picture is not a video, or it is a mp4 video, or the original video is required, we serve the file.
            if (! s.pic.vid || s.pic.vid === '1' || (rq.data.query && rq.data.query.original)) return cicek.file (rq, rs, Path.join (H.hash (s.pic.owner), s.pic.id), [CONFIG.basepath], headers);

            if (s.pic.vid.match (/pending/)) return reply (rs, 404, 'pending');
            if (s.pic.vid.match (/error/))   return reply (rs, 500, 'error');
            // We serve the mp4 version of the video.
            headers ['content-type'] = mime.getType ('mp4');
            cicek.file (rq, rs, Path.join (H.hash (s.pic.owner), s.pic.vid), [CONFIG.basepath], headers);
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
            var format = s.pic.format === 'png' ? 'png' : 'jpeg';
            if (rq.data.params.size === '900' && s.pic.format === 'gif') format = 'gif';
            // We base etags solely on the id of the file; this requires files to never be changed once created. This is the case here.
            var etag = cicek.etag (id, true), headers = {etag: etag, 'content-type': mime.getType (format)};
            if (rq.headers ['if-none-match'] === etag) return reply (rs, 304, '', headers);
            cicek.file (rq, rs, Path.join (H.hash (s.pic.owner), id), [CONFIG.basepath], headers);
         }
      ]);
   }],

   // *** UPLOAD PICTURES ***

   ['post', 'metaupload', function (rq, rs) {

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
            ['body.total', b.total, {min: 0}, teishi.test.range],
            ['body.alreadyImported', b.alreadyImported, ['integer', 'undefined'], 'oneOf'],
            b.alreadyImported === undefined ? [] : ['body.alreadyImported', b.alreadyImported, {min: 1}, teishi.test.range],
         ],
         b.op !== 'error' ? [] : ['body.error', b.error, 'object']
      ])) return;

      if (b.provider && rq.origin !== '::ffff:127.0.0.1') return reply (rs, 403);

      var invalidTag;
      if (b.tags && b.tags.length) b.tags = dale.go (b.tags, function (tag) {
         if (! H.isUserTag (tag)) return invalidTag = tag;
         return H.trim (tag);
      });

      if (invalidTag) return reply (rs, 400, {error: 'invalid tag: ' + invalidTag});

      if (b.op === 'start') b.id = t;

      astop (rs, [
         [H.getUploads, rq.user.username, {id: b.id}],
         function (s) {
            if (b.op === 'start' && s.last.length) return reply (rs, 409);
            if (b.op !== 'start' && b.op !== 'error') {
               if (! s.last.length)                   return reply (rs, 404);
               if (s.last [0].status !== 'uploading') return reply (rs, 409);
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
         ['keys of body', dale.keys (b), ['id', 'hash', 'filename', 'fileSize', 'tags'], 'eachOf', teishi.test.equal],
         ['body.id',   b.id,   'integer'],
         ['body.hash', b.hash, 'integer'],
         ['body.filename', b.filename, 'string'],
         ['body.fileSize', b.fileSize, 'integer'],
         ['body.fileSize', b.fileSize, {min: 0}, teishi.test.range],
         ['body.tags', b.tags, ['undefined', 'array'], 'oneOf'],
         ['body.tags', b.tags, 'string', 'each'],
      ])) return;

      var invalidTag;

      b.tags = dale.go (b.tags, function (tag) {
         if (! H.isUserTag (tag)) invalidTag = tag;
         return H.trim (tag);
      });

      if (invalidTag) return reply (rs, 400, {error: 'invalid tag: ' + invalidTag});

      astop (rs, [
         [H.getUploads, rq.user.username, {id: b.id}],
         function (s) {
            if (! s.last.length)                   return reply (rs, 404, {error: 'upload'});
            if (s.last [0].status !== 'uploading') return reply (rs, 409, {error: 'status'});
            s.next ();
         },
         [a.cond, [Redis, 'hget', 'hashorig:' + rq.user.username, b.hash], {
            'null': [reply, rs, 200, {repeated: false}],
            'else': [
               [function (s) {
                  Redis (s, 'hgetall', 'pic:' + s.last);
               }],
               function (s) {
                  s.pic = s.last;

                  // We add the tags of this picture to those of the identical picture already existing
                  var multi = redis.multi ();

                  dale.go (b.tags, function (tag) {
                     multi.sadd ('pict:' + s.pic.id,                     tag);
                     multi.sadd ('tags:' + rq.user.username,             tag);;
                     multi.sadd ('tag:'  + rq.user.username + ':' + tag, s.pic.id);
                  });
                  if (b.tags.length > 0) multi.srem ('tag:' + rq.user.username + ':untagged', s.pic.id);
                  mexec (s, multi);
               },
               function (s) {
                  H.log (s, rq.user.username, {ev: 'upload', type: b.filename === s.pic.name ? 'alreadyUploaded' : 'repeated', id: b.id, fileId: s.pic.id, tags: b.tags && b.tags.length ? b.tags : undefined, filename: b.filename === s.pic.name ? undefined : b.filename, fileSize: b.filename !== s.pic.name ? b.fileSize : undefined});
               },
               [reply, rs, 200, {repeated: true}]
            ]
         }]
      ]);
   }],

   ['post', 'upload', function (rq, rs) {

      if (! rq.data.fields)                    return reply (rs, 400, {error: 'field'});
      if (! rq.data.files)                     return reply (rs, 400, {error: 'file'});
      if (! rq.data.fields.id)                 return reply (rs, 400, {error: 'id'});
      if (! rq.data.fields.id.match (/^\d+$/)) return reply (rs, 400, {error: 'id'});
      rq.data.fields.id = parseInt (rq.data.fields.id);

      if (type (parseInt (rq.data.fields.lastModified)) !== 'integer') return reply (rs, 400, {error: 'lastModified'});

      if (! rq.data.fields.tags) rq.data.fields.tags = '[]';
      if (teishi.stop (['fields', dale.keys (rq.data.fields), ['id', 'lastModified', 'tags', 'providerData'], 'eachOf', teishi.test.equal], function () {})) return reply (rs, 400, {error: 'invalidField'});

      if (! eq (dale.keys (rq.data.files), ['pic'])) return reply (rs, 400, {error: 'invalidFile'});

      var tags = teishi.parse (rq.data.fields.tags), invalidTag;
      if (type (tags) !== 'array') return reply (rs, 400, {error: 'tags'});
      tags = dale.go (tags, function (tag) {
         if (type (tag) !== 'string' || ! H.isUserTag (tag)) {
            invalidTag = tag;
            return;
         }
         return H.trim (tag);
      });
      if (invalidTag) return reply (rs, 400, {error: 'invalid tag: ' + invalidTag});

      if (rq.data.fields.providerData !== undefined) {
         if (rq.origin !== '::ffff:127.0.0.1') return reply (rs, 403);
         rq.data.fields.providerData = teishi.parse (rq.data.fields.providerData);
      }

      var path = (rq.data.fields.providerData || {}).path || rq.data.files.pic, lastModified = parseInt (rq.data.fields.lastModified);
      var hashpath = Path.join (Path.dirname (rq.data.files.pic), Path.basename (rq.data.files.pic).replace (Path.extname (rq.data.files.pic), '') + 'hash' + Path.extname (rq.data.files.pic));
      var name = rq.data.fields.providerData ? rq.data.fields.providerData.name : path.slice (path.indexOf ('_') + 1);

      if (CONFIG.allowedFormats.indexOf (mime.getType (rq.data.files.pic)) === -1) return reply (rs, 400, {error: 'fileFormat', filename: name});

      var pic = {
         id:     uuid (),
         owner:  rq.user.username,
         name:   name,
         dateup: Date.now (),
      };

      var vidFormats = {'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/3gpp': '3gp', 'video/x-msvideo': 'avi'};

      if (vidFormats [mime.getType (rq.data.files.pic)]) {
         var vidFormat = vidFormats [mime.getType (rq.data.files.pic)];
         // If the format is mp4, we only put a truthy placeholder in pic.vid; otherwise, we create an id to point to the mp4 version of the video.
         pic.vid = vidFormat === 'mp4' ? 1 : uuid ();
      }

      var newpath = Path.join (CONFIG.basepath, H.hash (rq.user.username), pic.id);

      var perf = [['init', Date.now ()]], perfTrack = function (s, label) {
         perf.push ([label, Date.now ()]);
         s.next (s.last);
      }

      // input can be either an async sequence (array) or an error per se (object)
      var invalidHandler = function (s, input) {
         var cbError = function (error) {
            astop (rs, [
               [H.unlink, newpath, true],
               ! s.t200 ? [] : [H.unlink, Path.join (Path.dirname (newpath), s.t200), true],
               ! s.t900 ? [] : [H.unlink, Path.join (Path.dirname (newpath), s.t900), true],
               [H.log, rq.user.username, {ev: 'upload', type: 'invalid', id: rq.data.fields.id, provider: (rq.data.fields.providerData || {}).provider, filename: name, error: error}],
               [reply, rs, 400, {error: 'Invalid ' + (pic.vid ? 'video' : 'image'), data: error, filename: name}],
            ]);
         }
         // If input is an async sequence, we return another async sequence
         if (type (input) === 'array') return [a.stop, input, function (s, error) {
            cbError (error);
         }];
         // Otherwise, we invoke cbError with the error directly
         else cbError (input);
      }

      a.stop ([
         [H.getUploads, rq.user.username, {id: rq.data.fields.id}],
         function (s) {

            if (! s.last.length)                   return reply (rs, 404, {error: 'upload'});
            if (s.last [0].status !== 'uploading') return reply (rs, 409, {error: 'status'});
            s.next ();
         },
         [a.set, 'byfs', [a.make (fs.stat), path]],
         function (s) {
            if (s.byfs.size <= CONFIG.maxFileSize) return s.next ();
            a.seq (s, [
               [H.log, rq.user.username, {ev: 'upload', type: 'tooLarge', id: rq.data.fields.id, provider: (rq.data.fields.providerData || {}).provider, filename: name, size: s.byfs.size}],
               [reply, rs, 400, {error: 'tooLarge', filename: name}]
            ]);
         },
         [Redis, 'get', 'stat:s:byfs-' + rq.user.username],
         function (s) {
            var used = parseInt (s.last) || 0;
            var limit = CONFIG.storelimit [rq.user.type];
            // TODO: remove
            // Temporarily override limit for admins until we roll out paid accounts.
            if (SECRET.admins.indexOf (rq.user.email) !== -1) limit = 1000 * 1000 * 1000 * 1000;
            if (used + s.byfs.size >= limit) return a.seq (s, [
               [H.log, rq.user.username, {ev: 'upload', type: 'noCapacity', id: rq.data.fields.id, provider: (rq.data.fields.providerData || {}).provider}],
               [reply, rs, 409, {error: 'capacity'}]
            ]);
            s.next ();
         },
         [perfTrack, 'initial'],
         function (s) {
            a.seq (s, invalidHandler (s, [H.getMetadata, path, pic.vid]));
         },
         function (s) {
            s.rawMetadata = s.last;
            s.metadata = s.last [pic.vid ? 'stderr' : 'stdout'];
            var metadata = s.metadata.split ('\n');
            if (! pic.vid) {
               s.size = {};
               var error = dale.stopNot (metadata, undefined, function (line) {
                  if (line.match (/^Warning/)) {
                     if (line.match ('minor') || line.match ('Invalid EXIF text encoding') || line.match ('Bad IFD1 directory')) return;
                     return line.replace (/^Warning\s+:\s+/, '');
                  }
                  if (line.match (/^Image Width/))  s.size.w = parseInt (line.split (':') [1].trim ());
                  if (line.match (/^Image Height/)) s.size.h = parseInt (line.split (':') [1].trim ());
                  if (line.match (/^Error/))   return line.replace (/^Error\s+:\s+/, '');
               });

               if (error) return invalidHandler (s, {error: 'Exiftool error', data: error});

               if (! s.size.w || ! s.size.h) return invalidHandler (s, {error: 'Invalid size', metadata: metadata});

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
               s.size = {};
               dale.go ((s.rawMetadata.stdout + s.rawMetadata.stderr).split ('\n'), function (line) {
                  if (line.match (/\s+rotate\s+:/)) rotation = line.replace (/rotate\s+:/, '').trim ();
                  if (line.match (/^width/i))  s.size.w = parseInt (line.split ('=') [1]);
                  if (line.match (/^height/i)) s.size.h = parseInt (line.split ('=') [1]);
               });
               if (! s.size.w || ! s.size.h) return invalidHandler (s, {error: 'Invalid size', metadata: metadata});

               if (rotation === '90' || rotation === '270') s.size = {w: s.size.h, h: s.size.w};
               s.dates = dale.obj (metadata, function (line) {
                  if (line.match (/time\b/i)) return [line.split (':') [0].trim (), line.replace (/.*: /, '')];
               });
            }
            s.next ();
         },
         function (s) {
            a.set (s, 'format', [H.detectFormat, s.rawMetadata, pic.vid ? vidFormat : false]);
         },
         [perfTrack, 'format'],
         [a.set, 'hashorig', function (s) {
            fs.readFile (path, function (error, file) {
               if (error) return s.next (null, error);
               s.next (hash (file));
               // We remove the reference to the buffer to free memory.
               file = null;
            });
         }],
         [a.cond, [a.get, Redis, 'hexists', 'hashorig:' + rq.user.username, '@hashorig'], {'1': [
            [a.get, Redis, 'hget', 'hashorig:' + rq.user.username, '@hashorig'],
            function (s) {
               Redis (s, 'hgetall', 'pic:' + s.last);
            },
            function (s) {
               s.pic = s.last;

               // We add the tags of this picture to those of the identical picture already existing
               var multi = redis.multi ();

               dale.go (tags, function (tag) {
                  multi.sadd ('pict:' + s.pic.id,                     tag);
                  multi.sadd ('tags:' + rq.user.username,             tag);;
                  multi.sadd ('tag:'  + rq.user.username + ':' + tag, s.pic.id);
               });
               if (tags.length > 0) multi.srem ('tag:' + rq.user.username + ':untagged', s.pic.id);
               mexec (s, multi);
            },
            function (s) {
               H.log (s, rq.user.username, {ev: 'upload', type: name === s.pic.name ? 'alreadyUploaded' : 'repeated', id: rq.data.fields.id, fileId: s.pic.id, tags: tags.length ? tags : undefined, filename: name === s.pic.name ? undefined : name, fileSize: name === s.pic.name ? undefined : s.byfs.size});
            },
            function (s) {
               reply (rs, 409, {error: name === s.pic.name ? 'alreadyUploaded' : 'repeated', id: s.pic.id});
            }
         ]}],
         pic.vid ? function (s) {
            a.seq (s, invalidHandler (s, [k, 'ffmpeg', '-i', path, '-map_metadata', '-1', '-c:v', 'copy', '-c:a', 'copy', hashpath]));
         } : function (s) {
            // exiftool doesn't support removing metadata from bmp files, so we use the original file to compute the hash.
            if (s.format === 'bmp') return a.make (fs.copyFile) (s, path, hashpath);
            a.seq (s, [
               [a.make (fs.copyFile), path, hashpath],
               // We use exiv2 for removing the metadata from the comparison file because exif doesn't support writing webp files
               invalidHandler (s, s.format !== 'webp' ? [k, 'exiftool', '-all=', '-overwrite_original', hashpath] : [k, 'exiv2', 'rm', hashpath])
            ]);
         },
         [a.set, 'hash', function (s) {
            fs.readFile (hashpath, function (error, file) {
               if (error) return s.next (null, error);
               s.next (hash (file));
               // We remove the reference to the buffer to free memory.
               file = null;
            });
         }],
         [H.unlink, hashpath],
         [a.cond, [a.get, Redis, 'hexists', 'hash:' + rq.user.username, '@hash'], {'1': [
            [a.get, Redis, 'hget', 'hash:' + rq.user.username, '@hash'],
            function (s) {
               s.id = s.last;

               // We add the tags of this picture to those of the identical picture already existing
               var multi = redis.multi ();

               dale.go (tags, function (tag) {
                  multi.sadd ('pict:' + s.id,                         tag);
                  multi.sadd ('tags:' + rq.user.username,             tag);;
                  multi.sadd ('tag:'  + rq.user.username + ':' + tag, s.id);
               });
               if (tags.length > 0) multi.srem ('tag:' + rq.user.username + ':untagged', s.id);
               mexec (s, multi);
            },
            function (s) {
               H.log (s, rq.user.username, {ev: 'upload', type: 'repeated', id: rq.data.fields.id, provider: (rq.data.fields.providerData || {}).provider, fileId: s.id, tags: tags.length ? tags : undefined, filename: name, fileSize: s.byfs.size});
            },
            function (s) {
               reply (rs, 409, {error: 'repeated', id: s.id});
            }
         ]}],
         [perfTrack, 'hash'],
         [H.mkdirif, Path.dirname (newpath)],
         [k, 'cp', path, newpath],
         [H.unlink, path],
         [perfTrack, 'fs'],
         // This function converts non-mp4 videos to mp4.
         function (s) {
            if (! pic.vid || vidFormat === 'mp4') return s.next ();
            var id = pic.vid, start = Date.now ();
            pic.vid = 'pending:' + id;
            // Don't wait for conversion process, run it in new astack thread.
            s.next ();

            a.stop ([
               [Redis, 'hset', 'proc:vid', pic.id, Date.now ()],
               // TODO: add queuing to allow a maximum of N simultaneous conversions.
               [k, 'ffmpeg', '-i', newpath, '-vcodec', 'h264', '-acodec', 'mp2', Path.join (Path.dirname (newpath), id + '.mp4')],
               [a.make (fs.rename), Path.join (Path.dirname (newpath), id + '.mp4'), Path.join (Path.dirname (newpath), id)],
               [a.set, 'bymp4', [a.make (fs.stat), Path.join (Path.dirname (newpath), id)]],
               [Redis, 'exists', 'pic:' + pic.id],
               function (s) {
                  if (! s.last) return a.stop ([H.unlink, Path.join (Path.dirname (newpath), id), true], function (error) {
                     notify (a.creat (), {priority: 'critical', type: 'video conversion deletion of mp4', error: error, username: rq.user.username});
                  });
                  s.bymp4 = s.bymp4.size;
                  var multi = redis.multi ();
                  multi.hmset ('pic:' + pic.id, {vid: id, bymp4: s.bymp4});
                  multi.hdel ('proc:vid', pic.id);
                  mexec (s, multi);
               },
               function (s) {
                  H.stat.w (s, [
                     ['stock', 'byfs',                     s.bymp4],
                     ['stock', 'byfs-' + rq.user.username, s.bymp4],
                     ['flow', 'ms-video-convert', Date.now () - start],
                     ['flow', 'ms-video-convert:' + vidFormat, Date.now () - start]
                  ]);
               }
            ], function (s, error) {
               redis.exists ('pic:' + pic.id, function (Error, exists) {
                  if (Error) return notify (s, {priority: 'critical', type: 'redis error', error: Error});
                  // If the picture was deleted, ignore the error.
                  if (! exists) return;
                  redis.set ('pic:' + pic.id, 'vid', 'error:' + id, function (Error) {
                     if (Error) return notify (s, {priority: 'critical', type: 'redis error', error: Error});
                     notify (s, {priority: 'critical', type: 'video conversion to mp4 error', error: error, username: rq.user.username});
                  });
               });
            });
         },
         function (s) {
            pic.format = s.format;
            if (pic.format !== 'heic') return s.next ();
            s.heic_jpg = Path.join ((os.tmpdir || os.tmpDir) (), pic.uuid + '.jpeg');
            a.seq (s, invalidHandler (s, [k, 'heif-convert', '-q', '100', newpath, s.heic_jpg]));
         },
         function (s) {
            if (pic.vid) return H.thumbVid (s, invalidHandler, newpath);
            var alwaysMakeThumb = s.format !== 'jpeg' && s.format !== 'png';
            // If gif, only make small thumbnail.
            if (pic.format === 'gif') a.seq (s, [[H.thumbPic, invalidHandler, newpath, 200, pic, true], [perfTrack, 'resize200']]);
            else a.seq (s, [
               [H.thumbPic, invalidHandler, newpath, 200, pic, alwaysMakeThumb, s.heic_jpg],
               [perfTrack, 'resize200'],
               [H.thumbPic, invalidHandler, newpath, 900, pic, alwaysMakeThumb, s.heic_jpg],
               [perfTrack, 'resize900']
            ]);
         },
         function (s) {
            if (pic.format !== 'heic') return s.next ();
            H.unlink (s, s.heic_jpg);
         },
         // We store only the original pictures in S3, not the thumbnails. We do this only after the picture/video has been considered valid.
         [H.s3queue, 'put', rq.user.username, Path.join (H.hash (rq.user.username), pic.id), newpath],
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

            pic.dimw         = s.size.w;
            pic.dimh         = s.size.h;
            pic.byfs         = s.byfs.size;
            pic.hash         = s.hash;
            pic.originalHash = s.hashorig;

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
               // Ignore manufacture date stamp
               if (k.match (/manufacture date/i)) return;
               var d = new Date (v);
               if (d.getTime ()) return d.getTime ();
               d = new Date (v.replace (':', '-').replace (':', '-'));
               if (d.getTime ()) return d.getTime ();
            }).sort (function (a, b) {
               return a - b;
            });

            pic.date = pic.date [0];
            // If date is earlier than 1990, report it but carry on.
            if (pic.date < new Date ('1990-01-01').getTime ()) notify (a.creat (), {priority: 'important', type: 'old date in picture', user: rq.user.username, dates: s.dates, filename: name});

            if (s.t200) pic.t200  = s.t200;
            if (s.t900) pic.t900  = s.t900;
            if (s.t200) pic.by200 = s.t200size;
            if (s.t900) pic.by900 = s.t900size;
            if (s.t200) multi.set ('thu:' + pic.t200, pic.id);
            if (s.t900) multi.set ('thu:' + pic.t900, pic.id);

            multi.hset ('hash:'     + rq.user.username, pic.hash,         pic.id);
            multi.hset ('hashorig:' + rq.user.username, pic.originalHash, pic.id);
            multi.srem ('hashdel:'     + rq.user.username, pic.hash);
            multi.srem ('hashdelorig:' + rq.user.username, pic.originalHash);

            if (rq.data.fields.providerData) {
               var providerKey = {google: 'g', dropbox: 'd'} [rq.data.fields.providerData.provider];
               var providerHash = H.hash (rq.data.fields.providerData.id + ':' + rq.data.fields.providerData.modifiedTime);
               multi.sadd ('hash:'    + rq.user.username + ':' + providerKey, providerHash);
               multi.srem ('hashdel:' + rq.user.username + ':' + providerKey, providerHash);
               pic.providerHash = providerKey + ':' + providerHash;
            }
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
            H.log (s, rq.user.username, {ev: 'upload', type: 'ok', id: rq.data.fields.id, provider: (rq.data.fields.providerData || {}).provider, fileId: pic.id, tags: tags.length ? tags : undefined, deg: pic.deg});
         },
         [perfTrack, 'db'],
         function (s) {
            H.stat.w (s, [
               ['stock', 'byfs',                     pic.byfs + (pic.by200 || 0) + (pic.by900 || 0)],
               ['stock', 'byfs-' + rq.user.username, pic.byfs + (pic.by200 || 0) + (pic.by900 || 0)],
               ['stock', pic.vid ? 'vids' : 'pics', 1],
               ['stock', 'format-' + pic.format, 1],
               pic.by200 ? ['stock', 't200', 1] : [],
               pic.by900 ? ['stock', 't900', 1] : [],
            ].concat (dale.fil (perf, undefined, function (item, k) {
               if (k > 0) return ['flow', 'ms-upload-' + item [0], item [1] - perf [k - 1] [1]];
            })));
         },
         function (s) {
            reply (rs, 200, {id: pic.id, deg: pic.deg});
         }
      ], function (s, error) {
         H.log (s, rq.user.username, {ev: 'upload', type: 'error', id: rq.data.fields.id, provider: (rq.data.fields.providerData || {}).provider, filename: name, error: error});
         reply (rs, 500, {error: error});
      });
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
         [H.log, rq.user.username, {ev: 'delete', ids: b.ids}],
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
         [H.log, rq.user.username, {ev: 'rotate', ids: b.ids, deg: b.deg}],
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
      if (! H.isUserTag (b.tag)) return reply (rs, 400, {error: 'tag'});

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
         [H.log, rq.user.username, {ev: 'tag', type: b.del ? 'untag' : 'tag', ids: b.ids, tag: b.tag}],
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
         ['keys of body', dale.keys (b), ['tags', 'mindate', 'maxdate', 'sort', 'from', 'to', 'recentlyTagged', 'idsOnly'], 'eachOf', teishi.test.equal],
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
         ['body.idsOnly', b.idsOnly, ['undefined', 'boolean'], 'oneOf']
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

            s.pics = dale.fil (s.last.slice (0, s.pics.length).concat (recentlyTagged), null, function (pic) {return pic});

            if (b.idsOnly) return reply (rs, 200, dale.go (s.pics, function (pic) {return pic.id}));

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
            multi.get ('geo:' + rq.user.username);
            mexec (s, multi);
         },
         function (s) {
            // If geotagging is ongoing, refreshQuery will be already set to true so there's no need to query uploads
            if (teishi.last (s.last)) {
               s.refreshQuery = true;
               return s.next (s.last);
            }
            var tags = s.last;
            a.seq (s, [
               // We assume that any ongoing uploads must be found in the first 20
               [H.getUploads, rq.user.username, {}, 20],
               function (s) {
                  s.refreshQuery = dale.stop (s.last, true, function (v) {
                     return v.status === 'uploading';
                  });
                  s.next (tags);
               }
            ]);
         },
         function (s) {
            s.output.tags = teishi.last (s.last, 2).sort ();
            dale.go (s.output.pics, function (pic, k) {
               var vid = undefined;
               if (pic.vid) {
                  if (pic.vid.match ('pending'))    vid = 'pending';
                  else if (pic.vid.match ('error')) vid = 'error';
                  else                              vid = true;
               }
               s.output.pics [k] = {id: pic.id, t200: ! ENV ? pic.t200 : undefined, t900: ! ENV ? pic.t900 : undefined, owner: pic.owner, name: pic.name, tags: s.last [k].sort (), date: parseInt (pic.date), dateup: parseInt (pic.dateup), dimh: parseInt (pic.dimh), dimw: parseInt (pic.dimw), deg: parseInt (pic.deg) || undefined, vid: vid, loc: pic.loc ? teishi.parse (pic.loc) : undefined};
            });
            if (s.refreshQuery) s.output.refreshQuery = true;
            reply (rs, 200, s.output);
         },
      ]);
   }],

   // *** SHARING ***

   ['post', 'share', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tag', 'whom', 'del'], 'eachOf', teishi.test.equal],
         ['body.tag',  b.tag, 'string'],
         ['body.whom', b.whom, 'string'],
         ['body.del', b.del, ['boolean', 'undefined'], 'oneOf']
      ])) return;

      b.tag = H.trim (b.tag);
      if (['all', 'untagged'].indexOf (b.tag) !== -1) return reply (rs, 400, {error: 'tag'});
      if (H.isYear (b.tag) || H.isGeo (b.tag))        return reply (rs, 400, {error: 'tag'});
      if (b.whom === rq.user.username)                return reply (rs, 400, {error: 'self'});

      astop (rs, [
         [a.cond, [Redis, 'exists', 'users:' + b.whom], {'0': [reply, rs, 404]}],
         function (s) {
            var multi = redis.multi ();

            multi [b.del ? 'srem' : 'sadd'] ('sho:' + rq.user.username, b.whom           + ':' + b.tag);
            multi [b.del ? 'srem' : 'sadd'] ('shm:' + b.whom,           rq.user.username + ':' + b.tag);
            mexec (s, multi);
         },
         [H.log, rq.user.username, {ev: 'share', type: b.del ? 'unshare' : 'share', tag: b.tag, whom: b.whom}],
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

      redis.get ('download:' + rq.data.params [0].replace ('.zip', ''), function (error, download) {
         if (error) return reply (rs, 500, {error: error});
         if (! download) return reply (rs, 404);
         download = JSON.parse (download);

         if (download.username !== rq.user.username) return reply (rs, 403);

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
            [a.fork, download.pics, function (pic) {
               return [a.make (fs.stat), Path.join (CONFIG.basepath, H.hash (pic.owner), pic.id)];
            }, {max: os.cpus ().length}],
            function (s) {
               if (s.error) return reply (rs, 500, {error: error});
               dale.go (download.pics, function (pic, k) {
                  var stat = s.last [k];
                  stat.mtime = new Date (pic.mtime - new Date ().getTimezoneOffset () * 60 * 1000);
                  // https://www.archiverjs.com/docs/archiver#entry-data
                  archive.append (fs.createReadStream (Path.join (CONFIG.basepath, H.hash (pic.owner), pic.id)), {name: unrepeatName (pic.name), stats: stat});
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
               return {owner: pic.owner, id: pic.id, name: pic.name, mtime: JSON.parse (pic.dates) ['upload:date']};
            })}), function (error) {
               if (error) return reply (rs, 500, {error: error});
               reply (rs, 200, {id: downloadId + '.zip'});
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
            if (SECRET.admins.indexOf (rq.user.email) !== -1) limit = 1000 * 1000 * 1000 * 1000;

            reply (rs, 200, {
               username: rq.user.username,
               email:    rq.user.email,
               type:     rq.user.type === 'tier1' ? 'free' : 'paid',
               created:  parseInt (rq.user.created),
               usage:    {
                  limit:  limit,
                  fsused: parseInt (s.last [1]) || 0,
                  s3used: parseInt (s.last [2]) || 0,
               },
               geo:           rq.user.geo ? true : undefined,
               geoInProgress: s.last [3]  ? true : undefined,
               suggestGeotagging: rq.user.suggestGeotagging ? true : undefined,
               suggestSelection:  rq.user.suggestSelection  ? true : undefined,
               // We only return logs for testing purposes when running the app locally
               logs:          ENV ? undefined : dale.go (s.last [0], JSON.parse)
            });
         }
      ]);
   }],

   ['get', 'uploads', function (rq, rs) {
      astop (rs, [
         [H.getUploads, rq.user.username, {provider: null}, 20],
         function (s) {
            reply (rs, 200, s.last);
         }
      ]);
   }],

   ['get', 'imports/:provider', function (rq, rs) {
      if (['google', 'dropbox'].indexOf (rq.data.params.provider) === -1) return reply (rs, 400);
      astop (rs, [
         [H.getImports, rq, rs, rq.data.params.provider, 20],
         function (s) {
            reply (rs, 200, s.last);
         }
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

      if (b.operation === 'geotagging' && ! rq.user [suggest]) return reply (rs, 200);

      return astop (rs, [
         [Redis, 'hdel', 'users:' + rq.user.username, suggest],
         [H.log, rq.user.username, {ev: 'dismiss', type: b.operation}],
         [reply, rs, 200]
      ]);
   }],

   // *** ENABLE/DISABLE GEOTAGGING ***

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
            [H.log, rq.user.username, {ev: 'geotagging', type: b.operation}],
            [reply, rs, 200]
         ] : [
            [Redis, 'set', 'geo:' + rq.user.username, Date.now ()],
            [Redis, 'hset', 'users:' + rq.user.username, 'geo', 1],
            [H.log, rq.user.username, {ev: 'geotagging', type: b.operation}],
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
                     [H.getMetadata, path, vid],
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

   // *** IMPORT ROUTES ***

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
            H.log (a.creat (), rq.user.username, {ev: 'import', type: 'grant', provider: 'google'});
         });
      }});
   }],

   ['post', 'import/list/google', function (rq, rs) {

      a.stop ([
         [a.stop, [H.getGoogleToken, rq.user.username], function (s, error) {
            reply (rs, 403, {code: error.code || 500, error: error.body || error});
         }],
         // If there's already an import process ongoing for this provider, we return a 409.
         [a.cond, [Redis, 'exists', 'imp:g:' + rq.user.username], {'1': [reply, rs, 409]}],
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

            var PAGESIZE = process.argv [2] === 'dev' ? 10 : 1000, PAGES = process.argv [2] === 'dev' ? 100 : 10000;

            var files = [], unsupported = [], page = 1, folders = {}, roots = {}, children = {}, parentsToRetrieve = [];
            var limits = [], setLimit = function (n) {
               var d = Date.now ();
               limits.unshift ([d - d % 1000, n || 1]);
            }

            var getFilePage = function (s, nextPageToken) {
               a.seq (s, [
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
                        'q=' + 'mimeType%20contains%20%27image%2F%27%20or%20mimeType%20contains%20%27video%2F%27',
                        'supportsAllDrives=true',
                        'spaces=drive,photos',
                     ].join ('&') + (! nextPageToken ? '' : '&pageToken=' + nextPageToken);

                     page++;
                     setLimit ();

                     hitit.one ({}, {timeout: 30, https: true, method: 'get', host: 'www.googleapis.com', path: path, headers: {authorization: 'Bearer ' + s.token, 'content-type': 'application/x-www-form-urlencoded'}, body: '', code: '*', apres: function (S, RQ, RS) {

                        if (RS.code !== 200) return s.next (null, RS.body);

                        a.seq (s, [
                           [Redis, 'exists', 'imp:g:' + rq.user.username],
                           function (s) {
                              // If key was deleted, process was cancelled. The process stops.
                              if (! s.last) return;
                              Redis (s, 'hincrby', 'imp:g:' + rq.user.username, 'fileCount', RS.body.files.length);
                           },
                           [H.log, rq.user.username, {ev: 'import', type: 'filePage', provider: 'google', id: s.id, nFiles: RS.body.files.length}],
                           function (s) {
                              var allowedFiles = dale.fil (RS.body.files, undefined, function (file) {
                                 file.size = parseInt (file.size);
                                 // Ignore trashed files!
                                 if (file.trashed) return;
                                 if (CONFIG.allowedFormats.indexOf (file.mimeType) === -1) {
                                    unsupported.push (file.originalFilename);
                                    return;
                                 }
                                 return file;
                              });

                              dale.go (allowedFiles, function (v) {
                                 dale.go (v.parents, function (v2) {
                                    if (! folders [v2] && parentsToRetrieve.indexOf (v2) === -1) parentsToRetrieve.push (v2);
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
                  function (s) {
                     // QUERY LIMITS: daily: 1000m; per 100 seconds: 10k; per 100 seconds per user: 1k.
                     // don't extrapolate over user limit: 10 requests/second.
                     // We lower it to 4 requests every seconds to avoid hitting rate limits.
                     // Dashboard: https://console.developers.google.com/apis/dashboard
                     var requestLimit = 4, timeWindow = 1;

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
                        if (RS.code !== 200) return s.next (null, RS.body);

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

                        a.seq (s, [
                           [Redis, 'exists', 'imp:g:' + rq.user.username],
                           function (s) {
                              // If key was deleted, process was cancelled. The process stops.
                              if (! s.last) return;
                              Redis (s, 'hincrby', 'imp:g:' + rq.user.username, 'folderCount', batch.length);
                           },
                           [H.log, rq.user.username, {ev: 'import', type: 'folderPage', provider: 'google', id: s.id, nFolders: batch.length}],
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
                  // Count how many pics/vids per folder there are.
                  var porotoSum = function (id) {
                     if (! folders [id].count) folders [id].count = 0;
                     folders [id].count++;
                     dale.go (folders [id].parents, porotoSum);
                  }

                  // Convert files into an object with their ids as keys
                  files = dale.obj (files, function (file) {
                     // Increment count for all parent folders
                     dale.go (file.parents, porotoSum);
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
                     [Redis, 'exists', 'imp:g:' + rq.user.username],
                     function (s) {
                        // If key was deleted, process was cancelled. The process stops.
                        if (! s.last) return;
                        Redis (s, 'hmset', 'imp:g:' + rq.user.username, {status: 'ready', unsupported: JSON.stringify (unsupported), data: JSON.stringify (data)});
                     },
                     [H.log, rq.user.username, {ev: 'import', type: 'listEnd', provider: 'google', id: s.id, data: data}],
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
            [H.log, rq.user.username, {ev: 'import', type: 'listError', provider: 'google', id: s.id, error: error}],
            [notify, {priority: 'critical', type: 'import list error', provider: 'google', user: rq.user.username, error: error}],
            function (s) {
               var email = CONFIG.etemplates.importError ('Google', rq.user.username);
               sendmail (s, {
                  to1:     rq.user.username,
                  to2:     rq.user.email,
                  subject: email.subject,
                  message: email.message
               });
            },
            [Redis, 'exists', 'imp:g:' + rq.user.username],
            function (s) {
               // If key was deleted, process was cancelled. The process stops.
               if (! s.last) return;
               Redis (s, 'hmset', 'imp:g:' + rq.user.username, {status: 'error', error: teishi.complex (error) ? JSON.stringify (error) : error});
            }
         ], function (s, error) {
            notify (a.creat (), {priority: 'critical', type: 'import list error reporting error', provider: 'google', user: rq.user.username, error: error});
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
            reply (rs, 403, {code: error.code || 500, error: error.body || error});
         }],
         [a.set, 'hashes', [Redis, 'smembers', 'hash:'  + rq.user.username + ':g']],
         [a.set, 'import', [Redis, 'hgetall',  'imp:g:' + rq.user.username]],
         function (s) {
            if (! s.import) return reply (rs, 404);
            if (s.import.status !== 'ready') return reply (rs, 409);

            var data = JSON.parse (s.import.data);

            var hashes = dale.obj (s.hashes, function (hash) {
               return [hash, true];
            });

            // filesToUpload: keys are file ids, values is the file plus a list of folder names to be used as tags (direct parent and parent of parents all the way to the root).
            // alreadyImported is a counter of already imported files. There's no need to store their names, just how many of them there are.
            var filesToUpload = {}, alreadyImported = 0, tooLarge = [], unsupported = JSON.parse (s.import.unsupported);

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
                  // Else, it is a pic/vid.
                  // We check whether we already have the file. If we do, we ignore it and not have into account at all, not even on the total count.
                  var file = data.files [childId];
                  if (hashes [H.hash (childId + ':' + file.modifiedTime)]) return alreadyImported++;
                  if (file.size > CONFIG.maxFileSize)                      return tooLarge.push (file.originalFilename);
                  file.tags = [];
                  filesToUpload [childId] = file;
                  recurseUp (childId, folderId);
               });
            }

            dale.go (s.import.selection ? JSON.parse (s.import.selection) : [], recurseDown);

            // If there are no files to import, we delete the import key and set the user logs.
            if (dale.keys (filesToUpload).length === 0) return a.seq (s, [
               [Redis, 'del', 'imp:g:' + rq.user.username],
               [H.log, rq.user.username, {ev: 'upload', type: 'start',    id: parseInt (s.import.id), provider: 'google', total: 0, tooLarge: tooLarge.length ? tooLarge : undefined, unsupported: unsupported.length ? unsupported : undefined, alreadyImported: alreadyImported}],
               [H.log, rq.user.username, {ev: 'upload', type: 'complete', id: parseInt (s.import.id), provider: 'google'}],
               [reply, rs, 200]
            ]);

            s.filesToUpload = filesToUpload;
            s.ids = dale.keys (s.filesToUpload);

            // If we're here, there are files to be imported.
            H.log (s, rq.user.username, {ev: 'upload', type: 'start', id: parseInt (s.import.id), provider: 'google', total: s.ids.length, tooLarge: tooLarge.length ? tooLarge : undefined, unsupported: unsupported.length ? unsupported : undefined, alreadyImported: alreadyImported});
         },
         [Redis, 'hset', 'imp:g:' + rq.user.username, 'status', 'uploading'],
         [a.set, 'session', [a.make (require ('bcryptjs').genSalt), 20]],
         [a.set, 'csrf',    [a.make (require ('bcryptjs').genSalt), 20]],
         function (s) {
            // We use s.Cookie instead of s.cookie to avoid it being overwritten by the call to the notify function
            s.Cookie = cicek.cookie.write (CONFIG.cookiename, s.session);
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
               a.seq (s, [
                  [H.getGoogleToken, rq.user.username],
                  // If the import was cancelled, we interrupt the async chain to stop the process.
                  [a.cond, [Redis, 'exists', 'imp:g:' + rq.user.username], {'0': function () {}}],
                  function (s) {
                     // If we reached the end of the list, we're done.
                     if (index === s.ids.length) return a.seq (s, [
                        [Redis, 'del', 'imp:g:' + rq.user.username],
                        [H.log, rq.user.username, {ev: 'upload', type: 'complete', id: parseInt (s.import.id), provider: 'google'}],
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

                     var file = s.filesToUpload [s.ids [index]], Error, providerError = function (code, error) {
                        if (Error) return;
                        Error = true;
                        a.seq (s, [
                           [H.log, rq.user.username, {ev: 'upload', type: 'providerError', id: parseInt (s.import.id), provider: 'google', error: {code: code, error: error}}],
                           [importFile, index + 1]
                        ]);
                     }

                     // We stream the response body directly into a file.
                     // https://developers.google.com/drive/api/v3/reference/files/export
                     https.request ({host: 'www.googleapis.com', path: '/drive/v3/files/' + file.id + '?alt=media', headers: {authorization: 'Bearer ' + s.token, 'content-type': 'application/x-www-form-urlencoded'}}, function (response) {
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
                           s.next (null, error);
                        });
                        response.pipe (wstream);
                        wstream.on ('finish', function () {
                           if (Error) return;
                           // UPLOAD THE FILE
                           hitit.one ({}, {host: 'localhost', port: CONFIG.port, method: 'post', path: 'upload', headers: {cookie: s.Cookie}, body: {multipart: [
                              // This `file` field is a dummy one to pass validation, but the actual file informastion goes inside providerData
                              {type: 'file',  name: 'pic', value: 'foobar', filename: 'foobar.' + Path.extname (file.name)},
                              {type: 'field', name: 'id', value: parseInt (s.import.id)},
                              // Use oldest date, whether createdTime or updatedTime
                              {type: 'field', name: 'lastModified', value: Math.min (new Date (file.createdTime).getTime (), new Date (file.modifiedTime).getTime ())},
                              {type: 'field', name: 'tags', value: JSON.stringify (file.tags.concat ('Google Drive'))},
                              {type: 'field', name: 'providerData', value: JSON.stringify ({
                                 provider:     'google',
                                 id:           file.id,
                                 name:         file.originalFilename,
                                 modifiedTime: file.modifiedTime,
                                 path:         tempPath
                              })},
                              {type: 'field', name: 'csrf', value: s.csrf}
                           ]}, code: '*', apres: function (S, RQ, RS, next) {

                              // UNEXPECTED ERROR
                              if (RS.code !== 200 && RS.code !== 400 && RS.code !== 409) return s.next (null, {error: RS.body, code: RS.code, file: file});

                              // NO MORE SPACE
                              if (RS.code === 409 && eq (RS.body, {error: 'capacity'})) return s.next (null, {error: 'No more space in your ac;pic account.', code: RS.code});

                              // INVALID FILE (CANNOT BE TOO LARGE BECAUSE WE PREFILTER THEM ABOVE)
                              if (RS.code === 400) return a.seq (s, [
                                 // Notify and keep on going
                                 [notify, {priority: 'important', type: 'import upload invalid file error', error: RS.body, code: RS.code, file: file, provider: 'google', user: rq.user.username}],
                                 [importFile, index + 1]
                              ]);

                              // SUCCESSFUL UPLOAD OR REPEATED IMAGE, KEEP ON GOING
                              importFile (s, index + 1);
                           }});
                        });
                     }).on ('error', function (error) {
                        s.next (null, error);
                     }).end ();
                  }
               ]);
            }
            importFile (s, 0);
         }
      ], function (s, error) {
         // If error happens before replying to the request, send it directly to the response.
         if (! rs.writableEnded) reply (rs, 500, {error: error});
         a.seq (s, [
            // 409 errors for capacity limit reached are considered critical now in the beginning phases. This behavior will be changed as that becomes a more normal occurrence.
            [notify, {priority: 'critical', type: 'import upload error', error: error, user: rq.user.username, provider: 'google', id: s.id}],
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
               redis.hset ('imp:g:' + rq.user.username, 'error', JSON.stringify (error));
            }}]
         ]);
      });
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

   // *** ADMIN: DEBUG PIC ***

   ['get', 'admin/debug/:id', function (rq, rs) {
      astop (rs, [
         [Redis, 'hgetall', 'pic:' + rq.data.params.id],
         function (s) {
            if (! s.last) return reply (rs, 200, {});
            s.data = {db: s.last};
            var path = Path.join (CONFIG.basepath, H.hash (s.last.owner), s.last.id);
            H.getMetadata (s, path, s.last.vid);
         },
         function (s) {
            s.data.metadata = dale.go ((s.last.stdout + s.last.stderr).split ('\n'), function (v) {
               return v.replace (/\s+/g, ' ');
            });
            reply (rs, 200, s.data);
         }
      ]);
   }],

   // *** ADMIN: USER LOGS ***

   ['get', 'admin/logs', function (rq, rs) {

      astop (rs, [
         [Redis, 'hgetall', 'emails'],
         function (s) {
            var multi = redis.multi ();
            s.users = [];
            dale.go (s.last, function (username) {
               s.users.push (username);
               multi.lrange ('ulog:' + username, 0, -1);
            });
            mexec (s, multi);
         },
         function (s) {
            var output = [];
            dale.go (s.last, function (logs, k) {
               dale.go (logs, function (log) {
                  log = JSON.parse (log);
                  log.username = s.users [k];
                  if (ENV === 'prod') {
                     if (log.tag) delete log.tag;
                     if (log.tags) log.tags = log.tags.length;
                  }
                  output.push (log);
               });
            });
            reply (rs, 200, output);
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
      if (report ()) {
         notify (a.creat (), {priority: rs.log.code >= 500 ? 'critical' : 'important', type: 'response error', code: rs.log.code, method: rs.log.method, url: rs.log.url, ip: rs.log.origin, userAgent: rs.log.requestHeaders ['user-agent'], headers: rs.log.requestHeaders, body: rs.log.requestBody, data: rs.log.data, user: rs.request.user ? rs.request.user.username : null, rbody: teishi.parse (rs.log.responseBody) || rs.log.responseBody});
      }
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

var server = cicek.listen ({port: CONFIG.port}, routes);

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
         if (pic.vid && pic.vid !== '1') s.dbfiles [prefix + pic.vid] = 'thumb';
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

      // We only show the first 100 items to avoid making the email too big.
      if (s.s3extra.length)   notify (a.creat (), {priority: 'critical', type: 'extraneous files in S3 error', n: s.s3extra.length,   files: s.s3extra.slice (0, 100)});
      if (s.fsextra.length)   notify (a.creat (), {priority: 'critical', type: 'extraneous files in FS error', n: s.fsextra.length,   files: s.fsextra.slice (0, 100)});
      if (s.s3missing.length) notify (a.creat (), {priority: 'critical', type: 'missing files in S3 error',    n: s.s3missing.length, files: s.s3missing.slice (0, 100)});
      if (s.fsmissing.length) notify (a.creat (), {priority: 'critical', type: 'missing files in FS error',    n: s.fsmissing.length, files: s.fsmissing.slice (0, 100)});

      if (process.argv [3] !== 'makeConsistent') return notify (a.creat (), {priority: 'important', type: 'File consistency check done.'});
      // We delete the list of pics from the stack so that it won't be copied by a.fork below in case there are extraneous FS files to delete.
      s.last = undefined;
      if (s.s3extra.length || s.fsextra.length || s.s3missing.length || s.fsmissing.length) s.next ();
   },
   // Extraneous S3 files: delete. Don't update the statistics.
   // s3:files entries should be deleted manually if needed.
   function (s) {
      H.s3del (s, s.s3extra);
   },
   function (s) {
      // Extraneous FS files: delete. Don't update the statistics.
      a.fork (s, s.fsextra, function (v) {
         return [H.unlink, Path.join (CONFIG.basepath, v)];
      }, {max: os.cpus ().length});
   },
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
      if (! s ['s3:files']) s ['s3:files'] = {};
      var extraneousS3 = teishi.copy (s ['s3:files']), missingS3 = {}, invalidS3 = {};
      dale.go (s.last, function (pic) {
         if (! actual [pic.owner]) actual [pic.owner] = {s3: 0, fs: 0};
         actual [pic.owner].fs += parseInt (pic.byfs) + parseInt (pic.by200 || 0) + parseInt (pic.by900 || 0) + parseInt (pic.bymp4 || 0);
         actual.TOTAL.fs       += parseInt (pic.byfs) + parseInt (pic.by200 || 0) + parseInt (pic.by900 || 0) + parseInt (pic.bymp4 || 0);
         var key = H.hash (pic.owner) + '/' + pic.id;
         var s3entry = s ['s3:files'] [key];
         delete extraneousS3 [key];
         if (type (parseInt (s3entry)) === 'integer') {
            actual [pic.owner].s3 += parseInt (s ['s3:files'] [H.hash (pic.owner) + '/' + pic.id]);
            actual.TOTAL.s3       += parseInt (s ['s3:files'] [H.hash (pic.owner) + '/' + pic.id]);
         }
         else if (s3entry === undefined) missingS3 = s3entry;
         else invalidS3 [key] = s3entry;
      });
      var mismatch = [];
      dale.go (actual, function (v, k) {
         if (k === 'TOTAL') var stats = {fs: s.stats ['stat:s:byfs']      || 0, s3: s.stats ['stat:s:bys3']      || 0};
         else               var stats = {fs: s.stats ['stat:s:byfs-' + k] || 0, s3: s.stats ['stat:s:bys3-' + k] || 0};
         if (v.fs !== stats.fs) mismatch.push (['byfs' + (k === 'TOTAL' ? '' : '-' + k), v.fs - stats.fs]);
         if (v.s3 !== stats.s3) mismatch.push (['bys3' + (k === 'TOTAL' ? '' : '-' + k), v.s3 - stats.s3]);
      });

      if (dale.keys (missingS3).length)    notify (a.creat (), {priority: 'critical', type: 'Missing s3:files entries',    missingS3: missingS3});
      if (dale.keys (extraneousS3).length) notify (a.creat (), {priority: 'critical', type: 'Extraneous s3:files entries', extraneousS3: extraneousS3});
      if (dale.keys (invalidS3).length)    notify (a.creat (), {priority: 'critical', type: 'Invalid s3:files entries',    invalidS3: invalidS3});

      if (mismatch.length !== 0)           notify (a.creat (), {priority: 'critical', type: 'Stored sizes consistency mismatch', mismatch: mismatch});

      if (process.argv [3] !== 'makeConsistent') return notify (a.creat (), {priority: 'important', type: 'Stored sizes consistency check done.'});

      a.seq (s, [
         [H.stat.w, dale.go (mismatch, function (v) {
            return ['stock', v [0], v [1]];
         })],
         function (s) {
            var multi = redis.multi ();
            dale.go (extraneousS3, function (v, k) {multi.hdel ('s3:files', k)});
            mexec (s, multi);
         }
      ]);
   },
   [notify, {priority: 'critical', type: 'Stored sizes consistency check success.'}]
], function (s, error) {
   notify (s, {priority: 'critical', type: 'Stored sizes consistency check error.', error: error});
});

// *** CHECK S3 QUEUE ON STARTUP ***

if (cicek.isMaster) a.stop ([
   [a.set, 'proc', [Redis, 'get', 's3:proc']],
   [Redis, 'llen', 's3:queue'],
   function (s) {
      if (s.proc && s.proc !== '0') notify (a.creat (), {priority: 'critical', type: 'Non-empty S3 process counter on startup.', n: s.proc});
      if (s.last) notify (s, {priority: 'critical', type: 'Non-empty S3 queue on startup.', n: s.last});
   }
], function (error) {
   notify (s, {priority: 'critical', type: 'Non-empty S3 queue DB error.', error: error});
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
