process.stdin.resume ();
process.stdin.setEncoding ('utf8');
process.stdin.on ('data', function (data) {
   (data.match (/\d{13}/g) || []).map (function (v) {
      data = data.replace (v, new Date (parseInt (v)).toISOString ());
   });
   process.stdout.write (data);
});
