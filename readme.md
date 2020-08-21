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

### Todo v1 now

- [FEATURE - INVITE EMAIL] Remove colors and format from email text:
'
ac;pic

Hi [uName],
You have been officially invited to join ac;pic!
<br>
<a href="">Please click on this link to create your account.</a>
<br>
Have an amazing [dayOfWeek]!
<br>
The ac;pic team
'
- [BUG - SIGN UP]: If user enters an already used username, there's no feedback. Red snackbar of "That username is already in use" should appear.
- [FEATURE - SIGN UP]: If user enters an email as username, we have a yellow snackbar of 'Your username cannot contain an @ sign.' on clicking "create account". It would be better to have "Your username cannot be an email".
- [FEATURE - SIGN UP] If user enters missmatching passwords, we have red snackbar "Please enter the same password twice." on clicking "create account". It would be better to have "Repeated password does not match.". By telling the user that "the repeated password does not match" we're reducing friction and pointing to the exact problem.
- [FEATURE - WELCOME EMAIL]: Remove format from email.
- [FEATURE - UPLOAD]: If in middle of upload process 'cancel' is clicked, the green snackbar "Upload completed successfully. You can see the pictures in the "View Pictures" section." appears. We should have a green snackbar "Upload successfully cancelled. [x] where uploaded". Otherwise user might be confused if uploading process was indeed cancelled.
- [FEATURE - GEOTAGGING] As of now geotagging doesn't work unless the user refreshes page. If we can make it work without the user refreshing, great (in which case we should tell the user to wait a few seconds for the tags to appear). If not, we have to let the user know.
- [FEATURE - GEOTAGGING] When turned on or off, snackbar reads 'Understood! You can always turn on geotagging from My Account.' UI best practices say: Don’t use “you” and “your” with “me” and “my” in the same sentence. It is very confusing and can throw off your readers. Try to avoid using them in the same context when addressing the user. For example, instead of saying “Change your preferences in My Account”, use “Change preferences in My Account”. (sources: https://material.io/design/communication/writing.html#principles https://www.uxpin.com/studio/blog/13-ways-to-make-your-ui-writing-better/ http://babich.biz/effective-writing-for-your-ui-things-to-avoid/). Not sure on better wording for this snackbar. To be discussed.
- [BUG - TAG VIEW] Select a tag in 'sidebar left' > Click on 'untagged' on sidebar left. App freezes. No navigation possible, images don't open.
- [BUG GEOTAGGING - UNTAGGED | INCONSISTENCIES: on 2 different dev environments, in one appears in another one it doesn't] Geo icons do are not displayed on sidebar left when view is in 'untagged'.
- [FEATURE - UNTAGGED] When mixed with other queries (ie: year) the 'eye' icon dissapears from sidebar left next to 'untagged'. It should be there, in the same way as it is there on CITY tags and regular tags. There has to be clear markings on sidebar left as well as querie array below title.
- Untagged tagging: add "done tagging" button, "sticky untagged" pictures: remove on taking out untagged from query or querying another tag.
- request t200 or t900 directly referring to ids, remove t200/t900 from returned payloads.

- check delete account if picture belongs to more than one tag.
- endpoint to delete account.
- fix line 1526 untagged picture with geotagging
- no eye on untagged + year/geotag
- when cancelling upload, recognize that in the snackbar.

- Dynamize
   - Basic account view
   - Paid plan landing
   - Running out of space box (import & upload)

- Import from GDrive/Dropbox.
   - Import is list, then upload (pass param to upload). Import in db, but uploads on log one at a time.
   - Import stops if: 1) API error; 2) space limit.
   - Email when import done or stopped.
- Paid accounts.

### Alpha version (DONE)

- Pics
   - Show all pictures.
   - Load more pictures on scroll.
   - Sort by newest, oldest & upload date.
   - Select/unselect picture by clicking on it.
   - Multiple selection with shift.
   - Select/unselect all.
   - When selecting pictures, see selection bar.
   - Hover on picture and see date.
   - Show untagged pictures.
   - When querying untagged tag, remove non-year and non-geo tags. When querying normal tag, remove untagged tag.
   - When modifying pictures with `untagged` in the query, add button for confirming operation; show alert if user navigates away.
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
   - Ignore rotation of videos.
   - When clicking on tag on the attach/unattach menu, remove selection and query the tag.
   - When untagging, if no pictures left with that tag, remove tag from query.
   - Fill pictures grid until screen is full or no pictures remain.
   - Download a single picture.
   - Download multiple pictures as one zip file.
   - Only show tags relevant to the current query.
   - When just enabling geotagging, update tags every 3 seconds.
   - Suggest geotagging when having a few pictures uploaded, but only once; either enable it or dismiss the message, and don't show it again.
   - When clicking on no man's land, unselect.

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
   - If video, show thumbnail & controls.
   - Mobile: no padding, swipe left/right.
   - If upload is happening in the background, keep the current picture open but update the counter on the bottom right.
   - Warn of leaving page if upload is ongoing.

- Upload
   - Allow only jpeg, png & video.
   - Auto thumbnail generation.
   - Server-side encryption (onto S3).
   - Store original pictures in S3 and pictures + thumbnails locally.
   - Ignore images that already were uploaded (by hash check, ignoring metadata).
   - Upload files from folder selection, files selection & drop.
   - See progress when uploading files, using a progress bar.
   - Add one or more tags to the upcoming upload batch.
   - See previous uploads.
   - Auto rotate based on metadata.
   - Allow to go back to browse while files are being uploaded in the background.
   - Refresh list of pics periodically if there's an upload in the background.
   - Show thumbnail of last picture on each upload.
   - Cancel current upload.
   - Mobile: show upload box as folders only, since there's no dropdown or perhaps no folders.
   - Snackbar with success message when pics are finished uploading.
   - Show errors.

- Account & payment
   - Login/logout.
   - Signup with invite.
   - Store auth log.
   - Enable/disable geotagging.

- Admin
   - Store statistics.
   - Block further uploads if storage limits are exceeded.
   - See & send invites.

- Other
   - S3 & SES setup.
   - Set up dev & prod environments.

### v1

- Pics
   - Basic mobile design.

- Open
   - Show tags.

- Upload
   - Retry on error.
   - Show estimated time remaining in ongoing uploads.
   - Report automatically for file extensions that are not allowed, for future expansion of formats.
   - Support 3gp, mov, heic, avi. Check for actual file type in server, not just extension.
   - Ignore deleted pictures flag.
   - New upload flow
      - Starting state: area from dropdown & button for files & button for folder upload.
      - Uploading state: button for starting new upload and button for starting tagging state.
      - Tagging state: input with button to add tags, also dropdown to select existing tags to add to current upload.

- Account & payment
   - Account page.
   - Recover/reset password.
   - Payment.
   - Change email, password & username.
   - Delete account.
   - Export/import all data.
   - Log me out of all sessions.
   - Freeze me out (includes log me out of all sessions).
   - Payment late flow: freeze uploads, email, auto-delete by size.

- Share & manage
   - Delete tag.
   - Rename tag.
   - Share/unshare with email: signup, login, or go straight if there's a session.
   - Mark tags shared.
   - Mark tags shared with me.
   - If two shared tags from different users have the same name, put "@username".
   - Authorization to see or ignore share.

- Admin
   - Retrieve stats & test endpoint.
   - User management.

- Other
   - Set up proper lifecycle of pics bucket in S3.
   - Frontend tests.
   - Disable THP for redis.
   - Reference users internaly by id, not username.
   - Test for maximum capacity.
   - Report slow queries & slow redraws.
   - Migrate to gotoB v2
   - Security: figure out workaround for package-lock with nested dependencies that are not pegged.
   - ac;tools integration.
   - Favicon & icons.
   - Status & stats public page.
   - Spanish support.

- Bugs
   - Intermittent 403 from GET csrf when already being logged in.

### Future

- Pics
   - Hidden tags.
   - Set date manually.
   - Filters.
   - Themes for the interface.
   - Set colors of tags?
   - Order pictures within tag? Set priorities! Manual order mode.

- Share & manage
   - Upload to shared tag.
   - Public tag, including download restrictions per picture?
   - QR code to share.
   - Create group that groups people.
   - Create tag that groups tags (can also have pictures directly assigned).

### Never

- Share
   - Comments.
   - Share to social platforms.
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
   - The trimmed `username` must have at least 3 characters and `password` must have at least 6 characters.
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

- `GET /thumbof/ID`
   - Gets the smallest thumbnail (or the picture, if the picture has none) of the picture with id ID.
   - Picture must exist and the user must have permissions to see it (otherwise, 404).
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
   - The file uploaded must be `.png`, `.jpg` or `.mp4` (otherwise, 400 with body `{error: 'format'}`).
   - If the same file exists for that user, a 409 is returned with body `{error: 'repeated'}`.
   - If the storage capacity for that user is exceeded, a 409 is returned with body `{error: 'capacity'}`.
   - If the upload is successful, a 200 is returned with body `{id: ID, deg: 90|180|-90|undefined}`, where `ID` is the ID of the picture just uploaded and `deg` is the rotation automatically applied to the picture based on its metadata.

- `POST /delete`
   - Body must be of the form `{ids: [STRING, ...]}` (otherwise, 400 with body `{error: ...}`).
   - Array with ids can be empty.
   - All pictures must exist and user must be owner of the pictures, otherwise a 404 is returned.
   - There should be no repeated ids on the query, otherwise a 400 is returned.
   - If the deletion is successful, a 200 is returned.

- `POST /rotate`
   - Body must be of the form `{ids: [STRING, ...], deg: 90|180|-90}` (otherwise, 400 with body `{error: ...}`).
   - All pictures must exist and user must be owner of the pictures, otherwise a 404 is returned.
   - Videos will not be rotated and will be silently ignored.
   - There should be no repeated ids on the query, otherwise a 400 is returned.
   - If the rotation is successful, a 200 is returned.

- `POST /tag`
   - Body must be of the form `{tag: STRING, ids: [STRING, ...], del: true|false|undefined}`
   - `tag` will be trimmed (any whitespace at the beginning or end of the string will be eliminated; space-like characters in the middle will be replaced with a single space).
   - `tag` cannot be a stringified integer between 1900 and 2100 inclusive. It also cannot be `all` or `untagged`, or any tag that when lowercased equals `all` or `untagged`.
   - `tag` cannot start with `g::`.
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
   - If the query is successful, a 200 is returned with body `pics: [{...}], total: INT, tags: [...]}`.
      - Each element within `body.pics` is an object corresponding to a picture and contains these fields: `{date: INT, dateup: INT, id: STRING, t200: STRING|UNDEFINED, t900: STRING|UNDEFINED, owner: STRING, name: STRING, dimh: INT, dimw: INT, tags: [STRING, ...], deg: INT|UNDEFINED, vid: true|UNDEFINED}`.
      - `body.total` contains the number of total pictures matched by the query (notice it can be larger than the amount of pictures in `body.pics`).
      - `body.tags` contains all the tags relevant to the current query - if any of these tags is added to the tags sent on the request body, the result of the query will be non-empty.

`POST /share`
   - Body must be of the form `{tag: STRING, who: ID, del: BOOLEAN|UNDEFINED}`.
   - The target user (`body.who`) must exist, otherwise a 404 is returned.
   - If the tag being shared is `all` or `untagged`, a 400 is returned with body `{error: 'tag'}`.
   - If try to share with yourself, a 400 is returned with body `{error: 'self'}`.
   - If successful, returns a 200.

`GET /share`
   - If successful, returns a 200 with body `{sho: [[USERNAME1, TAG1], ...], shm: [[USERNAME2, TAG2], ...]}`.
   - `body.sho` lists the tags shared with others by the user. `body.shm` lists the tags shared with the user.

`POST /download`
   - Body must be of the form `{ids: [STRING, ...]}` (otherwise, 400 with body `{error: ...}`).
   - `body.ids` must have at least a length of 2.
   - All pictures must exist and user must be owner of the pictures or have the pictures shared with them, otherwise a 404 is returned.
   - If successful, returns a 200 with body `{id: STRING}`. The `id` corresponds to a temporary download file that lasts 5 seconds and is only valid for the user that requested the download.

`GET /download/ID`
   - `ID` is an id returned by `POST /download`.
   - If successful, the user will receive a zip file with the specified pictures.

`POST /geo`
   - Enables or disables geotagging.
   - Body must be of the form `{operation: 'enable|disable|dismissSuggestion'}`.
   - If an operation is ongoing while the request is being made, the server will reply with a 409 code. Otherwise it will reply with a 200 code.
   - In the case of enabling geotagging, a server reply doesn't mean that the geotagging is complete, since it's a background process that might take minutes. In contrast, when disabling geotagging a 200 response will be sent after the geotags are removed, without the need for a background p rocess.

`GET /account`
   - If successful, returns a 200 with body `{username: STRING, email: STRING, type: STRING, created: INTEGER, usage: {limit: INTEGER, fsused: INTEGER, s3used: INTEGER}, logs: [...], geo: true|undefined, geoInProgress: true|undefined}`.

#### Debugging routes

`POST /error`
   - This route does not require the user to be logged in.
   - Body must be JSON, otherwise a 400 is returned.

All the routes below require an admin user to be logged in.

#### Stats route

`GET /stats`
   - Publicly accessible.
   - Returns all public stats information, with the shape `{byfs: INT, bys3: INT, pics: INT, t200: INT, t900: INT, users: INT}`.

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
   - vids:          total vids
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
   - ms-geo:    maximum ms for successful requests for POST /geo
   - ms-s3put:  maximum ms for successful uploads to S3
   - ms-s3del:  maximum ms for successful deletions to S3

4. stat:f (flow)
   - rq-user-USERNAME: total requests from USERNAME
   - rq-NNN:    total requests responded with HTTP code NNN
   - rq-bad:    total unsuccessful requests for all endpoints
   - rq-all:    total successful requests for all endpoints
   - rq-auth:   total successful requests for POST /auth
   - rq-pic:    total successful requests for GET /pic
   - rq-thumb:  total successful requests for GET /thumb
   - rq-upload: total successful requests for POST /upload
   - rq-delete: total successful requests for POST /delete
   - rq-rotate: total successful requests for POST /rotate
   - rq-tag:    total successful requests for POST /tag and /tags
   - rq-query:  total successful requests for POST /query
   - rq-share:  total successful requests for POST /share
   - rq-geo:    total successful requests for POST /geo
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
   - ms-geo:    total ms for successful requests for POST /geo
   - ms-upload-hash:      total ms for hash check in POST /upload
   - ms-upload-capacity:  total ms for capacity check in POST /upload
   - ms-upload-format:    total ms for format check in POST /upload
   - ms-upload-fs:        total ms for FS operations in POST /upload
   - ms-upload-resize200: total ms for 200 resize operation in POST /upload
   - ms-upload-resize900: total ms for 900 resize operation in POST /upload
   - ms-upload-s3:        total ms for S3 upload in POST /upload (no longer in use after S3 uploads are done in the background)
   - ms-upload-db:        total ms for info storage & DB processing in POST /upload

### Redis structure

```
- users:USERNAME (hash):
   pass: STRING
   username: STRING
   email: STRING
   type: STRING (one of tier1|tier2)
   created: INT
   geo: 1|undefined

- geo:USERNAME: INT|undefined, depending on whether there's an ongoing process to enable geotagging for the user.

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
   byfs: INT (size in bytes in FS)
   hash: STRING
   dates: STRING (stringified array of dates belonging to the picture, normalized and sorted by earliest first)
   deg: INT 90|-90|180 or absent
   date: INT (latest date within dates)
   t200: STRING or absent
   by200: INT or absent (size of 200 thumbnail in FS)
   t900: STRING or absent
   by900: INT or absent (size of 900 thumbnail in FS)
   vid: `1` or absent
   xt2: INT or absent, number of thumb200 downloaded (also includes cached hits)
   xt9: INT or absent, number of thumb900 downloaded (also includes cached hits)
   xp:  INT or absent, number of pics downloaded (also includes cache)
   loc: [INT, INT} or absent - latitude and longitude of picture taken from metadata, only if geotagging is enabled for the pic's owner.

- pict:ID (set): list of all the tags belonging to a picture.

- tag:USERID:TAG (set): pic ids.

- tags:USERID (set): list of all tags created by the user. Does not include tags shared with the user.

- shm:USERID (set): USERA:TAG, USERB:TAG (shared with me)

- sho:USERID (set): USERA:TAG, USERB:TAG (shared with others)

- download:ID (string): stringified object of the shape `{username: ID, pics: [{owner: ID, id: ID, name: STRING}, {...}, ...]}`. Expires after 5 seconds.

- ulog:USER (list): stringified log objects with user activity. Leftmost is most recent.
   - For login:           {t: INT, a: 'log', ip: STRING, ua: STRING, tz: INTEGER}
   - For signup:          {t: INT, a: 'sig', ip: STRING, ua: STRING}
   - For recover:         {t: INT, a: 'rec', ip: STRING, ua: STRING, token: STRING}
   - For reset:           {t: INT, a: 'res', ip: STRING, ua: STRING, token: STRING}
   - For password change: {t: INT, a: 'chp', ip: STRING, ua: STRING, token: STRING}
   - For destroy:         {t: INT, a: 'des', ip: STRING, ua: STRING}
   - For uploads:         {t: INT, a: 'upl', id: STRING, uid: STRING (id of upload), tags: ARRAY|UNDEFINED, deg:90|-90|180|UNDEFINED}
   - For deletes:         {t: INT, a: 'del', ids: [STRING, ...]}
   - For rotates:         {t: INT, a: 'rot', ids: [STRING, ...], deg: 90|180|-90}
   - For (un)tags:        {t: INT, a: 'tag', ids: [STRING, ...], tag: STRING, d: true|undefined (if true it means untag)}
   - For (un)shares:      {t: INT, a: 'sha', u: STRING, tag: STRING, d: true|undefined (if true it means unshare)}
   - For geotagging:      {t: INT, a: 'geo', op: 'enable|disable|dismiss'}

- stat:...: statistics
   - stat:f:NAME:DATE: flow
   - stat:m:NAME:DATE: min
   - stat:M:NAME:DATE: max
   - stat:s:NAME:      stock
   - stat:s:NAME:DATE: stock change
   - stat:u:NAME:PERIOD:DATE: unique

- s3:...: S3 management
   - s3:queue (list): items yet to be processed
   - s3:proc (string): number of queue items being processed
   - s3:files (hash): each key is the name of the object in S3, each value is `true|INT` - if `true`, it means that the upload is ongoing; if INT, it shows the amount of bytes taken by the file in S3.

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
   - Depends on: `Data.tags`, `Data.pics`, `Data.queryTags`, `Data.account`, `State.query`, `State.selected`, `State.filter`, `State.untag`, `State.newTag`.
   - Events:
      - `click -> stop propagation`
      - `click -> rem State.selected`
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
   - Depends on: `State.upload.summary`, `State.upload.new`, `Data.tags`, `State.upload.tag`, `State.upload.queue`
   - Events:
      - `onchange -> upload files|folder`
      - `onclick -> rem State.upload.new`
      - `oninput -> set State.upload.tag`
      - `onclick -> upload tag`
      - `onclick -> rem State.upload.new.tags.INDEX`
      - `onclick -> upload start`
      - `onclick -> upload cancel`
3. `E.share`
4. `E.tags`
5. `E.import`
6. `E.account`
7. Auth:
   7.1 `E.login`
      - Events: `click -> login`
   7.2 `E.signup`
      - Depends on: `Data.signup.username`.
      - Events: `click -> signup`
   7.3 `E.recover`
   7.4 `E.reset`

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
   - Depends on `State.nPics` and `Data.pics`.
   - Events: `click -> click pic`.
6. `E.open`
   - Contained by: `E.pics`.
   - Depends on `State.open`.
   - Events: `click -> open prev`, `click -> open next`, `click -> exit fullscreen`, `rotate pics 90 PIC`, `goto location PIC`.

### Responders

1. Native
   1. `error` -> `error`
   2. `hashchange` -> `read hash`
   3. `keydown` -> `key down KEYCODE`
   4. `keyup` -> `key up KEYCODE`
   5. `scroll` -> `scroll [] EVENT`
   6. `beforeunload` -> if `State.upload.queue` is not empty, prompt the user before exiting the app.
   7. `webkitfullscreenchange|mozfullscreenchange|fullscreenchange|MSFullscreenChange` -> `exit fullscreen`
   8. `dragover` -> do nothing
   9. `drop` -> `drop files EVENT`
   10. `touchstart` -> `touch start`
   11. `touchend` -> `touch end`

1. General
   1. `initialize`: calls `reset store`, `read hash` and `retrieve csrf`. Finally mounts `E.base` in the body. Executed at the end of the script. Burns after being matched. Also sets viewport width for zooming out in mobile.
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
   1. `retrieve csrf`: takes no arguments. Calls `get /csrf`. In case of non-403 error, calls `snackbar`; otherwise, it sets `Data.csrf` to either the CSRF token returned by the call, or `false` if the server replied with a 403. Also triggers a `change` on `State.page` so that the responder that handles page changes gets fired.
   2. `change Data.csrf`: when it changes, it triggers a change in `State.page` to potentially update the current page.
   3. `login`: calls `post /auth/login. In case of error, calls `snackbar`; otherwise, it updates `Data.csrf`.
   4. `logout`: takes no arguments. Calls `post /auth/logout`). In case of error, calls `snackbar`; otherwise, calls `reset store` (with truthy `logout` argument).
   5. `signup`: calls `post /auth/signup`. In case of error, calls `snackbar`; otherwise, it updates `Data.csrf`.
   6. `request invite`: calls `post /requestInvite`. Calls `snackbar` with either an error or a success message.

3. Pics
   1. `change []`: stopgap responder to add svg elements to the page until gotoB v2 (with `LITERAL` support) is available.
   2. `change State.page`: if current page is not `pics`, it does nothing. If there's no `Data.account`, it invokes `query account`. If there's no `State.query`, it initializes it to `{tags: [], sort: 'newest'}`; otherwise, it invokes `query pics`. It also invokes `query tags`. It also triggers a `change` in `State.selected` to mark the selected pictures if coming back from another view.
   3. `change State.query`: sets `State.npics` and invokes `query pics`.
   4. `change State.selected`: adds & removes classes from `#pics`, adds & removes `selected` class from pictures in `E.grid` (this is done here for performance purposes, instead of making `E.grid` redraw itself when the `State.selected` changes)  and optionally removes `State.untag`.
   5. `change State.untag`: adds & removes classes from `#pics`; if `State.selected` is empty, it will only remove classes, not add them.
   6. `query pics`: invokes `post query`, using `State.query`. Updates `State.selected`, and sets `Data.pics` (and optionally `State.open` if it's already present) after invoking `post query`. Also sets `Data.queryTags`.
   7. `click pic`: depends on `State.lastClick`, `State.selected` and `State.shift`. If it registers a double click on a picture, it removes `State.selected.PICID` and sets `State.open`. Otherwise, it will change the selection status of the picture itself; if `shift` is pressed and the previous click was done on a picture still displayed, it will perform multiple selection.
   8. `key down|up`: if `keyCode` is 16, toggle `State.shift`; if `keyCode` is 13 and `#newTag` is focused, invoke `tag pics`; if `keyCode` is 13 and `#uploadTag` is focused, invoke `upload tag`.
   9. `toggle tag`: if tag is in `State.query.tags`, it removes it; otherwise, it adds it.
   10. `select all`: sets `State.selected` to all the pictures in the current query.
   11. `query tags`: invokes `get tags` and sets `Data.tags`. It checks whether any of the tags in `State.query.tags` no longer exists and removes them from there.
   12. `tag pics`: invokes `post tag`, using `State.selected`. In case the query is successful it invokes `query pics` and `query tags`. Also invokes `snackbar`.
   13. `rotate pics`: invokes `post rotate`, using `State.selected`. In case the query is successful it invokes `query pics`. In case of error, invokes `snackbar`. If it receives a second argument (which is a picture), it submits its id instead of `State.selected`.
   14. `delete pics`: invokes `post delete`, using `State.selected`. In case the query is successful it invokes `query pics` and `query tags`. In case of error, invokes `snackbar`.
   15. `goto tag`: clears up `State.selection` and sets `State.query.tags` to the selected tag.
   16. `scroll`: only will perform actions if `State.page` is `pics`. Will set `State.lastScroll` if it doesn't exist, or if `State.lastScroll` is older than 10ms. It will increase `State.nPics` only if the following conditions are met: 1) the `scroll` goes down; 2) the `scroll` happened while the last pictures being displayed are visible; 3) the number of pictures in `Data.pics` is larger than `State.nPics`. If it increases `State.nPics`, it will do so by 20.
   17. `change Data.pics|State.nPics|Data.tags`: if `State.page` is `pics` and any of the three paths change, and the following conditions are met: 1) there are already pictures in `Data.pics`; 2) `State.nPics` is smaller than the amount of pics in `Data.pics`; and 3) all the pictures are visible; then, `State.nPics` will be increased by 20. This has the result of filling the screen with pictures, in increments of 20. The reason for including a change event for `Data.tags` is that `E.pics` also depends on `Data.tags`, so depending on the order of the redraws, there might be no pictures on the screen when the event is triggered by a change on `Data.pics`.
   18. `download`: uses `State.selected`. Invokes `post download`. If unsuccessful, invokes `snackbar`.
   19. `stop propagation`: stops propagation of the `ev` passed as an argument.

4. Open
   1. `key down`: if `State.open` is set, invokes `open prev` (if `keyCode` is 37) or `open next` (if `keyCode` is 39).
   2. `enter fullscreen`: enter fullscreen using the native browser methods and set the `<body>` `overflow` to `hidden`.
   3. `exit fullscreen`: if `State.open` is present, remove it. Depending on the `exited` flag passed to the invocation, exit fullscreen using the native browser methods. Also remove the `<body>` `overflow` property so it reverts to the defaut.
   4. `change State.open`: remove or add `app-fullscreen` class from `#pics`, depending on whether `State.open` is defined. If `State.open` is defined, it invokes `enter fullscreen`.
   5. `open prev|next`: decrements or increments `State.open`, with wraparound if going back when on the first picture or when going forward on the last picture.
   6. `touch start`: only performs actions if `State.open` is set. Sets `State.lastTouch`.
   7. `touch end`: only performs actions if `State.open` is set. Reads and deletes `State.lastTouch`. If it happened less than a second ago, it invokes `open prev` or `open next`, depending on the direction of the touch/swipe.
   8. `goto location`: takes a `pic` with `loc` field as its argument. Opens Google Maps in a new tab with the specified latitude & longitude.

5. Upload
   1. `change State.page`: if `State.page` is `upload`, 1) if no `Data.account`, `query account`; 2) if no `Data.tags`, `query tags`.
   2. `drop files`: if `State.page` is `upload`, access dropped files or folders and put them on the upload file input. `add` (without event) items to `State.upload.new.format` and `State.upload.new.files`, then `change State.upload.new`.
   3. `upload files|folder`: `add` (without event) items to `State.upload.new.format` and `State.upload.new.files`, then `change State.upload.new`. Clear up the value of either `#files-upload` or `#folder-upload`.
   4. `upload start`: adds items from `State.upload.new.files` onto `State.upload.queue`, then deletes `State.upload.new` and `change State.upload.queue`.
   5. `upload cancel`: has `uid` as its first argument; finds all the files on `State.upload.queue` with `uid`, filters them out and updates `State.upload.queue`.
   6. `upload tag`: optionally invokes `snackbar`. Adds a tag to `State.upload.new.tags` and removes `State.upload.tag`.
   7. `change State.upload.queue`:
      - Sets `State.upload.summary.UID.tags`.
      - Invokes `post upload`.
      - Removes an element from `State.upload.queue`.
      - Conditionally invokes `snackbar` on error; also on success of entire upload.
      - Adds an item to either `State.upload.summary.UID.ok`, `State.upload.summary.UID.error` or `State.upload.summary.UID.repeat`.
      - If query is successful, invokes `query account` and `query tags`.
      - If query is successful and `State.page` is `pics`, invokes `query pics`.
6. Account
   1. `query account`: `get account`; if successful, `set Data.account`, otherwise invokes `snackbar`. Optionally invokes `cb` passed as extra argument.
   2. `dismiss geo`: `post geo`; invokes `snackbar`. If successful, invokes `query account`.
   3. `toggle geo`: `post geo`; if successful, invokes `query account`. It always invokes `snackbar`. If operation is `enable`, sets an interval function in `State.updateGeotags`, which invokes `query account` and eventually calls `clear updateGeotags`.
   4. `clear updateGeotags`: if `State.updateGeotags` is defined, it invokes `clearInterval` on `State.updateGeotags` and then `rem State.updateGeotags`

### Store

- `State`:
   - `filter`: filters tags shown in sidebar.
   - `lastClick`: if present, has the shape `{id: PICID, time: INT}`. Used to determine 1) a double-click (which would open the picture in full); 2) range selection with shift.
   - `lastScroll`: if present, has the shape `{y: INT, time: INT}`. Used to determine when to increase `State.nPics`.
   - `lastTouch`: if present, has the shape `{x: INT, time: INT}`. Used to detect a swipe within `E.open`.
   - `newTag`: the name of a new tag to be posted.
   - `nPics`: the number of pictures to show.
   - `open`: index of the picture to be shown in full-screen mode.
   - `page`: determines the current page.
   - `redirect`: determines the page to be taken after logging in, if present on the original `window.location.hash`.
   - `query`: determines the current query for pictures. Has the shape: `{tags: [...], sort: 'newest|oldest|upload'}`.
   - `selected`: an object where each key is a picture id and every value is either `true` or `false`. If a certain picture key has a corresponding `true` value, the picture is selected.
   - `snackbar`: prints a snackbar. If present, has the shape: `{color: STRING, message: STRING, timeout: TIMEOUT_FUNCTION}`. `timeout` is the function that will delete `State.snackbar` after a number of seconds. Set by `snackbar` event.
   - `untag`: flag to mark that we're untagging pictures instead of tagging them.
   - `updateGeotags`: if defined, an interval that periodically queries the server for new tags until the enabling of geotags is completed.
   - `upload`:
      - `new`: {format: ['FILENAME', ...]|UNDEFINED, files: [...], tags: [...]|UNDEFINED}
      - `queue`: [{file: ..., uid: STRING, tags: [...]|UNDEFINED, uploading: true|UNDEFINED}, ...]
      - `tag`: content of input to filter tag or add a new one.
      - `summary`: {ok: [{id: ID, deg: 90|-90|180|undefined}, ...]|UNDEFINED, error: {name: STRING, error: STRING}|UNDEFINED, repeat: [FILENAME, ...]|UNDEFINED}

- `Data`:
   - `account`: `{username: STRING, email: STRING, type: STRING, created: INTEGER, usage: {limit: INTEGER, used: INTEGER}, logs: [...]}`.
   - `csrf`: if there's a valid session, contains a string which is a CSRF token. If there's no session (or the session expired), set to `false`. Useful as both a CSRF token and to tell the client whether there's a valid session or not.
   - `pics`: `[...]`; comes from `body.pics` from `query pics`.
   - `queryTags`: `[...]`; comes from `body.tags` from `query pics`.
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
      - `change -> set State.newInvite.ID`
      - `click -> del State.newInvite`
3. `E.deploy`
   - Events:
      - `click -> deploy client`

### Responders

1. Invites
   1. `retrieve invites`: invokes `get admin/invites`.
   2. `create invite`: invokes `post admin/invites` with `State.newInvite`; if successful, invokes `retrieve invites` and `rem State.newInvite`, otherwise it invokes `snackbar`.
   3. `delete invite`: invokes `delete admin/invites/EMAIL`; if successful, invokes `retrieve invites`, otherwise it invokes `snackbar`.
   4. `change State.page`: if current page is `invites` and there's no `Data.invites`, it invokes `retrieve invites`.

2. Deploy
   1. `deploy client`: invokes `post admin/deploy` and `snackbar`.

### Store

- `State`:
   - `newInvite`: `{email: STRING, firstName: STRING}`.

- `Data`:
   - `invites`: `{EMAIL: {firstName: STRING, token: STRING, sent: INT, accepted: INT|UNDEFINED}, ...}`.

## Version history

- Alpha/v0: bfa9ad50b5e54c78ba804ba35fe1f6310e55dced

## Annotated source code

For now, we only have annotated fragments of the code. This might be expanded comprehensively later.

### `server.js`

We create an array `ytags` to store the year tags in the query.

```javascript
      var ytags = [];
```

We create an object `tags`, which will have each tag as a key, and as a value an array with one or more usernames. We iterate the tags of the query; for each of them, if it's not a year tag, we put it in an object `tags` with the value being an array with the username of the user. If it is a year tag, we simply append it to `ytags`.

```javascript
      var tags = dale.obj (b.tags, function (tag) {
         if (! H.isYear (tag)) return [tag, [rq.user.username]];
         ytags.push (tag);
      });
```

We start the query process, invoking `astop`. We first bring all the tags shared with the user.

```javascript
      astop (rs, [
         [Redis, 'smembers', 'shm:' + rq.user.username],
```

If the user sent no tags, we set a variable `allMode` to denote that we want all possible pictures.

```javascript
         function (s) {
            var allMode = b.tags.length === 0;
```

If we're in `allMode`, we create an entry for the `all` tag inside `tags`, with the same shape of the entries already there.

```javascript
            if (allMode) tags.all = [rq.user.username];
```

We iterate the list of tags shared with the user, retrieved on the call to the database we just did.

```javascript
            dale.go (s.last, function (sharedTag) {
```

We clean up the shared tag, which is of the form `USERNAME:TAG`; to do this, we strip the tag of all the characters preceding the colon, plus the colon itself. Usernames cannot have colons because we forbid it, so there's no risk of a colon meaning something else than the separator between the username and the tag. We store the cleaned shared tag into a variable `tag`.

```javascript
               var tag = sharedTag.replace (/[^:]+:/, '');
```

If the tag is not already in `tags` and we're not in `allMode`, we ignore this tag. However, if we're in `allMode`, even though the user didn't specifically request for this tag, we will still consider it.

```javascript
               if (! tags [tag] && ! allMode) return;
```

If the entry for the tag does not exist yet in `tags` (which can only happen if we're in `allMode`), we create the entry.

```javascript
               if (! tags [tag]) tags [tag] = [];
```

We push the username of the shared tag to the entry for that tag. We extract the username by finding all the characters in the tag that are before the colon. This concludes our iteration of the shared tags.

```javascript
               tags [tag].push (sharedTag.match (/[^:]+/) [0]);
            });
```

By now, `tags` will be an object with each key as a tag, and each value as an array of one or more usernames, with the first one being the username of the user itself: `{KEY1: [USERID1, ...], ...}`. This gives us a list of all the tag + username combination that are relevant to the query.

We create two variables: `multi`, to hold the redis transaction; and `qid`, an id for the query we're about to perform. This `qid` key will hold a set of picture ids in redis for the purposes of the query.

```javascript
            var multi = redis.multi (), qid = 'query:' + uuid ();
```

If we have year tags, we bring the ids of all the pictures belonging to each of them and store their union in the query key.

```javascript
            if (ytags.length) multi.sunionstore (qid, dale.go (ytags, function (ytag) {
               return 'tag:' + rq.user.username + ':' + ytag;
            }));
```

We iterate the tags. For each tag, for each of its users, we store the ids of the corresponding pictures onto a key made by appending the tag to the query key.

```javascript
            dale.go (tags, function (users, tag) {
               multi.sunionstore (qid + ':' + tag, dale.go (users, function (user) {
                  return 'tag:' + user + ':' + tag;
               }));
            });
```

We compute the ids of all the pictures that match the query. This will be either the union (in case of `allMode`) or the intersection (if we're in a normal query) of all the ids for each tag. If there are `ytags`, we also use the query key.

The year tags are queried separately from normal tags because 1) if more than one year tag is sent, we want the union (not the intersection) of their pictures; and 2) it's not possible to share a year tag with another user, so the querying is simpler.

```javascript
            multi [allMode ? 'sunion' : 'sinter'] (dale.go (tags, function (users, tag) {
               return qid + ':' + tag;
            }).concat (ytags.length ? qid : []));
```

We delete all the temporary sets of ids we created for the query.

```javascript
            multi.del (qid);
            dale.go (tags, function (users, tag) {
               multi.del (qid + ':' + tag);
            });
```

We run the transaction and move to the next step of the process.

```javascript
            mexec (s, multi);
         },
```

We

```javascript
         function (s) {
            s.pics = s.last [(ytags.length ? 1 : 0) + dale.keys (tags).length];
            dale.go (s.pics, function (pic) {
               multi.hgetall ('pic:' + pic);
            });
            mexec (s, multi);
         },
```

            var multi = redis.multi ();
            dale.go (pics, function (pic) {
               multi.hgetall ('pic:' + pic);
            });
            mexec (s, multi);
         },
         function (s) {
            var pics = s.last;
            if (pics.length === 0) return reply (rs, 200, {total: 0, pics: [], tags: []});
            var output = {pics: []};

            var mindate = b.mindate || 0, maxdate = b.maxdate || new Date ('2101-01-01T00:00:00Z').getTime ();

            dale.go (pics, function (pic) {
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
            dale.go (s.tagpics, function (pic) {
               multi.smembers ('pict:' + pic);
            });
            s.output = output;
            mexec (s, multi);
         },

## License

ac;pic is written by [Altocode](https://altocode.nl) and released into the public domain.
