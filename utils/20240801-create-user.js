
var t = Date.now ();
var tdebug = function () {
   var args = [(Date.now () - t) + 'ms'].concat (dale.go (arguments, function (v) {return v}));
   debug.apply (null, args);
}

var user = {username: 'test', email: 'info@altocode.nl', password: password};

h.one (s, {method: 'post', path: 'auth/signup' + piv.id, body: user}, code: 200, apres: function (s, rq, rs) {
   tdebug ('Done creating user', user);
});

