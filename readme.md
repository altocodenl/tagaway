# ac:pic

A place for your pictures.

## About

ac:pic is an application that allows you to store and manage your pictures. ac:pic is built by [Altocode](https://altocode.nl). While the service itself is paid, Altocode freely shares the code for all purposes, including commercial ones.

To understand why we're sharing the source code of a commercial product, please read [our manifesto](http://federicopereiro.com/manifesto). If that's too long to read, in a nutshell: we want to share our code so that others can learn from it and contribute to us. Sharing is the way to progress.

## Status

The application is currently under development and has not been launched yet. We estimate to have an alpha by September 2018 and a beta before the end of 2018.

## Routes

### Auth routes

- `GET /auth/logout`.
   - If a valid cookie is present, its corresponding session will be destroyed.
   - Unless there's an error, the route will return a 302 code with the `location` header set to `/`.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /auth/login`.
   - Body must be `{username: STRING, password: STRING, tz: INTEGER}`. If not, a 400 code will be returned with body `{error: ...}`.
   - `username` is lowercased and any leading & trailing space is removed from it (and intermediate spaces or space-like characters are reduced to a single space). `username` can be either the `username` or the `email` associated to a `username`.
   - If the username/password combination is not valid, a 403 code will be returned with body: `{error: 'auth'}`.
   - If the username/password combination is valid but the email hasn't been verified yet, a 403 code will be returned with body `{error: 'verify'}`.
   - `tz` must be the output of `Date.getTimezoneOffset ()`, an integer expressing the number of minutes behind (or ahead) of UTC in the local time.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /auth/signup`.
   - Body must be `{username: STRING, password: STRING, email: STRING, token: STRING}`. The email must be a valid email. If not, a 400 code will be returned with body `{error: ...}`.
   - Both `username` and `email` are lowercased and leading & trailing space is removed from them (and intermediate spaces or space-like characters are reduced to a single space). `username` cannot contain any `@` or `:` characters.
   - If there's no invite associated with the token, a 403 is returned with body `{error: 'token'}`.
   - If there's already an account with that email, a 403 is returned with body `{error: 'email'}`.
   - If there's already an account with that username, a 403 is returned with body `{error: 'username'}`.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `GET /auth/verify/TOKEN` (for verifying email ownership).
   - If successful, a 302 is returned redirecting to `/`.
   - If the token provided doesn't match what's on the database, a 403 is returned with an empty object as body: `{}`.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /auth/recover`.
   - Body must be `{username: STRING}`. The username can be either the username or the email.
   - If username is invalid, a 403 is returned.
   - If successful, it sends an email to the associated email address with a link for password recovery.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /auth/reset`.
   - Body must be `{username: STRING, password: STRING, token: STRING}`. The username can be either the username or the email.
   - If username is invalid, a 403 is returned.
   - If successful, it sends an email to the associated email address with a link for password recovery.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /auth/delete`.
   - User must be logged in, otherwise a 403 is returned.
   - The body is ignored.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.
   - If successful, a 302 is returned redirecting to `/`.

### App routes

From this point onwards, if a user is not logged in, any request will receive a 403 with body `{error: 'session'}`.

- `GET /pic/ID`
   - Pic must exist and the user must have permissions to see it (otherwise, 404).
   - Depending on ETag, a 200 or 304 is returned.
   - If the file is not found, a 404 is returned.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `GET /thumb/ID`
   - Thumb must exist and the user must have permissions to see it (otherwise, 404).
   - Depending on ETag, a 200 or 304 is returned.
   - If the file is not found, a 404 is returned.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

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
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `DELETE /pic/ID`
   - If the picture is not found, or if it does not belong to the user attempting the deletion, a 404 is returned.
   - If the deletion is successful, a 200 is returned.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /pic/rotate`
   - Body must be of the form `{id: STRING, deg: 90|180|-90}` (otherwise, 400 with body `{error: ...}`).
   - Pic must exist and the user must own it (otherwise, 404).
   - If the rotation is successful, a 200 is returned.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /tag`
   - Body must be of the form `{tag: STRING, ids: [STRING, ...], del: true|false|undefined}`
   - `tag` will be trimmed (any whitespace at the beginning or end of the string will be eliminated; space-like characters in the middle will be replaced with a single space).
   - `tag` cannot be a stringified integer between 1900 and 2100 inclusive. It also cannot be `all` or `untagged`.
   - If `del` is `true`, the tag will be removed, otherwise it will be added.
   - Picture must exist and user must be owner of the picture, otherwise a 404 is returned.

- `GET /tags`
   - Returns an object of the form `{tag1: INT, tag2: INT, ...}`. Includes a field for `untagged` and one for `all`.

- `POST /query`
   - Body must be of the form `{tags: [STRING, ...], mindate: INT|UNDEFINED, maxdate: INT|UNDEFINED, sort: newest|oldest|upload, from: INT, to: INT}`. Otherwise, a 400 is returned with body `{error: ...}`.
   - `body.from` and `body.to` must be positive integers, and `body.to` must be equal or larger to `body.from`. For a given query, they provide pagination capability. Both are indexes (starting at 1) that specify the first and the last picture to be returned from a certain query. If both are equal to 1, the first picture for the query will be returned. If they are 1 & 10 respectively, the first ten pictures for the query will be returned.
   - `all` cannot be included on `body.tags`. If you want to search for all available pictures, set `body.tags` to an empty array. If you send this tag, you'll get a 400 with body `{error: 'all'}`.
   - If defined, `body.mindate` & `body.maxdate` must be UTC dates in milliseconds.
   - `body.sort` determines whether sorting is done by `newest`, `oldest`, or `upload`. The first two criteria use the *earliest* date that can be retrieved from the metadata of the picture, or the `lastModified` field. In the case of the `upload`, the sorting is by *newest* upload date; there's no option to sort by oldest upload.
   - If the query is successful, a 200 is returned with body `pics: [{...}], total: INT}`.
      - Each element within `body.pics` is an object corresponding to a picture and contains these fields: `{date: INT, dateup: INT, id: STRING, t200: STRING|UNDEFINED, t900: STRING|UNDEFINED, owner: STRING, name: STRING, dimh: INT, dimw: INT, tags: [STRING, ...]}`.
      - `body.total` contains the number of total pictures matched by the query (notice it can be larger than the amount of pictures in `body.pics`).
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

`POST /share`
   - Body must be of the form `{tag: STRING, who: ID, del: BOOLEAN|UNDEFINED}`.
   - The target user (`body.who`) must exist, otherwise a 404 is returned.
   - If the tag being shared is `all` or `untagged`, a 400 is returned with body `{error: 'tag'}`.
   - If the sharing is successful, a 200 is returned.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

`GET /share`
   - If successful, returns a 200 with body `{sho: [[USERNAME1, TAG1], ...], shm: [[USERNAME2, TAG2], ...]}`.
   - `body.sho` lists the tags shared with others by the user. `body.shm` lists the tags shared with the user.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

`GET /account`
   - If successful, returns a 200 with body `{username: STRING, email: STRING, type: STRING, created: INTEGER, used: [INTEGER_USED, INTEGER_MAXIMUM], logs: [...]}`.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

### Debugging routes

`POST /clientlog`
   - This route does not require the user to be logged in.
   - Body must be JSON, otherwise a 400 is returned.

All the routes below require an admin user to be logged in.

### Admin routes

`POST /admin/invites`
   - Body must be `{email: STRING}` and `body.email` must be an email, otherwise a 400 is returned with body `{error: ...}`.

## Notification service for admins

Push into a list, to the left. Most recent is leftmost. Within list, stringified JSONs.

When pushed, function is fired to go through the whole list. Function should be blocking?

Function takes all items and optionally generates new ones. Each new one is a digest. A digest is a function of the rules and also of previous digests.

If, for example, a digest for 500s has been sent in the last minute, the next digest will only be done in 5 minutes. After the 5 minute one, another one will be generated after an hour. Digests are stored on another list and those can be cleaned up according to other rules. Digests can also be emailed.

Use cases:
- 500s with their errors and as much info as possible.
- Server starts.
- Disk getting full or little RAM left or CPU usage high (requires poller).
- Redis failure.

## Features

### Todo alpha

- Server
   - dunkerque pic date issue
   - Trim spaces in tags & shares.
   - Add tests: get account, trim tags, add tags in upload.
   - Integrate with ac:ping.
   - Hidden tags.
   - Provision prod server.

- Client
   - Rotation is a PROPERTY, transform: rotate(90deg);
   - Upload view: multiple uploads, tags are readonly afterwards, can add/remove tags before triggering upload.
   - Top bar (Home, Manage, Upload)
   - Add autotag with enter
   - Show dates in upload mode
   - Make remove tags as a button/tag with an integrated cross, with ... for long tags and expand on click
   - Initial view with no pictures
   - Manage tags.
   - Mark shared & hidden tags always.

### Todo beta

- Admin & deploy
   - Manage payments.
   - Self host font.
   - Favicon & icons.
   - Report pictures.

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
   - Share/unshare tag with a link (takes you to special view even if you're logged in, with go back to my pictures).
   - Upload to shared tag.
   - Tags with same name (local vs shared, put a @).
   - QR code to share.

- Upload
   - Client-side hashes for fast duplicate elimination.
   - Client-side hashes to avoid deleted pictures on folder upload mode (with override).
   - Folder upload on Android & mobile.

- Organize
   - Mobile/tablet view.
   - Add colors to tags.
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

XXX

- Upload
   - Allow only jpeg & png.
   - Auto thumbnail generation.
   - Server-side encryption.
   - See progress when uploading files, using a progress bar.
   - Ignore images that already were uploaded (by hash check).
   - Upload more files while uploading files.
   - Allow to go back to browse while files are being uploaded in the background.
   - Retry on error.

- Carrousel
   - Full screen viewing.
   - Use etags to save bandwidth.
   - Carrousel with wrap-around and autoloading of more pictures.
   - Show date & tags.

- Organize
   - Multiple selection with shift & ctrl.
   - Tag/untag.
   - Delete.
   - Sort by newest/oldest/upload.
   - Autocomplete tags when searching.
   - Allow for more than one tag to be searched at the same time.
   - See number of tags & date below each picture.
   - Rotate pictures.
   - Consider 1900-2100 as automatic tags for search.
   - Sort by newest, oldest & upload date.
   - Refresh list of pictures if there's an upload in the background.

- Account
   - Signup with invite.
   - Login/logout.
   - Recover/reset.

- Admin
   - Metering requests, downloads & space stored.
   - Block further uploads if storage limits are exceeded.
   - Invites.

### Features we may never implement

- Account
   - Login with FB.
   - Login with gmail.
   - Multiple users.

- Share
   - Comments.
   - Share to social platforms.
   - Serve images as hosting.
   - Share certain tags only on shared pictures.
   - Home pages.

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
`State.loading`: true|undefined, to see whether pics are being loaded.

`Data.pics`: `[...]`; comes from `body.pics` from `POST /query`. A `selected` boolean can be added to denote selection of the picture.
`Data.tags`: `{all: INT, untagged: INT, ...}`; the body returned by `GET /tags`.
`Data.total`: number of pics matched by query.

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

- invites (hash): key is email, value is {token: ..., sent: INT (date), accepted: UNDEFINED|INT (date)}

- verify (hash): key is token, value is email. Deleted after usage.

- upic:USERID (set): contains hashes of the pictures uploaded by an user, to check for repetition.

- upicd:USERID (set): contains hashes of the pictures uploaded by an user, to check for repetition when re-uploading files.

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
   xp: INT or absent, number of pics downloaded (also includes cache)

- pict:ID (set): list of all the tags belonging to a picture.

- tag:USERID:TAG (set): pic ids.

- shm:USERID (set): USERA:TAG, USERB:TAG (shared with me)

- sho:USERID (set): USERA:TAG, USERB:TAG (shared with others)

- tags:USERID (hash): list of all tags and the number of pictures for each. Also contains untagged field. Does not count pictures shared with the user.

- ulog:USER (list): stringified log objects with user activity. Leftmost is most recent.
   - For login:      {t: INT, a: 'log', ip: STRING, ua: STRING, tz: INTEGER}
   - For signup:     {t: INT, a: 'sig', ip: STRING, ua: STRING}
   - For reset:      {t: INT, a: 'res', ip: STRING, ua: STRING}
   - For destroy:    {t: INT, a: 'des', ip: STRING, ua: STRING}
   - For uploads:    {t: INT, a: 'upl', id: STRING, uid: STRING (id of upload), tags: ARRAY|UNDEFINED}
   - For deletes:    {t: INT, a: 'del', id: STRING}
   - For rotates:    {t: INT, a: 'rot', id: STRING, deg: 90|180|-90}
   - For (un)tags:   {t: INT, a: 'tag', tag: STRING, d: true|undefined (if true it means untag), ids: [...]}
   - For (un)shares: {t: INT, a: 'sha', tag: STRING, d: true|undefined (if true it means unshare), u: STRING}

- sti:d:DATE (string): picture/thumb downloads in the last 10 minutes. Time is Date.now () divided by 100000.
- sti:u:DATE (string): uploads in the last 10 minutes. Time is Date.now () divided by 100000.
- sti:t:DATE (string): tag operations in the last 10 minutes. Time is Date.now () divided by 100000.
- sti:l:DATE (string): total milliseconds for all responses, to calculate average, in the last 10 minutes. Time is Date.now () divided by 100000.
- sti:hxxx:DATE (string): responses with status code XXX in the last 10 minutes. Time is Date.now () divided by 100000.
- stp:a:DATE (hyperloglog or string): unique active users in the last 10 minutes. Time is Date.now () divided by 100000. Entries older than 10 minutes will be converted from hyperloglog to a string with a counter.
- stp:A:DATE (hyperloglog or string): unique active users in the last 24 hours. Time is Date.now () divided by 100000. Entries older than a day will be converted from hyperloglog to a string with a counter.
- stp (set): list of all hyperloglog entries.

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

## License

ac:pic is written by [Altocode](https://altocode.nl) and released into the public domain.
