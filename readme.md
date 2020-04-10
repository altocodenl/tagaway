# ac;pic :: a home for your pictures

## About

ac;pic is an application that allows you to store and manage your pictures. ac;pic is built by [Altocode](https://altocode.nl). While the service itself is paid, Altocode freely shares the code for all purposes, including commercial ones.

To understand why we're sharing the source code of a commercial product, please read [our manifesto](http://federicopereiro.com/manifesto). If that's too long to read, in a nutshell: we want to share our code so that others can learn from it and contribute to us. Sharing is the way to progress.

All non-code documents related to the project are published in this [open folder](https://drive.google.com/drive/u/1/folders/11UPZHrHUT_ce2baN9s0K-CtfXYQOewG3).

## Status

ac;pic is currently under development and has not been launched yet. We aim to launch it in 2020.

The author wishes to thank [Browserstack](https://browserstack.com) for providing tools to test cross-browser compatibility.

## Functionality

### Core functions

1. **Upload**. Converse operation is **delete**.
2. **Tag**. Converse operation is **untag**. Complementary operation is **rotate**.
3. **Share**. Converse operation is **unshare**. Complementary operations are **accepting a shared tag** and **deleting a shared tag**.
4. **See**. No converse operation. Complementary operation is **download**.

Functions 1 through 3 modify the data; the last function is purely passive.

### Complementary functions

1. **Auth**.
2. **Account**. Complementary functions are **export** and **import**.
3. **Payment**.

## Security

If you find a security vulnerability, please disclose it to us as soon as possible (`info AT altocode.nl`). We'll work on it with the utmost priority.

## Features

### Todo next

- Pics
   - fix scroll height when having many tags
   - bug svgs after untagging and no pictures left
   - Paint picture a bit when selected
   - when removing tag, if no pictures left with that tag, remove tag from query

   - Fix moving pic grid when going from/to selecting/unselecting
   - When clicking on no man's land, unselect? Discuss with Ruben.
- see
   - When seeing, if list of pictures changes on background update, update the index correctly so that you don't lose the picture. same with rotating.
- upload
   - hide recent uploads
   - show ETA
   - fix number of pictures in upload when going
   - show number of duplicates skipped
   - don't redraw box of new uploads when other uploads are updated
   - mobile: show upload box as folders only, since there's no dropdown or perhaps no folders
   - Document

   - Upload flow
      - Put two buttons for downloading files or folder
      - Put two buttons for adding a tag or skipping/done adding tags
   - Show thumbnails of last 3 pictures on upload
   - Reduce top margin.
- Manage
   - delete tag, rename tag
- Server
   - s3 uploads in background
   - priority: important|critical on notifications
   - fix email going into spam

### Todo v0

- Pics
   - Show all pictures.
   - Sort by newest, oldest & upload date.
   - Select/unselect picture by clicking on it.
   - Multiple selection with shift.
   - When selecting pictures, see selection bar.
   - Hover on picture and see date.
   - Show untagged pictures.
   - See list of tags.
   - Query by tag or tags.
   - Show pictures according to the selected tags.
   - If there are selected pictures, toggle between browse mode & organize mode.
   - If query changes but selected pictures are still there, maintain their selection.
   - Filter tags when browsing.
   - Tag/untag.
   - Filter tags when tagging/untagging.
   - Rotate pictures.
   - Delete pictures.
   - When clicking on tag on the attach/unattach menu, remove selection and query the tag.

- Open
   - Open picture and trigger fullscreen.
   - If exit fullscreen, exit picture too.
   - Show date & picture position.
   - Use caret icons to move forward & backward.
   - Use arrow keys to move forward & backward.
   - Wrap-around if there are no more pictures.
   - Preload the next picture.
   - If exiting fullscreen, also exit picture.
   - Hide scrollbar on fullscreen and hide it again on exit.

- Upload
   - Allow only jpeg & png.
   - Auto thumbnail generation.
   - Server-side encryption (onto S3).
   - Store original pictures in S3 and pictures + thumbnails locally.
   - Ignore images that already were uploaded (by hash check).
   - Upload files from folder selection, files selection & drop.
   - See progress when uploading files, using a progress bar.
   - Add one or more tags to the upcoming upload batch.
   - See previous uploads.
   - Allow to go back to browse while files are being uploaded in the background.
   - Refresh list of pics periodically if there's an upload in the background.
   - Cancel current upload.

   - Document upload element & listeners

- Account & payment
   - Login/logout.
   - Signup with invite.
   - Store auth log.

- Admin
   - Store statistics.
   - Block further uploads if storage limits are exceeded.
   - See & send invites.

- Other
   - S3 & SES setup.
   - Set up dev & prod environments.

### Todo beta

- Pics
   - Load on scroll.
   - Hidden tags.
   - Enable GPS detection.
   - Set date manually.
   - Mobile/tablet design.
   - Download picture.

- Open
   - Show tags.

- Upload
   - Auto rotate using metadata.
   - Retry on error.
   - Notify of ignored files in upload.
   - Warn of leaving page if upload is going.
   - Report automatically for file extensions that are not allowed, for future expansion of formats.
   - Client-side hashes for fast duplicate elimination.
   - Client-side hashes to avoid deleted pictures on folder upload mode (with override).
   - Folder upload on mobile.
   - Upload video.

- Share & manage
   - Share/unshare with email: signup, login, or go straight if there's a session.
   - Mark tags shared with user with something.
   - If two shared tags from different users have the same name, put "@email".
   - Authorization to see or ignore share.
   - Share/unshare tag with a link (takes you to special page even if you're logged in, with go back to my pictures). Query against it as well with tags that are in those too?
   - Upload to shared tag.

- Account & payment
   - Recover/reset/change password.
   - Account page.
   - Delete account.
   - Change email, password & username.
   - Export all data.
   - Re-import your data (won't reset what you have. do it through the proper endpoints, change ids).
   - Log me out of all sessions.
   - Freeze me out (includes log me out of all sessions).
   - Payment.
   - Payment late: 2 week notice with download.

- Admin
   - Logout.
   - Invites: fix visual & clear boxes when done.
   - Retrieve stats & test endpoint.
   - User management.

- Other
   - Frontend tests.
   - Reference users internaly by id, not username.
   - Test for maximum capacity.
   - Report slow queries & slow redraws.
   - Migrate to gotoB v2
   - Security: figure out workaround for package-lock with nested dependencies that are not pegged.
   - ac;tools integration.
   - Favicon & icons.
   - Status & stats public page.
   - Spanish support.

### Todo maybe

- Pics
   - Filters.
   - Themes for the interface.
   - Add colors to tags?
   - Order pictures within tag? Set priorities! Manual order mode.

- Share & manage
   - QR code to share.
   - Create group that groups people.
   - Create tag that groups tags (can also have pictures directly assigned).

### Todo never

- Share
   - Comments.
   - Share to social platforms.
   - Serve images as hosting.
   - Share certain tags only on shared pictures.
   - Public profile pages.

## Server

General server approach outlined [here](https://github.com/fpereiro/backendlore).

### Routes

If any route fails with an internal error, a 500 code will be returned with body `{error: ...}`.

All `POST` requests must have a `content-type` header of `application/json` and their bodies must be valid JSON objects. The only exception is `POST /upload`, which must be of type `multipart/form-data`.

All non-auth routes (unless marked otherwise) will respond with a 403 error with body `{error: 'nocookie'}` if the user is not logged in.

If a cookie with invalid signature is sent along, the application will respond with a 403 error with body `{error: 'tampered'}`.

If a cookie with valid signature but that has already expired is sent along, the application will respond with a 403 error with body `{error: 'session'}`.

All POST requests (unless marked otherwise) must contain a `csrf` field equivalent to the `csrf` provided by a successfull call to `POST /auth/login`. This requirement is for CSRF prevention. In the case of `POST /upload`, the `csrf` field must be present as a field within the `multipart/form-data` form. If this condition is not met, a 403 error will be sent.

#### Request invite

- `POST /requestInvite`.
   - Body must be `{email: STRING}`, otherwise a 400 will be sent.

#### Auth routes

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

#### App routes

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

- `POST /upload`
   - Must be a multipart request (and it should include a `content-type` header with value `multipart/form-data`).
   - Must contain fields (otherwise, 400 with body `{error: 'field'}`).
   - Must contain one file (otherwise, 400 with body `{error: 'file'}`).
   - Must contain a field `uid` with an upload id (otherwise, 400 with body `{error: 'uid'}`. The `uid` groups different uploaded files into an upload unit, for UI purposes.
   - Must contain no extraneous fields (otherwise, 400 with body `{error: 'invalidField'}`). The only allowed fields are `uid`, `lastModified` and `tags`; the last one is optional.
   - Must contain no extraneous files (otherwise, 400 with body `{error: 'invalidFile'}`). The only allowed file is `pic`.
   - Must include a `lastModified` field that's parseable to an integer (otherwise, 400 with body `{error: 'lastModified'}`).
   - If it includes a `tag` field, it must be an array (otherwise, 400 with body `{error: 'tags'}`). None of them should be `'all`', `'untagged'` or a four digit string that when parsed to an integer is between 1900 to 2100 (otherwise, 400 with body `{error: 'tag: TAGNAME'}`).
   - The file uploaded must be `.png` or `.jpg` (otherwise, 400 with body `{error: 'format'}`).
   - If the same file exists for that user, a 409 is returned with body `{error: 'repeated'}`.
   - If the storage capacity for that user is exceeded, a 409 is returned with body `{error: 'capacity'}`.
   - If the upload is successful, a 200 is returned.

- `POST /delete`
   - Body must be of the form `{ids: [STRING, ...]}` (otherwise, 400 with body `{error: ...}`).
   - Array with ids can be empty.
   - All pictures must exist and user must be owner of the pictures, otherwise a 404 is returned.
   - There should be no repeated ids on the query, otherwise a 400 is returned.
   - If the deletion is successful, a 200 is returned.

- `POST /rotate`
   - Body must be of the form `{ids: [STRING, ...], deg: 90|180|-90}` (otherwise, 400 with body `{error: ...}`).
   - All pictures must exist and user must be owner of the pictures, otherwise a 404 is returned.
   - There should be no repeated ids on the query, otherwise a 400 is returned.
   - If the rotation is successful, a 200 is returned.

- `POST /tag`
   - Body must be of the form `{tag: STRING, ids: [STRING, ...], del: true|false|undefined}`
   - `tag` will be trimmed (any whitespace at the beginning or end of the string will be eliminated; space-like characters in the middle will be replaced with a single space).
   - `tag` cannot be a stringified integer between 1900 and 2100 inclusive. It also cannot be `all` or `untagged`, or any tag that when lowercased equals `all` or `untagged`.
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
   - `untagged` can be included on `body.tags` to retrieve untagged pictures.
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
   - If successful, returns a 200 with body `{username: STRING, email: STRING, type: STRING, created: INTEGER, usage: {limit: INTEGER, used: INTEGER}, logs: [...]}`.

#### Debugging routes

`POST /error`
   - This route does not require the user to be logged in.
   - Body must be JSON, otherwise a 400 is returned.

All the routes below require an admin user to be logged in.

#### Stats route

`GET /stats`
   - Publicly accessible.
   - Returns all public stats information.

#### Admin routes

`POST /admin/invites`
   - Body must be `{email: STRING, firstName: STRING}` and `body.email` must be an email, otherwise a 400 is returned with body `{error: ...}`.

`GET /admin/invites`
   - Returns an object where each key is an email and each value is an object of the form `{token: STRING, firstName: STRING, sent: INT, accepted: INT|undefined}`.

`POST /admin/invites/delete`
   - Body must be `{email: STRING}`.

### Statistics

1. uniques:
   - users: active users

2. stock:
   - byfs:          total bytes stored in FS
   - bys3:          total bytes stored in S3
   - byfs-USERNAME: total bytes stored in FS for USERNAME
   - bys3-USERNAME: total bytes stored in S3 for USERNAME
   - pics:          total pics
   - t200:          total thumbnails of size 200
   - t900:          total thumbnails of size 900
   - users:         total users

3. maximum:
   - ms-all:    maximum ms for successful requests for all endpoints
   - ms-auth:   maximum ms for successful requests for POST /auth
   - ms-pic:    maximum ms for successful requests for GET /pic
   - ms-thumb:  maximum ms for successful requests for GET /thumb
   - ms-upload: maximum ms for successful requests for POST /upload
   - ms-delete: maximum ms for successful requests for POST /delete
   - ms-rotate: maximum ms for successful requests for POST /rotate
   - ms-tag:    maximum ms for successful requests for POST /tag
   - ms-query:  maximum ms for successful requests for POST /query
   - ms-share:  maximum ms for successful requests for POST /share

4. stat:f (flow)
   - rq-user-USERNAME: total requests from USERNAME
   - rq-NNN:    total requests responded with HTTP code NNN
   - rq-bad:    total unsuccessful requests for all endpoints
   - rq-all:    total successful requests for all endpoints
   - rq-auth:   total successful requests for /auth
   - rq-pic:    total successful requests for /pic
   - rq-thumb:  total successful requests for /thumb
   - rq-upload: total successful requests for /upload
   - rq-delete: total successful requests for /delete
   - rq-rotate: total successful requests for /rotate
   - rq-tag:    total successful requests for /tag and /tags
   - rq-query:  total successful requests for /query
   - rq-share:  total successful requests for /share
   - ms-all:    total ms for successful requests for all endpoints
   - ms-auth:   total ms for successful requests for POST /auth
   - ms-pic:    total ms for successful requests for GET /pic
   - ms-thumb:  total ms for successful requests for GET /thumb
   - ms-upload: total ms for successful requests for POST /upload
   - ms-delete: total ms for successful requests for POST /delete
   - ms-rotate: total ms for successful requests for POST /rotate
   - ms-tag:    total ms for successful requests for POST /tag
   - ms-query:  total ms for successful requests for POST /query
   - ms-share:  total ms for successful requests for POST /share
   - ms-upload-hash:      total ms for hash check in POST /upload
   - ms-upload-capacity:  total ms for capacity check in POST /upload
   - ms-upload-format:    total ms for format check in POST /upload
   - ms-upload-fs:        total ms for FS operations in POST /upload
   - ms-upload-resize200: total ms for 200 resize operation in POST /upload
   - ms-upload-resize900: total ms for 900 resize operation in POST /upload
   - ms-upload-s3:        total ms for S3 upload in POST /upload
   - ms-upload-db:        total ms for info storage & DB processing in POST /upload

### Redis structure

```
- users:USERNAME (hash):
   pass: STRING
   username: STRING
   email: STRING
   type: STRING (one of tier1|tier2)
   created: INT

- emails (hash): key is email, value is username

- emailtoken:TOKEN (hash): key is token, value is email. Used to verify email addresses.

- invites (hash): key is email, value is {firstName: STRING, token: ..., sent: INT (date), accepted: UNDEFINED|INT (date)}

- verify (hash): key is token, value is email. Deleted after usage.

- csrf:SESSION (string): key is session, value is associated CSRF token.

- upic:USERID (set): contains hashes of the pictures uploaded by an user, to check for repetition.

- upicd:USERID (set): contains hashes of the pictures deleted by an user, to check for repetition when re-uploading files.

- thu:ID (string): id of the corresponding pic.

- pic:ID (hash)
   id: STRING (uuid)
   owner: STRING (user id)
   name: STRING
   dateup: INT (millis)
   dimw: INT (width in pixels)
   dimh: INT (height in pixels)
   bys3: INT (size in bytes in S3)
   byfs: INT (size in bytes in FS)
   hash: STRING
   dates: STRING (stringified array of dates belonging to the picture, normalized and sorted by earliest first)
   orientation: STRING (stringified array of orientation data) or absent
   deg: 90|-90|180 or absent
   date: INT (latest date within dates)
   t200: STRING or absent
   by200: INT or absent (size of 200 thumbnail in FS)
   t900: STRING or absent
   by900: INT or absent (size of 900 thumbnail in FS)
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
   - For deletes:         {t: INT, a: 'del', ids: [STRING, ...]}
   - For rotates:         {t: INT, a: 'rot', ids: [STRING, ...], deg: 90|180|-90}
   - For (un)tags:        {t: INT, a: 'tag', ids: [STRING, ...], tag: STRING, d: true|undefined (if true it means untag)}
   - For (un)shares:      {t: INT, a: 'sha', u: STRING, tag: STRING, d: true|undefined (if true it means unshare)}

- stat:...: statistics
   - stat:f:NAME:DATE: flow
   - stat:m:NAME:DATE: min
   - stat:M:NAME:DATE: max
   - stat:s:NAME:      stock
   - stat:s:NAME:DATE: stock change
   - stat:u:NAME:PERIOD:DATE: unique

Used by giz:

- session:ID (string): value is username. Used for sessions. Expires automatically.

- token:ID (string): value is username. Used for password recovery. Expires automatically.

- users:USERNAME (hash): covered above, giz only cares about `pass`.
```

## Client

### Elements

**Container**: `E.base`: depends on `Data.csrf` and `State.page`. Will only draw something if the client attempted to retrieve `Data.csrf`. Contains all other elements.

**Pages**:

1. `E.pics`
   - Depends on: `Data.tags`, `Data.pics`, `State.query`, `State.selected`, `State.filter`, `State.untag`, `State.newTag`.
   - Events:
      - `click -> rem State.selected`
      - `click -> set State.query.tags []|['untagged']`
      - `click -> toggle tag`
      - `click -> select all`
      - `click -> rem State.untag`
      - `click -> set State.untag true`
      - `click -> tag TAG`
      - `click -> untag TAG`
      - `click -> rotate pics`
      - `click -> delete pics`
      - `input -> set State.newTag`
      - `input -> set State.filter`
      - `click -> goto tag`
2. `E.upload`
   - Depends on: `Data.account`, `State.currentUpload`.
   - Events:
      - `click -> upload`
3. `E.share`
4. `E.tags`
5. Auth:
   5.1 `E.login`
      - Events: `click -> login`
   5.2 `E.signup`
      - Depends on: `Data.signup.username`.
      - Events: `click -> signup`
   5.3 `E.recover`
   5.4 `E.reset`

**Other**:

1. `E.logo`
   - Contained by: `E.header`.
2. `E.snackbar`
   - Depends on: `State.snackbar`.
   - Events: `click -> clear snackbar`.
   - Contained by: `E.base`.
3. `E.header`
   - Events: `click -> logout`
   - Contained by: `E.pics`, `E.upload`, `E.share`, `E.tags`.
4. `E.empty`
   - Contained by: `E.pics`.
5. `E.grid`
   - Contained by: `E.pics`.
   - Depends on `Data.pics`.
   - Events: `click -> click pic`.
6. `E.open`
   - Contained by: `E.pics`.
   - Depends on `State.open`.
   - Events: `click -> open prev`, `click -> open next`, `click -> exit fullscreen`, `rotate pics 90 PIC`.

### Listeners

1. Native
   1. `error` -> `error`
   2. `hashchange` -> `read hash`
   3. `keydown` -> `key down KEYCODE`
   4. `keyup` -> `key up KEYCODE`
   5. `scroll` -> `scroll [] EVENT`
   6. `beforeunload` -> `exit app`
   7. `webkitfullscreenchange|mozfullscreenchange|fullscreenchange|MSFullscreenChange` -> `exit fullscreen`
   8. `dragover` -> do nothing
   9. `drop` -> `drop files EVENT`

1. General
   1. `initialize`: calls `reset store`, `read hash` and `retrieve csrf`. Finally mounts `E.base` in the body. Executed at the end of the script. Burns after being matched.
   2. `reset store`: (Re)initializes `B.store.State` and `B.store.Data` to empty objects and sets the global variables `State` and `Data` to these objects (so that they can be quickly printed from the console). If its first argument (`logout`) is truthy, it also clears out `B.r.log` (to remove all user data from the local event log) and sets `Data.csrf` to `false` (which indicates that the current page should be `login`).
   3. `clear snackbar`: clears the timeout in `State.snackbar.timeout` (if present) and removes `State.snackbar`.
   4. `snackbar`: calls `clear snackbar` and sets `State.snackbar` (shown in a snackbar) for 4 seconds. Takes a path with the color (`green|red`) and the message to be printed as the first argument.
   5. `get` & `post`: wrapper for ajax functions.
      - `path` is the HTTP path (the first path member, the rest is ignored and actually shouldn't be there).
      - Takes `headers`, `body` and optional `cb`.
      - Removes last log to excise password or token information from `B.r.log`.
      - Adds `Data.csrf` to `POST` requests.
      - If 403 is received and it is not an auth route or `GET csrf`, calls `reset store` (with truthy `logout` argument) and `snackbar`.
   6. `error`: submits browser errors (from `window.onerror`) to the server through `post /error`.
   7. `read hash`: places the first part of `window.location.hash` into (`State.page`). If the page is `signup`, it reads the second part of the hash and stores it into `Data.signup`, then modifies the hash to get rid of the extra information once it is in the store.
   8. `change State.page`: validates whether a certain page can be shown, based on 1) whether the page exists; and 2) the user's session status (logged or unlogged) allows for showing it. Optionally sets/removes `State.redirect`, `State.page` and overwrites `window.location.hash`.
   9. `test`: loads test suite.

2. Auth
   1. `retrieve csrf`: takes no arguments. Calls `get /csrf`. In case of non-403 error, calls `snackbar`; otherwise, it sets `Data.csrf` to either the CSRF token returned by the call, or `false` if the server replied with a 403. Also triggers a `change` on `State.page` so that the listener that handles page changes gets fired.
   2. `change Data.csrf`: when it changes, it triggers a change in `State.page` to potentially update the current page.
   3. `login`: calls `post /auth/login. In case of error, calls `snackbar`; otherwise, it updates `Data.csrf`.
   4. `logout`: takes no arguments. Calls `post /auth/logout`). In case of error, calls `snackbar`; otherwise, calls `reset store` (with truthy `logout` argument).
   5. `signup`: calls `post /auth/signup. In case of error, calls `snackbar`; otherwise, it updates `Data.csrf`.

3. Pics
   1. `change []`: stopgap listener to add svg elements to the page until gotoB v2 (with `LITERAL` support) is available.
   2. `change State.page`: if current page is `pics` and there's no `State.query`, it initializes it to `{tags: [], sort: 'newest'}`; otherwise, it invokes `query pics`. It also invokes `query tags`.
   3. `change State.query`: invokes `query pics`.
   4. `change State.selected`: adds & removes classes from `#pics`, adds & removes `selected` class from pictures in `E.grid` (this is done here for performance purposes, instead of making `E.grid` redraw itself when the `State.selected` changes)  and optionally removes `State.untag`.
   5. `change State.untag`: adds & removes classes from `#pics`.
   6. `query pics`: invokes `post query`, using `State.query`. Updates `State.selected` and sets `Data.pics` after invoking `post query`.
   7. `click pic`: depends on `State.lastClick`, `State.selected` and `State.shift`. If it registers a double click on a picture, it removes `State.selected.PICID` and sets `State.open`. Otherwise, it will change the selection status of the picture itself; if `shift` is pressed and the previous click was done on a picture still displayed, it will perform multiple selection.
   8. `key down|up`: if `keyCode` is 16, toggle `State.shift`; if `keyCode` is 13 and `#newTag` is focused, invoke `tag pics`.
   9. `toggle tag`: if tag is in `State.query.tags`, it removes it; otherwise, it adds it.
   10. `select all`: sets `State.selected` to all the pictures in the current query.
   11. `query tags`: invokes `get tags` and sets `Data.tags`.
   12. `tag pics`: invokes `post tag`, using `State.selected`. In case the query is successful it invokes `query pics` and `query tags`. Also invokes `snackbar`.
   13. `rotate pics`: invokes `post rotate`, using `State.selected`. In case the query is successful it invokes `query pics`. In case of error, invokes `snackbar`. If it receives a second argument (which is a picture), it submits its id instead of `State.selected`.
   14. `delete pics`: invokes `post delete`, using `State.selected`. In case the query is successful it invokes `query pics` and `query tags`. In case of error, invokes `snackbar`.
   15. `goto tag`: clears up `State.selection` and sets `State.query.tags` to the selected tag.

4. Open
   1. `key down`: if `State.open` is set, invokes `open prev` (if `keyCode` is 37) or `open next` (if `keyCode` is 39).
   2. `enter fullscreen`: enter fullscreen using the native browser methods and set the `<body>` `overflow` to `hidden`.
   3. `exit fullscreen`: if `State.open` is present, remove it. Depending on the `exited` flag passed to the invocation, exit fullscreen using the native browser methods. Also remove the `<body>` `overflow` property so it reverts to the defaut.
   4. `change State.open`: remove or add `app-fullscreen` class from `#pics`, depending on whether `State.open` is defined. If `State.open` is defined, it invokes `enter fullscreen`.
   5. `open prev|next`: decrements or increments `State.open`, with wraparound if going back when on the first picture or when going forward on the last picture.

5. Upload
   1. `drop files`: if `State.page` is upload, access dropped files or folders and put them on the upload file input.

### Store

- `State`:
   - `filter`: filters tags shown in sidebar.
   - `lastClick`: if present, has the shape `{id: PICID, time: INT}`. Used to determine 1) a double-click (which would open the picture in full); 2) range selection with shift.
   - `newTag`: the name of a new tag to be posted.
   - `open`: index of the picture to be shown in full-screen mode.
   - `page`: determines the current page.
   - `redirect`: determines the page to be taken after logging in, if present on the original `window.location.hash`.
   - `query`: determines the current query for pictures. Has the shape: `{tags: [...], sort: 'newest|oldest|upload'}`.
   - `selected`: an object where each key is a picture id and every value is either `true` or `false`. If a certain picture key has a corresponding `true` value, the picture is selected.
   - `snackbar`: prints a snackbar. If present, has the shape: `{color: STRING, message: STRING, timeout: TIMEOUT_FUNCTION}`. `timeout` is the function that will delete `State.snackbar` after a number of seconds. Set by `snackbar` event.
   - `untag`: flag to mark that we're untagging pictures instead of tagging them.
   - `upload`:
      - `new`: {files: [...], tags: [...]|UNDEFINED}
      - `queue`: [{file: ..., uid: STRING, tags: [...]|UNDEFINED, uploading: true|UNDEFINED}, ...]
      - `tag`: content of input to filter tag or add a new one.

- `Data`:
   - `account`: `{username: STRING, email: STRING, type: STRING, created: INTEGER, usage: {limit: INTEGER, used: INTEGER}, logs: [...]}`.
   - `csrf`: if there's a valid session, contains a string which is a CSRF token. If there's no session (or the session expired), set to `false`. Useful as both a CSRF token and to tell the client whether there's a valid session or not.
   - `pics`: `[...]`; comes from `body.pics` from `query pics`.
   - `signup`: `{username: STRING, token: STRING, email: STRING}`. Sent from invitation link and used by `signup []`.
   - `tags`: `{TAGNAME: INT, ...}`. Also includes keys for `all` and `untagged`.

## Admin

Only things that differ from client are noted.

### Elements

**Pages**:

1. `E.dashboard`
2. `E.invites`
   - Depends on: `Data.invites`, `State.newInvite`
   - Events:
      - `click -> create invite`
      - `click -> delete invite`
      - `change -> set State.newInvite.*`
      - `click -> del State.newInvite`

### Listeners

1. Invites
   1. `retrieve invites`: invokes `get admin/invites`.
   2. `create invite`: invokes `post admin/invites` with `State.newInvite`; if successful, invokes `retrieve invites`, otherwise it invokes `snackbar`.
   3. `delete invite`: invokes `delete admin/invites/EMAIL`; if successful, invokes `retrieve invites`, otherwise it invokes `snackbar`.
   2. `change State.page`: if current page is `invites` and there's no `Data.invites`, it invokes `retrieve invites`.

### Store

- `State`:
   - `newInvite`: `{email: STRING, firstName: STRING}`.

- `Data`:
   - `invites`: `{EMAIL: {firstName: STRING, token: STRING, sent: INT, accepted: INT|UNDEFINED}, ...}`.

## Version history

- Alpha/v0: bfa9ad50b5e54c78ba804ba35fe1f6310e55dced

## License

ac;pic is written by [Altocode](https://altocode.nl) and released into the public domain.
