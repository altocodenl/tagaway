/*
astack - v4.0.0 candidate - not a stable version.

Written by Federico Pereiro (fpereiro@gmail.com) and released into the public domain.

Please refer to readme.md to read the annotated source.
*/

(function () {

   // *** SETUP ***

   var isNode = typeof exports === 'object';

   if (isNode) var a = exports;
   else        var a = window.a = {};

   DEBUG = false, c = 0;

   var dlog = function () {
      if (DEBUG) console.log.apply (console, [].slice.call (arguments));
   }

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

   // *** BOOTSTRAPPING FUNCTIONS ***

   a.creat = function (s) {
      if (! s) s = {path: [], vars: {}};
      s.do = function () {
         return a.do.apply (undefined, [s].concat ([].slice.call (arguments)));
      }
      return s;
   }

   a.log = function (s, what, stack) {
      if (s.log) return s.log.apply (null, [].slice.call (arguments));

      if (! stack) console.log (what);
      else {
         var S = {};
         for (var key in s) {
            if (key !== 'do') S [key] = s [key];
         }
         console.log (what, S);
      }
      s.do ();
   }

   a.reserved = ['path', 'vars', 'do'];

   a.vars = function (s, vars, clean) {
      for (var i in vars) {
         if (! clean) {
            if (s.vars [i] === undefined) s.vars [i]     = [];
            if (s.vars [i].length > 0)    s.vars [i] [0] = s [i];
            s.vars [i].unshift (vars [i]);
            s [i] = vars [i];
         }
         else {
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
      s.do ();
   }

   a.parse = function (path, returnError) {

      if (type (path) === 'array' && path.length === 0) return returnError ? 'a.parse error: an empty array is considered value, not path.' : false;

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

      return error ? returnError ? error : false : output;
   }

   a.do = function () {

      // XXX should POV be copied?
      if (type (arguments [0]) === 'object') var s = arguments [0], pov = arguments [1], error = arguments [2];
      else                                   var s = a.creat (),    pov = arguments [0], error = arguments [1];

      dlog ('a.do: pov #' + ++c, pov, 'callee', arguments.callee.caller + '');

      if (type (s.do) !== 'function')           throw new Error ('a.do error: s.do must be a function but instead is: ',  type (s.do),  s.do);
      if (s.irq && type (s.irq) !== 'function') throw new Error ('a.do error: s.irq must be a function but instead is: ', type (s.irq), s.irq);

      if (error) {
         dlog ('a.do: error placing #' + c, error);
         s.error = error;
         return s.do ();
      }

      if (s.irq && s.irq (s) !== true) return;

      dlog ('a.do: irq is passed, path length #' + c, s.path.length, s.error);

      if (arguments.length > (s === arguments [0] ? 1 : 0)) {
         var parsed = a.parse (pov);
         if (! parsed) {
            dlog ('a.do: pov is value #' + c, pov);
            s.last = pov;
            return s.do ();
         }
         dlog ('a.do: pov checking #' + c, pov);
         s.path = parsed.concat (s.path);
      }

      if (s.path.length === 0) return s.last;

      var step   = s.path.shift ();
      dlog ('a.do: step is #' + c, step [0].toString ().slice (0, 100), step);
      var result = step.shift ().apply (undefined, [s].concat (step));

      if (result !== undefined) s.do (result);
   }

   // *** NON-SEQUENTIAL EXECUTION ***

   a.cond = function () {
      if (type (arguments [0]) === 'object') var s = arguments [0], path = arguments [1], map = arguments [2];
      else                                   var s = a.creat (),    path = arguments [0], map = arguments [1];

      if (type (s.do) !== 'function') throw new Error ('a.cond error: s.do must be a function but instead is: '   + type (s.do) + ' ' + s.do);
      if (type (map) !== 'object')    return s.do (null, 'a.cond error: map has to be an object but instead is: ' + type (map)  + ' ' + map);

      s.do ([
         path === true ? [] : type (path) === 'function' ? [path] : path,
         function (s) {
            if (Object.keys (map).indexOf (s.last + '') !== -1) return map [s.last];
            if (Object.keys (map).indexOf ('else') !== -1) return map.else;
            s.do ();
         }
      ]);
   }

   a.stop = function () {
      if (type (arguments [0]) === 'object') var s = arguments [0], path = arguments [1], opts = arguments [2];
      else                                   var s = a.creat (),    path = arguments [0], opts = arguments [1];

      if (type (s.do) !== 'function') throw new Error ('a.stop error: s.do must be a function but instead is: ' + type (s.do) + ' ' + s.do);
      if (opts !== undefined && type (opts) !== 'object') return s.do (null, 'a.stop error: opts must be undefined or an error but instead is: ' + type (opts) + ' ' + opts);
      if (opts && opts.test && type (opts.test) !== 'function') return s.do (null, 'a.stop error: if present, opts.test must be a function.');

      var mark = function (s) {return s.do ()}, test = opts && opts.test ? opts.test : function (s) {return s.error === undefined};

      s.do ([{
         error: undefined,
         irq: function (s) {
            dlog ('a.stop executing irq #' + c);
            if (test (s) === true) return true;
            dlog ('a.stop irq sent interrupt!!! #' + c);
            var error = s.error;
            var i = 0, path = s.path, seenMark;
            s.path = [], s.irq = undefined;
            while (true) {
               var step = path.splice (i, 1) [0];
               if (! step) break;
               dlog ('a.stop splicing #' + c, seenMark, step [0], step);
               if (step [0] === a.vars) a.vars (s, step [1], step [2]);
               if (seenMark) break;
               if (step [0] === mark) seenMark = true;
            }
            s.path = path;
            s.do (opts && opts.catch ? [{catch: error}, opts.catch] : function (s) {
               s.error = error;
               return [a.log, error];
            });
         }
      }, [
         type (path) === 'function' ? [path] : path,
         mark
      ]]);
   }

   a.fork = function () {
      dlog ('A.FORK SYNC STARTED');
      var arg     = 0;
      var s       = type (arguments [arg]) === 'object'   ? arguments [arg++] : a.creat ();
      var data    = arguments [arg++] === true            ? s.last            : arguments [arg - 1];
      var fun     = type (arguments [arg]) === 'function' ? arguments [arg++] : undefined;
      var opts = type (arguments [arg]) === 'object'   ? arguments [arg]   : {};

      if (type (s.do) !== 'function') throw new Error ('a.stop error: s.do must be a function but instead is: ' + type (s.do) + ' ' + s.do);

      var dataType = type (data);
      if (dataType === 'function') data = [data], dataType = 'array';

      if (dataType !== 'array' && dataType !== 'object')
         return s.do (null, 'a.fork error: data must be a function, an array or an object but instead is: ' + dataType + ' ' + data);

      if (opts.max &&  (type (opts.max)  !== 'integer' || opts.max  < 1))
         return s.do (null, 'a.fork error: if present, opts.max must be an integer greater than 0 but instead is: ' + type (opts.max) + ' ' + opts.max);

      if (opts.beat && (type (opts.beat) !== 'integer' || opts.beat < 1))
         return s.do (null, 'a.fork error: if present, opts.beat a.fork must be an integer greater than 0 but instead is: ' + type (opts.beat) + ' ' + opts.beat);

      if (opts.test && type (opts.test) !== 'function')
         return s.do (null, 'a.fork error: If present, opts.test must be a function but instead is: ' + type (opts.test) + ' ' + opts.test);

      // XXX is this necessary?
      //opts.beat = opts.beat || ((opts.max || opts.test) ? 100 : 0);
      opts.beat = opts.beat || 0;

      if (dataType === 'array'  && data.length === 0 && opts.beat === 0) return [];
      if (dataType === 'object' && Object.keys (data).length === 0)      return {};

      var output = dataType === 'array' ? [] : data;
      if (dataType === 'object') data = Object.keys (data);

      var counter = 0, active = 0, test = true, loading = false;

      var fire = function () {
         dlog ('findfire', {counter: counter, datalen: data.length, test: test});
         return counter < data.length && test && (! opts.max || opts.max > active);
      }

      var testInterval;
      if (opts.test) {
         testInterval = setInterval (function () {
            test = opts.test ({counter: counter, active: active, test: test, loading: loading, output: output, stack: s});
            if (fire ()) load ();
         }, opts.beat);
      }

      var save = function (stack, key) {
         dlog ('A.FORK SAVING', key, stack.last);
         --active;
         output [key] = stack.last;
         for (var key in stack) {
            if (key !== 'irq' && key !== 'vars' && key !== 'path' && key !== 'path' && key !== 'last' && key !== 'do' && stack [key] !== undefined) s [key] = stack [key];
         }
         if (fire ()) return load ();
         dlog ('outer', active, counter);
         if (active === 0 && counter === data.length) {
            setTimeout (function () {
               if (fire ()) return load ();
               if (testInterval) clearInterval (testInterval);
               if (active === 0 && counter === data.length) {
                  // XXX s.do (output) doesn't work when error interrupted.
                  s.last = output;
                  s.do ();
               }
            }, opts.beat);
         }
      }

      var scopy  = copy (s);
      scopy.path = [], scopy.irq = undefined;

      var load = function () {
         while (fire () && loading === false) {
            loading = true;
            counter++;
            active++;
            var key   = dataType === 'array' ? counter - 1 : data [counter - 1];
            var value = dataType === 'array' ? data [key]  : output [key];
            if (fun) value = fun (value, key, scopy) || a.do;
            dlog ('A.FORK FIRING', key, value, scopy);
            a.do (a.creat (copy (scopy)), [
               [value],
               [save, key]
            ]);
            loading = false;
         }
      }
      setTimeout (load, opts.beat);
      dlog ('A.FORK SYNC ENDED');
   }

   // *** TWO USEFUL FUNCTIONS ***

   a.make = function (fun, This) {
      if (type (fun) !== 'function') throw new Error ('a.make error: fun must be a function but instead is: ' + type (fun) + ' ' + fun);
      return function (s) {
         var args = [].slice.call (arguments, 1);
         fun.apply (This, args.concat (function (error, data) {
            s.do (data, error);
         }));
      }
   }

   a.set = function (s, key, path, restore) {
      if (key !== false && a.reserved.indexOf (key) !== -1) return s.do (null, 'a.set error: forbidden key: ' + key);
      if (key === false || restore) var last = s.last;
      s.do ([
         type (path) === 'function' ? [path] : path,
         function (s) {
            if (key !== false) s [key] = s.last;
            if (key === false || restore) s.last = last;
            s.do ();
         }
      ]);
   }

}) ();
