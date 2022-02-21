# ac;pic :: a home for your pictures

## About

ac;pic is an application that allows you to store and manage your pictures and videos (pivs). ac;pic is built by [Altocode](https://altocode.nl). While the service itself is paid, Altocode freely shares the code for all purposes, including commercial ones.

To understand why we're sharing the source code of a commercial product, please read [our manifesto](http://federicopereiro.com/manifesto). If that's too long to read, in a nutshell: we want to share our code so that others can learn from it and contribute to us. Sharing is the way to progress.

All non-code documents related to the project are published in this [open folder](https://drive.google.com/drive/u/1/folders/11UPZHrHUT_ce2baN9s0K-CtfXYQOewG3).

## Status

ac;pic is currently under development and has not been launched yet. We aim to launch it in 2020.

The author wishes to thank [Browserstack](https://browserstack.com) for providing tools to test cross-browser compatibility.

## Functionality

### Core functions

1. **Upload**. Converse operation are **delete** and **import**.
2. **Tag**. Converse operation is **untag**. Complementary operation are **rotate** and **enable/disable geotagging**.
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

### Todo beta

- Pivs
   - Move year tags to d::2004, all to a::, untagged to u::, g:: to ::g, forbid tags that start [a-z]::
   - Months:
      - Show months only if one year is selected. If 0 or >2, don't show.
      - If selected a month, don't show other years.
      - month is a pseudo-tag, set in a particular part of the state. when doing that, set the from/to in the query.
   - How to serve lastPiv if lastPiv is deleted?
   - Specify in which order to show tags:
      - By piv number
      - latest tagged
      - latest queried
      - pinned (manual solution)?
      - compress years and geo? also other categories to compress (with overlap): latest queried, latest tagged, pinned, all
   - Stop losing state of left scrollbar and sort by scrollbar when query refreshes.
   - [markup] Search box height is incorrect. Must match to original design markup. When 'Done tagging' button appear in 'Untagged', bottom border of tag navigation moves. It shouldn't do that.
   - [markup] Adjust height of sidebar__inner-section when switching from main tag view to selected tags view. They should have different heights.
   - [incognito FF] Review fonts not loading
   - Increase thumbnail size
   - Implement video streaming.
   - [To be specified] Arcade mode when browsing:
      - changes in query/position are reflected in url, back button works
      - remember position by the piv at a certain position (top/left), not the number, so it works while uploads are happening in the background
      - top bar showing position
      - fixed piv separators as milestones

- Backend improvements:
   - Avoid logs of invalid signature in cookie
   - Route logging
      - Log all non-admin routes in terms of performance
      - Distinguish 4xx from 5xx
      - Tighter 4xx ignoring rules for endpoints
   - Check if we're leaving behind temporary files from import.
   - On shutdown, if there are S3 uploads, re-add it to the queue and send notification before shutting down.

- Upload/import:
   - Stop losing scroll when view is updated.
   - See if there's a way to detect whatsapp videos that look the same but are slightly different.
   - Add a "show more" button to show more items of Recent Imports or Recent Uploads.
   - Improve display of errors in upload & import:
      - Show foldable list of repeated|invalid|too large pivs.
      - When adding many files to upload, put a "loading, please wait" snackbar.
      - Show provider errors in import.
      - If there's a provider error, give a "try again" option with the same list?
      - If there's another type of error, mark "ac;pic/server error".
   - Import from Dropbox.

- Safari bugs
   - Videos do not play in Safari Version 13.1.2 (15609.3.5.1.3): implement streaming (https://blog.logrocket.com/streaming-video-in-safari/)
   - On double click, pivs fail to open in most cases
   - When opening thumbnail, big picture is superimposed to the same piv (it's like a piv is opened on top of another)
   - photo slider Error sound when pressing arrow keys to navigate gallery. This exact same problem https://stackoverflow.com/questions/57726300/safari-error-sound-when-pressing-arrow-keys-to-navigate-gallery#:~:text=1%20Answer&text=It%20seems%20that%20Safari%20browser,no%20input%20element%20in%20focus.

- Refactor UI with unified terminology for pivs: Pics&Vids?

- Accounts
   - Recover/reset password.
   - Set account space limit.
   - Delete my account with confirmation.
   - Show/hide paid space in account.
   - Retrieve data on payment cycle.
   - Retrieve used space so far (stats).
   - Downgrade my account alert.
   - Family plan.

- Mobile
   - Login & signup.
   - Upload files & folders.

### Already implemented

- Pivs
   - Show dialog that indicates that a click selects a piv and that a double click opens it. The dialog should be permanently dismissable.
   - Show all pivs.
   - Load more pivs on scroll.
   - Sort by newest, oldest & upload date.
   - Select/unselect piv by clicking on it.
   - Multiple selection with shift.
   - Select/unselect all.
   - When selecting pivs, see selection bar.
   - Hover on piv and see date.
   - Show untagged pivs.
   - When querying untagged tag, remove non-year and non-geo tags. When querying normal tag, remove untagged tag.
   - When modifying pivs with `untagged` in the query, add button for confirming operation; show alert if user navigates away.
   - See list of tags.
   - Query by tag or tags.
   - Show pivs according to the selected tags.
   - If there are selected pivs, toggle between browse mode & organize mode.
   - If query changes but selected pivs are still there, maintain their selection.
   - Filter tags when browsing.
   - Tag/untag.
   - Filter tags when tagging/untagging.
   - Rotate pivs.
   - Delete pivs.
   - Ignore rotation of videos.
   - When clicking on tag on the attach/unattach menu, remove selection and query the tag.
   - When untagging, if no pivs left with that tag, remove tag from query.
   - Fill pivs grid until screen is full or no pivs remain.
   - Scroll to the top of the pivs grid when selecting a new combination of tags.
   - Block selection of a tag if the UI is still processing a previous selection of a tag.
   - Download a single piv.
   - Download multiple pivs as one zip file. The original modification times of each file should be respected.
   - Only show tags relevant to the current query.
   - When just enabling geotagging, update tags every 3 seconds.
   - Suggest geotagging when having a few pivs uploaded, but only once; either enable it or dismiss the message, and don't show it again.
   - When clicking on no man's land, unselect.
   - When querying untagged pivs AND pivs are selected, show "Done tagging" button. When tagging those pivs, they remain in selection until either 1) "Done tagging" button is clicked; 2) all pivs are unselected; or 3) "untagged" is removed from query.

- Open
   - Open piv and trigger fullscreen.
   - If exit fullscreen, exit piv too.
   - Show date & piv position.
   - Use caret icons to move forward & backward.
   - Use arrow keys to move forward & backward.
   - Wrap-around if there are no more pivs.
   - Preload the next piv.
   - If exiting fullscreen, also exit piv.
   - Hide scrollbar on fullscreen and hide it again on exit.
   - If video, show thumbnail & controls.
   - Mobile: no padding, swipe left/right.
   - If upload is happening in the background, keep the current piv open but update the counter on the bottom right.
   - Warn of leaving page if upload is ongoing.

- Upload
   - Allow only valid pivs of certain formats.
   - Auto thumbnail generation.
   - Server-side encryption (onto S3).
   - Store original pivs in S3 and pivs + thumbnails locally.
   - Ignore pivs that already were uploaded (by hash check, ignoring metadata), but add their tags to the already existing files.
   - Upload files from folder selection, files selection & drop.
   - If uploading from folder, use folder name (and optional subfolders) as tags for the pivs contained in them.
   - See progress when uploading files, using a progress bar.
   - Add one or more tags to the upcoming upload batch.
   - See previous uploads.
   - Auto rotate based on metadata.
   - Allow to go back to browse while files are being uploaded in the background.
   - Refresh list of pivs periodically if there's an upload in the background.
   - Show thumbnail of last piv on each upload.
   - Cancel current upload. After cancelling, show snackbar that indicates how many pivs were uploaded for the given upload.
   - Mobile: show upload box as folders only, since there's no dropdown or perhaps no folders.
   - Snackbar with success message when pivs are finished uploading.
   - Show errors.

- Account & payment
   - Login/logout.
   - Signup with invite.
   - Store auth log.
   - Enable/disable geotagging.
   - Change password.

- Import
   - List
      - If no auth access, provide link to start auth flow.
      - Start listing or see existing list.
      - When listing, update listing progress.
      - Show snackbar when process is done or if the listing ends in error.
      - Send email when process is done or if the listing ends in error.
      - Show full list of folders when done listing.
      - Allow cancelling ongoing listing process.
      - Delete current list.
      - Allow retrying in case of an error.
      - Select folders to import in a persistent manner.
      - Send back to main import view when click on "start import".
   - Upload
      - Block new import from the same provider.
      - Allow cancelling ongoing upload process.
      - If user is on the pivs view, refresh query every n seconds to show new pivs.
      - Show snackbar when process is done or if the listing ends in error.
      - Send email when process is done or if the listing ends in error.
      - Show recent imports.

- Admin
   - Block further uploads if storage limits are exceeded.
   - See & send invites.

- Other
   - S3 & SES setup.
   - Set up dev & prod environments.

### Todo post-launch

- Open
   - Show tags.

- Upload
   - Retry on error.
   - Show estimated time remaining in ongoing uploads.
   - Ignore deleted pivs flag for both upload & import.
   - New upload flow
      - Starting state: area from dropdown & button for files & button for folder upload.
      - Uploading state: button for starting new upload and button for starting tagging state.
      - Tagging state: input with button to add tags, also dropdown to select existing tags to add to current upload.

- Account & payment
   - Change email.
   - Export/import all data.
   - Log me out of all sessions.
   - Freeze me out (includes log me out of all sessions).
   - Payment late flow: freeze uploads, email, auto-delete by size.

- Share & manage
   - Rename tag.
   - Share/unshare with email: signup, login, or go straight if there's a session.
   - Mark tags shared with others.
   - Mark tags shared with me.
   - If two shared tags from different users have the same name, put "@username".
   - Authorization to see or ignore share.

- Admin
   - Retrieve stats & test endpoint.
   - User management.

- Mobile
   - See pivs.
   - Select tags & sort order to see pivs.
   - Select sorting order.

- Other
   - Check lifecycle of pivs bucket in S3.
   - Disable THP for redis.
   - Check graceful app shutdown on mg restart: wait for S3 uploads and ongoing uploads
   - Downgrade read ECONNRESET errors priority?
   - Test for maximum capacity.
   - Security: figure out workaround for package-lock with nested dependencies that are not pegged.
   - Frontend tests.
   - ac;tools integration.
   - Status & stats public page.
   - Spanish support.

### Todo future

- Pivs
   - Hidden tags.
   - Set date manually.
   - Filters.
   - Themes for the interface.
   - Set colors of tags?
   - Order pivs within tag? Set priorities! Manual order mode.

- Share & manage
   - Upload to shared tag.
   - Public tag, including download restrictions per piv?
   - QR code to share.
   - Create group that groups people.
   - Create tag that groups tags (can also have pivs directly assigned).

### Todo never

- Share
   - Comments.
   - Share to social platforms.
   - Share certain tags only on shared pivs.
   - Profile pages.

## Server

General server approach outlined [here](https://github.com/fpereiro/backendlore).

### Routes

If any route fails with an internal error, a 500 code will be returned with body `{error: ...}`.

All `POST` requests must have a `content-type` header of `application/json` and their bodies must be valid JSON objects. The only exception is `POST /piv`, which must be of type `multipart/form-data`.

All non-auth routes (unless marked otherwise) will respond with a 403 error with body `{error: 'nocookie'}` if the user is not logged in.

If a cookie with invalid signature is sent along, the application will respond with a 403 error with body `{error: 'tampered'}`.

If a cookie with valid signature but that has already expired is sent along, the application will respond with a 403 error with body `{error: 'session'}`.

All POST requests (unless marked otherwise) must contain a `csrf` field equivalent to the `csrf` provided by a successfull call to `POST /auth/login`. This requirement is for CSRF prevention. In the case of `POST /piv`, the `csrf` field must be present as a field within the `multipart/form-data` form. If this condition is not met, a 403 error will be sent.

#### Request invite

- `POST /requestInvite`.
   - Body must be `{email: STRING}`, otherwise a 400 will be sent.

#### Auth routes

- `GET /csrf`.
   - If the user is not logged in or the session expired, returns a 403.
   - Otherwise, returns a body `{csrf: STRING}`, where `STRING` is the CSRF token to be used in all requests.

- `POST /auth/login`.
   - Does not require the user to be logged in.
   - Body must be `{username: STRING, password: STRING, timezone: INTEGER}`. If not, a 400 code will be returned with body `{error: ...}`.
   - `username` is lowercased and any leading & trailing space is removed from it (and intermediate spaces or space-like characters are reduced to a single space). `username` can be either the `username` or the `email` associated to a `username`.
   - If the username/password combination is not valid, a 403 code will be returned with body: `{error: 'auth'}`.
   - If the username/password combination is valid but the email hasn't been verified yet, a 403 code will be returned with body `{error: 'verify'}`.
   - `timezone` must be the output of `Date.getTimezoneOffset ()`, an integer expressing the number of minutes behind (or ahead) of UTC in the local time.

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
   - User must be logged in, otherwise a 403 is returned.
   - Can be used to delete own account or to delete another user account (if admin).
   - Temporarily disabled in non-local environments if used to delete own account (route always returns 501).
   - If the body contains a key `user` with the id of an user, said user's account will be deleted if the user performing the request is an admin. To delete own account, send an empty object.

- `POST /auth/changePassword`.
   - Body must be `{old: STRING, new: STRING}`.

#### App routes

`POST /feedback`
   - Body must be an object of the form `{message: STRING}` (otherwise 400).
   - If successful, returns a 200.

- `GET /piv/ID`
   - Piv must exist and the user must have permissions to see it (otherwise, 404).
   - Depending on ETag, a 200 or 304 is returned.
   - If the file is not found, a 404 is returned.
   - If the file is a non-mp4 video:
      - If the `original` query parameter is truthy, the original video is served.
      - Otherwise, the mp4 version of the video is served. If the conversion is still ongoing, a 404 is returned with body `'pending'`. If the conversion ended up in an error, a 500 is returned with body `'error'`.

- `GET /thumb/SIZE/ID`
   - Thumb must exist and the user must have permissions to see it (otherwise, 404).
   - Size must be 200 or 900.
   - If the piv has no thumbnail for that size, the original piv is returned.
   - Depending on ETag, a 200 or 304 is returned.
   - If the file is not found, a 404 is returned.

- `GET /thumbof/ID`
   - Gets the smallest thumbnail (or the piv, if the piv has none) of the piv with id ID.
   - Piv must exist and the user must have permissions to see it (otherwise, 404).
   - Depending on ETag, a 200 or 304 is returned.
   - If the file is not found, a 404 is returned.

- `POST /upload`
   - Body can have one of five forms:
      - `{op: 'start', tags: UNDEFINED|[STRING, ...], total: INTEGER, tooLarge: UNDEFINED|{STRING, ...], unsupported: UNDEFINED|[STRING, ...]}}`
      - `{op: 'complete', id: INTEGER}`
      - `{op: 'cancel',   id: INTEGER}`
      - `{op: 'wait',     id: INTEGER}`
      - `{op: 'error',    id: INTEGER, error: OBJECT}`
   - The body can contain a field `provider` with value `'google'|'dropbox'` and a field `alreadyImported` that should be an integer larger than 0. This can only happen if the request comes from the server itself as part of an import process; if the IP is not from the server itself, 403 is returned.
   - If `tags` are present, none of them should start with `[a-z]::`. These tags are reserved for internal use of the app. Note that because tags are trimmed, if a tag starts with whitespace and then `[a-z]::`, the tag will still be considered as a tag for internal use, therefore invalid in this context.
   - If an `id` is provided in the case of `complete`, `cancel`, `wait` or `error`, it must correspond to that of an existing upload, otherwise the endpoint returns 404 with body `{error: 'upload'}`.
   - In the case of `complete` or `cancel`, the existing upload must have a status of `uploading`, otherwise the endpoint returns 409. The same happens with a `start` on an upload that already has the same `id`.
   - In the case of `wait`, the existing upload must have a status of `uploading` or `stalled, otherwise the endpoint returns 409. This operation is used to warn the server not to consider the upload stalled in the case a file is taking more than ten minutes to be uploaded; it can also be used to revive a stalled upload.
   - If successful, the endpoint returns a body of the form `{id: INTEGER}`. In the case of a `start` operation, this id should be used for an ulterior `end` or `cancel`.

- `POST /uploadCheck`
   - This route is used to see if a piv has already been uploaded.
   - Body must be of the form `{ID: INTEGER (id of the upload), hash: INTEGER, name: STRING, size: INTEGER, lastModified: INTEGER, tags: UNDEFINED|[STRING, ...]}`.
   - If `tags` are included, after being trimmed, none of them should start with `[a-z]::` (otherwise, 400 with body `{error: 'invalid tag'}`).
   - `body.size` must be the size in bytes of the file being checked.
   - `body.id` must be that of an existing upload id, otherwise the endpoint returns 404 with body `{error: 'upload'}`; if the upload exists but its status is not `uploading`, the endpoint returns 409 with body `{error: 'status'}`.
   - If there's already a piv with the same bytes (whether with the same name or not), the endpoint will reply `{repeated: true}`, otherwise it will return `{repeated: false}`.
   - If the piv matches another one already present and `lastModified` and/or a date parsed from the `name` is a date not held by the metadata of the piv already present, those dates will be added to it.

- `POST /piv`
   - Must be a multipart request (and it should include a `content-type` header with value `multipart/form-data`) (otherwise, 400 with body `{error: 'multipart'}`).
   - Must contain exactly one file with name `piv` (otherwise, 400 with body `{error: 'file'}`).
   - Must contain no extraneous fields (otherwise, 400 with body `{error: 'invalidField'}`). The only allowed fields are `id`, `lastModified`, `tags` and `importData`; the last two are optional.
   - Must contain a field `id` with an upload id (otherwise, 400 with body `{error: 'id'}`. The `id` groups different uploaded files into an upload unit, for UI purposes. The `id` should be a timestamp in milliseconds returned by a previous call to `POST /upload`. If no upload with such `id` exists, the endpoint returns 404. The upload with that `id` should have a `status` of `uploading`; if it is not, a 409 is returned with body `{error: 'status'}`.
   - Must include a `lastModified` field that's parseable to an integer (otherwise, 400 with body `{error: 'lastModified'}`).
   - If it includes a `tag` field, it must be an array (otherwise, 400 with body `{error: 'tags'}`). After being trimmed, none of them should start with `[a-z]::` (otherwise, 400 with body `{error: 'invalid tag'}`).
   - Can contain a field `importData` with value `{provider: 'google'|'dropbox', id: FILE_ID, name: STRING, modificationTime: FILE_MODIFICATION_TIME, path: STRING}`. This can only happen if the request comes from the server itself as part of an import process; if the IP is not from the server itself, 403 is returned.
   - The file uploaded must be one of the allowed formats: `jpeg`, `png`, `bmp`, `heic`, `gif`, `tiff`, `webp`, `mp4`, `mov`, `3gp`, `avi`, `webm`, `wmv` and `m4v` (otherwise, 400 with body `{error: 'format'}`).
   - The file must be at most 2GB bytes (otherwise, 400 with body `{error: 'tooLarge'}`).
   - If the file is not a valid piv, a 400 is returned with body `{error: 'Invalid piv', data: {...}}`.
   - If a file exists for that user that is both identical to an existing one and also having the same name, a 200 is returned with body `{alreadyUploaded: true, id: STRING}`, where `ID` is the ID of the identical piv that is already uploaded.
   - If a file exists for that user that is either identical but has a different name than an existing one, or that is the same after stripping the metadata and without regard to the original name, a 200 is returned with body `{repeated: true, id: STRING}`, where `ID` is the ID of the identical piv that is already uploaded.
   - In the case for both repeated or already uploaded, and `lastModified` and/or a date parsed from the `name` is a date not held by the metadata of the piv already present, those dates will be added to it.
   - If the storage capacity for that user is exceeded, a 409 is returned with body `{error: 'capacity'}`.
   - If the upload is successful, a 200 is returned with body `{id: ID, deg: 90|180|-90|undefined}`, where `ID` is the ID of the piv just uploaded and `deg` is the rotation automatically applied to the piv based on its metadata.

- `POST /delete`
   - Body must be of the form `{ids: [STRING, ...]}` (otherwise, 400 with body `{error: ...}`).
   - Array with ids can be empty.
   - All pivs must exist and user must be owner of the pivs, otherwise a 404 is returned.
   - There should be no repeated ids on the query, otherwise a 400 is returned.
   - If the deletion is successful, a 200 is returned.

- `POST /rotate`
   - Body must be of the form `{ids: [STRING, ...], deg: 90|180|-90}` (otherwise, 400 with body `{error: ...}`).
   - All pivs must exist and user must be owner of the pivs, otherwise a 404 is returned.
   - Videos will not be rotated and will be silently ignored.
   - There should be no repeated ids on the query, otherwise a 400 is returned.
   - If the rotation is successful, a 200 is returned.

- `POST /tag`
   - Body must be of the form `{tag: STRING, ids: [STRING, ...], del: true|false|undefined}`
   - `tag` will be trimmed (any whitespace at the beginning or end of the string will be eliminated; space-like characters in the middle will be replaced with a single space).
   - After trimmed, `tag` cannot start with `[a-z]::`.
   - If `del` is `true`, the tag will be removed, otherwise it will be added.
   - All pivs must exist and user must be owner of the pivs, otherwise a 404 is returned.
   - There should be no repeated ids on the query, otherwise a 400 is returned.
   - If successful, returns a 200.

- `GET /tags`
   - Returns an array of the form `['tag1', 'tag2', ...]`. This list also includes year tags and geotags, but it doesn't include `a::`, `d::`, or tags shared with the user by other users.

- `POST /query`
   - Body must be of the form `{tags: [STRING, ...], mindate: INT|UNDEFINED, maxdate: INT|UNDEFINED, sort: newest|oldest|upload, from: INT, to: INT, recentlyTagged: [STRING, ...]|UNDEFINED}`. Otherwise, a 400 is returned with body `{error: ...}`.
   - `body.from` and `body.to` must be positive integers, and `body.to` must be equal or larger to `body.from`. For a given query, they provide pagination capability. Both are indexes (starting at 1) that specify the first and the last piv to be returned from a certain query. If both are equal to 1, the first piv for the query will be returned. If they are 1 & 10 respectively, the first ten pivs for the query will be returned.
   - `a::` cannot be included on `body.tags`. If you want to search for all available pivs, set `body.tags` to an empty array. If you send this tag, you'll get a 400 with body `{error: 'all'}`.
   - `untagged` can be included on `body.tags` to retrieve untagged pivs. Untagged pivs are those that have no user tags on them - tags added automatically by the server (such as year/month tags or geotags) don't count as tags in this regard.
   - If defined, `body.mindate` & `body.maxdate` must be UTC dates in milliseconds.
   - `body.sort` determines whether sorting is done by `newest`, `oldest`, or `upload`. The first two criteria use the *earliest* date that can be retrieved from the metadata of the piv, or the `lastModified` field. In the case of the `upload`, the sorting is by *newest* upload date; there's no option to sort by oldest upload.
   - If `body.recentlyTagged` is present, the `'untagged'` tag must be on the query. `recentlyTagged` is a list of ids that, if they are ids of piv owned by the user, will be included as a result of the query, even if they are not untagged pivs.
   - If the query is successful, a 200 is returned with body `pivs: [{...}], total: INT, tags: {'a::': INT, 'u::': INT, otherTag1: INT, ...}, refreshQuery: true|UNDEFINED}`.
      - Each element within `body.pivs` is an object corresponding to a piv and contains these fields: `{date: INT, dateup: INT, id: STRING,  owner: STRING, name: STRING, dimh: INT, dimw: INT, tags: [STRING, ...], deg: INT|UNDEFINED, vid: UNDEFINED|'pending'|'error'|true}`.
      - `body.total` contains the number of total pivs matched by the query (notice it can be larger than the amount of pivs in `body.pivs`).
      - `body.tags` is an object where every key is one of the tags relevant to the current query - if any of these tags is added to the tags sent on the request body, the result of the query will be non-empty. The values for each key indicate how many pivs within the query have that tag. The two exceptions are `a::` and `untagged`, which indicate the *total* amount of all and untagged pivs, irrespective of the query.
      - `body.refreshQuery`, if set, indicates that there's either an upload ongoing or a geotagging process ongoing (or both), in which case it makes sense to repeat the query after a short amount of time to update the results.
   - If `body.idsOnly` is present, only a list of ids will be returned. When this parameter is enabled, `body.from`, `body.to` and `body.sort` will be ignored; in other words, an array with all the ids matching the query will be returned. This enables the "select all" functionality.

- `POST /share`
   - Body must be of the form `{tag: STRING, whom: ID, del: BOOLEAN|UNDEFINED}`.
   - The target user (`body.whom`) must exist, otherwise a 404 is returned.
   - If the tag being shared, after being trimmed, starts with `[a-z]::`, a 400 is returned with body `{error: 'tag'}`.
   - If try to share with yourself, a 400 is returned with body `{error: 'self'}`.
   - If successful, returns a 200.

- `GET /share`
   - If successful, returns a 200 with body `{sho: [[USERNAME1, TAG1], ...], shm: [[USERNAME2, TAG2], ...]}`.
   - `body.sho` lists the tags shared with others by the user. `body.shm` lists the tags shared with the user.

- `POST /download`
   - Body must be of the form `{ids: [STRING, ...]}` (otherwise, 400 with body `{error: ...}`).
   - There should be no repeated ids on the query, otherwise a 400 is returned.
   - `body.ids` must have at least a length of 2 (otherwise, 400 with body `{error: 'single'}`. To download a single piv you can use `GET /piv/ID?original=1` instead.
   - All pivs must exist and user must be owner of the pivs or have the pivs shared with them, otherwise a 404 is returned.
   - If successful, returns a 200 with body `{id: STRING}`. The `id` corresponds to a temporary download file that lasts 5 seconds and is only valid for the user that requested the download.

- `GET /download/ID`
   - `ID` is an id returned by `POST /download`.
   - If there's no such download, or if the user doesn't requested that download, a 404 is returned.
   - If successful, the user will receive a zip file with the specified pivs.

- `POST /dismiss`
   - Disables suggestions shown to new users.
   - Body must be of the form `{operation: 'geotagging|selection'}`.

- `POST /geo`
   - Enables or disables geotagging.
   - Body must be of the form `{operation: 'enable|disable'}`.
   - If an operation is ongoing while the request is being made, the server will reply with a 409 code. Otherwise it will reply with a 200 code.
   - In the case of enabling geotagging, a server reply doesn't mean that the geotagging is complete, since it's a background process that might take minutes. In contrast, when disabling geotagging a 200 response will be sent after the geotags are removed, without the need for a background p rocess.

- `GET /uploads`
   - If successful, returns a 200 with an array as body. The array contains one or more of the following objects: `{id: INTEGER (also functions as start time), total: INTEGER, status: uploading|complete|cancelled|stalled|error, unsupported: UNDEFINED|[STRING, ...], alreadyImported: INTEGER|UNDEFINED (only for uploads of imports), alreadyUploaded: INTEGER|UNDEFINED, tags: [STRING, ...]|UNDEFINED, end: INTEGER|UNDEFINED, ok: INTEGER|UNDEFINED, repeated: [STRING, ...]|UNDEFINED, repeatedSize: INTEGER|UNDEFINED, invalid: [STRING, ...]|UNDEFINED, tooLarge: [STRING, ...]|UNDEFINED, lastPiv: {id: STRING, deg: UNDEFINED|90|-90|180}, error: UNDEFINED|STRING|OBJECT, providerErrors: UNDEFINED|[STRING|OBJECT, ...]}`.

- `GET /imports/PROVIDER`
   - If successful, returns a 200 with an array as body. Each of the elements is either an upload corresponding to the import (with the same shape of those returned by `GET /uploads`); if there's an import process that has not reached the upload stage yet, it will be the first element of the array and have the shape `{id: INTEGER, provider: PROVIDER, status: listing|ready|error, fileCount: INTEGER|UNDEFINED, folderCount: INTEGER|UNDEFINED, error: STRING|OBJECT|UNDEFINED, selection: UNDEFINED|[ID, ...], data: UNDEFINED|{roots: [ID, ...], folders: [{id: ID, name: ..., count: INTEGER, parent: ID, children: [ID, ...]}]}}`. If oauth access hasn't been provided yet, the reply will be of the form `[{redirect: URL, provider: PROVIDER}]`, where `URL` is the URL to start the OAuth authorization process for that provider.

- `GET /account`
   - If successful, returns a 200 with body `{username: STRING, email: STRING, type: STRING, created: INTEGER, usage: {limit: INTEGER, byfs: INTEGER, bys3: INTEGER}, geo: true|UNDEFINED , geoInProgress: true|UNDEFINED, suggestGeotagging: true|UNDEFINED, suggestSelection: true|UNDEFINED}`.

- `GET /import/oauth/PROVIDER`
   - Receives the redirection from the oauth provider containing a temporary authorization code.
   - If no query parameters are received, the route responds with a 400.
   - If no authorization code is received, the route responds with a 403.
   - If the request for an access token is not successful, the route responds with a 403 and with a body of the shape `{code: <CODE RETURNED BY PROVIDER'S API>, body: <BODY RETURNED BY REQUEST TO PROVIDER'S API>}`.
   - If the request for an access token is successful, the route responds with a 200.

- `POST /import/list/PROVIDER`
   - Creates a list of available folders with pivs/videos in the PROVIDER's cloud, or provides a `redirect` URL for the OAuth flow if the authorization credentials for that provider haven't been requested yet.
   - If the credentials have not been requested yet, the endpoint returns a body with the shape `{redirect: URL}`. `URL` is the URL to start the OAuth authorization process for that provider.
   - If the credentials are already granted but authentication against the provider fails, the endpoint returns a 403 with a body of the shape `{code: <CODE RETURNED BY PROVIDER'S API>, body: <BODY RETURNED BY REQUEST TO PROVIDER'S API>}`.
   - If there's already a list ready or the import is in the process of uploading, a 409 is returned to the client.
   - If there's access or refresh tokens and no import process ongoing, a process is started to query the PROVIDER's API and 200 is returned to the client. The listing will be performed asynchronously after replying the 200 to the request.

- `POST /import/cancel/PROVIDER`
   - Deletes list of files/folders available in the PROVIDER's cloud.
   - If no listing was done, the route succeeds anyway.
   - If successful, the route returns no body.

- `POST /import/select/PROVIDER`
   - Updates the list of selected folders for import from `PROVIDER`.
   - Requires a list of files to be present; otherwise a 404 is returned.
   - If the import is listing, uploading or experienced an error, a 409 is returned.
   - The body must be of the shape `{ids: [ID, ...]}`.
   - If any of the ids doesn't belong to a folder id on the `PROVIDER`'s list, a 400 is returned.
   - If there previously was an array of selected folder ids on the list, it will be overwritten.

- `POST /import/upload/PROVIDER`
   - If no credentials are present or the credentials are already granted but authentication against the provider fails, the endpoint returns a 403 with a body of the shape `{code: <CODE RETURNED BY PROVIDER'S API>, body: <BODY RETURNED BY REQUEST TO PROVIDER'S API>}`.
   - If there's no import process present, returns a 404.
   - If there's an import process present but 1) the listing process is ongoing; or 2) there was an error; or 3) there are no folders selected yet; or 4) the import process already started; the endpoint returns a 409.
   - If all initial checks pass, the endpoint will return 200 and perform its operations asynchronously.
   - The endpoint will upload one by one the files from supported formats that are in the selection of folders. The import key will be updated so that the user can query for updates by retrieving the list.
   - Depending on whether the process ends with an error or with success, the endpoint will update either the import entry (in case of error) or delete it and add an user log entry (in case of success).

#### Debugging routes

`POST /error`
   - This route does not require the user to be logged in.
   - Body must be JSON, otherwise a 400 is returned.

All the routes below require an admin user to be logged in.

#### Stats route

`GET /stats`
   - Publicly accessible.
   - Returns all public stats information, with the shape `{byfs: INT, bys3: INT, pivs: INT, t200: INT, t900: INT, users: INT}`.

#### Admin routes

`POST /admin/invites`
   - Body must be `{email: STRING, firstName: STRING}` and `body.email` must be an email, otherwise a 400 is returned with body `{error: ...}`.

`GET /admin/invites`
   - Returns an object where each key is an email and each value is an object of the form `{token: STRING, firstName: STRING, sent: INT, accepted: INT|undefined}`.

`POST /admin/invites/delete`
   - Body must be `{email: STRING}`.

`GET /admin/users`
   - Returns an array of users.

`GET /admin/stats`
   - Returns an object with stats.

`GET /admin/debug/ID`
   - Returns an object with all the piv information.

`GET /admin/logs`
   - Returns an array of logs.

`GET /admin/dates`
   - Returns a CSV file with the date information of pivs.

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
   - format-FORMAT: total pivs with the specified format
   - t200:          total thumbnails of size 200
   - t900:          total thumbnails of size 900
   - users:         total users

3. maximum:
   - ms-all:    maximum ms for successful requests for all endpoints
   - ms-auth:   maximum ms for successful requests for POST /auth
   - ms-piv:    maximum ms for successful requests for GET /piv
   - ms-thumb:  maximum ms for successful requests for GET /thumb
   - ms-pivup:  maximum ms for successful requests for POST /piv
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
   - rq-piv:    total successful requests for GET /piv
   - rq-thumb:  total successful requests for GET /thumb
   - rq-pivup:  total successful requests for POST /piv
   - rq-delete: total successful requests for POST /delete
   - rq-rotate: total successful requests for POST /rotate
   - rq-tag:    total successful requests for POST /tag and /tags
   - rq-query:  total successful requests for POST /query
   - rq-share:  total successful requests for POST /share
   - rq-geo:    total successful requests for POST /geo
   - ms-all:    total ms for successful requests for all endpoints
   - ms-auth:   total ms for successful requests for POST /auth
   - ms-piv:    total ms for successful requests for GET /piv
   - ms-thumb:  total ms for successful requests for GET /thumb
   - ms-pivup:  total ms for successful requests for POST /piv
   - ms-delete: total ms for successful requests for POST /delete
   - ms-rotate: total ms for successful requests for POST /rotate
   - ms-tag:    total ms for successful requests for POST /tag
   - ms-query:  total ms for successful requests for POST /query
   - ms-share:  total ms for successful requests for POST /share
   - ms-geo:    total ms for successful requests for POST /geo
   - ms-pivup-initial:   total ms for initial checks in POST /piv
   - ms-pivup-metadata:  total ms for metadata check in POST /piv
   - ms-pivup-hash:      total ms for hash check in POST /piv
   - ms-pivup-fs:        total ms for FS operations in POST /piv
   - ms-pivup-thumb:     total ms for thumbnail creation in POST /piv
   - ms-pivup-db:        total ms for info storage & DB processing in POST /piv
   - ms-video-convert:   total ms for non-mp4 to mp4 video conversion
   - ms-video-convert:FORMAT: total ms for non-mp4 (with format FORMAT, where format is `mov|avi|3gp`) to mp4 video conversion

### Redis structure

```
- users:USERNAME (hash):
   pass: STRING
   username: STRING
   email: STRING
   type: STRING (one of tier1|tier2)
   created: INT
   geo: 1|undefined
   suggestGeotagging: 1|undefined
   suggestSelection: 1|undefined

- geo:USERNAME: INT|undefined, depending on whether there's an ongoing process to enable geotagging for the user.

- emails (hash): key is email, value is username

- emailtoken:TOKEN (hash): key is token, value is email. Used to verify email addresses.

- invites (hash): key is email, value is {firstName: STRING, token: ..., sent: INT (date), accepted: UNDEFINED|INT (date)}

- verify (hash): key is token, value is email. Deleted after usage.

- csrf:SESSION (string): key is session, value is associated CSRF token.

- hash:USERNAME (hash): key is hash of piv uploaded (with metadata stripped), value is id of corresponding piv. Used to check for repeated piv.

- hashorig:USERNAME (hash): key is hash of piv uploaded (without metadata stripped), value is id of corresponding piv. Used to check for already uploaded piv.

- hash:USERNAME:PROVIDER (set): contains hashes of the pivs imported by an user. The hashed quantity is `ID:MODIFIED_TIME`.

- hashdel:USERNAME (set): contains hashes of the pivs deleted by an user, to check for repetition when re-uploading files that were deleted. This field is not in use yet.

- hashorigdel:USERNAME (set): contains hashes of the pivs deleted by an user (without metadata stripped), to check for repetition when re-uploading files that were deleted. This field is not in use yet.

- hashdel:USERNAME:PROVIDER (set): contains hashes of the pivs deleted by an user, to check for repetition when re-importing files that were deleted. The hashed quantity is `ID:MODIFIED_TIME`. This field is not in use yet.

- thu:ID (string): id of the corresponding piv.

- piv:ID (hash)
   id: STRING (uuid)
   owner: STRING (user id)
   name: STRING
   dateup: INT (millis)
   dimw: INT (width in pixels)
   dimh: INT (height in pixels)
   byfs: INT (size in bytes in FS)
   hash: STRING
   originalHash: STRING
   providerHash: STRING (provider hash if piv was imported, which comes from combining `FILE_ID:MODIFIED_TIME`; has the shape PROVIDER:HASH)
   dates: STRING (stringified object of dates belonging to the piv)
   deg: INT 90|-90|180 or absent
   date: INT (latest date within dates)
   dateSource: STRING (metadata field used to get date)
   format: STRING
   t200: STRING or absent
   by200: INT or absent (size of 200 thumbnail in FS)
   t900: STRING or absent
   by900: INT or absent (size of 900 thumbnail in FS)
   vid: `1` if a mp4 video, absent if a piv, ID for a non-mp4 video (ID points to the mp4 version of the video), `pending:ID` for a pending mp4 conversion, `error:ID` for an errored conversion.
   bymp4: if a non-mp4 video, size of mp4 version of the video.
   xt2: INT or absent, number of thumb200 downloaded (also includes cached hits)
   xt9: INT or absent, number of thumb900 downloaded (also includes cached hits)
   xp:  INT or absent, number of pivs downloaded (also includes cached hits)
   loc: [INT, INT] or absent - latitude and longitude of piv taken from metadata, only if geotagging is enabled for the piv's owner and the piv has valid geodata.

- pivt:ID (set): list of all the tags belonging to a piv.

- tag:USERNAME:TAG (set): piv ids.

- tags:USERNAME (set): list of all tags created by the user. Does not include tags shared with the user.

- shm:USERNAME (set): USERA:TAG, USERB:TAG (shared with me)

- sho:USERNAME (set): USERA:TAG, USERB:TAG (shared with others)

- download:ID (string): stringified object of the shape `{username: ID, pivs: [{owner: ID, id: ID, name: STRING}, {...}, ...]}`. Expires after 5 seconds.

- ulog:USERNAME (list): stringified log objects with user activity. Leftmost is most recent.
   - For login:           {t: INT, ev: 'auth', type: 'login',          ip: STRING, userAgent: STRING, timezone: INTEGER}
   - For logout:          {t: INT, ev: 'auth', type: 'logout',         ip: STRING, userAgent: STRING}
   - For signup:          {t: INT, ev: 'auth', type: 'signup',         ip: STRING, userAgent: STRING}
   - For recover:         {t: INT, ev: 'auth', type: 'recover',        ip: STRING, userAgent: STRING}
   - For reset:           {t: INT, ev: 'auth', type: 'reset',          ip: STRING, userAgent: STRING}
   - For password change: {t: INT, ev: 'auth', type: 'passwordChange', ip: STRING, userAgent: STRING}
   - For account delete:  {t: INT, ev: 'auth', type: 'delete',         ip: STRING, userAgent: STRING, triggeredByAdmin: true|UNDEFINED}
   - For deletes:         {t: INT, ev: 'delete', ids: [STRING, ...]}
   - For rotates:         {t: INT, ev: 'rotate', ids: [STRING, ...], deg: 90|180|-90}
   - For (un)tags:        {t: INT, ev: 'tag',        type: tag|untag, ids: [STRING, ...], tag: STRING}
   - For (un)shares:      {t: INT, ev: 'share',      type: 'share|unshare,                tag: STRING, whom: ID|UNDEFINED, who: ID|UNDEFINED} (if `whom` is present, `who` is absent and the operation is done by the user; if `who` is present, `whom` is absent and the operation is done to the user).
   - For dismiss:         {t: INT, ev: 'dismiss',    type: 'geotagging|selection'}
   - For geotagging:      {t: INT, ev: 'geotagging', type: 'enable|disable'}
   - Import:
      - For oauth request:     {t: INT, ev: 'import', type: 'request',    provider: PROVIDER}
      - For oauth grant:       {t: INT, ev: 'import', type: 'grant',      provider: PROVIDER}
      - For start listing:     {t: INT, ev: 'import', type: 'listStart',  provider: PROVIDER, id: INTEGER}
      - For listing ended:     {t: INT, ev: 'import', type: 'listEnd',    provider: PROVIDER, id: INTEGER}
      - For cancel:            {t: INT, ev: 'import', type: 'cancel',     provider: PROVIDER, id: INTEGER, status: 'listing|ready|error'} - Note: if cancel happens during upload, it is registered as an upload cancel event.
      - For listing error:     {t: INT, ev: 'import', type: 'listError', provider: PROVIDER, id: INTEGER, error: STRING|OBJECT}
      - For folder selection:  {t: INT, ev: 'import', type: 'selection', provider: PROVIDER, id: INTEGER, folders: [ID, ...]}
   - For upload:
      - [Note on ids: they function as the id of the upload and also mark the beginning time of the upload; in the case of an import upload they are the same as the id of the import itself]
      - For start:              {t: INT, ev: 'upload', type: 'start',    id: INTEGER, provider: UNDEFINED|PROVIDER, tags: UNDEFINED|[STRING, ...], total: INTEGER, tooLarge: UNDEFINED|[STRING, ...], unsupported: UNDEFINED|[STRING, ...], alreadyImported: UNDEFINED|INTEGER (this field is only present in the case of uploads from an import)}
      - For complete:           {t: INT, ev: 'upload', type: 'complete', id: INTEGER, provider: UNDEFINED|PROVIDER}
      - For cancel:             {t: INT, ev: 'upload', type: 'cancel',   id: INTEGER, provider: UNDEFINED|PROVIDER}
      - For wait for long file or to revive stalled upload: {t: INT, ev: 'upload', type: 'wait',     id: INTEGER, provider: UNDEFINED|PROVIDER}
      - For uploaded file:         {t: INT, ev: 'upload', type: 'ok',       id: INTEGER, provider: UNDEFINED|PROVIDER, pivId: ID (id of newly created file),    tags: UNDEFINED|[STRING, ...], deg:90|-90|180|UNDEFINED}
      - For repeated file:         {t: INT, ev: 'upload', type: 'repeated',        id: INTEGER, provider: UNDEFINED|PROVIDER, pivId: ID (id of piv already existing), tags: UNDEFINED|[STRING, ...], lastModified: INTEGER, name: STRING (name of file being uploaded), size: INTEGER (size of file being uploaded), identical: true|false (if true, the file was an exact duplicate; if not, its detection was after comparing a version stripped from metadata), dates: UNDEFINED|{...} (if identical: false, shows the dates found in the piv)}
      - For already uploaded file: {t: INT, ev: 'upload', type: 'alreadyUploaded', id: INTEGER, provider: UNDEFINED|PROVIDER, pivId: ID (id of piv already existing), tags: UNDEFINED|[STRING, ...], lastModified: INTEGER}
      - For invalid file:          {t: INT, ev: 'upload', type: 'invalid',  id: INTEGER, provider: UNDEFINED|PROVIDER, name: STRING, error: STRING|OBJECT}
      - For too large file:        {t: INT, ev: 'upload', type: 'tooLarge', id: INTEGER, provider: UNDEFINED|PROVIDER, name: STRING, size: INTEGER} - This should be prevented by the client or the import process (and added within the `start` log) but we create a separate entry in case the API is used directly to make an upload.
      - For unsupported file:      {t: INT, ev: 'upload', type: 'unsupported', id: INTEGER, provider: UNDEFINED|PROVIDER, name: STRING} - This should be prevented by the client or the import process (and added within the `start` log) but we create a separate entry in case the API is used directly to make an upload.
      - For provider error:         {t: INT, ev: 'upload', type: 'providerError', id: INTEGER, provider: PROVIDER, error: STRING|OBJECT} - Note: this is only possible for an upload triggered by an import.
      - For no more space:          {t: INT, ev: 'upload', type: 'noCapacity', id: INTEGER, provider: UNDEFINED|PROVIDER, error: STRING|OBJECT}
      - For unexpected error:       {t: INT, ev: 'upload', type: 'error', id: INTEGER, provider: UNDEFINED|PROVIDER, name: STRING|UNDEFINED (will be UNDEFINED if it happens on the upload of an import within the import logic), error: STRING|OBJECT, fromClient: true|UNDEFINED (if error is reported by the client)}

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

- oa:g:acc:USERNAME (string): access token for google for USERNAME
- oa:g:ref:USERNAME (string): refresh token for google for USERNAME

- imp:PROVIDER:username (hash) information of current import operation from provider (`g` for google, `d` for dropbox). Has the shape {id: INTEGER, status: listing|ready|uploading|error, fileCount: INTEGER, folderCount: INTEGER, error: UNDEFINED|STRING, selection: UNDEFINED|[ID, ...], data: UNDEFINED|{roots: [ID, ...], folders: {ID: {...}, ...}, files: {ID: {...}, ...}}}

- proc:vid (hash): list of ongoing non-mp4 to mp4 video conversions. key is the `id` of the video, value is the timestamp in milliseconds.

Used by giz:

- session:ID (string): value is username. Used for sessions. Expires automatically.

- token:ID (string): value is username. Used for password recovery. Expires automatically.

- users:USERNAME (hash): covered above, giz only cares about `pass`.
```

Command to copy a key `x` to a destination `y` (it will delete the key at `y`), from the console: `eval 'redis.call ("DEL", KEYS [2]); redis.call ("RESTORE", KEYS [2], 0, redis.call ("DUMP", KEYS [1]));' 2 x y`

## Client

### Views

**Container**: `views.base`: depends on `State.page`. Will only draw something if `State.page` is set (otherwise it will return an empty `<div>`). Contains all other views.

**Pages**:

1. `views.pivs`
   - Depends on: `Data.tags`, `Data.pivs`, `Data.pivTotal`, `Data.queryTags`, `Data.account`, `State.query`, `State.selected`, `State.filter`, `State.untag`, `State.newTag`, `State.showNTags`, `State.showNSelectedTags`.
   - Events:
      - `click -> stop propagation`
      - `click -> rem State.selected`
      - `click -> toggle tag`
      - `click -> select all`
      - `click -> rem State.untag`
      - `click -> set State.untag true`
      - `click -> tag TAG`
      - `click -> untag TAG`
      - `click -> rotate pivs`
      - `click -> delete pivs`
      - `click -> set State.showNTags`
      - `click -> set State.showNSelectedTags`
      - `input -> set State.newTag`
      - `input -> rem State.showNTags`
      - `input -> rem State.showNSelectedTags`
      - `input -> set State.filter`
      - `click -> goto tag`
2. `views.upload`
   - Depends on: `Data.uploads`, `Data.account`, `State.upload.new`, `Data.tags`.
   - Events:
      - `onclick -> snackbar yellow MESSAGE true`
      - `onchange -> upload files|folder`
      - `onclick -> rem State.upload.new`
      - `oninput -> set State.upload.tag`
      - `onclick -> upload tag`
      - `onclick -> rem State.upload.new.tags.INDEX`
      - `onclick -> upload start`
      - `onclick -> upload cancel`
3. `views.share`
4. `views.tags`
5. `views.import`
   - Depends on: `Data.imports`, `State.imports` and `Data.account`.
   - Events:
      - `onclick -> import cancel`
      - `onclick -> import retry`
      - `onclick -> import list`
      - `onclick -> snackbar red/yellow`
      - `onclick -> set/rem State.imports.PROVIDER.showFolders`
      - `onclick -> set/rem State.imports.PROVIDER.currentFolder`
      - `onclick -> set/rem State.imports.PROVIDER.selection`
6. `views.account`
   - Depends on: `Data.account`.
   - Events:
      - `click -> clear changePassword`.
      - `click -> submit changePassword`.
7. Auth:
   7.1 `views.login`
      - Events: `click -> login`
   7.2 `views.signup`
      - Depends on: `Data.signup.username`.
      - Events: `click -> signup`
   7.3 `views.recover`
   7.4 `views.reset`

**Other**:

1. `views.logo`
   - Contained by: `views.header`.
2. `views.snackbar`
   - Depends on: `State.snackbar`.
   - Events: `click -> clear snackbar`.
   - Contained by: `views.base`.
3. `views.header`
   - Events: `click -> logout`
   - Contained by: `views.pivs`, `views.upload`, `views.share`, `views.tags`.
4. `views.empty`
   - Contained by: `views.pivs`.
5. `views.grid`
   - Contained by: `views.pivs`.
   - Depends on `State.nPivs` and `Data.pivs`.
   - Events: `click -> click piv`.
6. `views.open`
   - Contained by: `views.pivs`.
   - Depends on `State.open` and `Data.pivTotal`.
   - Events: `click -> open prev`, `click -> open next`, `click -> exit fullscreen`, `rotate pivs 90 PIV`, `open location PIV`.
7. `views.noSpace`
   - Contained by: `views.import`, `views.upload`.
   - Depends on `Data.account`.
8. `views.importFolders`
   - Contained by: `views.import`.
   - Depends on: `Data.import` and `State.import`.
   - Events:
      - `onclick -> rem State.import.current`
      - `onclick -> set State.import.current`
      - `onclick -> import select`
      - `onclick -> rem State.import.list`
      - `onclick -> set State.import.selection.PROVIDER`
      - `onclick -> rem State.import.selection.PROVIDER`

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

2. General
   1. `initialize`: calls `reset store` and `retrieve csrf`. Then mounts `views.base` in the body. Executed at the end of the script. Burns after being matched. Also sets viewport width for zooming out in mobile.
   2. `reset store`: If its first argument (`logout`) is truthy, it clears out `B.r.log` (to remove all user data from the local event log) and sets `lastLogout` to the current date. Notes `State.redirect` and (re)initializes `B.store.State` and `B.store.Data` to empty objects (with the exception of `State.redirect`) and sets the global variables `State` and `Data` to these objects (so that they can be quickly printed from the console).
   3. `clear snackbar`: clears the timeout in `State.snackbar.timeout` (if present) and removes `State.snackbar`.
   4. `snackbar`: calls `clear snackbar` and sets `State.snackbar` (shown in a snackbar) for 4 seconds. Takes a path with the color (`green|red`) and the message to be printed as the first argument. As second argument it takes a flag `noSnackbar` that doesn't set a timeout to clear the snackbar.
   5. `get` & `post`: wrapper for ajax functions.
      - `path` is the HTTP path (the first path member, the rest is ignored and actually shouldn't be there).
      - Takes `headers`, `body` and optional `cb`.
      - Removes last log to excise password or token information from `B.r.log`.
      - Adds `Data.csrf` to most `POST` requests.
      - If by the time the response from the server is received, the user has just logged out (judging by `lastLogout`), and the request is not an auth request, the callback will not be executed.
      - If 403 is received and it is not an auth route or `GET csrf`, calls `reset store true` (with truthy `logout` argument), `goto page login` and `snackbar`.
   6. `error`: submits browser errors (from `window.onerror`) to the server through `post /error`.
   7. `read hash`:
      - If the page is `signup`, it reads the second part of the hash and stores it into `Data.signup`, then modifies the hash to get rid of the extra information once it is in the store.
      - If the page is `import`, it reads the second and third part of the hash. If the second part is `success`, it expects the provider's name to be the third part of the hash (as sent in a redirect by the server) and sets `State.import.PROVIDER.authOK` to `true`.
      - Invokes `goto page PAGE`, where `PAGE` is the first part of the hash.
   8. `goto page PAGE`: this is the main navigation responder, which decides whether a change in the hash should take the app to a new page.
      - Before explaining the implementation, it is useful to understand the requirements of navigation in the application.
         - We cannot go to views that don't exist.
         - We can only show certain pages while being logged in, and certain pages only when being logged out.
         - When requesting a logged in page when being logged out, the user should be redirected to the requested page after signup/login. We'll use `State.redirect` to store the required view after signup/login.
         - When loading the app for the first time, we should notice whether the user wants to go to no view or the default view (which means the default view), or a valid view that requires login.
         - Navigation covers four cases: 1) initial load of the app; 2) change of hash (the user has decided to go to another view); 3) signup/login; 4) logout.
            - The initial load can take you to the requested view if you're logged in, or to `login` otherwise (but remembering that choice). It should disregard non-existing views being requested.
            - The change of hash is very similar to the initial load.
            - `signup/login` takes you to either the requested view (`State.redirect`) or the default logged in view.
            - `logout` takes you to `signup/login`.
      - Implementation notes:
         - This responder is invoked directly by `signup/login` and `logout`. Also by `read hash`. The initial load hits it through invoking `read hash`.
         - This responder exists as a gatekeeper to `State.page`, to prevent responders that are matched on a certain value of `State.page` being triggered if the user doesn't have access to a certain page. For example, the responders that perform queries in `pics` should not be triggered until the user is logged in.
      - Sequence:
         - The responder defines a list of valid views when being logged and unlogged.
         - If `PAGE` is undefined or it isn't a valid view, the responder will consider `PAGE` to be the default logged in page (`pics`).
         - The responder checks whether the user is logged by reading `Data.csrf`.
         - If the user is not logged, we set `State.redirect` to `PAGE` and then invoke `goto page login`. We don't do anything else.
         - If the user is logged but the requested view requires being unlogged, we invoke `goto page pics`. We don't do anything else.
         - If we're logged and `State.redirect` is set, we invoke `rem State.redirect`.
         - We update the document's title using `PAGE`.
         - If `State.page` is different from `PAGE`, we set it.
         - If `window.location.hash` doesn't match `PAGE`, we update it.
   8. `test`: loads the test suite.

3. Auth
   1. `retrieve csrf`: takes no arguments. Calls `get /csrf`. In case of non-403 error, calls `snackbar`; otherwise, it sets `Data.csrf` to either the CSRF token returned by the call, or `false` if the server replied with a 403. Also invokes `read hash` to kick off the navigation after we determine whether the user is logged in or not.
   3. `login`: calls `post /auth/login. In case of error, calls `snackbar`; otherwise, it updates `Data.csrf` and invokes `goto page State.redirect`.
   4. `logout`: takes no arguments. Calls `post /auth/logout`). In case of error, calls `snackbar`; otherwise, calls `reset store` (with truthy `logout` argument) and invokes `goto page login`.
   5. `signup`: calls `post /auth/signup`. In case of error, calls `snackbar`; otherwise, it updates `Data.csrf` and invokes `goto page State.redirect`.
   6. `request invite`: calls `post /requestInvite`. Calls `snackbar` with either an error or a success message.

4. Pivs
   1. `change []`: stopgap responder to add svg elements to the page until gotoB v2 (with `LITERAL` support) is available.
   2. `change State.page`: if current page is not `pivs`, it does nothing. If there's no `Data.account`, it invokes `query account`. If there's no `State.query`, it initializes it to `{tags: [], sort: 'newest'}`; otherwise, it invokes `query pivs true`. It also triggers a `change` in `State.selected` to mark the selected pivs if coming back from another view.
   3. `change State.query`: if the path to the change is just `State` object (which only happens during initialization or logout), we ignore it. if the change is not to `State.query.recentlyTagged`, we directly set `State.nPivs` to 20 (we don't do it through an event because we want to avoid that call also invoking `query pivs`). We then invokes `query pivs true`.
   4. `change State.selected`: adds & removes classes from `#pics`, adds & removes `selected` class from pivs in `views.grid` (this is done here for performance purposes, instead of making `views.grid` redraw itself when the `State.selected` changes)  and optionally removes `State.untag`. If there are no more pivs selected and `State.query.recentlyTagged` is set, we `rem` it and invoke `snackbar`.
   5. `change State.untag`: adds & removes classes from `#pics`; if `State.selected` is empty, it will only remove classes, not add them.
   6. `query pivs`:  if `State.query` is not set, does nothing. If `State.querying` is true, does nothing; otherwise it sets it `State.querying` to `true`; if `State.queryRefresh` is set, it removes it and invokes `clearTimeout` on it; invokes `post query`, using `State.query` and `State.nPivs + 100` (the reason for the `+ 100` is that we hold the metadata of up to 100 pivs more than we display to increase the responsiveness of the scroll). Once the query is done, it sets again `State.querying` to `false` and invokes `query tags`. It also sets `Data.pendingConversions` to `true|false`, depending if the returned list of pivs contains a non-mp4 video currently being converted. If `State.nPivs` is set to 20, it scrolls the view back to the top. If it receives a truthy first argument (`updateSelected`), it updates `State.selected`. It sets `Data.pivs` and `Data.pivTotal` (and optionally `State.open` if it's already present) after invoking `post query`. If `body.refreshQuery` is set to true, it will set `State.querying` to a timeout that invokes `query pivs` after 1500ms. Also sets `Data.queryTags`. If `State.open` is not present, it will also invoke `fill screen`.
   7. `click piv id k ev`: depends on `State.lastClick` and `State.selected`. If it registers a double click on a piv, it removes `State.selected.PIVID` and sets `State.open`. Otherwise, it will change the selection status of the piv itself; if `shift` is pressed (judging by reading the `shiftKey` of `ev` and the previous click was done on a piv still displayed, it will perform multiple selection.
   8. `key down|up`: if `keyCode` is 13 and `#newTag` is focused, invoke `tag pics`; if `keyCode` is 13 and `#uploadTag` is focused, invoke `upload tag`; if the path is `down` and keycode is either 46 (delete) or 8 (backspace) and there are selected pivs, it invokes `delete pivs`.
   9. `toggle tag`: if `State.querying` is `true`, it will do nothing. Otherwise, if tag is in `State.query.tags`, it removes it; otherwise, it adds it. If the tag removed is `'untagged'` and `State.query.recentlyTagged` is defined, we remove it. If the tag is added and it is an user tag, we invoke `rem State.filter`.
   10. `select all`: Invokes `post query` using `State.query` and setting `body.idsOnly` to `true`. Sets `State.selected` using the body returned by the query.
   11. `query tags`: invokes `get tags` and sets `Data.tags`. It checks whether any of the tags in `State.query.tags` no longer exists and removes them from there.
   12. `tag pivs`: invokes `post tag`, using `State.selected`. If tagging (and not untagging) and `'untagged'` is in `State.query.tags`, it adds items to `State.query.recentlyTagged`, but not if they are alread there. In case the query is successful it invokes `query pivs`. Also invokes `snackbar`. A special case if the query is successful and we're untagging all the pivs that match the query: in that case, we only remove the tag from `State.query.tags` and not do anything else, since that invocation will in turn invoke `query pivs` and `query tags`.
   13. `rotate pivs`: invokes `post rotate`, using `State.selected`. In case the query is successful it invokes `query pivs`. In case of error, invokes `snackbar`. If it receives a second argument (which is a piv), it submits its id instead of `State.selected`.
   14. `delete pivs`: invokes `post delete`, using `State.selected`. In case the query is successful it invokes `query pivs true`. In case of error, invokes `snackbar`.
   15. `goto tag`: clears up `State.selection` and sets `State.query.tags` to the selected tag.
   16. `scroll`: only will perform actions if `State.page` is `pivs`. Will set `State.lastScroll` if it doesn't exist, or if `State.lastScroll` is older than 10ms. It will increase `State.nPivs` only if the following conditions are met: 1) the `scroll` goes down; 2) the `scroll` happened while the last pivs being displayed are visible. If the conditions are met, it will invoke `increment nPivs` and `change State.selected`.
   17. `fill screen`: if `State.page` is `pivs`, there are pivs present and the pivs do not fill the screen, then it will invoke `increment nPivs`.
   18. `download`: uses `State.selected`. Invokes `post download`. If unsuccessful, invokes `snackbar`.
   19. `stop propagation`: stops propagation of the `ev` passed as an argument.
   20. `increment nPivs`: if `Data.pivTotal` is more than `State.nPivs`, `State.nPivs` will be incremented by 20; if `Data.pivTotal` is more than `State.nPivs` but less than `State.nPivs + 20`, then `State.nPivs` will be set to `Data.pivTotal`.
   21. `change State.nPivs`: if `State.nPivs + 100` is more than `Data.pivTotal`, the responder will invoke `State.query`.
   22. `change Data.pendingConversions`: if `Data.pendingConversions` is `true` and `State.pendingConversions` already contains an interval, or if `Data.pendingConversions` is `false` and `State.pendingConversions` is `undefined`, the responder does nothing. If `Data.pendingConversions` is `true` and there's no interval yet, it sets an interval to invoke `query pivs` every 2 seconds and stores it in `State.pendingConversions`. If `Data.pendingConversions` is `false` and there's still an interval, it removes it from the store and invokes `clearInterval` on it.

5. Open
   1. `key down`: if `State.open` is set, invokes `open prev` (if `keyCode` is 37) or `open next` (if `keyCode` is 39).
   2. `enter fullscreen`: enter fullscreen using the native browser methods and set the `<body>` `overflow` to `hidden`.
   3. `exit fullscreen`: if `State.open` is present, remove it. Depending on the `exited` flag passed to the invocation, exit fullscreen using the native browser methods. Also remove the `<body>` `overflow` property so it reverts to the defaut.
   4. `change State.open`: remove or add `app-fullscreen` class from `#pics`, depending on whether `State.open` is defined. If `State.open` is defined, it invokes `enter fullscreen`.
   5. `open prev|next`: decrements or increments `State.open`, with wraparound if going back when on the first piv or when going forward on the last piv. If `State.open` is equal to `State.nPivs` and the `next` piv is requested, it invokes `increment nPivs`.
   6. `touch start`: only performs actions if `State.open` is set. Sets `State.lastTouch`.
   7. `touch end`: only performs actions if `State.open` is set. Reads and deletes `State.lastTouch`. If it happened less than a second ago, it invokes `open prev` or `open next`, depending on the direction of the touch/swipe.
   8. `open location`: takes a `piv` with `loc` field as its argument. Opens Google Maps in a new tab with the specified latitude & longitude.

6. Upload
   1. `change State.page`: if `State.page` is `upload` or `pivs`, 1) if no `Data.account`, `query account`; 2) if no `Data.tags`, `query tags`; 3) if no `Data.uploads`, `query uploads`.
   2. `drop files`: if `State.page` is `upload`, access dropped files or folders and put them on the upload file input. `add` (without event) items to `State.upload.new.tooLarge`, `State.upload.new.unsupported` and `State.upload.new.files`, then `change State.upload.new`.
   3. `upload files|folder`: `add` (without event) items to `State.upload.new.tooLarge`, `State.upload.new.unsupported` and `State.upload.new.files`, then `change State.upload.new`. Clear up the value of either `#files-upload` or `#folder-upload`. If it's a folder upload, it clears the snackbar warning about possible delays with `clear snackbar`.
   4. `upload start`: invokes `post upload` using `State.upload.new.files`, `State.upload.new.tooLarge`, `State.upload.new.unsupported`, and `State.upload.new.tags`; if there's an error, invokes `snackbar`. Otherwise sets `State.upload.wait.ID`, invokes `query uploads`, adds items from `State.upload.new.files` onto `State.upload.queue`, then deletes `State.upload.new` and invokes `change State.upload.queue`.
   5. `upload cancel|complete|wait|error`: receives an upload `id` as its first argument and an optional `noSnackbar` flag as the second argument, plus an optional `error` as the third argument; invokes `post upload`; if the operation is `wait`, it sets `State.upload.wait.ID.lastActivity` and does nothing else; if `post upload` receives an error, invokes `snackbar`; otherwise, if it's the `cancel` or `error` operation, finds all the files on `State.upload.queue` with `id`, filters them out and updates `State.upload.queue`. For both `cancel` and `complete`, it then removes `State.upload.wait.ID`, clears the interval at `State.upload.wait.ID.interval` and invokes `query uploads`; if operation is `error`, it invokes `snackbar red` and returns; if `noSnackbar` is present, it finally invokes `snackbar` to report success.
   6. `upload tag`: optionally invokes `snackbar`. Adds a tag to `State.upload.new.tags` and removes `State.upload.tag`.
   7. `query uploads`: if `State.upload.timeout` is set, it removes it and invokes `clearTimeout` on it; it then invokes `get uploads`; if there's an error, invokes `snackbar`; otherwise, sets the body in `Data.uploads` and conditionally sets `State.upload.timeout`. If a timeout is set, the timeout will invoke `query uploads` again after 1500ms.
   8. `change State.upload.queue`:
      - Hashes the file; if there is an error, invokes `upload error` and returns.
      - Invokes `post uploadCheck` to check if an identical file already exists; if there is an error, invokes `upload error` and returns.
      - If a file with the same hash already exists, the responder removes it from `State.upload.queue` and conditionally invokes `upload complete` if this is the last file of an upload that still has status `uploading` (as per `Data.uploads`). It then returns.
      - Invokes `post piv` to upload the file.
      - Sets `State.upload.wait.ID.lastActivity`.
      - Removes the file just uploaded from `State.upload.queue`.
      - If space runs out, it invokes `upload cancel` on all pending uploads, passing a `true` flag as the second argument.
      - If there's an unexpected error (not a 400) it invokes `upload error`.
      - Conditionally invokes `upload complete` if this is the last file of an upload that still has status `uploading` (as per `Data.uploads`).

7. Import
   1. `change State.page`: if `State.page` is `import`, 1) if no `Data.account`, `query account`; 2) for all providers, if `State.import.PROVIDER.authOK` is set, it deletes it and invokes `import list PROVIDER true` to create a new list; 3) for all providers, if there's no `Data.import.PROVIDER`, invokes `import list PROVIDER`.
   2. `query imports PROVIDER`: if `State.imports.PROVIDER.timeout` is set, it removes it and invokes `clearTimeout` on it; it then invokes `get imports/PROVIDER`; if the request is unsuccessful, invokes `snackbar red`, otherwise sets `set Data.imports.PROVIDER` to the result of the query; it conditionally sets `State.imports.PROVIDER.selection` and `State.imports.PROVIDER.timeout`. If a timeout is set, the timeout will invoke `query imports` again after 1500ms.
   3. `import list PROVIDER`: invokes `post import/list/PROVIDER`; if unsuccessful, invokes `snackbar`, otherwise invokes `query imports PROVIDER`.
   4. `import cancel PROVIDER`: invokes `post import/cancel/PROVIDER`; invokes `snackbar` and then `query imports PROVIDER`.
   5. `import retry PROVIDER`: invokes `post import/cancel/PROVIDER`; if unsuccessful, invokes `snackbar`, otherwise invokes `import list PROVIDER`.
   6. `import select PROVIDER start`: invokes `post import/select/PROVIDER` passing `State.import.PROVIDER.selection`; if there is an error, invokes `snackbar`. Otherwise, if `start` is not passed it only invokes `query imports PROVIDER`. If the query is successful and `start` is passed, it sets `Data.imports.PROVIDER` and invokes `post import/upload/PROVIDER`; if that invocation is not successful, it invokes `snackbar`, otherwise it invokes `query imports PROVIDER`.

8. Account
   1. `query account`: `get account`; if successful, `set Data.account`, otherwise invokes `snackbar`. Optionally invokes `cb` passed as extra argument.
   2. `dismiss geotagging|selection`: `post dismiss`; if path is `geotagging`, invokes `snackbar`. If successful, invokes `query account`.
   3. `toggle geo dismiss`: `post geo`; if successful, invokes `query account`. It always invokes `snackbar`. If operation is successful, invokes `query pivs` and `query tags`. If `dismiss` is passed, invokes `dismiss geotagging`.
   4. `submit changePassword`: invokes `post auth/changePassword`, invokes `snackbar`; if successful, invokes `clear changePassword`.
   5. `clear changePassword`: clears inputs of the change password fields and removes `State.changePassword`.

### Store

- `lastLogout`: date of the last logout done in the current tab.
- `State`:
   - `changePassword`: if present, shows the change password form in the account view.
   - `filter`: filters tags shown in sidebar.
   - `imports`: if defined, it is an object with one key per provider and as value an object of the form:
```
{
   authOK: UNDEFINED|true, (if present we just confirmed an OAuth flow and we want to start an import process)
   currentFolder: UNDEFINED|STRING,
   showFolders: UNDEFINED|true, (if present, we show the folder list for this provider)
   selection: UNDEFINED|{ID1: true, ...},
   timeout: UNDEFINED|timeout, (if present, a timeout that makes `query imports PROVIDER` invoke itself)
}
```
  `list` determines whether the list of folders for import from the indicated provider is visible; `current` marks the current folder being inspected; and `selected` is a list of folders to be imported; if present, `update` is a javascript interval that updates the list.
   - `lastClick`: if present, has the shape `{id: PIVID, time: INT}`. Used to determine 1) a double-click (which would open the piv in full); 2) range selection with shift.
   - `lastScroll`: if present, has the shape `{y: INT, time: INT}`. Used to determine when to increase `State.nPivs`.
   - `lastTouch`: if present, has the shape `{x: INT, time: INT}`. Used to detect a swipe within `views.open`.
   - `newTag`: the name of a new tag to be posted.
   - `nPivs`: the number of pivs to show.
   - `open`: index of the piv to be shown in full-screen mode.
   - `page`: determines the current page.
   - `pendingConversions`: if set, an interval that invokes `query pivs`.
   - `redirect`: determines the page to be taken after logging in, if present on the original `window.location.hash`.
   - `query`: determines the current query for pivs. Has the shape: `{tags: [...], sort: 'newest|oldest|upload'}`.
   - `queryRefresh`: if set, a timeout that invokes `query pivs` after 1500ms.
   - `querying`: BOOLEAN|UNDEFINED, set if `query pivs` is currently querying the server.
   - `selected`: an object where each key is a piv id and every value is either `true` or `false`. If a certain piv key has a corresponding `true` value, the piv is selected.
   - `showNTags`: UNDEFINED|INTEGER, determines the amount of tags seen when no pivs are selected.
   - `showNSelectedTags`: UNDEFINED|INTEGER, determines the amount of tags seen when at least one piv is selected.
   - `snackbar`: prints a snackbar. If present, has the shape: `{color: STRING, message: STRING, timeout: TIMEOUT_FUNCTION}`. `timeout` is the function that will delete `State.snackbar` after a number of seconds. Set by `snackbar` event.
   - `untag`: flag to mark that we're untagging pivs instead of tagging them.
   - `upload`:
      - `new`: {unsupported: [STRING, ...]|UNDEFINED, files: [...], tags: [...]|UNDEFINED}
      - `queue`: [{file: ..., uid: STRING, tags: [...]|UNDEFINED, uploading: true|UNDEFINED, lastInUpload: true|false}, ...]
      - `tag`: content of input to filter tag or add a new one.
      - `timeout`: if present, a timeout that invokes `query uploads`.
      - `wait`: if present, an object where every key is an upload id and the value is an array of the form `{lastActivity: INTEGER, interval: SETINTERVAL FUNCTION}`. These are used to determine when a `wait` event should be sent.

- `Data`:
   - `account`: `{username: STRING, email: STRING, type: STRING, created: INTEGER, usage: {limit: INTEGER, used: INTEGER}, suggestGeotagging: true|UNDEFINED, suggestSelection: true|UNDEFINED}`.
   - `csrf`: if there's a valid session, contains a string which is a CSRF token. If there's no session (or the session expired), set to `false`. Useful as both a CSRF token and to tell the client whether there's a valid session or not.
   - `imports`: an object where each key is a provider. If defined, each key has as value an array with one or more imports. Imports that are in the process of being uploaded or have already been uploaded have the same shape as those in `Data.uploads`. However, there may be up to one import per provider representing an import in a listing or ready state. Also there might be just an object with the keys `redirect` and `provider`, if the OAuth flow has not been done yet.
```
   {
      redirect: STRING|UNDEFINED,
      id: INTEGER|UNDEFINED,
      provider: PROVIDER,
      status:   listing|ready|error|uploading|stalled|complete (uploading/stalled is for imports that are being uploaded)
      fileCount: INTEGER|UNDEFINED,
      folderCount: INTEGER|UNDEFINED,
      error: STRING|OBJECT|UNDEFINED,
      selection: UNDEFINED|[ID, ...],
      data: UNDEFINED|{roots: [ID, ...], folders: [{id: ID, name: STRING, count: INTEGER, parent: ID, children: [ID, ...]}]},
   }
```
   - `pendingConversions`: if truthy, indicates that one or more videos in the current query are non-mp4 videos being converted.
   - `pivs`: `[...]`; comes from `body.pivs` from `query pivs`.
   - `pivTotal`': UNDEFINED|INTEGER, with the total number of pivs matched by the current query; comes from `body.total` from `query pivs`.
   - `queryTags`: `{'a::': INTEGER, 'u::': INTEGER, tag1: ..., ...}`; comes from `body.tags` from `query pivs`.
   - `signup`: `{username: STRING, token: STRING, email: STRING}`. Sent from invitation link and used by `signup []`.
   - `tags`: `[TAG1, TAG2, ...]`. Only includes tags created by the user.
   - `uploads`: `[{id: INTEGER (also functions as start time), total: INTEGER, status: uploading|complete|cancelled|stalled|error, unsupported: UNDEFINED|[STRING, ...], alreadyImported: INTEGER|UNDEFINED (only for uploads of imports), alreadyUploaded: INTEGER|UNDEFINED, tags: [STRING, ...]|UNDEFINED, end: INTEGER|UNDEFINED, ok: INTEGER|UNDEFINED, repeated: [STRING, ...]|UNDEFINED, repeatedSize: INTEGER|UNDEFINED, invalid: [STRING, ...]|UNDEFINED, tooLarge: [STRING, ...]|UNDEFINED, lastPiv: {id: STRING, deg: UNDEFINED|90|-90|180}, error: UNDEFINED|STRING|OBJECT, providerErrors: UNDEFINED|[STRING|OBJECT, ...]}, ...]`.

## Admin

Only things that differ from client are noted.

### Views

**Pages**:

1. `views.dashboard`
2. `views.invites`
   - Depends on: `Data.invites`, `State.newInvite`
   - Events:
      - `click -> create invite`
      - `click -> delete invite`
      - `change -> set State.newInvite.ID`
      - `click -> del State.newInvite`
3. `views.users`
   - Depends on: `Data.users`
   - Events:
      - `click -> delete user USERNAME`
4. `views.logs`
   - Depends on: `Data.logs`
5. `views.deploy`
   - Events:
      - `click -> deploy client`

### Responders

1. Invites
   1. `retrieve invites`: invokes `get admin/invites`.
   2. `create invite`: invokes `post admin/invites` with `State.newInvite`; if successful, invokes `retrieve invites` and `rem State.newInvite`. It also invokes `snackbar`.
   3. `delete invite`: invokes `delete admin/invites/EMAIL`; if successful, invokes `retrieve invites`. It also invokes `snackbar`.
   4. `change State.page`: if current page is `invites` and there's no `Data.invites`, it invokes `retrieve invites`.

2. Users
   1. `retrieve users`: invokes `get admin/users`.
   2. `delete user`: invokes `post auth/delete`; if successful, invokes `retrieve users`. It also invokes `snackbar`.
   3. `change State.page`: if current page is `users` and there's no `Data.users`, it invokes `retrieve users`.

3. Users
   1. `retrieve logs`: invokes `get admin/logs`.
   3. `change State.page`: if current page is `logs` and there's no `Data.logs`, it invokes `retrieve users`.

3. Deploy
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

If the user sent no tags, we set a variable `allMode` to denote that we want all possible pivs.

```javascript
         function (s) {
            var allMode = b.tags.length === 0;
```

If we're in `allMode`, we create an entry for the `a::` tag inside `tags`, with the same shape of the entries already there.

```javascript
            if (allMode) tags ['a::'] = [rq.user.username];
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

By now, `tags` will be an object with each key as a tag, and each value as an array of one or more usernames, with the first one being the username of the user itself: `{KEY1: [USERNAME1, ...], ...}`. This gives us a list of all the tag + username combination that are relevant to the query.

We create two variables: `multi`, to hold the redis transaction; and `qid`, an id for the query we're about to perform. This `qid` key will hold a set of piv ids in redis for the purposes of the query.

```javascript
            var multi = redis.multi (), qid = 'query:' + uuid ();
```

If we have year tags, we bring the ids of all the pivs belonging to each of them and store their union in the query key.

```javascript
            if (ytags.length) multi.sunionstore (qid, dale.go (ytags, function (ytag) {
               return 'tag:' + rq.user.username + ':' + ytag;
            }));
```

We iterate the tags. For each tag, for each of its users, we store the ids of the corresponding pivs onto a key made by appending the tag to the query key.

```javascript
            dale.go (tags, function (users, tag) {
               multi.sunionstore (qid + ':' + tag, dale.go (users, function (user) {
                  return 'tag:' + user + ':' + tag;
               }));
            });
```

We compute the ids of all the pivs that match the query. This will be either the intersection of all the ids for each tag. If there are `ytags`, we also use the query key. In the case of `allMode`, we perform the *union* of all tags, since there might be shared tags for the user.

The year tags are queried separately from normal tags because 1) if more than one year tag is sent, we want the union (not the intersection) of their pivs; and 2) it's not possible to share a year tag with another user, so the querying is simpler.

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

By now, we have a list of all the ids of the pivs matching the query. To access them, we look for a certain item returned by the last call to redis. This item will be at index N (where N is the number of `tags`) or N+1, depending on whether the query has `ytags` or not.

```javascript
         function (s) {
            s.pivs = s.last [(ytags.length ? 1 : 0) + dale.keys (tags).length];
```

We create another `multi` transaction to retrieve the information for all the pivs. We also create an object `ids`, which we'll review in a minute.

```javascript
            var multi = redis.multi (), ids = {};
```

We retrieve all the info for this piv. If `b.recentlyTagged` is passed, we also set an entry for this id into the `ids` object.

```javascript
            dale.go (s.pivs, function (id) {
               multi.hgetall ('piv:' + id);
               if (b.recentlyTagged) ids [id] = true;
            });
```

We iterate `b.recentlyTagged` (this will be a no-op if it's not defined) and store the result into `s.recentlyTagged`.

```javascript
            s.recentlyTagged = dale.fil (b.recentlyTagged, undefined, function (id) {
```

If the piv that is inside `b.recentlyTagged` is already covered by the query, we ignore it.

```javascript
               if (ids [id]) return;
```

Otherwise, we bring its information from the database and return its `id`, so that it will be contained in `s.recentlyTagged`; this last variable will be then an array with the list of the recently tagged pivs that are in excess of the query.

```javascript
               multi.hgetall ('piv:' + id);
               return id;
            });
```

We perform the call to redis to retrieve piv information and move to the next step.

```javascript
            mexec (s, multi);
         },
```

We iterate the pivs in `s.recentlyTagged`, which are those in `b.recentlyTagged` that are not already contained in the rest of the query. The goal is to prevent returning info from pivs for which the user shouldn't have access.

```javascript
         function (s) {
            var recentlyTagged = dale.fil (s.recentlyTagged, undefined, function (v, k) {
```

If there's no such piv or the piv doesn't belong to the user, it cannot be a recently tagged piv by the user (since the user cannot tag a piv that is not theirs). In this case, we ignore the piv. Otherwise, we return the actuali piv information.

```javascript
               if (! s.last [s.pivs.length + k] || s.last [s.pivs.length + k].owner !== rq.user.username) return;
               return s.last [s.pivs.length + k];
            });
```

We set `s.pivs` to hold the info of the pivs queried, ignoring those coming from `b.recentlyTagged`; we concatenate to it the pivs in `recentlyTagged`, which have been filtered both by existence and ownership. This is the set of pivs that will match the query.

Note that we filter out any `null` values, which can happen if some pivs returned by the query got deleted before getting their info but after the first part of the query was done.

```javascript
            s.pivs = dale.fil (s.last.slice (0, s.pivs.length).concat (recentlyTagged), null, function (piv) {return piv});
```

If `b.idsOnly` is `true`, we only return an array with the ids of all the matching pivs. Notice that we ignore `b.sort`, `b.from` and `b.to`.

```javascript
            if (b.idsOnly) return dale.go (s.pivs, function (piv) {return piv.id});
```

If there are no pivs, we return an object representing an empty query. The fields are `total`, `pivs` and `tags`.

```javascript
            if (s.pivs.length === 0) return reply (rs, 200, {total: 0, pivs: [], tags: []});
```

## License

ac;pic is written by [Altocode](https://altocode.nl) and released into the public domain.
