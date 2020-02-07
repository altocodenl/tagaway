var fs = require ('fs');

var dale   = require ('dale');
var teishi = require ('teishi');
var lith   = require ('lith');
var type = teishi.t, clog = console.log, time = teishi.time, media = lith.css.media, style = lith.style, last = teishi.last;

var css  = require ('css');
var sass = require ('node-sass');

var khit = function (command, cb) {

   var output = {stdout: '', stderr: ''};

   var proc = require ('child_process').spawn (command [0], command.slice (1));

   var wait = 3;

   var done = function () {
      if (--wait > 0) return;
      if (! output.stderr && output.code === 0) cb (null, output);
      else                                      cb (output);
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

var init = false;

var jscss = dale.fil (fs.readFileSync ('client.js', 'utf8').split ('\n'), undefined, function (line) {
   if (line === 'var CSS = {') {
      init = true;
   }
   if (line === 'Views.base = function () {') {
      init = false;
      return;
   }
   if (init) return line;
}).join ('\n').replace (/dale.do/g, 'dale.go');

// This shouldn't be an issue unless client.js has code to attack the server; but I kind of trust the author.
eval (jscss);

jscss = lith.css.g (CSS.litc);

khit (['./node_modules/node-sass/bin/node-sass', 'markup', '-o', 'compiled'], function (error) {
   if (error) return clog ('ERROR', error);
   var sasscss = fs.readFileSync ('compiled/style.css', 'utf8');

   jscss   = css.stringify (css.parse (css.stringify (css.parse (jscss),   {compress: true}))).split ('\n');
   // We omit the first two lines of style.css which have the @import directive.
   sasscss = css.stringify (css.parse (css.stringify (css.parse (sasscss), {compress: true}))).split ('\n').slice (2);
   dale.stop (jscss, false, function (line, k) {
      if (line === sasscss [k]) return;
      clog ('DIFFERENT LINE source.css target.css', k + 1, line, 'vs', sasscss [k]);
      return false;
   });

   // We omit the first two lines of style.css which have the @import directive.
   var stylecss = css.stringify (css.parse (css.stringify (css.parse (fs.readFileSync ('markup/style.css', 'utf8')), {compress: true}))).split ('\n').slice (2);
   dale.stop (stylecss, false, function (line, k) {
      if (line === sasscss [k]) return;
      clog ('DIFFERENT LINE source.css markup/style.css', k + 1, line, 'vs', sasscss [k]);
      return false;
   });

   fs.writeFileSync ('source.css', sasscss.join ('\n'));
   fs.writeFileSync ('target.css', jscss.join ('\n'));
   //fs.writeFileSync ('markup/style.css', sasscss.join ('\n'));
   khit (['rm', '-r', 'compiled'], function () {
      clog ('Done');
   });
});
