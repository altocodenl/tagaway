# ac;pic :: a home for your pictures

## About

ac;pic is an application that allows you to store and manage your pictures. ac;pic is built by [Altocode](https://altocode.nl). While the service itself is paid, Altocode freely shares the code for all purposes, including commercial ones.

To understand why we're sharing the source code of a commercial product, please read [our manifesto](http://federicopereiro.com/manifesto). If that's too long to read, in a nutshell: we want to share our code so that others can learn from it and contribute to us. Sharing is the way to progress.

All non-code documents related to the project are published in this [open folder](https://drive.google.com/drive/u/1/folders/11UPZHrHUT_ce2baN9s0K-CtfXYQOewG3).

## Status

The application is currently under development and has not been launched yet. We estimate to have an alpha by 2020.

The author wishes to thank [Browserstack](https://browserstack.com) for providing tools to test cross-browser compatibility.

<a href="https://www.browserstack.com"><img src="https://bstacksupport.zendesk.com/attachments/token/kkjj6piHDCXiWrYlNXjKbFveo/?name=Logo-01.svg" width="150px" height="33px"></a>

### Todo alpha

- Client
   - New interface.

### Todo v1

- gotoB 2 & style
   - > -1 instead of !== -1
   - [], not `*`
   - style, time, last
   - navigation

- Server
   - httponly cookie & csrf token
   - Security: figure out if workaround for package-lock is necessary with nested dependencies that are not pegged.
   - ac;tools

- Admin & deploy
   - Manage payments.
   - Favicon & icons.
   - Report pictures.
   - Security writeup: xss routes with user input (tags, eventually picture titles; image contents are left to browsers but images have to be valid as per imagemagick), cookie as signed token, CSRF prevented by sending cookie (not by headers, https://blog.appsecco.com/exploiting-csrf-on-json-endpoints-with-flash-and-redirects-681d4ad6b31b), s3 encryption, we encrypt the cookie only for distinguishing expired cookie from attack (https://hueniverse.com/on-securing-web-session-ids-b90f566b3786)

- Account
   - Account view
   - Delete account.
   - Change email & password.
   - Export all data.
   - Re-import your data (won't reset what you have. do it through the proper endpoints, change ids).
   - Payment.
   - Payment late: 2 week notice with download.
   - Freeze me out.
   - API tokens.
   - Status & stats page.
   - Languages.

- Share
   - Share/unshare with authorization & automatic email.
   - Share/unshare tag with a link (takes you to special view even if you're logged in, with go back to my pictures). Query against it as well with tags that are in those too?
   - Upload to shared tag.
   - Tags with same name (local vs shared, put a @).
   - QR code to share.

- Upload
   - Client-side hashes for fast duplicate elimination.
   - Client-side hashes to avoid deleted pictures on folder upload mode (with override).
   - Folder upload on Android & mobile.

- Organize
   - Hidden tags.
   - Mobile/tablet view.
   - Add colors to tags.
   - Show dates in upload mode.
   - Smaller level of scale to go faster
   - Upload video.
   - Add title (based on title of pic but optional)
   - Enable GPS detection.
   - Create tag that groups tags (can also have pictures directly assigned).
   - Create group that groups people.
   - Filters.
   - Themes for the interface.
   - Set date manually?
   - Order pictures within tag? Set priorities! Manual order mode.

### Done

- Upload
   - Allow only jpeg & png.
   - Auto thumbnail generation.
   - Server-side encryption.
   - See progress when uploading files, using a progress bar.
   - Ignore images that already were uploaded (by hash check).
   - Upload more files while uploading files.
   - Allow to go back to browse while files are being uploaded in the background.
   - Retry on error.
   - Add one or more tags to a certain upload batch.

- Carrousel
   - Full screen viewing.
   - Use etags to save bandwidth.
   - Carrousel with wrap-around and preloading of the next picture.
   - Show date & tags.

- Organize
   - Multiple selection with shift & ctrl.
   - Tag/untag.
   - Delete pictures.
   - Sort by newest, oldest & upload date.
   - Autocomplete tags when searching.
   - Allow for more than one tag to be searched at the same time.
   - See number of tags & date below each picture.
   - Rotate pictures.
   - Select all pictures in query even if they were not loaded.
   - Consider 1900-2100 as automatic tags for search.
   - Refresh list of pictures if there's an upload in the background.

- Account
   - Signup with invite.
   - Login/logout.
   - Recover/reset/change password.

- Admin
   - Metering requests, downloads & space stored.
   - Block further uploads if storage limits are exceeded.
   - Invites.
   - Stats endpoint.

### Features we may never implement

- Share
   - Comments.
   - Share to social platforms.
   - Serve images as hosting.
   - Share certain tags only on shared pictures.
   - Home pages.

## Routes

If any route fails with an internal error, a 500 code will be returned with body `{error: ...}`.

All `POST` requests must have a `content-type` header of `application/json` and their bodies must be valid JSON objects. The only exception is `POST /pic`, which must be of type `multipart/form-data`.

All non-auth routes (unless marked otherwise) will respond with a 403 error with body `{error: 'nocookie'}` if the user is not logged in.

If a cookie with invalid signature is sent along, the application will respond with a 403 error with body `{error: 'tampered'}`.

If a cookie with valid signature but that has already expired is sent along, the application will respond with a 403 error with body `{error: 'session'}`.

All POST requests (unless marked otherwise) must contain a `cookie` field equivalent to the `cookie` provided by a successfull call to `POST /auth/login`. This requirement is for CSRF prevention. In the case of `POST /upload`, the cookie must be present as a field within the `multipart/form-data` form. If this condition is not met, a 403 error will be sent.

### Request invite

- `POST /requestInvite`.
   - Body must be `{email: STRING}`, otherwise a 400 will be sent.

### Auth routes

- `POST /auth/login`.
   - Does not require the user to be logged in.
   - Body must be `{username: STRING, password: STRING, tz: INTEGER}`. If not, a 400 code will be returned with body `{error: ...}`.
   - `username` is lowercased and any leading & trailing space is removed from it (and intermediate spaces or space-like characters are reduced to a single space). `username` can be either the `username` or the `email` associated to a `username`.
   - If the username/password combination is not valid, a 403 code will be returned with body: `{error: 'auth'}`.
   - If the username/password combination is valid but the email hasn't been verified yet, a 403 code will be returned with body `{error: 'verify'}`.
   - `tz` must be the output of `Date.getTimezoneOffset ()`, an integer expressing the number of minutes behind (or ahead) of UTC in the local time.

- `POST /auth/signup`.
   - Does not require the user to be logged in.
   - Body must be `{username: STRING, password: STRING, email: STRING, token: STRING}`. The email must be a valid email. If not, a 400 code will be returned with body `{error: ...}`.
   - Both `username` and `email` are lowercased and leading & trailing space is removed from them (and intermediate spaces or space-like characters are reduced to a single space). `username` cannot contain any `@` or `:` characters.
   - If there's no invite associated with the token, a 403 is returned with body `{error: 'token'}`.
   - If there's already an account with that email, a 403 is returned with body `{error: 'email'}`.
   - If there's already an account with that username, a 403 is returned with body `{error: 'username'}`.

- `GET /auth/verify/TOKEN` (for verifying email ownership).
   - Does not require the user to be logged in.
   - If successful, a 302 is returned redirecting to `/`.
   - If the token provided doesn't match what's on the database, a 403 is returned.

- `POST /auth/recover`.
   - Does not require the user to be logged in.
   - Body must be `{username: STRING}`. The username can be either the username or the email.
   - If username is invalid, a 403 is returned.
   - If successful, it sends an email to the associated email address with a link for password recovery.

- `POST /auth/reset`.
   - Does not require the user to be logged in.
   - Body must be `{username: STRING, password: STRING, token: STRING}`. The username can be either the username or the email.
   - If username is invalid, a 403 is returned.
   - If successful, it sends an email to the associated email address with a link for password recovery.

- `GET /auth/logout`.
   - Unless there's an error, the route will return a 302 code with the `location` header set to `/`.

- `POST /auth/delete`.
   - Temporarily disabled (route always returns 501).
   - User must be logged in, otherwise a 403 is returned.
   - The body is ignored.
   - If successful, a 302 is returned redirecting to `/`.

- `POST /auth/changePassword`.
   - Body must be `{old: STRING, new: STRING}`.

### App routes

`POST /feedback`
   - Body must be an object of the form `{message: STRING}` (otherwise 400).
   - If successful, returns a 200.

- `GET /pic/ID`
   - Pic must exist and the user must have permissions to see it (otherwise, 404).
   - Depending on ETag, a 200 or 304 is returned.
   - If the file is not found, a 404 is returned.

- `GET /thumb/ID`
   - Thumb must exist and the user must have permissions to see it (otherwise, 404).
   - Depending on ETag, a 200 or 304 is returned.
   - If the file is not found, a 404 is returned.

- `POST /pic`
   - Must be a multipart request (and it should include a `content-type` header with value `multipart/form-data`).
   - Must contain fields (otherwise, 400 with body `{error: 'field'}`).
   - Must contain one file (otherwise, 400 with body `{error: 'file'}`).
   - Must contain a field `uid` with an upload id (otherwise, 400 with body `{error: 'uid'}`.
   - Must contain no extraneous fields (otherwise, 400 with body `{error: 'invalidField'}`). The only allowed fields are `uid`, `lastModified` and `tags`; the last one is optional.
   - Must contain no extraneous files (otherwise, 400 with body `{error: 'invalidFile'}`). The only allowed file is `pic`.
   - Must include a `lastModified` field that's parseable to an integer (otherwise, 400 with body `{error: 'lastModified'}`).
   - If it includes a `tag` field, it must be an array (otherwise, 400 with body `{error: 'tags'}`). None of them should be `'all`', `'untagged'` or a four digit string that when parsed to an integer is between 1900 to 2100 (otherwise, 400 with body `{error: 'tag: TAGNAME'}`).
   - The file uploaded must be `.png` or `.jpg` (otherwise, 400 with body `{error: 'format'}`).
   - If the same file exists for that user, a 409 is returned with body `{error: 'repeated'}`.
   - If the storage capacity for that user is exceeded, a 409 is returned with body `{error: 'capacity'}`.
   - If the upload is successful, a 200 is returned.

- `DELETE /pic/ID`
   - If the picture is not found, or if it does not belong to the user attempting the deletion, a 404 is returned.
   - If the deletion is successful, a 200 is returned.

- `POST /rotate`
   - Body must be of the form `{ids: [STRING, ...], deg: 90|180|-90}` (otherwise, 400 with body `{error: ...}`).
   - All pictures must exist and user must be owner of the pictures, otherwise a 404 is returned.
   - There should be no repeated ids on the query, otherwise a 400 is returned.
   - If the rotation is successful, a 200 is returned.

- `POST /tag`
   - Body must be of the form `{tag: STRING, ids: [STRING, ...], del: true|false|undefined}`
   - `tag` will be trimmed (any whitespace at the beginning or end of the string will be eliminated; space-like characters in the middle will be replaced with a single space).
   - `tag` cannot be a stringified integer between 1900 and 2100 inclusive. It also cannot be `all` or `untagged`.
   - If `del` is `true`, the tag will be removed, otherwise it will be added.
   - All pictures must exist and user must be owner of the pictures, otherwise a 404 is returned.
   - There should be no repeated ids on the query, otherwise a 400 is returned.
   - If successful, returns a 200.

- `GET /tags`
   - Returns an object of the form `{tag1: INT, tag2: INT, ...}`. Includes a field for `untagged` and one for `all`.

- `POST /query`
   - Body must be of the form `{tags: [STRING, ...], mindate: INT|UNDEFINED, maxdate: INT|UNDEFINED, sort: newest|oldest|upload, from: INT, to: INT}`. Otherwise, a 400 is returned with body `{error: ...}`.
   - `body.from` and `body.to` must be positive integers, and `body.to` must be equal or larger to `body.from`. For a given query, they provide pagination capability. Both are indexes (starting at 1) that specify the first and the last picture to be returned from a certain query. If both are equal to 1, the first picture for the query will be returned. If they are 1 & 10 respectively, the first ten pictures for the query will be returned.
   - `all` cannot be included on `body.tags`. If you want to search for all available pictures, set `body.tags` to an empty array. If you send this tag, you'll get a 400 with body `{error: 'all'}`.
   - If defined, `body.mindate` & `body.maxdate` must be UTC dates in milliseconds.
   - `body.sort` determines whether sorting is done by `newest`, `oldest`, or `upload`. The first two criteria use the *earliest* date that can be retrieved from the metadata of the picture, or the `lastModified` field. In the case of the `upload`, the sorting is by *newest* upload date; there's no option to sort by oldest upload.
   - If the query is successful, a 200 is returned with body `pics: [{...}], total: INT}`.
      - Each element within `body.pics` is an object corresponding to a picture and contains these fields: `{date: INT, dateup: INT, id: STRING, t200: STRING|UNDEFINED, t900: STRING|UNDEFINED, owner: STRING, name: STRING, dimh: INT, dimw: INT, tags: [STRING, ...], deg: INT|UNDEFINED}`.
      - `body.total` contains the number of total pictures matched by the query (notice it can be larger than the amount of pictures in `body.pics`).

`POST /share`
   - Body must be of the form `{tag: STRING, who: ID, del: BOOLEAN|UNDEFINED}`.
   - The target user (`body.who`) must exist, otherwise a 404 is returned.
   - If the tag being shared is `all` or `untagged`, a 400 is returned with body `{error: 'tag'}`.
   - If try to share with yourself, a 400 is returned with body `{error: 'self'}`.
   - If successful, returns a 200.

`GET /share`
   - If successful, returns a 200 with body `{sho: [[USERNAME1, TAG1], ...], shm: [[USERNAME2, TAG2], ...]}`.
   - `body.sho` lists the tags shared with others by the user. `body.shm` lists the tags shared with the user.

`GET /account`
   - If successful, returns a 200 with body `{username: STRING, email: STRING, type: STRING, created: INTEGER, used: [INTEGER_USED, INTEGER_MAXIMUM], logs: [...]}`.

### Debugging routes

`POST /error`
   - This route does not require the user to be logged in.
   - Body must be JSON, otherwise a 400 is returned.

All the routes below require an admin user to be logged in.

### Admin routes

`POST /admin/stats`
   - Publicly accessible.
   - Returns all stats information.

`POST /admin/invites`
   - Body must be `{email: STRING}` and `body.email` must be an email, otherwise a 400 is returned with body `{error: ...}`.

## Features

## Client Data/State structure

`State.view`: can be `'auth'` or `'main'`.

`State.subview`: for view `'auth'`:  `'login'`/`'signup'`. For view `'main'`, `'browse'`/`'upload'`.

`State.notify`: for printing messages, `{color: STRING, message: STRING, timeout: TIMEOUT FOR CLEARING State.notify}`.

`State.query`: `{tags: [...], sort: 'newest'/'oldest'/'upload'}`.

`State.shift`: `true|false|undefined`, truthy when the `shift` key is depressed.

`State.ctrl`: `true|false|undefined`, truthy when the `ctrl` key is depressed.

`State.autotag`: STRING denoting the tag being entered by the user for tagging pictures or searching for an existing tag with which to tag pictures.

`State.refreshQuery`: `undefined|timeout`. If there are pending uploads in `State.upload.queue`, this timeout retrieves pics. It's executed once per second.

`State.autoquery`: `undefined|string`, used to search for tags in the query box.

`State.upload`: used for queuing uploads `{queue: [FILE1, FILE2, ...], error: [[error, file], ...], invalid: [filename, ...], done: INT, repeated: INT, tags: [...]}`.

`State.uploadFolder`: `undefined|boolean`. If `true`, the input for uploading files will upload entire directories instead.

`State.uploadModal`: `undefined|true`, if true, show the upload modal.

`State.lastClick`: `undefined|{id: PICID, time: INT}`, marks the last picture clicked and the time when it happened, to implement the folllowing: picture selection, picture selection by range, opening canvas view.

`State.lastScroll`: `undefined|{y: INT, time: INT}`, marks the time of the last scroll, and the last Y position of the window (`window.scrollY`).

`State.canvas`: `undefined|PIC`, if not undefined contains the picture object that's being shown on the `canvas` view.

`State.nextCanvas`: `undefined|PIC`, used to preload the next picture in the `canvas` view.

`State.showPictureInfo`: `undefined|boolean`, if truthy, picture information is shown on the `canvas` view.

`State.screen`: `{w: window.innerWidth, h: window.innerHeight}`. Used by the `canvas` view.

`State.selected`: `{id1: true, id2: true, ...}`. Lists the ids all of selected pictures.

`State.slider`: true|false|undeined. If no pictures selected, falsy is all tags, truthy is selected tags. If pictures are selected, falsy is add tags, truthy is remove tags.

`State.loading`: true|undefined, to see whether pics are being loaded.

`Data.pics`: `[...]`; comes from `body.pics` from `POST /query`. A `selected` boolean can be added by the client to denote selection of the picture, but that never reaches the server.

`Data.total`: number of pics matched by query. Also comes from `POST /query`.

`Data.tags`: `{all: INT, untagged: INT, ...}`; the body returned by `GET /tags`.

`Data.account`: `{username: STRING, email: STRING, type: STRING, created: INT, logs: [{...}, ...], used: [INT, INT]`; the body returned by `GET /account`.

## Redis structure

```
- users:USERNAME (hash):
   pass: STRING,
   username: STRING,
   email: STRING,
   type: STRING (one of tier1|tier2),
   created: INT
   s3:bget: INT (bytes GET from s3),
   s3:buse: INT (space used in S3),

- emails (hash): key is email, value is username

- emailtoken:TOKEN (hash): key is token, value is email. Used to verify email addresses.

- invites (hash): key is email, value is {firstName: STRING, token: ..., sent: INT (date), accepted: UNDEFINED|INT (date)}

- verify (hash): key is token, value is email. Deleted after usage.

- upic:USERID (set): contains hashes of the pictures uploaded by an user, to check for repetition.

- upicd:USERID (set): contains hashes of the pictures deleted by an user, to check for repetition when re-uploading files.

- thu:ID (string): id of the corresponding pic.

- pic:ID (hash)
   id: STRING (uuid),
   owner: STRING (user id),
   name: STRING,
   dateup: INT (millis),
   dimw: INT (width in pixels),
   dimh: INT (height in pixels),
   by:   INT (size in bytes)
   hash: STRING,
   dates: STRING (stringified array of dates belonging to the picture, normalized and sorted by earliest first),
   orientation: STRING (stringified array of orientation data) or absent
   deg: 90|-90|180 or absent,
   date: INT (latest date within dates),
   t200: STRING or absent,
   by200: INT or absent,
   t900: STRING or absent,
   by900: INT or absent,
   xt2: INT or absent, number of thumb200 downloaded (also includes cached hits)
   xt9: INT or absent, number of thumb900 downloaded (also includes cached hits)
   xp:  INT or absent, number of pics downloaded (also includes cache)

- pict:ID (set): list of all the tags belonging to a picture.

- tag:USERID:TAG (set): pic ids.

- shm:USERID (set): USERA:TAG, USERB:TAG (shared with me)

- sho:USERID (set): USERA:TAG, USERB:TAG (shared with others)

- tags:USERID (set): list of all tags created by the user. Does not count tags shared with the user.

- ulog:USER (list): stringified log objects with user activity. Leftmost is most recent.
   - For login:           {t: INT, a: 'log', ip: STRING, ua: STRING, tz: INTEGER}
   - For signup:          {t: INT, a: 'sig', ip: STRING, ua: STRING}
   - For recover:         {t: INT, a: 'rec', ip: STRING, ua: STRING, token: STRING}
   - For reset:           {t: INT, a: 'res', ip: STRING, ua: STRING, token: STRING}
   - For password change: {t: INT, a: 'chp', ip: STRING, ua: STRING, token: STRING}
   - For destroy:         {t: INT, a: 'des', ip: STRING, ua: STRING}
   - For uploads:         {t: INT, a: 'upl', id: STRING, uid: STRING (id of upload), tags: ARRAY|UNDEFINED}
   - For deletes:         {t: INT, a: 'del', id: STRING}
   - For rotates:         {t: INT, a: 'rot', id: STRING, deg: 90|180|-90}
   - For (un)tags:        {t: INT, a: 'tag', tag: STRING, d: true|undefined (if true it means untag), ids: [...]}
   - For (un)shares:      {t: INT, a: 'sha', tag: STRING, d: true|undefined (if true it means unshare), u: STRING}

- sti:d:DATE (string): picture/thumb downloads in the last 10 minutes. Time is Date.now () divided by 100000.
- sti:u:DATE (string): uploads in the last 10 minutes. Time is Date.now () divided by 100000.
- sti:t:DATE (string): tag operations in the last 10 minutes. Time is Date.now () divided by 100000.
- sti:l:DATE (string): total milliseconds for all responses, to calculate average, in the last 10 minutes. Time is Date.now () divided by 100000.
- sti:hxxx:DATE (string): responses with HTTP status code XXX in the last 10 minutes. Time is Date.now () divided by 100000.
- stp:a:DATE (hyperloglog or string): unique active users in the last 10 minutes. Time is Date.now () divided by 100000. Entries older than 10 minutes will be converted from hyperloglog to a string with a counter.
- stp:A:DATE (hyperloglog or string): unique active users in the last 24 hours. Time is Date.now () divided by 100000. Entries older than a day will be converted from hyperloglog to a string with a counter.
- stp (set): list of all hyperloglog entries.
- cachestats (string): stringified object with cache of /admin/stats. Lasts 60 seconds only.

Used by giz:

- session:ID (string): value is username. Used for sessions. Expires automatically.

- token:ID (string): value is username. Used for password recovery. Expires automatically.

- users:USERNAME (hash): covered above, giz only cares about `pass`.
```

## Configuration

On `/etc/security/limits.conf`, the following two lines to increase file handles per process:

```
* soft nofile 99999
* hard nofile 99999
```

On `/etc/sysctl.conf`:

```
# increases TCP maximum queue length to 4096
net.core.somaxconn=4096
# for giving more memory to redis to create background processes for saving the DB to disk
vm.overcommit_memory=1
```

`start.sh` (must be executable, set with `chmod 777 start.sh`):

```
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"
echo never > /sys/kernel/mm/transparent_hugepage/enabled
service redis-server restart
cd /root/acpic && mg restart
```

crontab with `@reboot /root/start.sh`

### HTTPS configuration

Installation of certbot:

```
sudo add-apt-repository ppa:certbot/certbot -y
sudo apt-get update
sudo apt-get install python-certbot-nginx -y
```

On your relevant nginx configuration (either at `/etc/nginx/sites-available` or `/etc/nginx/sites-enabled`), add this line:

```
   server_name YOURDOMAIN
```

Make sure your domain points to the server where you're adding these changes. Then run these commands:

```
service nginx reload
sudo certbot --nginx -d YOURDOMAIN
```

Add the following to your crontab, to renew the certificates at the hour HH:YY every day.

```
crontab: YY HH * * * sudo certbot renew
```

## Security

If you find a security vulnerability, please disclose it to us as soon as possible (`info AT altocode.nl`). We'll work on it with the utmost priority.

## License

ac;pic is written by [Altocode](https://altocode.nl) and released into the public domain.
