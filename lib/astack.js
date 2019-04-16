/*
astack - v4.0.0

Written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.

Please refer to readme.md to read the annotated source.
*/

(function () {

   // *** SETUP ***

   var isNode = typeof exports === 'object';

   if (isNode) var a = exports;
   else        var a = window.a = {};

   // *** HELPER FUNCTIONS ***

   var type = a.type = function (value, objectType) {
      var type = typeof value;
      if (type !== 'object' && type !== 'number') return type;
      if (value instanceof Array) return 'array';
      if (type === 'number') {
         if      (isNaN (value))      return 'nan';
         else if (! isFinite (value)) return 'infinity';
         else if (value % 1 === 0)    return 'integer';
         else                         return 'float';
      }
      type = Object.prototype.toString.call (value).replace ('[object ', '').replace (']', '').toLowerCase ();
      if (type === 'array' || type === 'date' || type === 'null') return type;
      if (type === 'regexp') return 'regex';
      if (objectType) return type;
      return 'object';
   }

   var copy = a.copy = function (input, seen) {
      var typeInput = type (input);
      if (typeInput !== 'object' && typeInput !== 'array') return input;

      var output = typeInput === 'array' || type (input, true) === 'arguments' ? [] : {};

      var Seen = [], count = 0;
      if (seen !== undefined) {
         for (var i in seen) Seen [i] = seen [i];
      }

      for (var i in input) {
         var circular = false;
         typeInput = type (input [i]);
         if (typeInput === 'array' || typeInput === 'object') {
            for (var j in Seen) {
               if (Seen [j] === input [i]) {
                  circular = true;
                  break;
               }
            }
            if (! circular) Seen [count++] = input [i];
         }
         output [i] = circular ? input [i] : copy (input [i], Seen);
      }

      return output;
   }

   // *** BASE FUNCTIONS ***

   a.reserved = ['next', 'path', 'vars'];

   a.creat = function (s) {
      s = s || {};
      s.path = [];
      s.vars = {};
      s.next = function (result, error) {
         if (arguments.length === 2) s.error = arguments [1];
         if (arguments.length === 1) s.last  = arguments [0];
         a.seq (s);
      }
      return s;
   }

   a.log = function (s, label, stack) {
      if (s.log) return s.log.apply (null, [].slice.call (arguments));

      if (! stack) console.log (label);
      else {
         var S = {};
         for (var key in s) {
            if (key !== 'next') S [key] = s [key];
         }
         console.log (label, S);
      }
      s.next ();
   }

   a.vars = function (s, vars, clean) {
      for (var i in vars) {
         if (! clean) {
            if (s.vars [i] === undefined) s.vars [i]     = [];
            if (s.vars [i].length > 0)    s.vars [i] [0] = s [i];
            s.vars [i].unshift (vars [i]);
            s [i] = vars [i];
         }
         else {
            if (! s.vars [i]) throw new Error ('Variable ' + i + ' is being removed but it has already been removed.');
            if (s.vars [i].length === 1) {
               delete s.vars [i];
               delete s [i];
            }
            else {
               s.vars [i].shift ();
               s [i] = s.vars [i] [0];
            }
         }
      }
      s.next ();
   }

   a.parse = function (path) {

      var output = [], index = 0, error;

      (function inner (path) {
         if (error) return;
         if (type (path) === 'function') return output [index++] = [path];
         if (type (path) !== 'array')    return error = 'a.parse error: the provided path is invalid. It has type ' + type (path);
         if (path.length === 0)          return;
         var typeFirst = type (path [0]);
         if (typeFirst === 'function')   return output [index++] = path;

         if (typeFirst === 'array') {
            for (var i in path) inner (path [i]);
            return;
         }

         if (typeFirst !== 'string' && typeFirst !== 'object') return error = 'a.parse error: the first element of the path is invalid. It has type ' + type (path [0]);

         var arg = 0, vars, tag;

         if (type (path [arg]) === 'string') output [index++] = [a.log, path [arg++]];

         if (type (path [arg]) === 'object') {
            for (var i in path [arg]) {
               if (a.reserved.indexOf (i) !== -1) return error = 'a.parse error: vars object contains forbidden key: ' + i;
            }
            vars = path [arg++];
            output [index++] = [a.vars, vars];
         }

         if (path.length === arg)                             return error = 'a.parse error: after the tag and/or variables, you must pass further elements (or an empty array).';
         var typeNext = type (path [arg]);
         if (typeNext !== 'function' && typeNext !== 'array') return error = 'a.parse error: if you pass a tag and/or variables, the next element you pass must be either an array or a function.';
         if (typeNext === 'function') output [index++] = path.slice (arg);
         if (typeNext === 'array') inner (path.slice (arg));
         if (vars) output [index++] = [a.vars, vars, true];
      }) (path);

      return error || output;
   }

   // *** SEQUENTIAL EXECUTION ***

   a.seq = function () {

      if (type (arguments [0]) === 'object') var s = arguments [0], path = arguments [1];
      else                                   var s = a.creat (),    path = arguments [0];

      if (type (s.next) !== 'function' || type (a.parse (s.path)) !== 'array' || type (s.vars) !== 'object') throw new Error ('Invalid stack: ' + JSON.stringify (s));

      if (s.irq !== undefined) {
         if (type (s.irq) !== 'function') throw new Error ('a.seq error: s.irq must be a function but instead is: ', JSON.stringify (s.irq), 'with type', type (s.irq));
         // s.irq is executed before step execution. If it returns true, we keep on going, otherwise we stop and let s.irq handle the continuation.
         if (s.irq (s) !== true) return;
      }

      if (path !== undefined) {
         // If we're here, path was received
         path = a.parse (path);
         if (type (path) !== 'array') throw new Error ('a.seq error: invalid path: ' + JSON.stringify (path));
         // We place the parsed path onto s.path
         s.path = path.concat (s.path);
      }

      // Path is empty, nothing to do.
      if (s.path.length === 0) return;

      var step = s.path.shift ();
      step.shift ().apply (undefined, [s].concat (step));
   }

   // *** CONDITIONAL EXECUTION ***

   a.cond = function () {
      if (type (arguments [0]) === 'object') var s = arguments [0], path = arguments [1], map = arguments [2];
      else                                   var s = a.creat (),    path = arguments [0], map = arguments [1];

      if (type (s.next) !== 'function' || type (a.parse (s.path)) !== 'array' || type (s.vars) !== 'object') throw new Error ('Invalid stack passed to a.cond: ' + JSON.stringify (s));

      if (type (map) !== 'object') throw new Error ('a.cond error: map has to be an object but instead is: ' + JSON.stringify (map) + ' with type ' + type (map));

      path = a.parse (path);
      if (type (path) !== 'array') throw new Error ('a.cond error: invalid path: ' + JSON.stringify (path));

      a.seq (s, [
         path,
         function (s) {
            if      (Object.keys (map).indexOf (s.last + '') !== -1) a.seq (s, map [s.last]);
            else if (Object.keys (map).indexOf ('else')      !== -1) a.seq (s, map.else);
            else                                                     s.next ();
         }
      ]);
   }

   // *** INTERRUPTED EXECUTION ***

   a.stop = function () {
      if (type (arguments [0]) === 'object') var s = arguments [0], path = arguments [1], then = arguments [2];
      else                                   var s = a.creat (),    path = arguments [0], then = arguments [1];

      if (type (s.next) !== 'function' || type (a.parse (s.path)) !== 'array' || type (s.vars) !== 'object') throw new Error ('Invalid stack passed to a.stop: ' + JSON.stringify (s));

      path = a.parse (path);
      if (type (path) !== 'array') throw new Error ('a.cond error: invalid path: ' + JSON.stringify (path));

      if (then !== undefined && type (then) !== 'function') throw new Error ('a.stop error: invalid then: ' + JSON.stringify (then) + ' with type ' + type (then));

      var mark = function (s) {
         s.next ();
      };

      a.seq (s, [{
         error: undefined,
         irq: function (s) {
            var test = s.test || function (s) {
               return s.error === undefined;
            }
            if (test (s) === true) return true;

            var error = s.error;
            var i = 0, path = s.path, seenMark;
            s.path = [], s.irq = undefined;
            while (true) {
               var step = path.splice (i, 1) [0];
               if (! step) break;
               if (step [0] === a.vars) a.vars (s, step [1], step [2]);
               if (seenMark) break;
               if (step [0] === mark) seenMark = true;
            }
            s.path = path;
            if (then) return a.seq (s, [then, error]);
            a.seq (s, function (s) {
               s.error = error;
               s.next ();
            });
      }}, [
         path,
         mark
      ]]);
   }

   // *** PARALLEL EXECUTION ***

   a.fork = function () {

      var arg     = 0;
      var s       = type (arguments [arg]) === 'object'   ? arguments [arg++] : a.creat ();
      var data    = arguments [arg++] === true            ? s.last            : arguments [arg - 1];
      var fun     = arguments [arg++];
      var opts    = arguments [arg];

      if (type (s.next) !== 'function' || type (a.parse (s.path)) !== 'array' || type (s.vars) !== 'object') throw new Error ('Invalid stack passed to a.stop: ' + JSON.stringify (s));

      var dataType = type (data);

      if (dataType !== 'array' && dataType !== 'object')
         throw new Error ('a.fork error: data must be an array or an object but instead is: ' + dataType + ' ' + data);

      if (type (fun) !== 'function') throw new Error ('a.fork error: fun must be a function but instead is: ' + fun + ' with type ' + type (fun));

      if (opts !== undefined && type (opts) !== 'object') throw new Error ('a.fork error: if present, opts must be an object but instead is: ' + JSON.stringify (opts));

      if (opts !== undefined && (type (opts.max) !== 'integer' || opts.max <= 0)) throw new Error ('a.fork error: if present, opts.max must be an integer larger than 0.');

      if (dataType === 'object') var keys = Object.keys (data).sort ();

      var counter = 0, active = 0, remaining = dataType === 'array' ? data.length : keys.length;

      if (remaining === 0) return s.next ();

      var output = dataType === 'array' ? [] : {};

      var counter = 0, active = 0, test = true, error;

      var path = s.path, irq = s.irq;
      delete s.path;
      delete s.irq;
      var scopy = copy (s);

      var fire = function () {
         active++;

         var k = dataType === 'array' ? counter++ : keys [counter++];

         a.seq (a.creat (copy (scopy)), [
            [fun (data [k], k)],
            function (stack) {
               if (error) return;
               if (stack.error) {
                  s.path = path;
                  if (irq) s.irq = irq;
                  return s.next (0, stack.error);
               }
               output [k] = stack.last;
               for (var key in stack) {
                  if (['irq', 'vars', 'path', 'next'].indexOf (key) === -1) s [key] = stack [key];
               }
               if (--remaining && (counter < (dataType === 'array' ? data.length : keys.length)) && --active < ((opts || {}).max || Infinity)) return fire ();
               if (remaining === 0) {
                  s.path = path;
                  if (irq) s.irq = irq;
                  s.next (output);
               }

            }
         ]);
      }
      while (remaining && (counter < (dataType === 'array' ? data.length : keys.length)) && (active < ((opts || {}).max || Infinity))) {
         fire ();
      }
   }

   // *** THREE USEFUL FUNCTIONS ***

   a.make = function (fun, This) {
      if (type (fun) !== 'function') throw new Error ('a.make error: fun must be a function but instead is: ' + type (fun) + ' ' + fun);
      return function (s) {
         var args = [].slice.call (arguments, 1);
         fun.apply (This, args.concat (function (error, data) {
            if (error) s.next (0, error);
            else       s.next (data);
         }));
      }
   }

   a.set = function (s, key, path, putlast) {
      if (key !== false && a.reserved.indexOf (key) !== -1) throw new Error ('a.set error: forbidden key: ' + key);
      var last = s.last;
      a.seq (s, [
         type (path) === 'function' ? [path] : path,
         function (s) {
            if (key !== false) s [key] = s.last;
            if (! putlast)     s.last  = last;
            s.next ();
         }
      ]);
   }

   a.get = function (s, fun) {
      var args = [], seen = [];
      for (var k in arguments) {
         if (k >= 2) args.push (arguments [k]);
      }
      var replace = function (v) {
         var t = type (v);
         if (t === 'string') {
            var match = v.match (/@[a-z]+/);
            if (match) {
               if (match [0] === v) return s [match [0].replace ('@', '')];
               else return v.replace (match, s [match [0].replace ('@', '')]);
            }
         }
         if (t === 'array' || t === 'object') {
            if (seen.indexOf (v) !== -1) return v;
            seen.push (v);
            for (var k2 in v) {
               v [k2] = replace (v [k2]);
            }
         }
         return v;
      }

      a.seq (s, [fun].concat (replace (args)));
   }

}) ();
