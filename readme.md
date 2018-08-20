# acpic

A place for your pictures.

## About

acpic is an application that allows you to store and manage your pictures. acpic is built by [Altocode](https://altocode.nl). While the service itself is paid, Altocode freely shares the code for all purposes, including commercial ones.

To understand why we're sharing the source code of a commercial product, please read [our manifesto](http://federicopereiro.com/manifesto). If that's too long to read, in a nutshell: we want to share our code so that others can learn from it and contribute to us. Sharing is the way to progress.

## Status

The application is currently under development and has not been launched yet. We estimate to have an alpha by September 2018 and a beta before the end of 2018.

The client is not yet committed to the repository since it's not functional yet. The server is functional but some work still remains (see Features section below).

## Routes

### Auth routes

- `GET /auth/logout`.
   - If a valid cookie is present, its corresponding session will be destroyed.
   - Unless there's an error, the route will return a 302 code with the `location` header set to `/`.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /auth/login`.
   - Body must be `{username: STRING, password: STRING}`. If not, a 400 code will be returned with body `{error: ...}`.
   - `username` is lowercased and any trailing space is removed from it. `username` can be either the `username` or the `email` associated to a `username`.
   - If the username/password combination is not valid, a 403 code will be returned with body: `{error: 'auth'}`.
   - If the username/password combination is valid but the email hasn't been verified yet, a 403 code will be returned with body `{error: 'verify'}`.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /auth/signup`.
   - Body must be `{username: STRING, password: STRING, email: STRING, token: STRING}`. The email must be a valid email. If not, a 400 code will be returned with body `{error: ...}`.
   - Both `username` and `email` are lowercased and trailing space is removed from them.
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

From this point onwards, if a user is not logged in, any request will receive a 403 with body `{body: 'session'}`.

- `GET /pic/ID`.
   - Pic must exist and the user must have permissions to see it (otherwise, 404).
   - Depending on ETag, a 200 or 304 is returned.
   - If the file is not found, a 404 is returned.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `GET /thumb/ID`.
   - Thumb must exist and the user must have permissions to see it (otherwise, 404).
   - Depending on ETag, a 200 or 304 is returned.
   - If the file is not found, a 404 is returned.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /pic`.
   - Must be multipart.
   - Must include a text `lastModified` field that's parseable to an integer (otherwise, 400).
   - Must include a file `pic` field (otherwise, 400).
   - Must be `.png` or `.jpg` (otherwise, 400).
   - If the same file exists for that user, a 409 is returned.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `DELETE /pic/ID`.
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /pic/rotate`.
   - Body must be of the form `{id: STRING, deg: 90|180|-90}` (otherwise, 400).
   - Pic must exist and the user must own it (otherwise, 404).
   - If there's an internal error, a 500 is returned with body `{error: ...}`.

- `POST /tag`
   - Body must be of the form `{tag: STRING, ids: [STRING, ...], del: true|false|undefined}`
   - `tag` will be trimmed (any whitespace at the beginning or end of the string will be eliminated).
   - `tag` cannot be a stringified integer between 1900 and 2100 inclusive. It also cannot be `all` or `untagged`.
   - If `del` is `true`, the tag will be removed, otherwise it will be added.
   - Picture must exist and user must be owner of the picture, otherwise 404.

- `GET /tags`
   - Returns an object of the form `{tag1: INT, tag2: INT, ...}`. Includes a field for `untagged` and one for `all`.

- `POST /query`.
   - Body must be of the form `{tags: [STRING, ...], mindate: INT|UNDEFINED, maxdate: INT|UNDEFINED, sort: newest|oldest|upload, num: INT, more: BOOLEAN|UNDEFINED}`.
   - `mindate` & `maxdate` must be UTC dates in milliseconds.
   - `sort` determines whether sorting is done by `newest`, `oldest`, or `upload` (newest upload; there's no option for oldest upload).
   - `num` is number of things you already have. `more` adds 30 more to that, otherwise you just get what you asked for.

POST /share

GET /share

POST /api

### Admin & debugging routes

POST /clienterror (no need to be logged in)

   ['post', 'admin/invites', function (rq, rs) {
   ['post', 'logs', cicek.json (function (rq, rs) {

## Features

### Todo alpha

- Server
   - Account
      - check documentation for app routes
      - Get account activity, clienterror & test
   - Email sending & templates in config
   - DB backups to S3.
   - Limit of 1k for deleting S3 items in s3del.
   - Count user & picture activity (uploads & downloads) with 10 minute granularity

- Client
   - Fix all existing functionality after server refactor.
   - Upload popup
   - Canvas
      - Correct dimensions after full screen (check flechita movediza and size of initial picture).
      - Show picture info.
      - Make keyboard keys go back & forth.
      - Preload next picture.
   - Organize
      - Show tags when starting to type already.
      - Make browse usable when files are being uploaded.
      - Add multiple tags at the same time.
      - Bug when pictures fit in screen, no reload
      - Make 200x200 in organize view

- Admin
   - Admin area with invites
   - See login attempts & general activity.

### Todo beta

- Admin
   - Manage payments.

- Account
   - Account view
   - Two-cookie system with CSRF.
   - Delete account.
   - Change email & password.
   - Export all data
   - Re-import your data (won't reset what you have. do it through the proper endpoints, change ids).
   - Payment
   - Payment late: 2 week notice with download.
   - Freeze me out
   - API tokens.
   - Status page.
   - Languages.

- Share
   - Share/unshare with authorization & automatic email.
   - Share/unshare tag with a link (takes you to special view even if you're logged in, with go back to my pictures).

- Upload
   - Add tag(s) to uploads.
   - Upload to shared tag.

- Organize
   - Hide certain tags when you don't search for any, unless you explicitly search for them
   - Smaller level of scale to go faster
   - Upload video.
   - Add title (based on title of pic but optional)
   - Enable GPS detection.
   - Selection beyond what's currently on screen (operations by tag(s)!).
   - Create tag that groups tags (can also have pictures directly assigned).
   - Create group that groups people.
   - Filters.
   - Themes for the interface.
   - Mark tag as private/hide tag from normal view?
   - Set date manually?
   - Order pictures within tag? Set priorities!

- Other
   - Report pictures.
   - QR code to share.

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

- Carrousel
   - Full screen viewing.
   - Use etags to save bandwidth.
   - Carrousel with wrap-around and autoloading of more pictures.
   - Show date & tags.

- Organize
   - Multiple selection with shift & ctrl.
   - Tag/untag.
   - Delete.
   - Show latest/oldest first.
   - Autocomplete tags when searching.
   - Allow for more than one tag to be searched at the same time.
   - See number of tags & date below each picture.
   - Rotate pictures.
   - Consider 1900-2100 as automatic tags for search.
   - Sort by newest, oldest & upload date.
   - Refresh list of files if there's an upload in the background.

- Account
   - Signup with invite.
   - Login/logout.
   - Recover/reset.

- Admin
   - Metering requests, downloads & space stored.
   - Block further uploads if storage limits are exceeded.

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

## Redis structure

```
- users:USERNAME (hash):
   username: STRING,
   email: STRING,
   pass: STRING,
   tier: STRING (one of tier1|tier2|tier3|tier4),
   s3:bget: INT (bytes GET from s3),
   s3:buse: INT (space used in S3),

- emails (hash): key is email, value is username

- invites (hash): key is email, value is {token: ..., sent: INT (date), accepted: UNDEFINED|INT (date)}

- verify (hash): key is token, value is email. Deleted after usage.

- upic:USERID (set): contains hashes of the pictures uploaded by an user, to check for repetition.

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
   date: INT (latest date within dates),
   t200: STRING or absent,
   by200: INT or absent,
   t900: STRING or absent,
   by900: INT or absent,
   xt2: INT or absent, number of thumb200 downloaded (also includes cache)
   xt9: INT or absent, number of thumb900 downloaded (also includes cache)
   xp: INT or absent, number of pics downloaded (also includes cache)

- pict:ID (set): list of all the tags belonging to the picture.

- tag:USERID:TAG (set): pic ids.

- shm:USERID (set): USERA:TAG, USERB:TAG (shared with me)

- sho:USERID (set): USERA:TAG, USERB:TAG (shared with others)

- tags:USERID (hash): list of all tags and the number of pictures for each. Also contains untagged field. Does not count pictures shared with the user.

- ulog:USER (list): stringified log objects with user activity. Leftmost is most recent.
   - For login:    {t: INT, a: 'log', r: 0|1, ip: STRING, ua: STRING}
   - For signup:   {t: INT, a: 'sig', r: 0|1, ip: STRING, ua: STRING}
   - For destroy:  {t: INT, a: 'des', r: 0|1}
   - For uploads:  {t: INT, a: 'upl', id: STRING}
   - For deletes:  {t: INT, a: 'del', id: STRING}
   - For rotates:  {t: INT, a: 'rot', id: STRING, d: 90|180|-90, o: STRING (pic orientation)}
   - For tags:     {t: INT, a: 'tag', tag: STRING, d: true|undefined, ids: [...]}
   - For shares:   {t: INT, a: 'sh1', tag: STRING, u: STRING}
   - For unshares: {t: INT, a: 'sh0', tag: STRING, u: STRING}

Used by giz:

- session:ID (string): value is username. Used for sessions. Expires automatically.

- token:ID (string): value is username. Used for password recovery. Expires automatically.

- users:USERNAME (hash): covered above, giz only cares about `pass`.
```

## License

acpic is written by [Altocode](https://altocode.nl) and released into the public domain.
