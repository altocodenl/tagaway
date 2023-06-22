# tagaway :: all your photos and videos in one place

## About

tagaway is an application that allows you to store and manage your pictures and videos (pivs). tagaway is built by [Altocode](https://altocode.nl). While the service itself is paid, Altocode freely shares the code for all purposes, including commercial ones.

To understand why we're sharing the source code of a commercial product, please read [our manifesto](http://federicopereiro.com/manifesto). If that's too long to read, in a nutshell: we want to share our code so that others can learn from it and contribute to us. Sharing is the way to progress.

All non-code documents related to the project are published in this [open folder](https://drive.google.com/drive/u/1/folders/11UPZHrHUT_ce2baN9s0K-CtfXYQOewG3).

## Status

tagaway is currently in private beta.

The authors wish to thank [Browserstack](https://browserstack.com) for providing tools to test cross-browser compatibility.

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

- bugs
   - **server: investigate bug with piv with location but no geotags**
   - server: investigate 502 nginx error
   - server: replicate & fix issue with hometags not being deleted when many pivs are deleted at the same time
   - server/client/mobile: require csrf token for logging out (also ac;log)
   - client: fix phantom selection when scrolling with a large selection
   - client: refresh always in upload, import and pics // check that `_blank` oauth flow bug is fixed in old tab
   - server: prevent Whatsapp filenames with count that can be parsed into hour from being parsed as hour
--------------
- small tasks
   - **server: add cache for query that works on the last query, delete it on any user operation (tag|rotate|upload|delete|mp4conv|share accept/remove), SETEX 60s for changes on shared tags**
   - **Test hoop from US: check latency, then check if we can do HTTPS with two IPs to the same domain. Also check whether that IP would be normally preferred on the Americas.**
   - **server: process to review unsupported formats, invalid pivs and errored mp4 conversions**
   - server: review format errors with files that have a jpg extension
   - server: serve webp if there's browser support (check `request.header.accept`, modify tests to get both jpeg and original at M size).
   - server/client: rethink need for refreshQuery field, if we are constantly updating the query.
   - server/client: ignore deleted pivs flag for both upload & import, at an upload/import level.
   - server/client: videos pseudo-tag
   - server/client: set location
   - client: see info of piv
   - client: upgrade pop up notice or email when running out of free space
   - client: retry upload button
   - server/client: show checkbox on tags that are organized
--------------
- small internal tasks
   - server/client: rename everything to tagaway: folders, references.
   - server/client: Add mute events, use teishi.inc, teishi.prod = true in server // also in ac;web & ac;tools
   - server: on uncaughtException, close the server, then destroy all sockets
   - server: change keys from imp:PROVIDER:... to imp:USERNAME:..., same with oa:PROVIDER keys
   - server: rename b to rq.body throughout
   - server: get rid of thu entries, use id of piv + suffix
   - admin: add set of users for fast access rather than scanning db
   - server: script to rename username
   - other: set automatic backup from Google Drive to altofile
--------------
- large tasks
   - other: Submission Google Drive (Tom)
   - server/client: Share & manage
      - server: add support for adding a shared tag to home tags (validate tag type, check if in shm:)
      - server: remove home tags in H.tagCleanup if lose the tag because it was only on shared pivs
      - server: add lists of hashtags and taghashes to avoid expensive keyscans when deleting user
      - server: Finish server tests of queries and tagging, in particular:
         - Cleanup of taghashes/hashtags after owner untagging/deletion
         - Combine organized/to organize with shared pivs.
         - Don't return duplicated pivs and give priority to own pivs
         - Don't double-count tags but do count all tags with duplicated pivs
      - server: If user A shares a tag with user B and user B doesn't have an account or is not logged in: signup, login, or go straight if there's a session. On signup, resolve shares.
      - client: share & manage UI
      - client: In main view, see tags shared with me with a different icon than own tags.
   - server/client: opt-in near-duplicates recognition powered by AI: Deep Image Search
   - server/client: opt-in face recognition powered by AI
   - server/client: opt-in OCR recognition
   - server/client: rotate videos
   - server/client: investigate sharebox concept (web-reachable space where for N days any user can upload and download pivs)
   - server: set up prod mirror
   - server: Investigate soft deletion with different credentials in S3 for 7 days for programmatic errors or security breaches. https://d0.awsstatic.com/whitepapers/protecting-s3-against-object-deletion.pdf
   - server: add dedicated keys for uploads in order to improve getUploads performance
   - server: improve performance of POST /query endpoint
   - Recompute pricing
      - Investigate Glacier lifecycle.
      - Variable cost with maximum per GB? Minimum/maximum range, based on S3 usage.
      - Include price of PUT requests
      - Check new price of servers & price of large disk
      - Check balance between disk and RAM and compare to actual RAM usage
   - server: deploy to prod while there are processes going on!
      - background processes: upload, import, geotagging switch, mp4 conversions
      - incremental steps to solution:
         - don't shut down if there's something going on
         - shut down after all are done
         - stop new ones
         - save progress on what's already done
   - Add notes on self-hosted tagaway
      - Turn off/on S3
      - Docker
      - Documentation

### Already implemented

- Pivs
   - Show onboarding if the user hasn't tagged any pivs yet, but not if the user arrives to the app with a link to a query. When clicking on any tag, go to grid view.
   - Show home tags when entering to the app. When clicking on any tag, go to grid view.
   - When coming back to the pics view from another view, always show home tags.
   - Show dialog that indicates that a click selects a piv and that a double click opens it. The dialog should be permanently dismissable.
   - Show all pivs.
   - Show pivs split in meaningful chunks.
   - Load more pivs on scroll.
   - Hide unseen chunks so that performance remains the same no matter how deeply you scroll.
   - Sort by newest, oldest & upload date.
   - Select/unselect piv by clicking on it.
   - Multiple selection with shift.
   - Select/unselect all.
   - On top, have an always visible bar that shows the dates of the pivs you are seeing, as well as the total number of pivs, the number of selected pivs (if any) and the selected tags (if any).
   - When selecting pivs, see selection bar.
   - Hover on piv and see date.
   - Show untagged pivs.
   - Show year tags.
   - Show only one year tag if one is selected.
   - Show month tags only when a year tag is selected. When a month tag is selected, show the other available months as selectable and remove the current month if another month is selected.
   - When a year tag is removed from the query, also remove the month tag.
   - When all tags are removed from the current query and there is a selection, remove the selection.
   - When querying untagged tag, remove non-year and non-geo tags. When querying normal tag, remove untagged tag.
   - When modifying pivs with `untagged` in the query, add button for confirming operation ("Mark As Organized"); show alert if user navigates away.
   - See list of tags.
   - Query by tag or tags.
   - Show pivs according to the selected tags.
   - If there are selected pivs, toggle between browse mode & organize mode.
   - If query changes but selected pivs are still there, maintain their selection.
   - When performing changes to pivs, if that results on a query with no pivs, the query will be resetted to show Everything.
   - Filter tags when browsing.
   - Tag/untag.
   - Allow to mark pivs as Organized or as To Organize.
   - For a given query, if the query includes Organized or To Organize, see the total number of pivs for the complement tag (for example: if `'o::'` is in the query, see the number of pivs To Organize that the query would have *without* `'o::'`).
   - Filter tags when tagging/untagging.
   - Rotate pivs.
   - Delete pivs.
   - Ignore rotation of videos.
   - When clicking on tag on the attach/unattach menu, remove selection and query the tag.
   - When untagging, if no pivs left with that tag, remove tag from query. Same goes for marking as Organized if To Organize is in the query, or if marking as To Organize if Organized is in the query.
   - Fill pivs grid until screen is full or no pivs remain.
   - Block selection of a tag if the UI is still processing a previous selection of a tag.
   - Download a single piv.
   - Download multiple pivs as one zip file. The original modification times of each file should be respected.
   - Only show tags relevant to the current query.
   - When just enabling geotagging, update tags every 3 seconds.
   - Suggest geotagging when having a few pivs uploaded, but only once; either enable it or dismiss the message, and don't show it again.
   - When clicking on no man's land, unselect.
   - When querying untagged pivs AND pivs are selected, show "Done tagging" button. When tagging those pivs, they remain in selection until either 1) "Done tagging" button is clicked; 2) all pivs are unselected; or 3) "untagged" is removed from query.
   - Scroll to the top of the pivs grid when selecting a new combination of tags.
   - Retain current query and scroll position in the URL, so it can be copied and opened into a new tab.
   - The back button takes you to the previous query (including its scroll position), but not to the same query with a different scroll position.
   - When scrolling up/down, updates should not modify the scroll position.
   - When uploads are happening in the background that affect the current query, the piv at the top left of the screen should remain on the top row until the next refresh.
   - When uploads are happening in the background that affect the current query, show a dialog that allows for the query to be manually updated, or auto-updated.
   - Be able to invert the order in which tags on the left sidebar are shown, as well as sorting alphabetically rather than by number of pivs.
   - Click on chunk header to narrow down selection (range tag).

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
   - Show thumbnail of last piv on each upload. If said piv is deleted, then the latest uploaded piv that still exists is shown. If all pivs from the upload are deleted, no thumbnail is shown.
   - Cancel current upload. After cancelling, show snackbar that indicates how many pivs were uploaded for the given upload.
   - Mobile: show upload box as folders only, since there's no dropdown or perhaps no folders.
   - Snackbar with success message when pivs are finished uploading.
   - Show errors.

- Share & manage
   - If user A shares tag X with user B:
      - User A sees the tag as shared with others in its share view.
      - User B gets transactional email to accept tag X.
      - If user B doesn't click on the accept button, nothing else happens.
      - If user B is not logged in yet, they are prompted to login. If they don't have an account, they can create one. In both cases, the flow is resumed as if user B was logged in, once the login/signup is completed successfully.
   - If user B clicks on the accept share button (after a potential login/signup):
      - They are taken to the Share view and a notification tells them that tag X from user A is now available to them.
      - Tag X appears on the list of tags shared with me.
      - User B can see the pivs belonging to tag X, and they are also counted inside All Pictures.
      - If user A has also tagged a certain piv with a tag Y, and that piv also has tag X, user B will be able to see tag X on that piv, but not tag Y.
      - User B will see date tags relevant to those pivs that have been shared by user A. And if user B has geotagging enabled, they will also see geotags relevant to those pivs but only if user A turned on geotagging as well.
   - If user B removes tag X from the list:
      - Tag X disappears from their shared with me view, but not from user A's shared with others view.
      - User B cannot longer see pivs belonging to tag X, and they don't count anymore towards All Pictures.
      - User B can see the pivs belonging to tag X but not download them, rotate, delete nor share.
      - User B can tag the pivs belonging to tag X, but those tags will only be visible to user B, not to user A, nor to any other user with whom user A shared tag X.
      - User B can re-accept the invitation to see tag X as long as user A doesn't delete or untag all the pivs on tag X.
   - If user A unshares tag X with user B, it will be the same as if B removes tag X from the list, except that:
      - Tag X will disappear from user A's shared with others view., the tag disappears from the Share view for both users A and B.
      - If user B re-accepts the old invitation, an error message will appear stating that they no longer have access to tag X.
   - If user A deletes or untags all the pivs from tag X, and the tag X disappears, it is the same as if user A had unshared tag X with user B.
   - If user B tags a piv belonging to tag X with a tag Y, and then uploads a piv with the same hash as that tagged piv, the piv owned by B will also have the tag Y. The converse is also true: if the user B first has its own piv with tag Y and then a piv with identical hash is shared, that piv with also have the tag Y, but only for user B.
   - If a piv with hash 1, either owned by user B or shared with user B or both, is untagged from tag X, tag X won't be visible on that piv for user B.
   - If user B shares a tag Y with user C that contains pivs belonging to user A:
      - If the tag Y has pivs that belong to user B, user C will only see the pivs belonging to user B that are within the tag Y.
      - If user B deletes/untags own pivs from tag Y, it is equivalent as unsharing tag Y with user C.
      - If user A shares tag X with user C, user B will not see the tag Y on the pivs that belong to user A.
      - When user A shares a tag X with user C containing a piv with hash 1, and user B shares a tag Y with user C containing a piv with hash 1, user C should only see one piv with hash 1, and only one of those should count towards the total on All pictures.
      - If tag Y only has pivs belonging to user A, user B will get an error stating that a shared tag must have at least one own piv.
   - Each user can see a list of email addresses of previous shares. If user A shared one or more tags with user B in the past but removed all of those shares, then user B's email address won't be visible in user A's list.
   - In main view, see tags shared with me with a different icon than own tags.
   - Rename tag.

- Account & payment
   - Login/logout.
   - Signup.
   - Store auth log.
   - Enable/disable geotagging.
   - Change password.
   - Recover/reset password.

- Import
   - List
      - If no auth access, provide link to start auth flow. If there's an upload going in the background in that same tab, open the auth flow in a new tab.
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

- Other
   - S3 & SES setup.
   - Set up dev & prod environments.

### Todo v1

- Open
   - Show tags in open view.

- Upload/import
   - Add a "show more" button to show more items of Recent Imports or Recent Uploads.
   - Show estimated time remaining in ongoing uploads.
   - New upload flow
      - Starting state: area from dropdown & button for files & button for folder upload.
      - Uploading state: button for starting new upload and button for starting tagging state.
      - Tagging state: input with button to add tags, also dropdown to select existing tags to add to current upload.
   - Improve display of errors in upload & import: show foldable list of repeated|invalid|too large pivs.
   - Import from Dropbox.

- Share & manage
   - Share individual piv.
   - Disambiguate a tag named X shared by two different users.
   - Transitive share.
   - Share ownership.

- Account & payment
   - Set account space limit.
   - Change email.
   - Export/import all data.
   - Log me out of all sessions (also after password change).
   - Freeze me out (includes log me out of all sessions).
   - Show/hide paid space in account.
   - Retrieve data on payment cycle.
   - Downgrade my account alert.
   - Family plan.
   - Payment late flow: freeze uploads, email, auto-delete by size.
   - Discuss joint space deduplication opt-in (if original piv X is shared by N users, each pays for bytes X/N).

- Admin
   - Retrieve stats & test endpoint.
   - User management.

- Mobile
   - Background upload in iOS.
   - Functionality of main view (including editing) as a fullscreen web app.

- Other
   - Refactor UI with unified terminology for pivs: Pics&Vids, pivs.
   - When notifications cannot be send, default to writing error to local logfile
   - Import lets behind temporary invalid piv.
   - On shutdown, wait for background processes: S3 uploads, mp4 conversions and geotagging
   - Check graceful app shutdown on mg restart: wait for S3 uploads and ongoing uploads
   - Downgrade read ECONNRESET errors priority?
   - Test for maximum capacity.
   - Security: figure out workaround for package-lock with nested dependencies that are not pegged.
   - Frontend tests.
   - ac;tools integration.
   - Status & stats public page.
   - Spanish support.

### Todo maybe

- Pivs
   - Hidden tags.
   - Picture filters.
   - Themes for the interface.
   - Order pivs within tag? Set priorities! Manual order mode.

- Share & manage
   - Upload to shared tag.
   - Public tag, including download restrictions per piv?
   - QR code to share.
   - Create group that groups people.
   - Create tag that groups tags (can also have pivs directly assigned).

- Photobooks

### Todo never

- Share
   - Comments.
   - Share to social platforms.
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

#### Auth routes

- `GET /auth/csrf`.
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
   - Body must be `{username: STRING, password: STRING, email: STRING}`. The email must be a valid email. If not, a 400 code will be returned with body `{error: ...}`.
   - Both `username` and `email` are lowercased and leading & trailing space is removed from them (and intermediate spaces or space-like characters are reduced to a single space). `username` cannot contain any `@` or `:` characters.
   - The trimmed `username` must have at least 3 characters and `password` must have at least 6 characters.
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
   - If a valid `range` header is present, a 206 is returned along with the requested part of the file.

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
   - In the case of `complete` or `cancel`, the existing upload must have a status of `uploading`, otherwise the endpoint returns 409 with body `{error: 'status: complete|cancelled|stalled|error'}`. The same happens with a `start` on an upload that already has the same `id`.
   - In the case of `wait`, the existing upload must have a status of `uploading` or `stalled, otherwise the endpoint returns 409 as in the case we just mentioned above. This operation is used to warn the server not to consider the upload stalled in the case a file is taking more than ten minutes to be uploaded; it can also be used to revive a stalled upload.
   - If successful, the endpoint returns a body of the form `{id: INTEGER}`. In the case of a `start` operation, this id should be used for an ulterior `end` or `cancel`.

- `POST /uploadCheck`
   - This route is used to see if a piv has already been uploaded.
   - Body must be of the form `{ID: INTEGER (id of the upload), hash: STRING, name: STRING, size: INTEGER, lastModified: INTEGER, tags: UNDEFINED|[STRING, ...]}`.
   - If `tags` are included, after being trimmed, none of them should start with `[a-z]::` (otherwise, 400 with body `{error: 'invalid tag'}`).
   - `body.size` must be the size in bytes of the file being checked.
   - `body.id` must be that of an existing upload id, otherwise the endpoint returns 404 with body `{error: 'upload'}`; if the upload exists but its status is not `uploading`, the endpoint returns 409 with body `{error: 'status: complete|cancelled|stalled|error'}`.
   - If there's already a piv with the same bytes (whether with the same name or not), the endpoint will reply `{repeated: true}`, otherwise it will return `{repeated: false}`.
   - If the piv matches another one already present and `lastModified` and/or a date parsed from the `name` is a date not held by the metadata of the piv already present, those dates will be added to it.

- `POST /piv`
   - Must be a multipart request (and it should include a `content-type` header with value `multipart/form-data`) (otherwise, 400 with body `{error: 'multipart'}`).
   - Must contain exactly one file with name `piv` (otherwise, 400 with body `{error: 'file'}`).
   - Must contain no extraneous fields (otherwise, 400 with body `{error: 'invalidField'}`). The only allowed fields are `id`, `lastModified`, `tags` and `importData`; the last two are optional.
   - Must contain a field `id` with an upload id (otherwise, 400 with body `{error: 'id'}`. The `id` groups different uploaded files into an upload unit, for UI purposes. The `id` should be a timestamp in milliseconds returned by a previous call to `POST /upload`. If no upload with such `id` exists, the endpoint returns 404. The upload with that `id` should have a `status` of `uploading`; if it is not, a 409 is returned with body `{error: 'status: complete|cancelled|stalled|error'}`.
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
   - There should be no repeated ids on the body, otherwise a 400 is returned.
   - If the deletion is successful, a 200 is returned.

- `POST /rotate`
   - Body must be of the form `{ids: [STRING, ...], deg: 90|180|-90}` (otherwise, 400 with body `{error: ...}`).
   - All pivs must exist and user must be owner of the pivs, otherwise a 404 is returned.
   - Videos will not be rotated and will be silently ignored.
   - There should be no repeated ids on the body, otherwise a 400 is returned.
   - If the rotation is successful, a 200 is returned.

- `POST /date`
   - Body must be of the form `{ids: [STRING, ...], date: INTEGER}` (otherwise, 400 with body `{error: ...}`). `date` must be equal or greater than 0.
   - All pivs must exist and user must be owner of the pivs, otherwise a 404 is returned.
   - There should be no repeated ids on the body, otherwise a 400 is returned.
   - On each of the pivs, if the existing `date` field has a positive offset from UTC midnight, this offset will be added to the provided `date`.

- `POST /tag`
   - Body must be of the form `{tag: STRING, ids: [STRING, ...], del: true|false|undefined, autoOrganize: true|false|undefined}`
   - `tag` will be trimmed (any whitespace at the beginning or end of the string will be eliminated; space-like characters in the middle will be replaced with a single space).
   - After trimmed, `tag` cannot start with `[a-z]::`.
   - If `del` is `true`, the tag will be removed, otherwise it will be added.
   - All pivs must exist and user must be owner of the pivs, otherwise a 404 is returned.
   - There should be no repeated tags on the body, otherwise a 400 is returned.
   - If `autoOrganize` is set to `true`, if this is a tagging operation, the piv will be marked as organized. And if `autoOrganize` is set to `true` and this is an untagging operation that removes the *last user tag* from a piv, the piv will be marked as unorganized instead.
   - If successful, returns a 200.

- `GET /tags`
   - Returns an array of the form `['tag1', 'tag2', ...]`. This list includes user tags, as well as year tags and geotags; it also includes tags shared with the user by other users, each of them in the form `'s::USERNAME:tag'`.

- `POST /hometags`
   - Body must be of the form `{hometags: [STRING, ...]}`.
   - Each of the tags must be a string that does not start with `[a-z]::`.
   - All the tags must exist and user must be owner of the pivs, otherwise a 404 is returned.
   - There should be no repeated tags on the query, otherwise a 400 is returned.
   - All tags will be automatically trimmed.
   - If successful, returns a 200.

- `POST /idsFromHashes`
   - Body must be of the form `{hashes: [STRING, ...]}`.
   - The endpoint will return an object `{HASH: PIVID|null, ...}` that maps the requested hashes to a piv id.

- `POST /query`
   - Body must be of the form:
```
{
   tags: [STRING, ...],
   mindate: INT|UNDEFINED,
   maxdate: INT|UNDEFINED,
   sort: newest|oldest|upload,
   from: INT|UNDEFINED,
   fromDate: INT|UNDEFINED,
   to: INT,
   recentlyTagged: [STRING, ...]|UNDEFINED,
   idsOnly: BOOLEAN|UNDEFINED,
   timeHeader: BOOLEAN|UNDEFINED,
   refresh: BOOLEAN|UNDEFINED,
   updateLimit: INT|UNDEFINED
}
```
   Otherwise, a 400 is returned with body `{error: ...}`.
   - `body.from` and `body.to` must be positive integers, and `body.to` must be equal or larger to `body.from`. For a given query, they provide pagination capability. Both are indexes (starting at 1) that specify the first and the last piv to be returned from a certain query. If both are equal to 1, the first piv for the query will be returned. If they are 1 & 10 respectively, the first ten pivs for the query will be returned.
3. If `body.fromDate` is present, `body.from` must be absent. `body.fromDate` should be an integer larger than 1, and will represent a timestamp. For the provided query, the server will find the index of the last piv with the `date` (or `dateup` in the case of `sort` being `upload`) and use that as the `from` parameter. For example, if `fromDate` is `X`, `to` is 100 and `sort` is `newest`, the query will return the 100 pivs that match the query that were taken at `X` onwards, *plus all the pivs* taken before `X`.
   - `a::` cannot be included on `body.tags`. If you want to search for all available pivs, set `body.tags` to an empty array. If you send this tag, you'll get a 400 with body `{error: 'all'}`.
   - `untagged` can be included on `body.tags` to retrieve untagged pivs. Untagged pivs are those that have no user tags on them - tags added automatically by the server (such as year/month tags or geotags) don't count as tags in this regard.
   - Each of the returned pivs will have all the tags present in `body.tags`. The only exception to this rule are year tags, on which the query returns pivs that contain at least one of the given date tags. For example, the query `['d::2018', 'd::2019']` will return pivs from both 2018 and 2019.
   - If defined, `body.mindate` & `body.maxdate` must be UTC dates in milliseconds.
   - `body.sort` determines whether sorting is done by `newest`, `oldest`, or `upload`. The first two criteria use the *earliest* date that can be retrieved from the metadata of the piv, or the `lastModified` field. In the case of the `upload`, the sorting is by *newest* upload date; there's no option to sort by oldest upload.
   - If `body.recentlyTagged` is present, the `'untagged'` tag must be on the query. `recentlyTagged` is a list of ids that, if they are ids of piv owned by the user (or to which the user has access through a shared tag), will be included as a result of the query, even if they are not untagged pivs.
   - If `body.updateLimit` is set to an integer, no pivs uploaded after that date will be considered in the query.
   - If `body.refresh` is set to `true`, this will be considered as a request triggered by an automatic refresh by the client. This only makes a difference for statistical purposes.
   - If the query is successful, a 200 is returned with body `pivs: [{...}], total: INT, tags: {'a::': INT, 'u::': INT, 'o::': INT, 'u::': 0, otherTag1: INT, ...}, refreshQuery: true|UNDEFINED}`.
      - Each element within `body.pivs` is an object corresponding to a piv and contains these fields: `{date: INT, dateup: INT, id: STRING,  owner: STRING, name: STRING, dimh: INT, dimw: INT, tags: [STRING, ...], deg: INT|UNDEFINED, vid: UNDEFINED|'pending'|'error'|true}`.
      - `body.total` contains the number of total pivs matched by the query (notice it can be larger than the amount of pivs in `body.pivs`).
      - `body.tags` is an object where every key is one of the tags relevant to the current query - if any of these tags is added to the tags sent on the request body, the result of the query will be non-empty. The values for each key indicate how many pivs within the query have that tag. The only exception is `a::`, which indicate the *total* amount of all pivs, irrespective of the query. `u::` stands for untagged pivs, `o::` for pivs marked as organized, and `t::` for pivs not yet marked as organized.
      - `body.refreshQuery`, if set, indicates that there's either an upload ongoing or a geotagging process ongoing or a video conversion to mp4 for one of the requested pivs (or multiple of them at the same time), in which case it makes sense to repeat the query after a short amount of time to update the results.
   - If `body.idsOnly` is present, only a list of ids will be returned (`{ids: [...]}`). This enables the "select all" functionality.
   - If `body.timeHeader` is present, a `timeHeader` field will be sent along with the other fields, having the form `{YYYYMM: true|false...}`; if a year + month combination is set to `true`, that month will have all its pivs organized; if an entry is set to `false`, it will have one or more unorganized pivs. Months for which there is no entry have no pivs.

- `POST /sho` (for sharing or unsharing) and `POST /shm` (for accepting or removing a tag shared with the user).
   - Body must be of the form `{tag: STRING, whom: ID, del: BOOLEAN|UNDEFINED}`. `whom` must be the `email`, not the `username` of the target user.
   - If the tag being shared, after being trimmed, starts with `[a-z]::`, a 400 is returned with body `{error: 'tag'}`.
   - The target user (`body.whom`) must exist, otherwise a 404 is returned with body `{error: 'user'}`.
   - If `body.whom` corresponds to no user, a 400 is returned with body `{error: 'self'}`.
   - If the `tag` doesn't exist, a 404 is returned with body `{error: 'tag'}`. If this is a `shm` operation and the `tag` is not shared with the user, a 403 is returned.
   - In the case of `sho`, `del` represents an unsharing with another user; whereas in the case of `shm`, `del` means the removal of a tag shared with the user.
   - If successful, returns a 200.

- `GET /share`
   - If successful, returns a 200 with body `{sho: [[USERNAME1, TAG1], ...], shm: [[USERNAME2, TAG2], ...]}`.
   - `body.sho` lists the tags shared with others by the user. `body.shm` lists the tags shared with the user.

- `POST /rename`
   - Body must be of the form `{from: STRING, to: STRING}`, where both values are user tags - that is, a string that when trimmed *doesn't* start with a lowercased latin letter followed by two colons.
   - If `to` is not a user tag, a 400 is returned with body `{error: 'tag'}`.
   - If the user has no `from` tag, a 404 is returned with body `{error: 'tag'}`.
   - If the user already has a `to` tag, a 409 is returned with body `{error: 'exists'}`, to avoid overlapping two tags through a rename.
   - If the `from` tag is shared with one or more users, a 409 is returned with body `{error: 'shared'}`.
   - If successful, returns a 200.

- `POST /download`
   - Body must be of the form `{ids: [STRING, ...]}` (otherwise, 400 with body `{error: ...}`).
   - There should be no repeated ids on the query, otherwise a 400 is returned.
   - `body.ids` must have at least a length of 2 (otherwise, 400 with body `{error: 'single'}`. To download a single piv you can use `GET /piv/ID?original=1` instead.
   - All pivs must exist and user must be owner of all the pivs, otherwise a 404 is returned. This means that no pivs shared with the user can be downloaded.
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
   - Returns all public stats information, with the shape `{byfs: INT, bys3: INT, pivs: INT, thumbS: INT, thumbM: INT, users: INT}`.

#### Admin routes

`GET /admin/users`
   - Returns an array of users.

`GET /admin/stats`
   - Returns an object with stats.

`POST /admin/deploy`
   - Takes a file in the multipart field by name `file`. It will then overwrite `client.js` with that file.

`GET /admin/debug/ID`
   - Returns an object with all the piv information for piv with id `ID`.

`GET /admin/logs/USERNAME`
   - Returns an array of logs for `USERNAME`, with some edits to reduce verbosity. If `USERNAME` is set to `'all'`, all logs will be returned, but upload logs of types `'ok'`, `'alreadyUploaded'` and `'repeated'` will be omitted.

`GET /admin/dates`
   - Returns a CSV file with the date information of all pivs.

`GET /admin/space`
   - Returns a stringified object with the MBs used by each key prefix.

`GET /admin/uploads/USERNAME`
   - Returns an array of uploads done by `USERNAME`. Used to debug stalled uploads.

`GET /admin/activity/USERNAME`
   - Returns an array of intervals of time in which `USERNAME` was performing requests. Used to debug stalled uploads.

### Statistics

1. uniques:
   - users: active users

2. maximum:
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

3. stat:f (flow) - stock variables are also expressed as flow variables
   - byfs:          bytes stored in FS
   - bys3:          bytes stored in S3
   - byfs-USERNAME: bytes stored in FS for USERNAME
   - bys3-USERNAME: bytes stored in S3 for USERNAME
   - pics:          number of pics
   - vids:          number of vids
   - format-FORMAT: pivs with the specified format
   - thumbS:        thumbnails of small size
   - thumbM:        thumbnails of medium size
   - users:         number of users
   - rq-user-USERNAME: requests from USERNAME
   - rq-NNN:    requests responded with HTTP code NNN
   - rq-bad:    unsuccessful requests for all endpoints
   - rq-all:    successful requests for all endpoints
   - rq-auth:   successful requests for POST /auth
   - rq-piv:    successful requests for GET /piv
   - rq-thumb:  successful requests for GET /thumb
   - rq-pivup:  successful requests for POST /piv
   - rq-delete: successful requests for POST /delete
   - rq-rotate: successful requests for POST /rotate
   - rq-tag:    successful requests for POST /tag and /tags
   - rq-querym: successful requests for POST /query done as part of a manual query by the user
   - rq-queryr: successful requests for POST /query done as part of an automatic refresh
   - rq-share:  successful requests for POST /share
   - rq-geo:    successful requests for POST /geo
   - ms-all:    ms for successful requests for all endpoints
   - ms-auth:   ms for successful requests for POST /auth
   - ms-piv:    ms for successful requests for GET /piv
   - ms-thumb:  ms for successful requests for GET /thumb
   - ms-pivup:  ms for successful requests for POST /piv
   - ms-delete: ms for successful requests for POST /delete
   - ms-rotate: ms for successful requests for POST /rotate
   - ms-tag:    ms for successful requests for POST /tag
   - ms-query:  ms for successful requests for POST /query
   - ms-share:  ms for successful requests for POST /share
   - ms-geo:    ms for successful requests for POST /geo
   - ms-pivup-initial:   ms for initial checks in POST /piv
   - ms-pivup-metadata:  ms for metadata check in POST /piv
   - ms-pivup-hash:      ms for hash check in POST /piv
   - ms-pivup-fs:        ms for FS operations in POST /piv
   - ms-pivup-thumb:     ms for thumbnail creation in POST /piv
   - ms-pivup-db:        ms for info storage & DB processing in POST /piv
   - ms-video-convert:   ms for non-mp4 to mp4 video conversion
   - ms-video-convert:FORMAT: ms for non-mp4 (with format FORMAT, where format is `mov|avi|3gp`) to mp4 video conversion

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

- users (set): all the usernames that exist in the system

- geo:USERNAME: INT|undefined, depending on whether there's an ongoing process to enable geotagging for the user.

- email:EMAIL (string): key is email, value is username

- verifytoken:TOKEN (string): key is token, value is email. Used to verify email addresses after a signup. Deleted after usage.

- csrf:SESSION (string): key is session, value is associated CSRF token.

- hash:USERNAME (hash): key is hash of piv uploaded (with metadata stripped), value is id of corresponding piv. Used to check for repeated piv.

- hashorig:USERNAME (hash): key is hash of piv uploaded (without metadata stripped), value is id of corresponding piv. Used to check for already uploaded piv.

- hash:USERNAME:PROVIDER (set): contains hashes of the pivs imported by an user. The hashed quantity is `ID:MODIFIED_TIME` - not to be confused with the hashing of the uploaded piv that is stored in `hash:USERNAME`.

- hashdel:USERNAME (set): contains hashes of the pivs deleted by an user, to check for repetition when re-uploading files that were deleted. This field is not in use yet.

- hashorigdel:USERNAME (set): contains hashes of the pivs deleted by an user (without metadata stripped), to check for repetition when re-uploading files that were deleted. This field is not in use yet.

- hashdel:USERNAME:PROVIDER (set): contains hashes of the pivs deleted by an user, to check for repetition when re-importing files that were deleted. The hashed quantity is `ID:MODIFIED_TIME`. This field is not in use yet.

- hashid:HASH (set): contains a list of piv ids that have the given HASH

- raceConditionHash:USERNAME:HASH (string): contains the id of a piv currently being uploaded by the user, to serve as a check to avoid a race condition between simultaneous uploads of pivs with identical content.

- raceConditionHashorig:USERNAME:HASHORIG (string): same as raceConditionHash, but for identical pivs.

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
   thumbS: STRING or absent
   bythumbS: INT or absent (size of small thumbnail in FS)
   thumbM: STRING or absent
   bythumbM: INT or absent (size of medium thumbnail in FS)
   vid: `1` if a mp4 video, absent if a piv, ID for a non-mp4 video (ID points to the mp4 version of the video), `pending:ID` for a pending mp4 conversion, `error:ID` for an errored conversion.
   bymp4: if a non-mp4 video, size of mp4 version of the video.
   xthumbS: INT or absent, number of thumb200 downloaded (also includes cached hits)
   xthumbM: INT or absent, number of thumb900 downloaded (also includes cached hits)
   xp:  INT or absent, number of pivs downloaded (also includes cached hits)
   loc: [INT, INT] or absent - latitude and longitude of piv taken from metadata, only if geotagging is enabled for the piv's owner and the piv has valid geodata.

- pivt:ID (set): list of all the tags belonging to a piv.

- hashtag:USERNAME:HASH (set): list of all the tags belonging to pivs with a hash HASH for `USERNAME`. This will exist only if the user has one or more other users sharing a piv with a hash HASH that have one or more tags and, at the same time, the user has no own piv with hash HASH.

- taghash:USERNAME:TAG (set): list of all of the hashes belonging to a given tag, for all the pivs not owned by `USERNAME` that are tagged with that tag. The taghash sets contain the same information than the hashtag sets.

- tag:USERNAME:TAG (set): piv ids that belong to that tag.

- tags:USERNAME (set): list of all tags created by the user. Does not include tags shared with the user, nor `a::` or `u::`, but it does include geotags and date tags.

- hometags:USERNAME (string): stringified array of the form `[TAG1, ...]`, containing all the home tags of the user.

- shm:USERNAME (set): USERNAMEA:TAG, USERNAMEB:TAG (shared with me)

- sho:USERNAME (set): USERNAMEA:TAG, USERNAMEB:TAG (shared with others)

- download:ID (string): stringified object of the shape `{username: ID, pivs: [{owner: ID, id: ID, name: STRING}, {...}, ...]}`. Expires after 5 seconds.

- ulog:USERNAME (list): stringified log objects with user activity. Leftmost is most recent.
   - For login:           {t: INT, ev: 'auth', type: 'login',          ip: STRING, userAgent: STRING, timezone: INTEGER}
   - For logout:          {t: INT, ev: 'auth', type: 'logout',         ip: STRING, userAgent: STRING}
   - For signup:          {t: INT, ev: 'auth', type: 'signup',         ip: STRING, userAgent: STRING, verifyToken: STRING}
   - For verify:          {t: INT, ev: 'auth', type: 'verify',         ip: STRING, userAgent: STRING}
   - For recover:         {t: INT, ev: 'auth', type: 'recover',        ip: STRING, userAgent: STRING}
   - For reset:           {t: INT, ev: 'auth', type: 'reset',          ip: STRING, userAgent: STRING}
   - For password change: {t: INT, ev: 'auth', type: 'passwordChange', ip: STRING, userAgent: STRING}
   - For account delete:  {t: INT, ev: 'auth', type: 'delete',         ip: STRING, userAgent: STRING, triggeredByAdmin: true|UNDEFINED}
   - For deletes:         {t: INT, ev: 'delete', ids: [STRING, ...]}
   - For rotates:         {t: INT, ev: 'rotate', ids: [STRING, ...], deg: 90|180|-90}
   - For date setting:    {t: INT, ev: 'date', ids: [STRING, ...], date: INTEGER}
   - For (un)tags:        {t: INT, ev: 'tag',        type: tag|untag, ids: [STRING, ...], tag: STRING}
   - For (un)shares:      {t: INT, ev: 'share',      type: 'share|unshare,                tag: STRING, whom: ID|UNDEFINED, who: ID|UNDEFINED} (if `whom` is present, `who` is absent and the operation is done by the user; if `who` is present, `whom` is absent and the operation is done to the user).
   - For dismiss:         {t: INT, ev: 'dismiss',    type: 'geotagging|selection'}
   - For geotagging:      {t: INT, ev: 'geotagging', type: 'enable|disable'}
   - Import:
      - For oauth request:     {t: INT, ev: 'import', type: 'request',    provider: PROVIDER}
      - For oauth rerequest:   {t: INT, ev: 'import', type: 'requestAgain', provider: PROVIDER} - this will happen if the refresh token is invalidated by the user or if it expires.
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
   - stat:f:NAME       total flow
   - stat:m:NAME:DATE: min
   - stat:M:NAME:DATE: max
   - stat:u:NAME:PERIOD:DATE: unique

- s3:...: S3 management
   - s3:queue (list): items yet to be processed
   - s3:proc (string): number of queue items being processed
   - s3:files (hash): each key is the name of the object in S3, each value is `true|INT` - if `true`, it means that the upload is ongoing; if INT, it shows the amount of bytes taken by the file in S3.

- oa:g:acc:USERNAME (string): access token for google for USERNAME
- oa:g:ref:USERNAME (string): refresh token for google for USERNAME

- imp:PROVIDER:USERNAME (hash) information of current import operation from provider (`g` for google, `d` for dropbox). Has the shape {id: INTEGER, status: listing|ready|uploading|error, fileCount: INTEGER, folderCount: INTEGER, error: UNDEFINED|STRING, selection: UNDEFINED|[ID, ...], data: UNDEFINED|{roots: [ID, ...], folders: {ID: {...}, ...}, files: {ID: {...}, ...}}}

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

1. `views.pics`
   - Depends on: `Data.tags`, `Data.pivs`, `Data.pivTotal`, `Data.queryTags`, `Data.monthTags`, `Data.account`, `State.query`, `State.querying`, `State.selected`, `State.chunks`, `State.filter`, `State.newTag`, `State.showNTags`, `State.showNSelectedTags`, `State.tagOrder`, `State.query.update`, `State.query.home`, `State.onboarding`, `State.expandCountries`, `State.expandYears`.
   - Events:
      - `click -> stop propagation`
      - `click -> rem State.selected`
      - `click -> toggle tag`
      - `click -> select all`
      - `click -> scroll`
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
      - `click -> goto page`
      - `click -> goto tag`
      - `click -> set State.tagOrder`
      - `click -> set State.query.update`
      - `click -> set State.query.updateLimit`
      - `click -> set State.query.home`
      - `click -> set State.query.tags`
      - `click -> set State.expandCountries`.
      - `click -> set State.expandYears`.
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
      - `onclick -> goto page pics`
3. `views.share`
4. `views.tags`
5. `views.import`
   - Depends on: `Data.imports`, `State.imports`, `Data.account`, `State.upload.queue`, `State.import.hideLeaveBox` and `State.import.googleOAuthBox`.
   - Events:
      - `onclick -> import cancel`
      - `onclick -> import retry`
      - `onclick -> import list`
      - `onclick -> snackbar red/yellow`
      - `onclick -> set/rem State.imports.PROVIDER.showFolders`
      - `onclick -> set/rem State.imports.PROVIDER.currentFolder`
      - `onclick -> set/rem State.imports.PROVIDER.selection`
      - `onclick -> goto page pics`
      - `onclick -> set/rem State.import.hideLeaveBox`
      - `onclick -> set/rem State.import.googleOAuthBox`
6. `views.account`
   - Depends on: `Data.account`.
   - Events:
      - `click -> clear changePassword`.
      - `click -> submit changePassword`.
      - `click -> delete account`.
7. Auth:
   7.1 `views.login`
      - Events: `click -> login`
   7.2 `views.signup`
      - Events: `click -> signup`
   7.3 `views.recover`
      - Events: `click -> recover`
   7.4 `views.reset`
      - Events: `click -> reset`

**Other views**:

1. `views.logo`
   - Contained by: `views.header`.
2. `views.snackbar`
   - Contained by: `views.base`.
   - Depends on: `State.snackbar`.
   - Events: `onclick -> clear snackbar`.
3. `views.feedback`
   - Contained by: `views.base`.
   - Depends on `State.feedback`.
   - Events: `onclick -> set|rem State.feedback`.
4. `views.date`
   - Contained by: `views.base`.
   - Depends on `State.selected` and `State.date`.
   - Events: `onclick -> date pivs`.
5. `views.manageHome`
   - Contained by: `views.base`.
   - Depends on `State.manageHome`, `Data.tags` and `Data.hometags`.
   - Events: `onclick -> toggle hometag`, `onclick -> shift hometag`, `onclick -> rem State.managehome`.
6. `views.header`
   - Contained by: `views.pics`, `views.upload`, `views.share`, `views.tags`.
   - Depends on `State.page` and `Data.account`.
   - Events: `onclick -> logout`, `onclick -> goto page pics`, `onclick -> set State.feedback`, `open location undefined URL`
7. `views.empty`
   - Contained by: `views.pics`.
8. `views.onboarding`
   - Contained by: `views.pics`.
   - Depends on `State.onboarding` and `Data.account`.
   - Event: `onclick -> set State.onboarding`.
9. `views.home`
   - Contained by: `views.pics`.
   - Depends on `Data.hometags` and `Data.account`.
   - Event: `onclick -> goto page upload`.
10. `views.grid`
   - Contained by: `views.pics`.
   - Depends on `State.chunks`.
   - Events: `onclick -> click piv`.
11. `views.open`
   - Contained by: `views.pics`.
   - Depends on `State.open` and `Data.pivTotal`.
   - Events: `onclick -> open prev`, `onclick -> open next`, `onclick -> exit fullscreen`, `rotate pivs 90 PIV`, `open location PIV`.
12. `views.noSpace`
   - Contained by: `views.import`, `views.upload`.
   - Depends on `Data.account`.
13. `views.importFolders`
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
   2. `hashchange` -> `read hash window.location.hash`
   3. `keydown` -> `key down KEYCODE`
   4. `keyup` -> `key up KEYCODE`
   5. `scroll` -> `scroll []`
   6. `beforeunload` -> if `State.upload.queue` is not empty, prompt the user before exiting the app.
   7. `webkitfullscreenchange|mozfullscreenchange|fullscreenchange|MSFullscreenChange` -> `exit fullscreen`
   8. `dragover` -> do nothing
   9. `drop` -> `drop files EVENT`
   10. `touchstart` -> `touch start`
   11. `touchend` -> `touch end`

2. General
   1. `initialize`: calls `reset store` and `retrieve csrf`. Then mounts `views.base` in the body. Executed at the end of the script. Burns after being matched. Also sets viewport width for zooming out in mobile. Finally, it sets an interval in `State.uploadRefresh` that will prevent the screen/disk from going to sleep while `State.upload.queue` is not empty.
   2. `reset store`: If its first argument (`logout`) is truthy, it clears out `B.r.log` (to remove all user data from the local event log) and sets `lastLogout` to the current date. Notes `State.redirect` and (re)initializes `B.store.State` and `B.store.Data` to empty objects (with the exception of `State.redirect`) and sets the global variables `State` and `Data` to these objects (so that they can be quickly printed from the console).
   3. `clear snackbar`: clears the timeout in `State.snackbar.timeout` (if present) and removes `State.snackbar`.
   4. `snackbar`: calls `clear snackbar` and sets `State.snackbar` (shown in a snackbar) for 4 seconds. Takes a path with the color (`green|red`) and the message to be printed as the first argument. As second argument it takes a flag `noSnackbar` that doesn't set a timeout to clear the snackbar.
   5. `get` & `post`: wrapper for ajax functions.
      - `path` is the HTTP path (the first path member, the rest is ignored and actually shouldn't be there).
      - Takes `headers`, `body` and optional `cb`.
      - Removes last log to excise password or token information from `B.r.log`.
      - Adds `Data.csrf` to all `POST` requests except `/auth/login`, `/auth/signup`, `/auth/recover` and `/auth/reset`.
      - If by the time the response from the server is received, the user has just logged out (judging by `lastLogout`), and the request is not an auth request, the callback will not be executed.
      - If 403 is received and it is not an auth route or `GET csrf`, calls `reset store true` (with truthy `logout` argument), `goto page login` and `snackbar`.
   6. `error`: submits browser errors (from `window.onerror`) to the server through `post /error`.
   7. `read hash`: see annotated source code.
   8. `goto page PAGE`: see annotated source code.
   9. `send feedback`: if `State.feedback` is `undefined`, invokes `snackbar yellow`. Otherwise, it invokes `post feedback` and then invokes `snackbar`.
   10. `test`: loads the test suite.

3. Auth
   1. `retrieve csrf`: takes no arguments. Calls `get /csrf`. In case of non-403 error, calls `snackbar`; otherwise, it sets `Data.csrf` to either the CSRF token returned by the call, or `false` if the server replied with a 403. Also invokes `read hash` to kick off the navigation after we determine whether the user is logged in or not. Finally, if there was no error, it invokes `query account`.
   3. `login`: calls `post /auth/login. In case of error, calls `snackbar`; otherwise, it calls `clear authInputs`, updates `Data.csrf`, invokes `query account` and invokes `goto page State.redirect`.
   4. `logout`: takes no arguments. Calls `post /auth/logout`). In case of error, calls `snackbar`; otherwise, calls `reset store` (with truthy `logout` argument) and invokes `goto page login`.
   5. `signup`: calls `post /auth/signup`. In case of error, calls `snackbar`; otherwise, it calls `clear authInputs`, updates `Data.csrf`, invokes `query account` and invokes `goto page State.redirect`.
   6. `recover`: calls `post /auth/recover`. In case of error, only calls `snackbar`; otherwise, it calls `clear authInputs`, invokes `goto page login` and invokes `snackbar`.
   7. `reset`: calls `post /auth/reset`. In case of error, only calls `snackbar`; otherwise it calls `rem Data.tokens`, `clear authInputs`, `goto page login` and `snackbar`.
   8. `delete account`: calls `post /auth/delete`. In case of error, only calls `snackbar`; otherwise it calls `reset store true`, `goto page login` and `snackbar`.
   9. `clear authInputs`: sets the values of all possible auth inputs (`#auth-username`, `#auth-password` and `#auth-confirm`, plus their `-confirm` counterparts) to an empty string.

4. Pics
   1. `change State.page`: see annotated source code.
   2. `change State.query`: see annotated source code.
   3. `change State.selected`: if current page is not `pivs`, it does nothing. Adds & removes classes from `#pics`, adds & removes `selected` class from pivs in `views.grid` (this is done here for performance purposes, instead of making `views.grid` redraw itself when the `State.selected` changes). If there are no more pivs selected and `State.query.recentlyTagged` is set, we `rem` it and invoke `snackbar`.
   4. `query pivs`:
      - If `State.query` is not set, does nothing.
      - If `State.querying` is set and the `options.retry` passed to the responder is not truthy, it will overwrite `State.querying` with `{t: INTEGER, options: {...}}` and do nothing else. This will prevent a concurrent query call to the server; later we'll add logic to make the responder re-invoke itself if a later query requests has happened while a request is being sent to the server.
      - It sets `State.querying` to `{t: INTEGER, options: {...}}`.
      - If `State.queryRefresh` is set, it removes it and invokes `clearTimeout` on it.
      - Invokes `post query`, using `State.query`:
         - If `State.query.fromDate` is `undefined` and there are no pivs in `State.selected`, it will call the endpoint using the parameter `from` set to `1`. Otherwise, it will call the endpoint using the parameter `fromDate`, set to either `query.fromDate` or to the farthest date from any piv in `State.selected`, whichever of the two dates is the farthest one. The farthest date will be the *newest* one if `query.sort` is `oldest`, and the *oldest* one otherwise.
         - The `to` parameter will be the largest chunk size times three (`teishi.last (H.chunkSizes) * 3`). If `options.selectAll` is set, it will be set to a very large number instead.
         - If there's a range pseudo-tag (which is a strictly frontend query representing a date range), its values will be used as the `mindate` and `maxdate` parameters sent to the server.
         - The third argument passed to the responder will be passed in the `refresh` field.
         - If `State.query.update` is set to `'auto'`, or if there are no pivs yet in `Data.pivs`, it will set `updateLimit` to the present moment; otherwise, it will pass the value of `State.query.updateLimit`.
      - Once the query is done, if `State.querying.t` is larger than the time at which the current query started, this means we need to retry. In this case, the responder will re-invoke itself using `State.querying.options` but also adding `retry = true` to it.
      - If we're here, the query didn't change, so there is no need to retry it. It sets `State.querying` to `undefined`.
      - If the query returned an error, it invokes `snackbar` and doesn't do anything else.
      - If the query returned no pivs and one or more tags were present in `query.tags`, it will `set` `State.query.tags` to an empty array and do nothing else, in order to avoid a ronin (empty) query. This will only happen through a deletion of the entire contents of the query, or an untagging of the entire contents on the query on another client.
      - If `body.refreshQuery` is set to `true` and `State.query.update` is `undefined`, it will set it to `'manual'`, to indicate that updates are available. This will only happen if `Data.pivs` already has pivs.
      - If `body.refreshQuery` is falsy and `State.query.update` is not `undefined` and `State.query.updateLimit` is less than 10ms away from the time we made the query, it will will set `State.query.update` to `undefined`, to indicate that updates are no longer available.
      - If before the query there were no pivs in `Data.pivs`, `State.query.updateLimit` will be updated to the present moment, to avoid a further query using an outdated value that will make the pics view oscillate between being empty and having pivs.
      - Invokes `query tags`.
      - If the query contains a year tag, a second query equal to the current query minus the month tags will be performed to the server and the returned `queryTags` field will be set in `Data.monthTags` (just the tags, not the number of pivs for each); if the query does not contain a year tag, it will remove `Data.monthTags`. If this query fails, an error will be printed, but the responder will continue executing the rest of the logic.
      - It sets `Data.queryTags`and `Data.pivTotal` based on the result of the query.
      - If `body.refreshQuery` is set to `true`, it will set `State.querying` to a timeout that invokes `query pivs {refresh: true}` after 1500ms. The truthy `refresh` indicates that this is a request triggered by an automatic refresh.
      - It updates `State.selected` to filter out those pivs that are no longer returned by the current query. The updates to `State.selected`, are done directly without an event; the `change` event will be fired afterwards in the responder logic. If `options.selectAll` is passed, all pivs will be marked as selected.
      - It sets `Data.pivs` to `rs.body.pivs` without an event, to avoid redrawing jsut yet.
      - It sets `State.chunks` to the output of `H.computeChunks`, also without an event, to avoid redrawing just yet.
      - If `options.refresh` is set to `true`, we'll set `query.fromDate` to the current value of `State.query.fromDate`, since the `fromDate` info from a refresh will be stale if scrolls have happened afterwards.
      - It invokes `scroll` since that will match a responder that calculates chunk visibility and optionally scrolls to a y-offset.
         - If `options.noScroll` is set, it will invoke `scroll [] -1`. This will prevent scrolling.
         - If there's no `fromDate` set, it will invoke `scroll [] 0`. This will scroll the screen to the top.
         - Otherwise it will invoke `scroll [] DATE`, where `DATE` is the date of the first piv whose `date` or `dateup` matches `query.fromDate`. This is done in the following way: we find the first piv that has a `date` (or `dateup`, if `query.sort` is `upload`) that's the same or less as `query.fromDate` (the same or more if `query.sort` is `oldest`). If `query.refresh` is `true`, an `offset` is added, which consists of how many pixels are hidden from the topmost row of visible pivs - this will make the scrolling not jump.
      - If `options.selectAll` is passed, it will invoke `clear snackbar` and `change State.selected`.
      - If `State.open` is not set, it will trigger a `change` event on `Data.pivs` to the pivs returned by the query. If we entered this conditional, the responder won't do anything else.
      - If we're here, `State.open` is set. We check whether the piv previously opened is still on the list of pivs returned by the query. If it is no longer in the query, it invokes `rem State.open` and `change Data.pivs`. It will also invoke `exit fullscreen`. If we entered this conditional, the responder won't do anything else.
      - If we're here, `State.open` is set and the piv previously opened is still contained in the current query. It will `set State.open` and fire a `change` event on `Data.pivs`.
   5. `click piv piv k ev`: depends on `State.lastClick` and `State.selected`. If it registers a double click on a piv, it removes `State.selected.PIVID` and sets `State.open`. Otherwise, it will change the selection status of the piv itself; if `shift` is pressed (judging by reading the `shiftKey` of `ev` and the previous click was done on a piv still displayed, it will perform multiple selection. The `piv` argument is an object containing only the `id`, `date` and `dateup` fields, since the rest of them are not relevant for the purposes of the responder.
   6. `key down|up`: if `keyCode` is 13 and `#newTag` is focused, invoke `tag pivs`; if `keyCode` is 13 and `#uploadTag` is focused, invoke `upload tag`; if the path is `down` and keycode is either 46 (delete) or 8 (backspace) and there are selected pivs, it invokes `delete pivs`.
   7. `toggle tag`: see annotated source code.
   8. `toggle hometag`: see annotated source code.
   9. `shift hometag`: see annotated source code.
   10. `select all`: places in `State.selected` all the pivs currently loaded; if the number of selected pivs is larger than 2k, it invokes `snackbar`; finally invokes `query pivs {selectAll: true}`.
   11. `query tags`: invokes `get tags` and sets `Data.tags`. It checks whether any of the tags in `State.query.tags` no longer exists and removes them from there (with the exception of `'u::'`, `'o::'` and `'t::'` (which never are returned by the server) and the strictly client-side range pseudo-tag).
   12. `tag pivs`: see annotated source code.
   13. `rotate pivs`: invokes `post rotate`, using `State.selected`. In case the query is successful it invokes `query pivs`. In case of error, invokes `snackbar`. If it receives a second argument (which is a piv), it submits its id instead of `State.selected`.
   14. `date pivs`: invokes `snackbar` if there was either invalid input or the operation failed. If the input (`State.date`) is valid, it invokes `post date` and then if the operation is successful invokes `rem State.page` and `query pivs`.
   15. `delete pivs`: invokes `post delete`, using `State.selected`. In case the query is successful it invokes `query pivs`. In case of error, invokes `snackbar`.
   16. `scroll`:
      - Only will perform actions if `State.page` is `pivs`.
      - If the `to` argument is `undefined` and `State.scroll` exists and happened less than 50ms ago, the responder won't do anything else - effectively ignoring the call.
      - If `to` is set to `-1` or `undefined`, our reference `y` position will be the current one.
      - Will set `State.lastScroll` to `{y: y, time: INTEGER}`.
      - Depending on the height of the window and the current `y`, it will directly set the `DOMVisible` and `userVisible` properties of the chunks within `State.chunks`, without an event being fired.
      - If there were changes to the `DOMVisible` or `userVisible` properties of one or more chunks, it will then fire the `change` event on both `State.chunks` and `State.selected`.
      - It will `set State.query.fromDate` to the `date` (or `dateup` if `State.query.sort` is `upload`) of the first piv that's at least partly visible in the viewport.
      - If a `to` parameter is passed that is not -1, it will scroll to that `y` position after a timeout of 0ms. The timeout is there to allow for DOM operations to conclude before scrolling.
      - Note: the scroll responder has an overall flow of the following shape: 1) determine visibility; 2) trigger changes that will redraw the grid; 3) update `State.query.fromDate`; 4) if necesary, scroll to the right position.
   17. `download`: uses `State.selected`. Invokes `post download`. If unsuccessful, invokes `snackbar`.
   18. `stop propagation`: stops propagation of the `ev` passed as an argument.
   19. `change State.queryURL`: see annotated source code.
   20. `update queryURL`: see annotated source code.

5. Open
   1. `key down`: if `State.open` is set, invokes `open prev` (if `keyCode` is 37) or `open next` (if `keyCode` is 39).
   2. `enter fullscreen`: enter fullscreen using the native browser methods and set the `<body>` `overflow` to `hidden`.
   3. `exit fullscreen`: if `State.open` is present, remove it. Depending on the `exited` flag passed to the invocation, exit fullscreen using the native browser methods. Also remove the `<body>` `overflow` property so it reverts to the defaut.
   4. `change State.open`: remove or add `app-fullscreen` class from `#pics`, depending on whether `State.open` is defined. If `State.open` is defined, it invokes `enter fullscreen`.
   5. `open prev|next`: decrements or increments `State.open.k`, as long as there's a previous (or next) piv. It will also scroll the window to the `start` position of the piv currently open (so that the grid scrolls up or down when the user goes back or forth within the `open` view).
   6. `touch start`: only performs actions if `State.open` is set. Sets `State.lastTouch`.
   7. `touch end`: only performs actions if `State.open` is set. Reads and deletes `State.lastTouch`. If it happened less than a second ago, it invokes `open prev` or `open next`, depending on the direction of the touch/swipe.
   8. `open location`: takes a `piv` with `loc` field as its argument. Opens Google Maps in a new tab with the specified latitude & longitude. If a second argument is passed instead, that is considered as a url, which is then opened in a new tab.

6. Upload
   1. `change State.page`: if `State.page` is `upload` or `pivs`, 1) if no `Data.tags`, `query tags`; 3) if no `Data.uploads`, `query uploads`.
   2. `drop files`: if `State.page` is `upload`, access dropped files or folders and put them on the upload file input. `add` (without event) items to `State.upload.new.tooLarge`, `State.upload.new.unsupported` and `State.upload.new.files`, then `change State.upload.new`.
   3. `upload files|folder`: `add` (without event) items to `State.upload.new.tooLarge`, `State.upload.new.unsupported` and `State.upload.new.files`, then `change State.upload.new`. Clear up the value of either `#files-upload` or `#folder-upload`. If it's a folder upload, it clears the snackbar warning about possible delays with `clear snackbar`.
   4. `upload start`: invokes `post upload` using `State.upload.new.files`, `State.upload.new.tooLarge`, `State.upload.new.unsupported`, and `State.upload.new.tags`; if there's an error, invokes `snackbar`. Otherwise sets `State.upload.wait.ID`, invokes `query uploads`, adds items from `State.upload.new.files` onto `State.upload.queue`, then deletes `State.upload.new` and invokes `change State.upload.queue`.
   5. `upload cancel|complete|wait|error`: receives an upload `id` as its first argument and an optional `noAjax` flag as the second argument, an optional `noSnackbar` as the third argument and an optional `error` as a fourth argument. If `noAjax` is not `true`, it invokes `post upload` and if there's a server error during this ajax call, it will only invoke `snackbar red` and do nothing else; if the operation is `wait`, it sets `State.upload.wait.ID.lastActivity` and does nothing else; if we're performing the `cancel` or `error` operation, it finds all the files on `State.upload.queue` belonging to the upload with id `id`, filters them out and updates `State.upload.queue`. For all operations except `wait`, it then removes `State.upload.wait.ID`, clears the interval at `State.upload.wait.ID.interval` and invokes `query uploads`; if `noSnackbar` is not `true`, it invokes `snackbar` with a relevant message depending on the operation.
   6. `upload tag`: optionally invokes `snackbar`. Adds a tag to `State.upload.new.tags` and removes `State.upload.tag`.
   7. `query uploads`: if `State.upload.timeout` is set, it removes it and invokes `clearTimeout` on it; it then invokes `get uploads`; if there's an error, invokes `snackbar`; otherwise, sets the body in `Data.uploads` and conditionally sets `State.upload.timeout`. If a timeout is set, the timeout will invoke `query uploads` again after 1500ms.
   8. `change State.upload.queue`: (for each piv that's next in the queue)
      - Increments `State.upload.count.UPLOADID` (or sets it to `1` if it doesn't exist yet).
      - Hashes the file; if there is an error, invokes `upload error` and returns. The call to `upload error` will report the error to the server.
      - Invokes `post uploadCheck` to check if an identical file already exists; if there is an error, invokes `upload error` and returns.
      - If a file with the same hash already exists, the responder removes it from `State.upload.queue`, decrements `State.upload.count.UPLOADID` and conditionally invokes `upload complete` if there are no other files in this upload being processed (`State.upload.count.UPLOADID === 0`) *and* it is part of an upload that still has status `uploading` (as per `Data.uploads`). It then returns.
      - Invokes `post piv` to upload the file.
      - Sets `State.upload.wait.ID.lastActivity`.
      - Removes the file just uploaded from `State.upload.queue`.
      - If space runs out, it invokes `snackbar` and `upload cancel` - the call to `upload cancel` will perform neither an ajax call nor show a snackbar.
      - If there's an unexpected error (not a 400) it invokes `upload error` but it will not perform an ajax call to report it to the server.
      - Decrements `State.upload.count.UPLOADID`.
      - Conditionally invokes `upload complete` if there are no other files in this upload being processed (`State.upload.count.UPLOADID === 0`) *and* it is part of an upload that still has status `uploading` (as per `Data.uploads`).
      - Note: the logic of `State.upload.count.UPLOADID` works because we decrement *after* updating the queue. This updating of the queue triggers a recursive call to the responder itself, which brings another piv into processing, which increments the queue. In that way, the count entry for an upload reaches 0 only at the very end.

7. Import
   1. `change State.page`: if `State.page` is `import`, 1) for all providers, if `State.import.PROVIDER.authOK` is set, it deletes it and invokes `import list PROVIDER true` to create a new list; 3) for all providers, if `State.import.PROVIDER.authError` is set, it deletes it and invokes `snackbar`; 4) for all providers, if there's no `Data.import.PROVIDER`, invokes `import list PROVIDER`.
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
   - `chunks`: if present, it is an array of objects, each representing a chunk of pivs to be shown. Each chunk has the form `{pivs: [...], start: INT, end: INT, visible: true|false|undefined}`. `pivs` is an array of pivs; `start` and `end` indicate the y-coordinate of the start and the end of the chunk. `visible` indicates whether the chunk should be displayed or not, given the current y-position of the window.
   - `date`: `UNDEFINED|{y: STRING, m: STRING: d: STRING}`. If present, it denotes an object with date fields for dating pivs.
   - `expandCountries`: if set to `true`, it will show more than three country geotags.
   - `expandYears`: if set to `true`, it will show more than three year tags.
   - `feedback`: if not `undefined`, contains a text string with feedback to be sent.
   - `filter`: filters tags shown in sidebar.
   - `import`:
      - `googleOAuthBox`: if `true`, shows the instructional Google OAuth dialog.
      - `hideLeaveBox`: if `true`, *hides* the instructional box that indicates that the tab can be closed while an import is listing or uploading.
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
   - `lastScroll`: if present, has the shape `{y: INT, time: INT}`. Used to determine when to change the visibility of the chunks in `State.chunks` and to potentially invoke `increment nPivs`.
   - `lastTouch`: if present, has the shape `{x: INT, time: INT}`. Used to detect a swipe within `views.open`.
   - `newTag`: the name of a new tag to be posted.
   - `open`: `{id: STRING, k: INTEGER}`. id and index of the piv to be shown in full-screen mode.
   - `page`: determines the current page.
   - `redirect`: determines the page to be taken after logging in, if present on the original `window.location.hash`.
   - `query`: determines the current query for pivs. Has the shape:
```
{
   tags:           [...],
   sort:           'newest|oldest|upload',
   fromDate:       UNDEFINED|INTEGER,
   updateLimit:    UNDEFINED|INTEGER,
   recentlyTagged: UNDEFINED|[ID, ...],
   update:         UNDEFINED|'auto'|'manual',
   home:           UNDEFINED|BOOLEAN
}
```
   - `queryRefresh`: if set, a timeout that invokes `query pivs` after 1500ms.
   - `queryURL`: if set, has the form `{tags: [...], sort: 'newest|oldest|upload', fromDate: UNDEFINED|INTEGER}`. When updated, its data will be used to update `State.query`.
   - `querying`: `UNDEFINED|{t: INTEGER, options: {updateSelected: BOOLEAN|UNDEFINED, refresh: BOOLEAN|UNDEFINED}`, set if `query pivs` is currently querying the server. Its purpose is to avoid concurrent queries to the server.
   - `selected`: an object where each key is a piv id and every value is `{id: STRING, date: INTEGER, dateup: INTEGER}`. If a certain piv key has a corresponding `true` value, the piv is selected.
   - `showNTags`: UNDEFINED|INTEGER, determines the amount of tags seen when no pivs are selected.
   - `showNSelectedTags`: UNDEFINED|INTEGER, determines the amount of tags seen when at least one piv is selected.
   - `snackbar`: prints a snackbar. If present, has the shape: `{color: STRING, message: STRING, timeout: TIMEOUT_FUNCTION}`. `timeout` is the function that will delete `State.snackbar` after a number of seconds. Set by `snackbar` event.
   - `tagOrder`: determines whether tags are sorted by number of pivs or alphabetically, and whether the order should be reverse or not. It is of the shape `{field: 'a|n', reverse: true|false|UNDEFINED}`.
   - `untag`: flag to mark that we're untagging pivs instead of tagging them.
   - `upload`:
      - `count`: `UNDEFINED|{UPLOADID: INTEGER, ...}`. Each entry counts the number of items currently being processed for each upload.
      - `new`: {unsupported: [STRING, ...]|UNDEFINED, files: [...], tags: [...]|UNDEFINED}
      - `queue`: [{file: ..., uid: STRING, tags: [...]|UNDEFINED, uploading: true|UNDEFINED}, ...]
      - `tag`: content of input to filter tag or add a new one.
      - `timeout`: if present, a timeout that invokes `query uploads`.
      - `wait`: if present, an object where every key is an upload id and the value is an array of the form `{lastActivity: INTEGER, interval: SETINTERVAL FUNCTION}`. These are used to determine when a `wait` event should be sent.
   - `uploadRefresh`: an interval that will refresh the page (to prevent the screen and/or disk going to sleep) if `State.upload.queue` is not empty.

- `Data`:
   - `account`: `{username: STRING, email: STRING, type: STRING, created: INTEGER, usage: {limit: INTEGER, used: INTEGER}, suggestGeotagging: true|UNDEFINED, suggestSelection: true|UNDEFINED, onboarding: true|UNDEFINED}`.
   - `csrf`: if there's a valid session, contains a string which is a CSRF token. If there's no session (or the session expired), set to `false`. Useful as both a CSRF token and to tell the client whether there's a valid session or not.
   - `hometags`: an array of tags that are displayed in the home screen of the user.
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
   - `monthTags`: either `undefined` or an array with month tags that correspond to the current query. If a month is on the current query, it will be on the list but other months may be there too.
   - `pivs`: `[...]`; comes from `body.pivs` from `query pivs`. A `start` parameter is added to each piv to compute its Y-coordinate.
   - `pivTotal`': UNDEFINED|INTEGER, with the total number of pivs matched by the current query; comes from `body.total` from `query pivs`.
   - `queryTags`: `{'a::': INTEGER, 'u::': INTEGER, tag1: ..., ...}`; comes from `body.tags` from `query pivs`.
   - `reset`: if present, has the form `{token: STRING, username: STRING}`. Used to reset password.
   - `tags`: `[TAG1, TAG2, ...]`. Only includes tags created by the user.
   - `uploads`: `[{id: INTEGER (also functions as start time), total: INTEGER, status: uploading|complete|cancelled|stalled|error, unsupported: UNDEFINED|[STRING, ...], alreadyImported: INTEGER|UNDEFINED (only for uploads of imports), alreadyUploaded: INTEGER|UNDEFINED, tags: [STRING, ...]|UNDEFINED, end: INTEGER|UNDEFINED, ok: INTEGER|UNDEFINED, repeated: [STRING, ...]|UNDEFINED, repeatedSize: INTEGER|UNDEFINED, invalid: [STRING, ...]|UNDEFINED, tooLarge: [STRING, ...]|UNDEFINED, lastPiv: {id: STRING, deg: UNDEFINED|90|-90|180}, error: UNDEFINED|STRING|OBJECT, providerErrors: UNDEFINED|[STRING|OBJECT, ...]}, ...]`.

## Admin

Only things that differ from client are noted.

### Views

**Pages**:

1. `views.dashboard`
2. `views.users`
   - Depends on: `Data.users`
   - Events:
      - `click -> delete user USERNAME`
4. `views.logs`
   - Depends on: `Data.logs`, `State.logs.username`
5. `views.deploy`
   - Events:
      - `click -> deploy client`

### Responders

1. Users
   1. `retrieve users`: invokes `get admin/users`.
   2. `delete user`: invokes `post auth/delete`; if successful, invokes `retrieve users`. It also invokes `snackbar`.
   3. `change State.page`: if current page is `users` and there's no `Data.users`, it invokes `retrieve users`.

2. Users
   1. `retrieve logs`: invokes `get admin/logs/USERNAME`, where `USERNAME` is `State.logs.username`; set `Data.logs` and optionally `Data.allLogs`.
   2. `change State.page`: if current page is `logs` and there's no `Data.logs`, it invokes `retrieve logs`.

3. Deploy
   1. `deploy client`: invokes `post admin/deploy` and `snackbar`.

### Store

- `State`:

- `Data`:
   - `users`: `[...]`.
   - `logs`: `[...]`.
   - `allLogs`: `[...]` - only set if last logs query had more than 2k entries.

## Version history

- Alpha/v0: [bfa9ad50b5e54c78ba804ba35fe1f6310e55dced](https://github.com/altocodenl/acpic/tree/bfa9ad50b5e54c78ba804ba35fe1f6310e55dced)
- Beta: [27fe9a5ad0ee597a7ffdf11b6da8aa935f6fb5d2](https://github.com/altocodenl/acpic/tree/27fe9a5ad0ee597a7ffdf11b6da8aa935f6fb5d2)

## Annotated source code

For now, we only have annotated fragments of the code. This might be expanded comprehensively later.

### `client.js`

TODO: add annotated source code from the beginning of the file.

We define a responder `read hash`, which will be called whenever the hash component of the URL changes.

```javascript
   ['read', 'hash', {id: 'read hash'}, function (x) {
```

We start by taking `window.location.hash`, splitting it into parts and storing it into a variable `hash`. We'll set a variable `page` to the first part of the hash.

```javascript
      var hash = window.location.hash.replace ('#/', '').split ('/'), page = hash [0];
```

If `page` is `'login'` and there is a second part in the hash equal to `'verified'`, we print a welcoming message.

```javascript
      if (page === 'login' && hash [1]) B.call (x, 'snackbar', 'green', 'Your email is now verified. Please log in!');
```

If `page` is `'reset'` and there are both a second and a third part of the hash, we `set Data.reset.token` to the second part of the hash and `Data.reset.username` to the third one.

```javascript
      if (page === 'reset' && hash [1] && hash [2]) B.call (x, 'set', ['Data', 'reset'], {
         token:    decodeURIComponent (hash [1]),
         username: decodeURIComponent (hash [2])
      });
```

If `page` is `'import'` and there is a third part of the hash (which will represent the provider), we `set State.imports.PROVIDER.authOK` or `set State.imports.PROVIDER.authError`, depending on the value of the first part of the hash.

```javascript
      if (page === 'import' && hash [2]) {
         if (hash [1] === 'success') B.call (x, 'set', ['State', 'imports', hash [2], 'authOK'],    true);
         if (hash [1] === 'error'  ) B.call (x, 'set', ['State', 'imports', hash [2], 'authError'], true);
      }
```

If the user is logged in (which will be the case if `Data.csrf` is set) and there's no `page`, or if `page` is `'pics'`, we `set State.queryURL` to either the second part of the hash, or to `'home'` if there's no second part of the hash. We assume that if there's no `page` specified, the right page is `'pics'`, which it will be if the user is logged in. If the user is not logged in, the user will be redirected to the right page by `goto page`. We won't do this if the user is not logged in to avoid requesting pivs when the user has no session to do that yet.

```javascript
      if (B.get ('Data', 'csrf') && (! page || page === 'pics')) B.call (x, 'set', ['State', 'queryURL'], hash [1] || 'home');
```

This is as good a place as any to understand the flow of responders when this modification to `State.queryURL` is done, or, more in general, to understand how changes in the URL are reflected in the state and viceversa. The order of operations is the following:

```javascript
window.location.hash changes -> read hash -> set State.queryURL -> set State.query -> change State.query -> update queryURL -> update window.location.hash
```

This flow will be executed when 1) the app is loaded; 2) the user enters a new URL with a different hash; 3) another part of the app logic changes `window.location.hash`

You might have noticed that at the end of this flow, we set `window.location.hash`. Wouldn't this trigger an infinite loop? It will not, but only because `update queryURL` will only change `window.location.hash` if it doesn't already have the desired value. In the case where the flow starts with a change on the hash, all the upcoming changes will reflect what is already there in the hash.

We might be getting ahead of ourselves, but notice how this flows enables a change in `State.query` to do an abridged version of this sequence of operations, which skips everthing before but still updates `queryURL` and `window.location.hash`.

Finally, and after the operations above are executed, the responder will invoke `goto page`, passing `page` and `true` as extra arguments.

```javascript
      B.call (x, 'goto', 'page', page, true);
   }],
```

We now define `goto page`, the responder in charge of making sure that the user is in the right page (or perhaps, in the right *view*).

this is the main navigation responder, which decides whether a change in the hash should take the app to a new page. Before explaining the implementation, it is useful to understand the requirements of navigation in the application:
- We cannot go to views that don't exist.
- We can only show certain pages while being logged in, and certain pages only when being logged out.
- When requesting a logged in page when being logged out, the user should be redirected to the requested page after signup/login. We'll use `State.redirect` to store the required view after signup/login.
- When loading the app for the first time, we should notice whether the user wants to go to no view or the default view (which means the default view), or a valid view that requires login.
- Navigation comprises four cases: 1) initial load of the app; 2) change of hash (the user has decided to go to another view or has pasted a link on the URL bar with the app already opened); 3) signup/login; 4) logout.
   - The initial load can take you to the requested view if you're logged in, or to `login` otherwise (but remembering that choice). It should disregard non-existing views being requested.
   - The change of hash is equivalent to the initial load.
   - `signup/login` takes you to either the requested view (`State.redirect`) or the default logged in view.
   - `logout` takes you to `signup/login`.
- Implementation notes:
   - This responder is invoked directly by `read hash`, as well as by all auth responders. The initial load calls it through invoking `read hash`.
   - This responder exists as a gatekeeper to `State.page`, to prevent responders that are matched on a certain value of `State.page` being triggered if the user doesn't have access to a certain page. For example, the responders that perform queries in `pics` should not be triggered until the user is logged in.

This responder will take two arguments, `page` (the page where the user should go, assuming they have the right permissions) and `fromHash`, an argument that if enabled indicates that this invocation comes from the `read hash` responder.

Since this responder is also invoked by some buttons in some views, we need to distinguish those invocations from the ones from `read hash`, for reasons we'll see below.

```javascript
   ['goto', 'page', {id: 'goto page'}, function (x, page, fromHash) {
```

We define a `pages` object, containing a list of pages that are reachable when the user is either `logged` and `unlogged`.

```javascript
      var pages = {
         logged:   ['pics', 'upload', 'share', 'tags', 'import', 'account', 'upgrade'],
         unlogged: ['login', 'signup', 'recover', 'reset']
      }
```

If the requested page is not in the `pages` object, we default to the first page in the `logged` category (`pages`).

```javascript
      if (! inc (pages.logged, page) && ! inc (pages.unlogged, page)) page = pages.logged [0];
```

We determine if the user is `logged` by checking whether `Data.csrf` is defined.

```javascript
      var logged = B.get ('Data', 'csrf');
```

If the user is not logged and is requesting a page that requires to be logged, we `set State.redirect` to `page` and then instead go to the first unlogged page (`login`). We do this through a recursive call to the `goto page` responder. Notice there's a `return` clause just before the event call, which means that in this case no further actions will be performed on this invocation of the responder.

```javascript
      if (! logged && inc (pages.logged, page)) {
         B.call (x, 'set', ['State', 'redirect'], page);
         return B.call (x, 'goto', 'page', pages.unlogged [0]);
      }
```

If the user is logged and is requesting a page that belongs to a user not logged in, we redirect them to the first logged page (`pics`) with a recursive call to `goto page`. Notice there's a `return` clause before the event call just as we did in the previous code block, to prevent further actions in this invocation of the responder.

```javascript
      if (logged && inc (pages.unlogged, page)) return B.call (x, 'goto', 'page', pages.logged [0]);
```

If the user is logged and `State.redirect` is set, we invoke `rem` on it.

```javascript
      if (logged && B.get ('State', 'redirect')) B.call (x, 'rem', 'State', 'redirect');
```

If we're here, we will send the user to `page`.

We set `document.title` based on the `page` to which we are sending the user.

```javascript
      document.title = ['ac;pic', page].join (' - ');
```

If `page` is `'pics'`:

```javascript
      if (page === 'pics') {
```

If the event was not called with the `fromHash` parameters and `State.query` is not `'home'`, this means that we are going to the `pics` page and we need to show the home tags. To ensure this, we `set State.queryURL` and then we set `State.page` to `page`. In this case, we do not do anything else.

```javascript
         if (! fromHash && B.get ('State', 'queryURL') !== 'home') {
            B.call (x, 'set', ['State', 'queryURL'], 'home');
            return B.call (x, 'set', ['State', 'page'], page);
         }
```

Let's go back for a minute to the sequence of changes produced when the hash of the page changes:

```
window.location.hash changes -> read hash -> set State.queryURL -> set State.query -> change State.query -> update queryURL -> update window.location.hash
```

The modification to `State.queryURL` basically inserts itself on the third step of the sequence; all the following operations (setting `State.query`, updating `State.queryURL` and `window.location.hash` will happen through this change on `State.queryURL`.

Finally, if `page` is `pics` but the event was called from the `read hash` event or `State.queryURL` is already `'home'`, we redefine `page` to be the concatenation of `page` with a slash plus `State.queryURL`.

```javascript
         page = 'pics/' + B.get ('State', 'queryURL');
      }
```

We `set State.page` to `page`. If `page` now contains a slash plus `State.queryURL` (as it will if `page` is `'pics'`), we take care to remove that part of the string before setting that value into `State.page`.

```javascript
      B.call (x, 'set', ['State', 'page'], page.replace (/\/.+/, ''));
```


Finally, we update `window.location.hash` if it's not what it should be. This concludes the responder.

```javascript
      if (window.location.hash !== '#/' + page) window.location.hash = '#/' + page;
   }],
```

TODO: add annotated source code in between these two sections.

We now define the `pics` responders.

We start with `change State.page`. Unlike other `change` events, we do not set the `match` property to `B.changeResponder`, since we only care about changes to `State.page`, not those on `State` or on a nested value (`State.page` will never contain a nested value).

```javascript
   ['change', ['State', 'page'], {id: 'change State.page -> pics'}, function (x) {
```

This responder will only perform actions if the current page is `pics`, otherwise it will return. There will be other responders defined later on `change State.page` dedicated to the other main views.

```javascript
      if (B.get ('State', 'page') !== 'pics') return;
```

If `State.query.updateLimit` is older than 10 milliseconds, the responder will update it to the current date. This ensures that the current query is fresh enough when coming back from another view. The reason we allow for 10 milliseconds rather than checking for the present moment is that this number can sometimes be set by another responder which triggers further logic, and by the time we get to the invocation of the current responder, some milliseconds have elapsed; if, in this case, we still update `updateLimit`, we will trigger an extra change to `State.query` and thus an extra invocation to `query pivs`, which we want to avoid.

```javascript
      if (B.get ('State', 'query', 'updateLimit') < Date.now () - 10) B.call (x, 'set', ['State', 'query', 'updateLimit'], Date.now ());
```

Finally, we call `change State.selected`, which might be necessary to highlight the current selection. This concludes the responder.

```javascript
      B.call (x, 'change', ['State', 'selected']);
   }],
```

We define the responder for `change State.query`. This is one of the main responders of the application.

```javascript
   ['change', ['State', 'query'], {id: 'change State.query', match: B.changeResponder}, function (x, newValue, oldValue) {
```

If what changes is the `State` object itself, or `State.query.recentlyTagged|update`, we don't do anything else, since we want to ignore these changes. But if `State.query` is set, or if `State.query.tags|sort|home|fromDate|updateLimit` change, we will perform further actions.

```javascript
      if (x.path.length < 2 || inc (['recentlyTagged', 'update'], x.path [2])) return;
```

If either `State.query.tags` or `State.query.sort` or `State.query.home` changed, we will remove the fields `fromDate`, `update` and `updateLimit` from the query, since we deem the query to have changed and thus we need to clear out these fields. We will do without triggering any `change` events yet, since we don't want to call other events yet.

```javascript
      if (inc (['tags', 'sort', 'home'], x.path [2])) B.rem (['State', 'query'], 'fromDate', 'update', 'updateLimit');
```

If `State.query.updateLimit` is either `true` or `undefined`, we set it to the current time. It will be `undefined` if it was just removed by the line above; and it will be `true` if set to that value by two user interactions; `true` means "the present moment", so the result will be the same.

```javascript
      if (inc ([true, undefined], B.get ('State', 'query', 'updateLimit'))) B.set (['State', 'query', 'updateLimit'], Date.now ());
```

We now invoke `update queryURL`, passing a truthy extra argument if what changed is `State.query.fromDate`. We want that to be truthy in that case since we don't want the `update queryURL` responder to create further browser history entries each time this parameter is changed - this parameter changes very often on what the user perceives as the same query (same `tags` and `sort`), so it shouldn't create a new browser history entry.

```javascript
      B.call (x, 'update', 'queryURL', x.path [2] === 'fromDate');
```

If what changes in the query is the `fromDate` key, we write a mechanism that will prevent unnecessary calls to `query pivs`.

```javascript
      if (x.path [2] === 'fromDate') {
```

if the total pivs we have brought from the query is equal to the total pivs on the query itself, we don't query further pivs since there's nothing else to bring.

```javascript
         if (B.get ('Data', 'pivs').length === B.get ('Data', 'pivTotal')) return;
```

We will now determine whether we should load further pivs, based on chunk visibility.

```javascript
         var chunks = B.get ('State', 'chunks');
         if (chunks.length) {
            var lastVisibleChunkIndex;
```

We iterate the chunks and note the last visible chunk.

```javascript
            dale.go (chunks, function (chunk, k) {
               if (chunk.userVisible) lastVisibleChunkIndex = k;
            });
```


If last visible chunk is the last or the next-to-last last chunk, we load more pivs. Otherwise, we don't.

If we are scrolling backwards on the same query, we also don't have to perform a new query. But if the previous load gave us enough pivs, the last visible chunk check will loading more pivs. So there's no need for further logic to cover this case.

```javascript
            if (lastVisibleChunkIndex + 1 < chunks.length - 1) return;
         }
      }
```

If we're here, we will invoke `query pivs`. We pass an `options` parameter which will have the key `noScroll` set if either `updateLimit` changed, or if `fromDate` changed and there was a previous value on `fromDate`. This will prevent scrolling on both cases.

The first situation is when we want to get the latest list of pivs for a given query (which should not change the scroll position); the second one will happen when the `scroll` responder updates `updateLimit` (which should also not change the scroll position since that would create an infinite loop).

The case where `fromDate` changes but there was no previous value is the loading of a first query through a link that contains a `fromDate` parameter - in that case, we do want to programmatically set the scroll so we will not pass `noScroll`.

This concludes the responder.

```javascript
      B.call (x, 'query', 'pivs', {noScroll: x.path [2] === 'updateLimit' || x.path [2] === 'fromDate' && oldValue});
   }],
```

TODO: add annotated source code in between these two sections.

We now define the responder for `toggle tag`, which will add or remove a tag from `State.query.tags`.

This endpoint takes as extra arguments `tag` (the tag to be toggled) and `addOnly`, a flag that if present, will only add the tag if it's not present in `State.query.tags` and do nothing if it's already there.

```javascript
   ['toggle', 'tag', {id: 'toggle tag'}, function (x, tag, addOnly) {
```

If `tag` is already in `State.query.tags`, we will want to remove it.

```javascript
      if (inc (B.get ('State', 'query', 'tags'), tags)) {
```

If `addOnly` is set, we will not remove the tag from the query. In this case, there's nothing else to do. This flag will be enabled on the sidebar when pivs are selected; when the icon to select the tag is clicked, we want only to add the tag, never to remove it - and it is cumbersome to add a conditional for each tag to specify either a call to `toggle tag` or a no-op.

```javascript
         if (addOnly) return;
```

If the tag being removed is `'u::'` and there are entries in `State.query.recentlyTagged`, we will remove `State.query.recentlyTagged` mutely (without calling a `change` event). We do this mutely since we will modify later `State.query.tags` and thus we want to avoid two calls to `query pivs`.

```javascript
         if (tag === 'u::' && B.get ('State', 'query', 'recentlyTagged')) B.rem (['State', 'query'], 'recentlyTagged');
```

We create a list of new tags in the variable `resultingTags`. If the tag being removed is *not* a year tag, the list will merely be the existing list of tags minus the tag being removed; but if the tag being removed is a year tag, and there is a month tag in the query as well, that month tag will be removed too from the list.

```javascript
         var resultingTags = dale.fil (B.get ('State', 'query', 'tags'), function (existingTag) {
            if (! (existingTag === tag || (H.isYearTag (tag) && H.isMonthTag (existingTag)))) return existingTag;
         });
```

If there are no more tags on the list of tags and there currently is a selection, we remove the existing selection.

```javascript
         if (resultingTags.length === 0 && dale.keys (B.get ('State', 'selected')).length) B.call (x, 'rem', 'State', 'selected');
```

We update `State.query.tags` and do nothing else. This concludes the case where we are removing the tag from the list. This concludes the case for removing the tag from the list.

```javascript
         return B.call (x, 'set', ['State', 'query', 'tags'], resultingTags);
      }
```

If we are here, we will be adding the tag to the list.

If `State.query.home` is set, we will mutely set it to `false`. We do this mutely since we will change `State.query` below and we want to do this just once during the execution of this responder.

```javascript
      if (B.get ('State', 'query', 'home')) B.set (['State', 'query', 'home'], false);
```

If the user's onboarding flag (`Data.account.onboarding`) is set and `State.onboarding` is not `false` yet, we set it to `false`. This will hide the onboarding view.

```javascript
      if (B.get ('Data', 'account', 'onboarding') && B.get ('State', 'onboarding') !== false) B.call (x, 'set', ['State', 'onboarding'], false);
```

We will now set `State.query.tags` to a new list of tags, which will include the tag being added, minus some tags already in the query that might have to be removed to avoid unwanted combinations in the query.

```javascript
      B.call (x, 'set', ['State', 'query', 'tags'], dale.fil (B.get ('State', 'query', 'tags'), undefined, function (existingTag) {
```

If we are adding the tags Organized or To Organize, and its complement tag is already present, we remove the complement tag from the new list of tags.

```javascript
         if (existingTag === 'o::' && tag === 't::'     || existingTag === 't::'     && tag === 'o::') return;
```

If the untagged tag is present and we are adding a user tag, we remove the untagged tag; conversely, if we are adding the untagged tag, we remove all the normal tags from the list.

```javascript
         if (existingTag === 'u::' && H.isUserTag (tag) || H.isUserTag (existingTag) && tag === 'u::') return;
```

If we are adding a range tag, we remove all the existing date tags (month and year), as well as other range tags, from the list.

```javascript
         if ((H.isDateTag (existingTag) || H.isRangeTag (existingTag)) && H.isRangeTag (tag)) return;
```

If we're adding a month tag, we remove any other month tags from the list.

```javascript
         if (H.isMonthTag (existingTag) && H.isMonthTag (tag)) return;
```

Otherwise, we let the existing tag stand. Finally, we add the new `tag` to the list.

```javascript
         return existingTag;
      }).concat (tag));
```

Finally, if we are adding a user tag and `State.filter` is set, we remove it. This concludes the responder.

```javascript
      if (H.isUserTag (tag) && B.get ('State', 'filter')) B.call (x, 'rem', 'State', 'filter');
   }],
```

We now define the responder for `toggle hometag`, which will add or remove a tag from the list of home tags.

```javascript
   ['toggle', 'hometag', {id: 'toggle hometag'}, function (x, hometag) {
```

We start by noting the position of the tag in the list of hometags.

```javascript
      var index = B.get ('Data', 'hometags').indexOf (hometag);
```

If the position of the tag in `Data.hometags` is `-1`, then the tag should be added to the list since it's not there. Otherwise, we will remove it. Note we do this directly without triggering `change` events yet.

```javascript
      if (index > -1) B.rem (['Data', 'hometags'], index);
      else B.add (['Data', 'hometags'], hometag);;
```

We invoke `POST /hometags` passing `Data.hometags` inside the body. If there's an error, we merely report it through `snackbar` and do nothing else.

```javascript
      B.call (x, 'post', 'hometags', {}, {hometags: B.get ('Data', 'hometags')}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error updating your home tags.');
```

If the operation was successful, we invoke `query tags` (which will also refresh the list of home tags) and we call a `change` event on `Data.hometags`. This `change` event is necessary since we already updated `Data.hometags` without triggering a view redraw; even when the list of tags gets updated, no `change` event will now be fired since `Data.hometags` is what it already should be. For that reason, we now need to update the view directly through this `change` event.

This concludes the responder.

```javascript
         B.call (x, 'query', 'tags');
         B.call (x, 'change', ['Data', 'hometags']);
      });
   }],
```

We now define `shift hometag`, a responder for changing the position of a tag within the list of home tags.

```javascript
   ['shift', 'hometag', {id: 'shift hometag'}, function (x, from, to) {
```

This responder takes two indexes, the first one that of the tag we are moving, the other one the index to which in which we want to insert that tag. We get the corresponding tags to those two indexes.

```javascript
      var fromtag = B.get ('Data', 'hometags', from);
      var totag   = B.get ('Data', 'hometags', to);
```

We now update `Data.hometags` in place, without calling `change` events.

```javascript
      B.set (['Data', 'hometags', from], totag);
      B.set (['Data', 'hometags', to], fromtag);
```

As with the previous responder, we invoke `POST /hometags` passing `Data.hometags` inside the body. If there's an error, we merely report it through `snackbar` and do nothing else.

```javascript
      B.call (x, 'post', 'hometags', {}, {hometags: B.get ('Data', 'hometags')}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error updating your home tags.');
```

If the operation was successful, we invoke `query tags` (which will also refresh the list of home tags) and we call a `change` event on `Data.hometags`. This `change` event is necessary since we already updated `Data.hometags` without triggering a view redraw; even when the list of tags gets updated, no `change` event will now be fired since `Data.hometags` is what it already should be. For that reason, we now need to update the view directly through this `change` event.

This concludes the responder.

```javascript
         B.call (x, 'query', 'tags');
         B.call (x, 'change', ['Data', 'hometags']);
      });
   }],
```

TODO: add annotated source code in between these two sections.

We now define `tag pivs`, the responder that will be in charge of tagging or untagging pivs.

It takes two arguments besides the context: `tag`, the actual tag to be added/removed to the selected pivs; and `del`, a flag that indicates whether this is an untagging or not.

```javascript
   ['tag', 'pivs', function (x, tag, del) {
```

If no `tag` is sent, we don't do anything. This can only happen if the event is called from the input element for adding a new tag when there is nothing in the element.

```javascript
      if (! tag) return;
```

If we are untagging, we ask the user for confirmation. If the confirmation is not given, then we don't do anything else.

```javascript
      if (del && ! confirm ('Are you sure you want to remove the tag ' + tag + ' from all selected pictures?')) return;
```

If the user is trying to tag a tag that is neither a user tag nor an Organized tag, we invoke `snackbar` and stop the operation.

```javascript
      if (! H.isUserTag (tag) && tag !== 'o::') return B.call (x, 'snackbar', 'yellow', 'Sorry, you cannot use that tag.');
```

We place the ids of the pivs to be tagged/untagged into `ids`. We store `State.query` into `query` and the amount of pivs in the current query in `pivTotal`.

```javascript
      var ids = dale.keys (B.get ('State', 'selected')), query = B.get ('State', 'query'), pivTotal = B.get ('Data', 'pivTotal');
```

If tagging (and not untagging) and `'u::'` is in `State.query.tags`, it adds each of the `ids` to `State.query.recentlyTagged`, but not if they are already there. Note it does this without triggering a change event, since we don't want to invoke `query pivs` just yet.

```javascript
      if (! del && inc (query.tags, 'u::')) dale.go (ids, function (id) {
         if (! inc (query.recentlyTagged || [], id)) B.add (['State', 'query', 'recentlyTagged'], id);
      });
```

We invoke `post tag`.

```javascript
      B.call (x, 'post', 'tag', {}, {tag: tag, ids: ids, del: del}, function (x, error, rs) {
```

If there was an error, we invoke `snackbar` and do not do anything else.

```javascript
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error ' + (del ? 'untagging' : 'tagging') + ' the picture(s).');
```

If this was a tagging operation (and we did not mark pivs as Organized or To Organize) and the user still has no home tags (`Data.hometags`), we invoke `toggle hometag` on this tag to add it to the home tags.

```javascript
         if (! del && H.isUserTag (tag) && B.get ('Data', 'hometags').length === 0) B.call (x, 'toggle', 'hometag', tag);
```

If we are untagging all of the pivs in the query, we remove the tag from the query - more precisely, from `State.query.tags`. We don't do anything else, since this will indirectly perform a call to `query pivs`.

```javascript
         if (del && ids.length === pivTotal) return B.call (x, 'rem', ['State', 'query', 'tags'], query.tags.indexOf (tag));
```

If this was not an untagging operation, we invoke `snackbar`; note we use a differenet message if the tag in question is Organized or To Organize.

```javascript
         if (! del & H.isUserTag (tag)) B.call (x, 'snackbar', 'green', 'Just tagged ' + ids.length + ' picture(s) with tag ' + tag + '.');
         else if (! del)                B.call (x, 'snackbar', 'green', 'Just marked ' + ids.length + ' picture(s) as ' + (tag === 'o::' ? 'Organized' : 'To Organize ') + '.');
```

Now for some delightful application logic. If we are marking pivs as Organized or To Organize, and the complement tag (To Organize if we are marking pivs as Organized, or Organized if we are marking pivs as To Organize) is present in the query, we remove the complement tag from the query to avoid a ronin (empty) query. We won't do anything else, since this will indirectly invoke `query pivs`.

```javascript
         if (tag === 'o::' && ids.length === pivTotal) {
            var toRemove = del ? 'o::' : 't::';
            if (inc (query.tags, toRemove)) return B.call (x, 'rem', ['State', 'query', 'tags'], query.tags.indexOf (toRemove));
         }
```

If we're here, we invoke `query pivs` directly, to update the tag information on the sidebar and on the pivs themselves.

```javascript
         B.call (x, 'query', 'pivs');
```

If `tag` is equal to `State.newTag`, we remove `State.newTag` so that the input will be cleaned. This concludes the responder.

```javascript
         if (tag === B.get ('State', 'newTag')) B.call (x, 'rem', 'State', 'newTag');
      });
   }],
```

TODO: add annotated source code in between these two sections.

We now define the responder for `change State.queryURL`. This responder will make sure that whatever is contained on `State.queryURL` is reflected on `State.query`.

```javascript
   ['change', ['State', 'queryURL'], {id: 'change State.queryURL'}, function (x) {
      var queryURL = B.get ('State', 'queryURL');
```

If `queryURL` is `home`, it will initialize `State.query` to a query with no tags, sorted by `newest`, with `updateLimit` set to now and showing the `home` view. No further actions will be performed in this case.

```javascript
      if (queryURL === 'home') return B.call (x, 'set', ['State', 'query'], {tags: [], sort: 'newest', updateLimit: Date.now (), home: true});
```

If we're here, the query URL presumably contains a query. If so, we make sure to set `State.onboarding` to `false` since we don't want to show the onboarding view if we are loading a query. We do not check whether `Data.account.onboarding` is set (to avoid setting it unnecessarily if `Data.account.onboarding` is disabled) because this might be executed before the account information arrives form the server.

```javascript
      if (B.get ('State', 'onboarding') !== false) B.call (x, 'set', ['State', 'onboarding'], false);
```

We will wrap the rest of the logic in a `try/catch` block, since the decoding of the hash into a query object might fail if the user inputs an invalid URL.

```javascript
      try {
```

We [base64 decode](https://en.wikipedia.org/wiki/Base64) `State.queryURL`, then [percent decode](https://en.wikipedia.org/wiki/Percent-encoding) it and finally parse it as JSON. If this operation fails, we will go to the `catch` block further below.

```javascript
         var query = JSON.parse (decodeURIComponent (atob (B.get ('State', 'queryURL'))));
```

If we're here, we successfully decoded the `queryURL` into a `query` object. We save a copy of `State.query` in `oldValue` and also create a variable `changes` to mark whether we will perform changes to the object.

```javascript
         var changes, oldValue = teishi.copy (B.get ('State', 'query'));
```

We iterate the three keys from `State.query` that were previously stored in `State.queryURL`. If any of them is different from the corresponding key at `State.query`, we mark `changes` as `true` and we directly set the key on `State.query`. Note we do this without triggering `change` events, to avoid further responders being matched at this point.

```javascript
         dale.go (['tags', 'sort', 'fromDate'], function (k) {
            if (eq (query [k], B.get ('State', 'query', k))) return;
            changes = true;
            B.set (['State', 'query', k], query [k]);
         });
```

If there were changes, we also directly set `State.query.home` to `false` to leave the home view, and we finally call a `change` event on `State.query`, passing the new and old values of `State.query` as extra arguments so that we can have that information in the log.

```javascript
         if (changes) B.set (['State', 'query', 'home'], false);
         if (changes) B.call (x, 'change', ['State', 'query'], B.get ('State', 'query'), oldValue);
      }
```

If there was a decoding error, we catch it and report it through a call to `post error`. This concludes the responder.

```javascript
      catch (error) {
         B.call (x, 'post', 'error', {}, {error: 'Change queryURL error', queryURL: B.get ('State', 'queryURL')});
      }
   }],
```

We now define the responder for `update queryURL`. This responder is in charge of updating `State.queryURL` and `window.location.hash` when `State.query` changes.

```javascript
   ['update', 'queryURL', {id: 'update queryURL'}, function (x, dontAlterHistory) {
```

If `State.query.home` is truthy, we define `hash` to be `'home'`.

```javascript
      if (B.get ('State', 'query', 'home')) var hash = 'home';
```

Otherwise, we will construct a hash from three keys on `State.query`: `tags`, `sort` and `fromDate`. We will store these on a `query` object.

```javascript
         var query = dale.obj (B.get ('State', 'query'), function (v, k) {
            if (inc (['tags', 'sort', 'fromDate'], k)) return [k, v];
         });
```

While it would be fitting to add `State.query.recentlyTagged` as well, we don't do it to avoid potentially making the URL longer than 2k characters, which may not be supported on some browsers.

As for the fields `update`, `updateLimit` and `home`, we definitely don't want to store those on a URL since the first two should be refreshed when the user opens the interface from a saved link, while the last one is redundant since `hash` will be just `'home'` if we want to show the home view.

We construct the hash by first stringifying it, then percent encoding it and finally base64 encoding it. The base64 encoding is done for aesthetic purposes only (all those `%` in the URL sure look ugly).

```javascript
         var hash = btoa (encodeURIComponent (JSON.stringify (query)));
      }
```

We now have the desired hash. If the desired hash is the same as the one already on `window.location.hash` (or rather, the same one prepended by `#/pics`), there's nothing else to do.

```javascript
      if (window.location.hash === '#/pics/' + hash) return;
```

If we're here, we will update both `window.location.hash` and `State.queryURL`.

If the `dontAlterHistory` argument wasn't passed, we merely update `window.location.hash`. This will, in turn, update `State.queryURL`. In this case, there's nothing else to do.

```javascript
      if (! dontAlterHistory) return window.location.hash = '#/pics/' + hash;
```

If `dontAlterHistory` was passed (which will happen when `change State.query.fromDate` changes, we will update the hash by overwriting the last browser history entry, so this action doesn't create another history entry.

In this case, we will directly set `State.queryURL`. We do this without triggering a `change` event to avoid triggering unnecessarily the `change State.queryURL` responder - if we didn't prevent this, nothing bad would happen since `State.query` wouldn't change.

```javascript
      history.replaceState (undefined, undefined, '#/pics/' + hash);
      B.set (['State', 'queryURL'], hash);
```

This concludes the responder.

```javascript
   }],
```

TODO: add annotated source code to the end of the file.

### `server.js`

TODO: add annotated source code from the beginning of the file.

We define `H.getSharedHashes`, a function that will return a list of all the hashes of all the pivs shared with a given user.

This function will be used by `H.deletePiv` and `H.tagCleanup`.

As arguments, it takes an astack `s` and the `username` for which we want to obtain the list of hashes.

```javascript
H.getSharedHashes = function (s, username) {
```

We start an asynchronous sequence using the received astack.

```javascript
   a.seq (s, [
```

We first get a list of all the tags shared with the user, by getting `shm:USERNAME`.

```javascript
      [Redis, 'smembers', 'shm:' + username],
```

We will now build a list of all the ids of all the pivs shared with the user. For this, we define a redis `multi` operation and a `qid` (query id) since we will temporarily store our list of ids in redis.

If, however, there are no shared tags with the user, we simply return a string `'empty'` to the next asynchronous function.

```javascript
      function (s) {
         if (s.last.length === 0) return s.next ('empty');
         var multi = redis.multi (), qid = 'query:' + uuid ();
```

We iterate the tags shared with the user. These share items are of the form `USERNAME:tag`, so by merely prepending them with `tag:`, we will get the list of piv ids that are bound to each tag. The resulting ids are added in a set at key `qid` through the `sunionstore` operation.

A very useful consequence of using a set is that repeated piv ids won't be present more than once, since redis sets will not allow repeated items. Repeated pivs are indeed possible if (for example) user A tags a piv 1 with tags X and Y, and shares both tags with another user.

```javascript
         multi.sunionstore (qid, dale.go (s.last, function (share) {
            return 'tag:' + share;
         }));
```

We then get the resulting set, delete it from redis and execute the multi operation.

```javascript
         multi.smembers (qid);
         multi.del (qid);
         mexec (s, multi);
      },
```

We now iterate the list of ids, and obtain the `hash` for each of them as part of a new multi operation.

If no tags are shared with the user, we merely return an empty array.

If two (or more) distinct pivs have the same hash, the list will contain repeated hashes. However, we're OK with this, since the amount of repeated pivs should be relatively small, and the use we have for this list doesn't require it to contain non-repeated elements. To eliminate duplicates, we could either filter them in javascript, or add all the resulting hashes onto a redis set, but we won't do it - at least, not for now.

Note that we access the second element in `s.last`, since that one corresponds to the `smembers` operation which brings the ids.

We will merely return the result of obtaining all the hashes, which should produce a list of hashes. This concludes the function.

```javascript
      function (s) {
         if (s.last === 'empty') return s.next ([]);
         var multi = redis.multi ();
         dale.go (s.last [1], function (id) {
            multi.hget ('piv:' + id, 'hash');
         });
         mexec (s, multi);
      }
   ]);
}
```

We now define `H.tagCleanup`, a function that removes tag entries from a user's list of tags (`tags:USERNAME` and `hometags:USERNAME`), as well as shared tag entries (of the form `sho:USERNAME:TAG` and `shm:ANOTHERUSERNAME:TAG`). Those entries will be removed if no more pivs exist that hold a given tag - which means that the tag, for that particular user, has ceased to exist. If a tag entry is removed from `tags:USERNAME`, if that tag is shared with others, some entries on `sho:USERNAME` and `shm:ANOTEHRUSERNAME` will have to be removed as well. The cleanup of `tags:USERNAME`, `hometags:USERNAME`, `sho:USERNAME` and `shm:ANOTHERUSERNAME` is what we call the *first half* of the function.

The function will also delete hashtag entries that are no longer needed, while also removing some hashes from taghash entries. The affected hashtags and taghashes will belong to **other users**, rather than the user itself (with the exception of the *remove share* case, see below). The cleanup of hashtags and taghashes is what we call the *second half* of the function.

Some background on hashtags is helpful: hashtags are sets of the form `hashtag:USERNAME:HASH` that point to one or more tags. Their purpose is to allow a user B to tag pivs that don't belong to them, but are shared with them. Why is this done on a hash rather than on a piv id itself? For the following reason: if multiple users (say, A and C) happen to own each a piv with a hash 1, and they both share both pivs with user B, whenever user B tags one of those pivs, the desired behavior is that the tagging will happen to a piv that looks exactly like that one, rather than the version shared by either user A or C. In other words, what the user tags is *a piv that looks like this* - and the accurate proxy for a *piv that looks like this* is its `hash` entry.

taghashes are reverse hashtags: they are sets of the form `taghash:USERNAME:TAG` that point to one or more hashes. Their purpose is to make querying more efficient. Their contents, however, are equivalent to that of hashtags. Both should be kept consistent with each other.

One more thing regarding hashtags and taghashes: if a user B owns a piv with hash 1, they will have no hashtag entry for hash 1 and no taghashes will contain the hash 1. In other words, if a user owns a piv with hash 1, there's no need for hashtags or taghashes, since tags on a piv with hash 1 will be applied to the only piv they will own with hash 1.

This function will be invoked in the following five situations:

1. For a given user, a piv with the same content but different metadata is uploaded, which ends up changing the month and year of the piv with which the piv is tagged. This happens in `H.updateDate`. In this case, the change only affects one piv, and we only have to check whether the old month/year tags are gone and should be removed from `tags:USERNAME`. There's no need to clean up `sho`/`shm` entries, or hashtags/taghashes, since date tags cannot be shared.
2. A piv is deleted. In this case, one piv is removed, and we'll have to check whether each of the tags on that piv has now disappeared; we also have to perform `sho`/`shm` cleanup; we will also have to check if other users' hashtags/taghashes require cleanup.
3. One or more pivs are untagged. This is the same as when a piv is deleted, except that multiple pivs are potentially affected, and there's only one tag concerned, when it comes to the first half. Hashtag/taghash cleanup is also required.
4. A tag is unshared. In this case, `tags:USERNAME` entries for the user are not affected, and the `sho`/`shm` changes are performed directly by the endpoint rather than this function. But hashtag/taghash cleanup for other users is required, since an unshare potentially means loss of access to pivs by other users.
5. A tag shared by another user is removed by the user from their own list. In this case, hashtag/taghash cleanup is necessary **but for the user itself**, since they are provoking their own potential loss of access to pivs shared by others. And, after the cleanup of hashtag/taghash entries, we need to perform cleanup on the user's `tags:` entries - but not on `sho`/`shm` entries, since if the removal of hashtag/taghash entries causes the removal of an own tag, that means that the tag has no own pivs, and therefore cannot be a shared tag.

Interestingly enough, it is not necessary to invoke this function when disabling geotagging, since all geotags will be removed from the `tags:USERNAME` set by the endpoint itself, and because geotags cannot be shared (so it cannot affect neither `sho`/`shm` entries, nor hashtag/taghash entries).

Why do we need a helper function for tag cleanup and not one for tag setting? Simply, because adding a tag to a set can always be done, since this will add the tag to the set if the tag is not there, or will be a no-op if the tag is already there. But to check whether the tag is gone requires us to see that no more pivs are tagged with it; hence, the need for custom logic. The same goes for hashtags/taghashes.

The logic for the first half of the function (cleaning up `tags:USERNAME` and `sho:USERNAME`/`shm:ANOTHERUSERNAME` entries) is straigthforward: check whether `tag:USERNAME:TAG` or `taghash:USERNAME:TAG` still exist; if none of them does, remove the tag from `tags:USERNAME`; if only a taghash entry exists, remove the tag from `sho`/`shm` entries if it's a shared tag.

What's much less straightforward is the second half, hashtag/taghash cleanup. Even if no tags are removed from `tags:USERNAME` and `sho`/`shm`, other users might potentially lose access to one or more hashes of pivs previously (but no longer) shared with them. And, any change in a hashtag entry must be reflected in the relevant taghash entries as well. For this reason, the inputs received by the function make the two halves independent: the operations of the first half of the function don't affect the result of the second function, or viceversa. The inputs are provided by the calling functions to reduce the potential number of operations to perform the cleanup, particularly for the second half. The first half uses only the arguments `username` and `tags`, whereas the second half uses only the arguments `tags`, `ids` and `sho`.

The logic for hashtag/taghash cleanup is as follows: get a set of all the ids of the pivs to which other users might have lost access (because they were deleted, untagged, unshared, or the share was removed by the user performing the operation); from there, get the list of hashes for those pivs. Then, for each of these hashes, and *after* the rest of the delete/untag/unshare/remove share operation has been done, check whether the user has access to each of these hashes through a share. For each of the hashes that the user no longer has access to: 1) get the relevant hashtag entry `hashtag:ANOTHERUSERNAME:HASH`; 2) if it exists, delete it; 3) for each tag in that entry, remove the hash from `taghash:ANOTHERUSERNAME:TAG`; if a `taghash:ANOTHERUSERNAME:TAG` entry disappears, AND the user has no own pivs tagged with that tag, then remove that tag from `tags:ANOTHERUSERNAME`.

Now, how do we know that the hashtag/taghash changes don't affect further users downstream? The reason is simple: a user B cannot share a piv shared with them by user A with a user C. So, any tags that disappear because of a taghash entry that's gone is necessarily a tag that only existed on pivs not owned by the user; hence, it cannot affect another user.

Do you find this confusing? You're in good company. This function is probably the trickiest piece of code in the entire application.

The function takes as arguments:
- An astack `s`.
- The `username` for which we want to perform the tag cleanup.
- A list of `tags`.
- A list of `ids`. This argument can be absent in the case where `H.updateDates` invokes this function.
- `sho`, which will be the `sho:USERNAME` entry *before* the deletion/untagging/unsharing operation takes place.
- `unshare`, an optional flag that indicates whether this function is being invoked by the unshare/remove share endpoint.

```javascript
H.tagCleanup = function (s, username, tags, ids, sho, unshare) {
```

We start an asynchronous sequence using the received astack.

```javascript
   a.seq (s, [
```

We start by iterating all the `tags` and checking whether they still exist, by checking for the existence of `tag:USERNAME:TAG` and `taghash:USERNAME:tag`. We also get `hometags:USERNAME`.

Note we wrap the afunction in an array, to indicate astack that this is a single afunction with no arguments passed to it by astack. This is necessary only because this is the first entry of the array we pass to `a.seq`.

Note also that if `unshare` is present, we skip this asynchronous function.

```javascript
      [function (s) {
         if (unshare) return s.next ();
         var multi = redis.multi ();
         dale.go (tags, function (tag) {
            multi.exists ('tag:'     + username + ':' + tag);
            multi.exists ('taghash:' + username + ':' + tag);
         });
         multi.get ('hometags:' + username);
         mexec (s, multi);
      }],
```

Now that we have the required info (tag existence and shared tags), we will iterate `tags`; for those that don't exist any more, we remove them from `tags:USERNAME` and from the array `hometags`, which contains the hometags from the user. We also collect all the tags that have no normal tag entry (whether they have a taghash entry or not) in an array `toRemove`. The reason for the distinction is the following: if a tag only exists on pivs not owned by the user, the tag can no longer be a shared tag.

Note also that if `unshare` is present, we skip this asynchronous function.

```javascript
      function (s) {
         if (unshare) return s.next ();
         var hometags = JSON.parse (teishi.last (s.last) || '[]');
         var multi = redis.multi ();
         var toRemove = dale.fil (tags, undefined, function (tag, k) {
            var tagExists = s.last [k * 2], taghashExists = s.last [k * 2 + 1];
            if (! tagExists && ! taghashExists) multi.srem ('tags:'     + username, tag);
            if (! tagExists && ! taghashExists) hometags = dale.fil (hometags, tag, function (v) {return v});
            if (! tagExists) return tag;
         });
```

We update `hometags:USERNAME`. If no tags were removed, this will be a no-op.

```javascript
         multi.set ('hometags:' + username, JSON.stringify (hometags));
```

We now iterate the tags shared by the user. We split each of the items in `sho:USERNAME` into `whom` (the user with whom the tag is shared) and the `tag` itself.

If `sho` is not passed, as is in the case of the invocation done by `H.updateDates`, the iteration won't do anything.

```javascript
         dale.go (sho, function (share) {
            var whom = share.split (':') [0], tag = share.split (':').slice (1).join (':');
```

If the `tag` is in the `toRemove` list, we remove `WHOM:TAG` from `sho:USERNAME`, as well as `USERNAME:TAG` from `shm:ANOTHERUSERNAME` - the latter is the list that contains the tags shared *with* `whom`.

```javascript
            if (! inc (toRemove, tag)) return;
            multi.srem ('sho:' + username, whom + ':' + tag);
            multi.srem ('shm:' + whom, username + ':' + tag);
         });
         mexec (s, multi);
      },
```

This concludes the first half of the function. Now we're ready to perform hashtag/taghash cleanup.

We get the hash for each of the `ids` using a redis `multi` operation. We set the result, which will be an array of hashes, in `s.hashes`. If there are no `ids` present (in the case of date cleanup), this will be a no-op.

```javascript
      [a.set, 'hashes', function (s) {
         var multi = redis.multi ();
         dale.go (ids, function (id) {
            multi.hget ('piv:' + id, 'hash');
         });
         mexec (s, multi);
      }],
```

We now will compile a list of all the affected users - that is, users that might have lost access to one or more pivs as a result of the delete/untag/unshare/remove share operation that invoked this function.

To do this, we iterate the tags shared by `USERNAME`, and, if any of them is included in `tags` and is shared with a username `X`, we add `X` to the list of affected users. We will store this list of affected users in `s.affectedUsers` since we'll use it again below.

```javascript
         s.affectedUsers = [];
         dale.go (sho, function (share) {
```

We extract `username` and `tag` from each `share` string. Note we do a split, slice and join to get the tag from `USERNAME:tag`, since a tag may well contain colons. However, because usernames cannot contain a colon, we can access the username merely by splitting the `share` item by colon and then accessing its first element. This, by the way, is the reason colons are forbidden in usernames - so that we can always know that the username is contained in the first (or sometimes second) part of a string punctuated with colons.

```javascript
            var username = share.split (':') [0], tag = share.split (':').slice (1).join (':');
```

If the tag is inside `tags` and we haven't yet placed the username into `s.affectedUsers`, we do so. If a user is affected multiple times, by not adding them to the list multiple times we will avoid repeating identical operations later.

```javascript
            if (inc (tags, tag) && ! inc (s.affectedUsers, username)) s.affectedUsers.push (username);
         });
```

If there are no affected users, we simply pass an empty array to the next function.

```javascript
         if (s.affectedUsers.length === 0) return s.next ([]);
```

We invoke `a.fork` on `s.affectedUsers` and `H.getSharedHashes`, to get the hashes shared with each affected user. This operation, as well as the entire invocation to `H.tagCleanup`, should happen *after* deletion/untagging/unsharing, so that the list of hashes will be updated. However, `sho` and `ids` should contain the information present *before* the operation, since this will indicate us what is the scope of what should be cleaned up.

```javascript
         a.fork (s, s.affectedUsers, function (v) {return [H.getSharedHashes, v]}, {max: 5});
      },
```

We now start another `multi` operation to get each hashtag corresponding to each hash that is no longer accessible to a user. We will place items of the form `[username, hash]` in `s.toRemove`.

```javascript
      function (s) {
         var multi = redis.multi ();
         s.toRemove = [];
```

We iterate the list of shared hashes for each user (available at `s.last`).

```javascript
         dale.go (s.last, function (hashes, k) {
```

We get the corresponding username from `s.affectedUsers`.

```javascript
            var username = s.affectedUsers [k];
```

We iterate all the hashes (each of them corresponding to each id in `ids`); for each hash that is no longer available for this user, we push `[username, hash]` to `s.toRemove` and retrieve all the tags inside `HASHTAG:USERNAME:HASH`.

Now, if the hash is no longer shared with the user, two things could have happen: either the user indeed just lost access to a piv with that hash, or the user could also have an own piv with that hash. If the latter happens, the user will not have a hashtag entry for that tag, nor any of their taghash entries will contain that hash. But if this is the case, then removing the hashtag and taghash entries for that given hash won't make any difference. So we don't bother checking whether the user has an own piv with that hash; the fact that no user shares a piv with that hash is enough for us to perform a cleanup.

If, however, another user was still sharing a piv with the same hash, we would not want to remove the hashtag entry for this hash. It is precisely for this reason that we have to perform the check to see whether the hash is still available to the user.

Something interesting to note: there's no longer any references to the original list of tags passed as argument to the function. For hashtag/taghash purposes, that original list of tags was just a way to determine which users might have been affected by the operation.

```javascript
            dale.go (hashes, function (hash) {
               if (inc (hashes, hash)) return;
               s.toRemove.push ([user, hash]);
               multi.smembers ('hashtag:' + user + ':' + hash);
            });
         });
         mexec (s, multi);
      },
```

We will now start a multi operation to perform removals of hashtags and taghashes. We iterate `s.toRemove` to remove hashtags and taghashes.

```javascript
      function (s) {
         var multi = redis.multi ();
         dale.go (s.toRemove, function (toRemove, k) {
```

For each `toRemove` entry, we remove outright the `hashtag:USERNAME:HASH` entry; we then iterate the k-th element of `s.last`, each of which will be a tag that was inside the hashtag. Then, for each of `taghash:USERNAME:TAG`, we remove the hash.

```javascript
            multi.del ('hashtag:' + toRemove [0] + ':' + toRemove [1]);
            dale.go (s.last [k], function (tag) {
               multi.srem ('taghash:' + toRemove [0] + ':' + tag, toRemove [1]);
            });
         });
```

Now, for a further check. It might be the case that, for one or more users, the loss of access to one or more pivs might have meant that they also lost a tag. Namely, if a user B tagged a shared piv with hash 1 with the tag Y, and has no other piv tagged with tag Y, and then loses access to said piv, then the tag Y should be removed from user B's list of tags. To know whether this is the case, we check whether each user, after all the aforementioned deletions, still has either a taghash entry or a tag entry for each tag previously contained in their hashtag entry. If neither exists, it means that the tag is now lost and should be removed from the user's `tags:USERNAME` set.

So we will iterate the `s.toRemove` entries and make a new set of entries, each of them composed of a username and a tag, and store them in `s.toRemove2`. Not all of these entries may require cleanup, that will be determined by the result of the `exists` calls.

Note we do this within the same multi block, but at the very end of it, to make sure all cleanups happen before.

```javascript
         s.toRemove2 = [];
         dale.go (s.toRemove, function (toRemove, k) {
            dale.go (s.last [k], function (tag) {
               multi.exists ('tag:' + toRemove [0] + ':' + tag, 'taghash:' + toRemove [0] + ':' + tag);
               s.toRemove2.push ([toRemove [0], tag]);
            });
         });
         mexec (s, multi);
      },
```

We will now start another `multi` operation.

```javascript
      function (s) {
         var multi = redis.multi ();
```

We will only iterate the entries that are relevant to us, namely, the `exists` checks, which are at the end of the array of results we just obtained. The first part of the array, which we discarded, belong to the cleanup of hashtag/taghashes.

```javascript
         s.last = s.last.slice (- s.toRemove2.length);
```

We iterate the `s.toRemove2` entries.

```javascript
         dale.go (s.toRemove2, function (toRemove2, k) {
```

If neither a taghash nor a tag entry exists for the given username and tag combination, then we remove the tag from the list of tags for that user.

```javascript
            if (! s.last [k]) multi.srem ('tags:' + toRemove2 [0], toRemove2 [1]);
         });
```

```javascript

This concludes the function.

```javascript
         mexec (s, multi);
      }
   ]);
}
```

TODO: add annotated source code between `H.tagCleanup` and the `POST /tag` endpoint.

We now define the `POST /tag` endpoint. This endpoint will serve for both tagging and untagging operations.

```javascript
   ['post', 'tag', function (rq, rs) {
```

We create a shorthand `b` for the request's body.

```javascript
      var b = rq.body;
```

The body must be of the form `{tag: STRING, ids: [STRING, ...], del: true|false|undefined, autoOrganized: true|false|undefined}`. `ids` should have at least one tag in it. If any of these requirements is not met, a 400 will be returned with the corresponding validation error.

```javascript
      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tag', 'ids', 'del', 'autoOrganize'], 'eachOf', teishi.test.equal],
         ['body.tag', b.tag, 'string'],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
         function () {return ['body.ids length', b.ids.length, {min: 1}, teishi.test.range]},
         ['body.del', b.del, [true, false, undefined], 'oneOf', teishi.test.equal],
         ['body.autoOrganize', b.autoOrganize, [true, false, undefined], 'oneOf', teishi.test.equal],
      ])) return;
```

`b.tag` should be a valid user tag - that is, a string that, after being trimmed, should have length of at least 1 and should *not* start with a lowercase letter followed by two colons. The exceptions are if the tag is either `'o::'` or `'t::'`, which denote that a piv is marked as either Organized or To Organize.

If after trimming it the conditions are not met, we return a 400 error with body `{error: 'tag'}`.

```javascript
      b.tag = H.trim (b.tag);
      if (! H.isUserTag (b.tag) && b.tag !== 'o::') return reply (rs, 400, {error: 'tag'});
```

We check whether there are repeated ids inside `ids`. We do this by creating an object of the form `{ID1: true, ID2: true, ...}`. If this object has less keys than the length of `ids`, it means there are repeated keys. If that's the case, we return a 400 error with body `{error: 'repeated'}`.

```javascript
      var seen = dale.obj (b.ids, function (id) {return [id, true]});
      if (dale.keys (seen).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});
```

We start the asynchronous part of the operation, invoking `astop`.

```javascript
      astop (rs, [
```

We first whether the user has access to each of the pivs. To find out, we invoke `H.hasAccess`. If the user has access to a piv (because the piv exists and it's either owned by the user or shared with the user) this function will also return the actual piv in question.

```javascript
         [a.fork, b.ids, function (id) {
            return [H.hasAccess, rq.user.username, id];
         }, {max: 5}],
```

We iterate the results of `H.hasAccess`. If any of them is `false`, we return a 404 error with no body.

```javascript
         function (s) {
            if (dale.stop (s.last, true, function (piv) {return piv === false})) return reply (rs, 404);
```

If we're here, all of the pivs in `ids` exist, and the user has access to all of them. We store the list of pivs in `s.pivs`.

```javascript
            s.pivs = s.last;
```

We iterate `s.pivs` and collect those that are shared with the user (as opposed to being owned by the user) in an array `sharedPivs`. We also store the index of each piv inside itself in the field `k`, since this will be useful to us in a minute.

```javascript
            var sharedPivs = dale.fil (s.pivs, undefined, function (piv, k) {
               piv.k = k;
               if (piv.owner !== rq.user.username) return piv;
            });
```

If all of the pivs are owned by the user, we skip to the next asynchronous function.

```javascript
            if (! sharedPivs.length) return s.next ();
```

If we're here, at least one of the pivs is shared with the user. For each of the `sharedPivs`, we will see if the user owns a piv with the same hash. We do this by performing a lookup on `hash:USERNAME`.

```javascript
            a.seq (s, [
               [Redis, 'hmget', 'hash:' + rq.user.username, dale.go (sharedPivs, function (piv) {return piv.hash})],
```

We iterate `sharedPivs`. If the user doesn't own a piv with the same hash, there's nothing to do for that particular piv.

```javascript
               function (s) {
                  dale.go (sharedPivs, function (piv, k) {
                     if (! s.last [piv.hash]) return;
```

If the user indeed owns a piv with the same hash, we will then perform the tagging/untagging operation on the user's own piv. We replace the fields `id` and `owner` in the piv we obtained earlier, by the id of the piv owned by the user, and the user's username, respectively. Note we don't touch the database entry for piv, just the copy of it we queried in our code.

Any shared pivs that have no equivalent piv owned by the user will remain unchanged.

This concludes the asynchronous detour of `sharedPivs`.

```javascript
                     s.pivs [piv.k].id    = s.last [piv.hash];
                     s.pivs [piv.k].owner = rq.user.username;
                  });
                  s.next ();
               }
            ]);
         },
```

If we're performing an untagging operation, we iterate through `s.pivs` and, for each piv that is owned by the user, we return its list of tags. We also do so for each piv not owned by the user but potentially tagged. While we don't need the list of tags in the case of shared pivs, we have added the call anyway to have one entry per piv, as well as to make the code more illustrative than doing a dummy call `multi.get ('foo')` - the difference in performance should be negligible.

```javascript
         ! b.del ? [] : function (s) {
            var multi = redis.multi ();
            dale.go (s.pivs, function (piv) {
               if (piv.owner === rq.user.username) multi.smembers ('pivt:' + piv.id);
               else                                multi.smembers ('hashtag:' + rq.user.username + ':' + piv.hash);
            });
```

We also get the list of tags shared by the user, since we might also need it in the case of an untagging operation.

```javascript
            multi.smembers ('sho:' + rq.user.username);
            mexec (s, multi);
         },
```

We create another `multi` operation.

```javascript
         function (s) {
            var multi = redis.multi ();
```

If this is an untagging operation, we store the last operation from the last set of operations (the `smembers` call to `sho:USERNAME`) in `s.sho`. We then set up, `s.ids` an array of ids of pivs that are necessary for performing hashtag cleanup and will be passed to `H.tagCleanup` later.

```javascript
            if (b.del) {
               s.sho = teishi.last (s.last);
               s.ids = [];
            }
```

We start iterating the pivs.

```javascript
            dale.go (s.pivs, function (piv, k) {
```

We will first deal with the tagging operation.

```javascript
               if (! b.del) {
```

We add `b.tag` to `tags:USERNAME`. If the tag was already there, this will be a no-op. Note we do this for both pivs owned and not owned by the user.

```javascript
                  multi.sadd ('tags:' + rq.user.username, b.tag);
```

If the piv is not owned by the user, we will add `b.tag` to `hashtag:USERNAME:HASH` and `piv.hash` to `taghash:USERNAME:TAG`. If they were already there, this operation will not change anything.

```javascript
                  if (piv.owner !== rq.user.username) {
                     multi.sadd ('hashtag:' + rq.user.username + ':' + piv.hash, b.tag);
                     multi.sadd ('taghash:' + rq.user.username + ':' + b.tag,    piv.hash);
```

If `b.autoOrganize` is passed, we also mark the piv as organized.

```javascript
                     if (b.autoOrganize) multi.sadd ('hashtag:' + rq.user.username + ':' + piv.hash, 'o::');
                     if (b.autoOrganize) multi.sadd ('taghash:' + rq.user.username + ':' + 'o::',    piv.hash);
                  }
```

If the piv is owned by the user, we add `b.tag` to `pivt:ID`, as well as `piv.id` to `tag:USERNAME:TAG`. If this piv was tagged with this tag already, both will be no-ops.

```javascript
                  else {
                     multi.sadd ('pivt:' + piv.id, b.tag);
                     multi.sadd ('tag:'  + rq.user.username + ':' + b.tag, piv.id);
```

If `b.autoOrganize` is passed, we also mark the piv as organized.

```javascript
                     if (b.autoOrganize) multi.sadd ('pivt:' + piv.id, 'o::');
                     if (b.autoOrganize) multi.sadd ('tag:'  + rq.user.username + ':' + 'o::', piv.id);
```

Finally, we remove the piv's id from `tag:USERNAME:u::`, which is the list of untagged pivs. If the piv already had an user tag, this will be a no-op. Note we don't do this for pivs that are not owned by the user, since they will not be inside the `tag:USERNAME:u::` entry (or in any `tag:USERNAME:...` entry, for that matter).

The exception to this is if `tag` is `'o::'`, in which case we leave `'u::'` if it's on the piv. The reason for this is that marking a piv as organized doesn't count as the tagging of a piv.

```javascript
                     if (b.tag !== 'o::') multi.srem ('tag:'  + rq.user.username + ':u::', piv.id);
                  }
```

This concludes the tagging operation. Notice we didn't need to refer to the list of existing tags for the piv, since if an element was removed that wasn't there or added that already was there before, that will simply amount to a no-op instead of an error or duplication.

We use again a `return` statement to avoid having to write an `else` block for the untagging code.

```javascript
                  return;
               }
```

If we're here, we're dealing with an untagging operation. We check whether the tag is present in the piv; if it's not the case, we don't do anything else for this piv.

```javascript
               if (! inc (s.last [k], b.tag)) return;
```

We define an `autoOrganize` variable, which will be true if `b.autoOrganize` is set, and if there is only one user tag left on the piv. If this is indeed the last tag on the piv and `autoOrganize` is set, we will mark the piv as not organized.

```javascript
               var autoOrganize = b.autoOrganize && dale.fil (s.last [k], undefined, function (v) {if (H.isUserTag (v)) return v}).length === 1;
```


If the piv is not owned by the user, we will remove the tag from the user's hashtag entry for a piv with that hash. Since the user doesn't own a piv with that hash, then we know the user must have a hashtag entry for it. And as we saw above, the list of tags for this piv came from the hashtag entry, not a regular `pivt:USERNAME` entry.

We also remove the hash from the taghash entry for the tag (`taghash:USERNAME:TAG`).

```javascript
               if (piv.owner !== rq.user.username) {
                  multi.srem ('hashtag:' + rq.user.username + ':' + piv.hash, b.tag);
                  multi.srem ('taghash:' + rq.user.username + ':' + b.tag,    piv.hash);
```

We mark the piv as not organized if `autoOrganize` is set.

```javascript
                  if (autoOrganize) multi.srem ('hashtag:' + rq.user.username + ':' + piv.hash, 'o::');
                  if (autoOrganize) multi.srem ('taghash:' + rq.user.username + ':' + 'o::',    piv.hash);
               }
```

If we're here, the user is untagging a piv that belongs to them.

Since that could restrict access to the piv to another user with whom the tag was shared, we push the piv's id to `ids`, which will be passed to `H.tagCleanup` later.

We do not add ids of pivs not owned by the user to the list of ids, since those untaggings cannot remove access by other users to that piv, so it requires no further tag cleanup.

```javascript
               else {
                  s.ids.push (piv.id);
```

We remove the tag from `pivt:ID` and the id from `tag:USERNAME:TAG`.

```javascript
                  multi.srem ('pivt:' + piv.id, b.tag);
                  multi.srem ('tag:'  + rq.user.username + ':' + b.tag, piv.id);
```

We mark the piv as not organized if `autoOrganize` is set.

```javascript
                  if (autoOrganize) multi.srem ('pivt:' + piv.id, 'o::');
                  if (autoOrganize) multi.srem ('tag:'  + rq.user.username + ':' + 'o::', piv.id);
```

If there's only one user tag left on the piv and we're not removing the `'o::'` tag, then we are removing the last user piv from the piv. In that case, we add the piv to the `untagged` set (`tag:USERNAME:u::`.

```javascript
                  if (b.tag !== 'o::' && dale.fil (s.last [k], false, H.isUserTag).length === 1) multi.sadd ('tag:' + rq.user.username + ':u::', piv.id);
               }
```

We're done iterating each of the pivs.

```javascript
            });
```

If the `onboarding` field is set on the user and this is not an untagging nor the `'o::'` tag is involved, we remove the `onboarding` field from the user to stop showing the onboarding - in other words, the `onboarding` flag will be removed once the user tags something.

```javascript
            if (rq.user.onboarding && ! b.del && b.tag !== 'o::') multi.hdel ('users:' + rq.user.username, 'onboarding');
```

 We then execute the operations we just set up.

```javascript
            mexec (s, multi);
         },
```

If this is an untagging operation, we will invoke `H.tagCleanup` passing to it the username and the tag (the tag wrapped in an array), as well as `s.ids` and `s.sho`. `s.ids` will be the list of ids of pivs owned by the user that were untagged (excluding no-ops) and `s.sho` will be the list of tags shared by the user *before* the untagging operation.

```javascript
         ! b.del ? [] : [a.get, H.tagCleanup, rq.user.username, [b.tag], '@ids', '@sho'],
```

We then create a log entry for the user with the `type` set to either `'tag'` or `'untag'`. In all cases, the `ev` is `'tag'`. We also pass `ids` and `tag` and `whom` to the log entry.

Note that, unlike other operations, we create a log entry even if this is a no-op. While it would be possible to quite efficiently figure out whether this was a no-op or not, we believe it would be confusing to the user to see their own log and see that what to them was a tag to N pivs was in fact a tag on N-M pivs (or, if all the pivs were already tagged, the tagging operation wouldn't be marked at all). This, however, is subject to future change.

```javascript
         [H.log, rq.user.username, {ev: 'tag', type: b.del ? 'untag' : 'tag', ids: b.ids, tag: b.tag}],
```

We reply with a 200 code. This concludes the endpoint.

```javascript
         [reply, rs, 200],
      ]);
   }],
```

We now define `GET /tags`. This endpoint will return all the tags set by the user as well as year tags and geotags; it also includes tags shared with the user by other users, each of them in the form `'s::USERNAME:tag'`.

```javascript
   ['get', 'tags', function (rq, rs) {
      astop (rs, [
```

We start by getting all the home tags from the user and setting them in `s.hometags` through `a.set`.

```javascript
         [a.set, 'hometags', [Redis, 'get', 'hometags:' + rq.user.username]],
```

The endpoint needs to get the list of members of `tags:USERNAME`, as well as all the tags shared with the user (located at `shm:USERNAME`).

Interestingly enough, the only reason that this endpoint returns all tags and not only user tags (and consequently, that `tags:USERNAME` stores all tags, not just user tags) is that one of the client responders, `query tags`, needs to have the full list of existing tags, in order to filter out tags that no longer exist after any modifications. If it wasn't for this requirement, we would only store and return user tags on this endpoint, since the rest of the interface *always* filter out the non-user tags from the list of tags.

```javascript
         function (s) {
            var multi = redis.multi ();
            multi.smembers ('tags:' + rq.user.username);
            multi.smembers ('shm:'  + rq.user.username);
            mexec (s, multi);
         },
```

We iterate the list of tags shared with the user; for each of them, we prepend it with `s::` to denote that they are shared tags; we then add them to the list of tags belonging to the user itself.


```javascript
         function (s) {
            dale.go (s.last [1], function (share) {
               s.last [0].push ('s::' + share);
            });
```


We sort the resulting array and put it in the key `tags` of the output object - the sorting is case insensitive. We then set the `hometags` key to either the parsed value of `s.hometags`, or default to an empty array if there were no home tags. This concludes the endpoint.

```javascript
            reply (rs, 200, {tags: s.last [0].sort (function (a, b) {
               return a.toLowerCase ().localeCompare (b.toLowerCase ());
            }), hometags: JSON.parse (s.hometags || '[]')});
         }
      ]);
   }],
```

We define `POST /hometags`, an endpoint that will update the list of home tags for the user.

```javascript
   ['post', 'hometags', function (rq, rs) {
```

The `body` should be an object containing a `homekeys` key, which should be an array of strings.

```javascript
      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['hometags'], 'eachOf', teishi.test.equal],
         ['body.hometags', b.hometags, 'array'],
         ['body.hometags', b.hometags, 'string', 'each']
      ])) return;
```

We define a `multi` key which we'll use to determine whether the tag exists for the user. We will also collect the tags on a `seen` object, to detect duplicate tags in the array.

```javascript
      var multi = redis.multi (), seen = {};
```

We iterate the tags sent by the user. We put entries for them in `seen`; if any tag is not a user tag, we will note the tag and stop the process, returning a 400 error of the form `{error: 'tag', tag: INVALID TAG}`. For every tag, we will also check whether it exists.

```javascript
      var invalidTag = dale.stopNot (b.hometags, undefined, function (hometag) {
         seen [hometag] = true;
         if (! H.isUserTag (hometag)) return hometag;
         multi.exists ('tag:' + rq.user.username + ':' + hometag);
      });
      if (invalidTag) return reply (rs, 400, {error: 'tag', tag: invalidTag});
```

If there's less entries in `seen` than in `b.hometags`, there was at least one repeated tag. We reply with a 400 error.

```javascript
      if (dale.keys (seen).length < b.hometags.length) return reply (rs, 400, {error: 'repeated'});
```

We now check whether each tag exists. After getting them from redis, we iterate the list of results; if any of the tags does not exist, we reply with a 404 error.

```javascript
      astop (rs, [
         [mexec, multi],
         function (s) {
            var missingTag = dale.stopNot (s.last, undefined, function (exists, k) {
               if (! exists) return b.hometags [k];
            });
            if (missingTag) return reply (rs, 404, {tag: missingTag});
```

If we're here, the input is valid. We merely stringify `b.hometags` and store it in `hometags:USERNAME`. We reply with a 200 code. This concludes the responder.

```javascript
            Redis (s, 'set', 'hometags:' + rq.user.username, JSON.stringify (b.hometags));
         },
         [reply, rs, 200]
      ]);
   }],
```

We now define `POST /idsFromHashes`, an endpoint used to match a set of hashes to a set of corresponding piv ids.

```javascript
   ['post', 'idsFromHashes', function (rq, rs) {
```

We create a shorthand `b` for the request's body.

```javascript
      var b = rq.body;
```

The body of the request must have a single key, `hashes`, with an array of strings.

```javascript
      if (stop (rs, [
         ['body.hashes', b.hashes, 'array'],
         ['body.hashes', b.hashes, 'string', 'each'],
      ])) return;
```

If `b.hashes` is empty, we merely return an empty object.

```javascript
      if (b.hashes.length === 0) return reply (rs, 200, {});
```

We get each of the hashes from `hashorig:USERNAME`.

```javascript
      a.seq ([
         [Redis, 'hmget', 'hashorig:' + rq.user.username, b.hashes],
```

We create an object `{HASH: PIVID|null, ...}` and return it.

```javascript
         function (s) {
            reply (rs, 200, dale.obj (s.last, function (v, k) {
               return [b.hashes [k], v];
            }));
         }
```

This concludes the endpoint.

```javascript
      ]);
   }],
```

We now define `POST /query`, the main querying endpoint for the app.

```javascript
   ['post', 'query', function (rq, rs) {
```

We create a shorthand `b` for the request's body.

```javascript
      var b = rq.body;
```

Here are the requirements for the body (taken from the documentation of `POST /query`). If any of these requirements is not met, a 400 will be returned with the corresponding validation error.

1. Body must be of the form:
```
{
   tags: []|[STRING, ...],
   mindate: INT|UNDEFINED,
   maxdate: INT|UNDEFINED,
   sort: newest|oldest|upload,
   from: INT|UNDEFINED,
   fromDate: INT|UNDEFINED,
   to: INT,
   recentlyTagged: [STRING, ...]|UNDEFINED,
   idsOnly: BOOLEAN|UNDEFINED,
   timeHeader: BOOLEAN|UNDEFINED,
   refresh: BOOLEAN|UNDEFINED,
   updateLimit: INT|UNDEFINED
}
```
2. `body.from` and `body.to` must be positive integers, and `body.to` must be equal or larger to `body.from`. For a given query, they provide pagination capability. Both are indexes (starting at 1) that specify the first and the last piv to be returned from a certain query. If both are equal to 1, the first piv for the query will be returned. If they are 1 & 10 respectively, the first ten pivs for the query will be returned.
3. If `body.fromDate` is present, `body.from` must be absent. `body.fromDate` should be an integer larger than 1, and will represent a timestamp.
4. If present, `body.updateLimit` must be a positive integer.

```javascript
      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tags', 'mindate', 'maxdate', 'sort', 'from', 'fromDate', 'to', 'recentlyTagged', 'idsOnly', 'timeHeader', 'refresh', 'updateLimit'], 'eachOf', teishi.test.equal],
         ['body.tags',    b.tags, 'array'],
         ['body.tags',    b.tags, 'string', 'each'],
         ['body.mindate', b.mindate,  ['undefined', 'integer'], 'oneOf'],
         ['body.maxdate', b.maxdate,  ['undefined', 'integer'], 'oneOf'],
         ['body.sort',    b.sort, ['newest', 'oldest', 'upload'], 'oneOf', teishi.test.equal],
         ['body.from',    b.from, ['undefined', 'integer'], 'oneOf'],
         ['body.to',      b.to, 'integer'],
         b.from === undefined ? [
            ['body.fromDate', b.fromDate, 'integer'],
            ['body.fromDate', b.fromDate, {min: 1}, teishi.test.range],
            ['body.to',       b.to,       {min: 1}, teishi.test.range]
         ] : [
            ['body.fromDate', b.fromDate, 'undefined'],
            ['body.from', b.from, {min: 1},      teishi.test.range],
            ['body.to',   b.to,   {min: b.from}, teishi.test.range]
         ],
         ['body.recentlyTagged', b.recentlyTagged, ['undefined', 'array'], 'oneOf'],
         ['body.recentlyTagged', b.recentlyTagged, 'string', 'each'],
         ['body.timeHeader', b.timeHeader, ['undefined', 'boolean'], 'oneOf'],
         ['body.idsOnly', b.idsOnly, ['undefined', 'boolean'], 'oneOf']
         ['body.refresh', b.refresh, ['undefined', 'boolean'], 'oneOf'],
         ['body.updateLimit', b.updateLimit, ['undefined', 'integer'], 'oneOf'],
         b.updateLimit === undefined ? [] : ['body.updateLimit', b.updateLimit, {min: 1}, teishi.test.range],
      ])) return;
```

`a::` cannot be included on `body.tags`. If the user sends this tag, they will get a 400 with body `{error: 'all'}`.

```javascript
      if (inc (b.tags, 'a::')) return reply (rs, 400, {error: 'all'});
```

If `body.recentlyTagged` is present, the `'untagged'` tag must be on the query.

```javascript
      if (b.recentlyTagged && ! inc (b.tags, 'u::')) return reply (rs, 400, {error: 'recentlyTagged'});
```

We check whether there are repeated tags inside `tags`. We do this by creating an object of the form `{TAG1: true, TAG2: true, ...}`. If this object has less keys than the length of `tags`, it means there are repeated keys. If that's the case, we return a 400 error with body `{error: 'repeated'}`.

```javascript
      var seen = dale.obj (b.tags, function (id) {return [id, true]});
      if (dale.keys (seen).length < b.tags.length) return reply (rs, 400, {error: 'repeated'});
```

We define a variable `qid` to serve as a prefix for some temporary keys we will create in the database in the process of querying.

```javascript
      var qid = 'query-' + uuid ();
```

We start the query process, invoking `astop`. We first bring all the tags shared with the user.

```javascript
      astop (rs, [
         [Redis, 'smembers', 'shm:' + rq.user.username],
```

We iterate the tags from the query to find any shared tags (which start with `'s::'`) that are actually not shared with the user. If we find one, we stop the iteration and we return a 403 with body `{tag: TAG}`.

```javascript
            var forbidden = dale.stopNot (b.tags, undefined, function (tag) {
               if (tag.match (/^s::/) && ! inc (s.last, tag.replace ('s::', ''))) return tag;
            });
            if (forbidden) return reply (rs, 403, {tag: forbidden});
```

If we're here, the query is valid.

We will now create a `query` object that contains a curated set of variables that will be necessary to carry out the query. We have decided to write most of the query endpoint as a [Lua script that is executed inside Redis](https://redis.io/docs/manual/programmability/eval-intro/). While it is possible to write the query endpoint by performing some queries on Redis and then processing their results in node, this logic starts to become unacceptably slow for queries involving tens of thousands of pivs. Most of the delays entail bringing the information of those pivs and associated tags.

The query endpoint is the core read operation of the app and is constantly invoked by the clients; for that reason it should be as fast as possible. By writing the query endpoint as a Lua function within Redis, we can do most of the processing in Redis proper, and bring only the necessary information to node.

Lua, however, is a significantly more limited language than Javascript, so pre-processing some information in Javascript can save us considerable code. This is exactly what we're going to do now within the `query` variable.

```javascript
         function (s) {
            var query = {
```

We pass the `username` of the querying user, as well as the entire query.

```javascript
               username: rq.user.username,
               query:    b,
```

We group all the requested geo and date tags into `dateGeoTags`.

```javascript
               dateGeoTags: dale.fil (b.tags, undefined, function (tag) {
                  if (H.isGeoTag (tag) || H.isDateTag (tag)) return tag;
               }),
```

We group all the requested own user tags (rather than user tags that were shared by other users, which are prepended by `'s::'`) into `userTags`. We also include `'u::'` (the tag for untagged pivs) and `'o::'` as well.

```javascript
               userTags: dale.fil (b.tags, undefined, function (tag) {
                  if (inc (['u::', 'o::'], tag) || H.isUserTag (tag)) return tag;
               }),
```

We group all non-shared tags into `ownTagsPre`, which will contain all the tags in the query that are not tags shared with the user, and which will be prepended with `'tag:USERNAME:'`. These can be directly used in calls to Redis without processing in Lua. Note we also avoid passing `'t::'`, since that's only a pseudo-tag to mark pivs that are not organized, and for which the query script will search by finding the *negation* of those pivs that have the tag `'o::'`.

```javascript
               ownTagsPre:    dale.fil (b.tags, undefined, function (tag) {
                  if (! tag.match (/^s::/) && tag !== 't::') return 'tag:' + rq.user.username + ':' + tag;
               }),
```

We build an object `sharedTags` of the form `{SHAREDTAG1: true, ...}`, for easy lookup of whether a shared tag is shared with the user. Note we build it from `s.last`, which is the result from the call we did earlier to read all the tags shared with the user.

```javascript
               sharedTags:    dale.obj (s.last, function (v)   {return [v, true]}),
```

We build an array `sharedTagsPre`, which will contain all the tags shared with the user, prepended with the prefix `'tag:'`. These can be directly used in calls to Redis without processing in Lua.

```javascript
               sharedTagsPre: dale.go  (s.last, function (tag) {return 'tag:' + tag}),
```

We add a (for now) empty object `relevantUsers` that will group information from users that shared one or more tags with the user and which are relevant to the current query. We will populate this object in a moment.

```javascript
               relevantUsers: {},
```

We set a flag `untagged` to indicate whether we want to query untagged pivs. This is very useful because if that's the case, then no shared pivs will be matched by the query (since shares are only done through tags).

```javascript
               untagged: inc (b.tags, 'u::')
```

Finally, we set a property `toOrganize`, which will be `true` if `'t::'` is in the list of tags.

```javascript
               toOrganize:    inc (b.tags, 't::')
            };
```

We remove `'t::'` from `b.tags`, since we want the script to avoid interpreting that tag as a user tag on the query.

```javascript
            b.tags = dale.fil (b.tags, 't::', function (v) {return v});
```

We iterate the tags of the query, only looking at shared tags. We only do this if `'u::'` is absent from the list of tags.

```javascript
            if (! query.untagged) dale.go (b.tags, function (tag) {
               if (! tag.match (/^s::/)) return;
```

If this is indeed a shared tag, we remove its prefix (`s::`) and split it by its colons. These tags are of the form `USERNAME:TAGNAME`, so by splitting it by a colon we can access the username of the user that shared the tag with the querying user.

```javascript
               tag = tag.replace ('s::', '').split (':');
```

If there's no entry in `relevantUsers` for the user sharing this tag, we initialize it to an empty array.

```javascript
               if (! query.relevantUsers [tag [0]]) query.relevantUsers [tag [0]] = [];
```

We push the tag, prepended with `tag:` and including username, into the entry for this user inside `relevantUsers`.

```javascript
               query.relevantUsers [tag [0]].push ('tag:' + tag.join (':'));
            });
```

If there were any shared tags requested on the query, then `relevantUsers` will look like this: `{USER1: ['tag:USER1:TAG1', ...], ...}`.

Now, if there were no shared tags requested in the query, the relevant users are *all* of the users that shared tags with the querying user. So we iterate `s.last` (which is the list of all the tags shared with the querying user) and do the same operation. The only difference is that we don't remove the `s::` prefix since the tags brought from the database don't contain it. We only do this if `'u::'` is absent from the list of tags.

```javascript
            if (! query.untagged && ! dale.keys (query.relevantUsers).length) dale.go (s.last, function (tag) {
               tag = tag.split (':');
               if (! query.relevantUsers [tag [0]]) query.relevantUsers [tag [0]] = [];
               query.relevantUsers [tag [0]].push ('tag:' + tag.join (':'));
            });
```

We now define a `multi` operation. We will set the current time in `s.startLua` for performance tracking purposes. We then set the stringified query in the key `qid`.

```javascript
            var multi = redis.multi ();
            s.startLua = Date.now ();
            multi.set (qid, JSON.stringify (query));
```

We will now start defining the Lua script! Or rather, we should say we will start now to *annotate* it. The script is actually defined earlier in `server.js`, before defining the routes, so the Lua script can be preloaded. We annotate the script here, since its natural context is the `POST /query` endpoint.

While we'd like to only load the script if we're on the master process of Node, to avoid all the worker processes also loading it N times (where N is the number of workers), this would mean that the master process would have to communicate to all the worker processes what is the `sha` of the script. This complicates things, so we will instead load the script once per process.

```javascript
redis.script ('load', [
```

We start by pushing entries into `QID-perf`, to track the performance of the different parts of the script.

```javascript
   'redis.call ("rpush", KEYS [1] .. "-perf", "init", unpack (redis.call ("time")));',
```

Before we start with the script proper, it's useful to understand what information we are trying to get. If the `idsOnly` flag is passed, we only want a list of all the piv ids that match the query. If the flag is not passed, then we want three things: `total` (the number of pivs matched by the query), `tags` (the tags for all of the matched pivs, except for those tags in shared pivs to which the querying user has no access); and `pivs`, an array of objects, each with all the piv information, of the requested subset of pivs that match the query.

The script will be invoked after we have stored the `query` object constructed above in the key `qid` - this key will be passed to the script as its only argument (accessible at `KEYS [1]`).

We start by decoding this object into a local `query` variable.

You might have noticed that we are writing the Lua script in Javascript proper, as a list of concatenated lines. This is not a pretty sight, but it allows us to have the Lua script next to the rest of the code for this endpoint.

```javascript
   'local query = cjson.decode (redis.call ("get", KEYS [1]));\n' +
```

We start by getting all the pivs that match the requested tags, without regard to the other parameters in the query.

We have two main cases: one for when we get no tags in the query (which means we want all the pivs to which the querying user has access), and another one for when we have one or more tags on the query.

If there are no tags on the query, we will compute the union of all the user's pivs (which are at `tag:USERNAME:a::`) plus that of all tags shared with the user. We will store this list of ids in `QID-ids`, a temporary key in Redis. Note we use the `sharedTagsPre`, which is a list of shared tags as they appear in Redis; note as well we use the `unpack` Lua function to take all the shared tags and place them as arguments in place to `redis.call`.

```javascript
   'if #query.query.tags == 0 then',
   '   redis.call ("sunionstore", KEYS [1] .. "-ids", "tag:" .. query.username .. ":a::", unpack (query.sharedTagsPre));',
```

If there are one or more tags in the query, we first start by collecting all the relevant pivs owned by the user into `QID-ids`. Just as we did above, we leverage the array prepared in Javascript and pass it to the `unpack` operator. Notice that in this case we are doing an *intersection* (rather than an union) of all the tags, since the piv must be tagged with all of these tags to be considered a matching piv.

If there are no own tags on the query, we don't perform the call, since `SINTERSTORE` requires one or more arguments for the keys that should be intersected.

```javascript
   'else',
   '   if #query.ownTagsPre > 0 then',
   '      redis.call ("sinterstore", KEYS [1] .. "-ids", unpack (query.ownTagsPre));',
   '   end',
```

Now for the interesting part: getting the pivs from shared tags that are relevant to the query. Easily half of the code on this script deals with shared pivs. If the query contains the `untagged` tag (`'u::'`), we can skip this.

```javascript
   '   if not query.untagged then',
```

We start iterating the list of relevant users - the keys will be the usernames, while the values will be a list of tags of the form `tag:USERNAME:TAG`.

```javascript
  '      for k, v in ipairs (query.relevantUsers) do',
```

We create entries of the form `QID-ids-USERNAME`, each of them having a list of ids of pivs owned by `USERNAME` that are relevant to the current query. We start with the shared tags in the query, if there are any. If there are none, the tags will be all the tags shared by `USERNAME` with the querying user.

Interestingly enough, by using the information in `relevantUsers`, we implicitly are executing the query on the required shared tags, if any. For that reason, we didn't need to pass a separate array of shared tags from Javascript to Lua.

```javascript
   '         redis.call ("sinterstore", KEYS [1] .. "-ids-" .. k, redis.call ("sinter", unpack (v)));',
```

If there are date or geotags on the query, we intersect the corresponding tag from this user into the `QID-ids-USERNAME` list. For example, if `'d::2021'` is on the query, then we will only get the pivs with that tag that belong to this user and that are shared with the querying user.

```javascript
   '         for k2, v2 in ipairs (query.dateGeoTags) do',
   '            redis.call ("sinterstore", KEYS [1] .. "-ids-" .. k, KEYS [1] .. "-ids-" .. k, "tag:" .. k .. ":" .. v2);',
   '         end',
```

If `query.toOrganize` is set, we want to remove from `QID-sharedIds` those shared pivs that have the `'o::'` tag in them. This is the only instance in which we perform a `NOT` logical operation on the query, since we don't store the tag `'t::'` and instead want to dynamically compute it as the complement of those pivs that have the `'o::'` tag.

We start by iterating all the `sharedIds`.

```javascript
   '      if query.toOrganize then',
   '         for k, v in ipairs (redis.call ("smembers", KEYS [1] .. "-sharedIds")) do',
```

If `'o::'` is in `hashtag:USERNAME:HASH` (where `HASH` is the hash of the piv), then we remove this id from `QID-sharedIds`. This concludes the removal of organized pivs from `QID-sharedIds`. Later we will remove the own organized pivs from the `QID-ids`.

```javascript
   '            if redis.call ("sismember", "hashtag:" .. query.username .. ":" .. redis.call ("hget", "piv:" .. v, "hash"), "o::") then',
   '               redis.call ("srem", KEYS [1] .. "-sharedIds", v);',
   '            end',
   '         end',
   '      end',
```

We now store the resulting ids by user in a new set `QID-sharedIds`. We then delete the key that stores the matching ids for this particular user (`QID-ids-USERNAME`).

```javascript
   '         redis.call ("sunionstore", KEYS [1] .. "-sharedIds", KEYS [1] .. "-sharedIds", KEYS [1] .. "-ids-" .. k);',
   '         redis.call ("del", KEYS [1] .. "-hashids", KEYS [1] .. "-hashes");',
   '      end',
```

no shared piv can be untagged.
for own tags on shared pivs: get the taghashes, that gives you list of hashes. from each hash, get all ids. sinter on the united masks. more tags can be done in the same way, but on the previous result.

If there are user tags present in the query, we need to get those relevant shared pivs that have them. The tagging of a piv that's shared with the user (rather than owed by the user themselves) is quite tricky and explained in the section about hashtags/taghashes. Essentially, when a user tags a shared piv, they tag the *hash* of that piv, since if there are multiple pivs shared with the user that have the same hash, they will look the same to the user, so for the user the natural thing is that the tag to be applied to any and all instances of "that piv".

In practice, this means we need to first get a list of hashes from the taghashes (which are reverse taghashes); from the hashes, we construct a list of ids (which we get from hashids, which we have put in place only for this reason); from the resulting list of ids, we can finally perform further operations. The yield of this section will be the list of all shared pivs that have the user tags present in the query.

We put a conditional here, since if there are no user tags, the intersection we'll do at the end would remove all id entries we've seen so far - it is one thing that the set of shared pivs with user tags is zero if there were user tags on the query, vs. if there were not. In the last case, we still want the other pivs that match the query, whereas in the first one the result should indeed be an empty set.

```javascript
   '      if #query.userTags > 0 then',
```

We add all the hashes in each taghash entry into a set `QID-hashes`. If there are no taghash ids for a tag, we don't add anything to `QID-hashes` since this would generate a Redis error.

```javascript
   '         for k, v in ipairs (query.userTags) do',
   '            if redis.call ("scard", "taghash:" .. query.username .. ":" .. v) > 0 then',
   '               redis.call ("sadd", KEYS [1] .. "-hashes", unpack (redis.call ("smembers", "taghash:" .. query.username .. ":" .. v)));',
   '            end',
   '         end',
```

We iterate the items in `QID-hashes` to get all its corresponding ids (that is, *all* the pivs, belonging to any user, which have one of these hashes). We add the resulting ids into a set `QID-hashids`.

```javascript
   '         for k, v in ipairs (redis.call ("smembers", KEYS [1] .. "-hashes")) do',
   '            redis.sadd (KEYS [1] .. "-hashids", unpack (redis.smembers ("hashid:" .. v)));',
   '         end',
```

We now intersect the list of ids we obtained from taghashes and hashids with the existing list of shared ids. This does two things: first, it ensures that the remaining ids are of shared pivs to which the querying user has access (since we already put them on `QID-sharedIds`). Second, it removes those ids from `QID-sharedIds` that don't have all the requested user tags.

If `QID-ids` was empty, then there are no pivs shared with the querying user, so we lose no information.

```javascript
   '         redis.call ("sinterstore", KEYS [1] .. "-sharedIds", KEYS [1] .. "-sharedIds", KEYS [1] .. "-hashids");',
```

We delete the `QID-hashids` and `QID-hashes` keys and close the conditional that deals with user tags.

```javascript
   '         redis.del (KEYS [1] .. "-hashids", KEYS [1] .. "-hashes");',
   '      end',
```

We join all the shared ids onto `QID-ids` and then delete `QID-sharedIds`.

```javascript
   '      redis.call ("sunionstore", KEYS [1] .. "-ids", KEYS [1] .. "-ids", KEYS [1] .. "-sharedIds");',
   '      redis.call ("del", KEYS [1] .. "-sharedIds");',
```

We close the case in which we look for shared pivs.

```javascript
   '   end',
```

We close the conditional where we populate `QID-ids`.

```javascript
   'end',
```

Finally, if `query.toOrganize` is set, we need to remove the own pivs from `QID-ids` that are organized. Earlier we removed the organized pivs that were shared with the querying user.

```javascript
   'if query.toOrganize then',
   '   redis.call ("sdiffstore", KEYS [1] .. "-ids", KEYS [1] .. "-ids", "tag:" .. query.username .. ":o::");',
   'end',
```

We now have a list of all the piv ids that match the tags in the query in the key `QID-ids`. Onwards!

If there are `recentlyTagged` entries in the query, we want to add these ids to the results, whether they match the query or not. This functionality is used by the client when the user is tagging untagged pivs while querying the untagged pivs. If the pivs disappear after being tagged, the user cannot tag them again; by allowing certain ids to be added to the results, we avoid this issue. This is also why the entry is called `recentlyTagged`, by the way.

```javascript
   'if query.query.recentlyTagged and #query.query.recentlyTagged then',
```

We add all the `recentlyTagged` entries onto a set `QID-recent`.

```javascript
   '   redis.call ("sadd", KEYS [1] .. "-recent", unpack (query.query.recentlyTagged));',
```

We now create a list of *all* the pivs to which the user has access: how do we get that list of all the pivs to which the user has access? We do what we did at the beginning, which is to get the union of `tag:USERNAME:a::` plus all the shared tags. We need this set to make sure that any ids on the `recentlyTagged` are indeed accessible to the querying user (otherwise, the querying user could bypass our authorization mechanism).

```javascript
   '   redis.call ("sunionstore", KEYS [1] .. "-all", "tag:" .. query.username .. ":a::", unpack (query.sharedTagsPre));',
```

The next line packs some punch. We intersect `QID-recent` with `QID-all` and add all the remaining items (which should be the ids in `recentlyTagged` to which the querying user has access) to `QID-ids`.

We store this list of `recentlyTagged` ids to which we know the user has access to into `QID-ids`.

```javascript
   '   redis.call ("sadd", KEYS [1] .. "-ids", unpack (redis.call ("sinter", KEYS [1] .. "-recent", KEYS [1] .. "-all")));',
```

We delete the `QID-recent` and `QID-all` keys. This concludes the `recentlyTagged` logic; the entries will now be inside `QID-ids`.

```javascript
   '   redis.call ("del", KEYS [1] .. "-recent", KEYS [1] .. "-all");',
   'end',
```

We bring all the ids in `QID-ids` to a local variable `ids`.

```javascript
   'local ids = redis.call ("smembers", KEYS [1] .. "-ids");',
```

We add an entry labelled `'ids'` to `QID-perf`, since the work done so far got us a list of ids that match the query. Note we also add the result of invoking the `TIME` command on Redis, which will give us the current time in seconds, plus a microseconds (!) offset. We will also invoke `TIME` every time we add a subsequent performance entry.

```javascript
   'redis.call ("rpush", KEYS [1] .. "-perf", "ids", unpack (redis.call ("time")));',
```

We now will add all the ids into a sorted set at key `QID-sort`, which will sort it for us. We start by determining the proper sort field (`dateup` if sort is `upload` and `date` otherwise) and storing it in a variable `sortField`.

```javascript
   'local sortField = query.query.sort == "upload" and "dateup" or "date";',
```

We now iterate the pivi ids; for each piv, we get its date and its `dateup` (uploaded date).

If the date is inside the range requested by the query, and the `dateup` field of the piv is not greater than `query.query.updateLimit` (if `updateLimit` is present), we add it to `QID-sort` with its date (the date being the score of the ZSET entry).

Note that we wrote the conditional in a way that if there is no entry for `mindate` or `maxdate`, we don't exclude the piv if its date is below or above that value - for that reason, if we negate the overall clause and obtain a true value, the date doesn't go past neither of the boundaries, and the id can be included in the set. The same goes for the `updateLimit` condition.

```javascript
   'for k, v in ipairs (ids) ',
   '   local dates = redis.call ("hmget", "piv:" .. v, sortField, "dateup");',
   '   if not ((query.query.mindate and tonumber (dates [1]) < query.query.mindate) or (query.query.maxdate and tonumber (dates [1]) > query.query.maxdate) or (query.query.updateLimit and tonumber (dates [2]) > query.query.updateLimit)) then',
   '      redis.call ("zadd", KEYS [1] .. "-sort", tonumber (dates [1]), v);',
   '   end',
   'end',
```

If one or more pivs in were removed because of the requested date range, we update both the local list `ids` and the Redis key `QID-ids`. We get the list of updated ids from `QID-sort`.

```javascript
   'if #ids > redis.call ("zcard", KEYS [1] .. "-sort") then',
   '   ids = redis.call ("zrange", KEYS [1] .. "-sort", 0, -1);',
   '   redis.call ("del", KEYS [1] .. "-ids");',
   '   if #ids > 0 then redis.call ("sadd", KEYS [1] .. "-ids", unpack (ids)) end',
   'end',
```

We add an entry labelled `'sort'` to `QID-perf`, since the work since the last performance entry was done to sort the pivs using a sorted set.

```javascript
   'redis.call ("rpush", KEYS [1] .. "-perf", "sort", unpack (redis.call ("time")));',
```

We now define a list `output` which we'll use to return data back to Javascript.

```javascript
   'local output = {};',
```

If the `timeHeader` flag is passed, we will initialize `output.timeHeader` to a list.

```javascript
   'if query.query.timeHeader then output ["timeHeader"] = {} end;',
```

We will now have the list of all the piv ids that match the query and respect the requested date range. We will now get the tag information for all of these pivs; if `idsOnly` is set, we don't need to do so (since we only want the piv ids) so we can skip this section.

```javascript
   'if not query.query.idsOnly then',
```

We iterate the piv ids.

```javascript
   '   for k, v in ipairs (ids) do',
```

We get the `hash` and `owner` of the piv and store it in a variable `piv`.

```javascript
   '      local piv = redis.call ("hmget", "piv:" .. v, "hash", "owner");',
```

We will do the same with the tags belonging to the piv.

```javascript
   '      local tags = redis.call ("smembers", "pivt:" .. v);',
```

We will also add the hash of the piv to a set in the key `QID-hashes`. Earlier we created another set at the same key, but we already deleted it, so here we start from scratch collecting the hashes of all the pivs that match the query.

```javascript
   '      redis.call ("sadd", KEYS [1] .. "-hashes", piv [1]);',
```

Now, you may ask: why do we need the hash of the piv? Couldn't we just count the tags on each piv and sum them up? Here's the thing: if two pivs with different ids have the same hash, we want to consider them as one piv! If they look the same to the user, in a very important regard they can be considered the same piv. For that reason, we need to aggregate tags per hash. Here's how it would work:

If two pivs `A` and `B` have the same hash (let's say `H`), and piv `A` has tags `1` and `2`, and piv `B` has tags `1` and `3`, this means that the hash `H` is tagged with `1`, `2` and `3`. We also don't care whether more than one piv with that hash has that tag, all we care about is that at least one of them has that tag.

We will collect the tags belonging to a certain hash in the set `QID-tags-HASH`. If the piv is owned by the querying user, then we add all the tags to the set.

```javascript
   '      if piv [2] == query.username then',
   '         redis.call ("sadd", KEYS [1] .. "-tags-" .. piv [1], unpack (tags));',
```

If the piv is not owned by the querying user, but rather shared by some other user, we first add any tags in `hashtag:USERNAME:HASH` to `QID-tags-HASH`. These will be tags applied by the user to one or more pivs with this particular hash. Note that we only do this if there are tags in `QID-tags-HASH`, otherwise the `sadd` will throw an error if there are no arguments passed to it.

```javascript
   '      else',
   '         local hashtags = redis.call ("smembers", "hashtag:" .. query.username .. ":" .. piv [1]);',
   '         if #hashtags > 0 then redis.call ("sadd", KEYS [1] .. "-tags-" .. piv [1], unpack (hashtags)) end;',
```

Now we need to decide which of the piv's own tags will be seen in the query. We iterate the tags.

```javascript
   '         for k2, v2 in ipairs (tags) do',
```

If the tag is in `sharedTags`, an object we sent from Javascript of the form `{SHAREDTAG1: true, ...}`, then the tag is shared with the user, so we will let tag through.

```javascript
   '            if query.sharedTags [piv [2] .. ":" .. v2] then',
   '               redis.call ("sadd", KEYS [1] .. "-tags-" .. piv [1], piv [2] .. ":" .. v2);',
```

If the tag is a date or geo tag, we also add it to the set.

```javascript
   '            elseif string.sub (v2, 0, 3) == "d::" or string.sub (v2, 0, 3) == "g::" then',
   '               redis.call ("sadd", KEYS [1] .. "-tags-" .. piv [1], v2);',
```

Otherwise, we don't count the tag. We are now done getting the tags for this piv.

```javascript
   '            end',
   '         end',
   '      end',
```

If `query.query.timeHeader` is requested, we need to add (or overwrite) an entry on `output.timeHeader` with the information from this piv.

```javascript
   '      if query.query.timeHeader then',
```

We initialize three local variables: `month`, `year` and `organized`. The latter will be initialized to `t`, which stands for "to organize" (that is, the opposite of "organized". The other two are for holding the year and the month of the piv.

```javascript
   '         local month = "";',
   '         local year = "";',
   '         local organized = "t";',
```

If the piv does not belong to the querying user, then we overwrite `tags` with the tags set at `QID-tags-ID`, since we want to see if this piv is organized or not for the querying user, not for the owner of the piv.

```javascript
   '         if piv [2] ~= query.username then tags = redis.call ("smembers", KEYS [1] .. "-tags-" .. piv [1]) end;',
```

We iterate the tags of the piv:

```javascript
   '         for k, tag in ipairs (tags) do',
```

If we find a year or month tag, we put it in the local variable.

```javascript
   '           if string.sub (tag, 0, 3) == "d::" then',
   '              if #tag == 7 then year = string.sub (tag, 4) else month = string.sub (tag, 5) end',
   '           end',
```

If the tag is `o::`, then the piv is organized. We then overwrite the `organized` variable with `'o'`.

```javascript
   '           if tag == "o::" then organized = "o" end',
   '         end',
```

We construct a key of the form `YEAR:MONTH:o` if the piv is organized, or `YEAR:MONTH:t`, if the piv is not organized. We set that key to `true` in `output.timeHeader. Note that we might be overwriting already said key if it exists, which is perfectly fine. The `timeHeader` only cares if there's an organized piv (and an unorganized piv) on a given month & year combination. Note only that there could be a key for organized pivs and one for not organized pivs on the same month & year combination.

```javascript
   '         output.timeHeader [year .. ":" .. month .. ":" .. organized] = true;',
```

This concludes the computation of the `timeHeader` for this piv.

```javascript
   '      end',
```

We close the external `for` loop - the one that iterated piv ids.

```javascript
   '   end',
```

We add an entry labelled `'hashes'` to `QID-perf`, since the work since the last performance entry was done to get a set of hashes for all matching pivs.

```javascript
   '   redis.call ("rpush", KEYS [1] .. "-perf", "hashes", unpack (redis.call ("time")));',
```

Before we continue with the tags, we can now figure out the total amount of pivs that match the query and set it in `output.total`. As we do with tags, we count the total amount of unique hashes from pivs that match the query, since we don't want to double count pivs that have the same hashes.

```javascript
   '   output.total = redis.call ("scard", KEYS [1] .. "-hashes");',
```

We continue computing the tags. We iterate the hashes.

```javascript
   '   for k, v in ipairs (redis.call ("smembers", KEYS [1] .. "-hashes")) do',
```

We iterate all the tags for the given hash.

```javascript
   '      for k2, v2 in ipairs (redis.call ("smembers", KEYS [1] .. "-tags-" .. v)) do',
```

We create a Redis hash `QID-tags` where each key will be a tag and the value will be the number of hashes (each associated to one or more pivs) that contain the tag. We do this through the `hincrby` command.

```javascript
   '         redis.call ("hincrby", KEYS [1] .. "-tags", v2, 1);',
   '      end',
```

We delete the `QID-tags-HASH` entries since we don't need it anymore.

```javascript
   '     redis.call ("del", KEYS [1] .. "-tags-" .. v);',
   '   end',
```

We add an entry labelled `'usertags'` to `QID-perf`, since the work since the last performance entry was done to compute the amount of pivs per user tag.

```javascript
   '   redis.call ("rpush", KEYS [1] .. "-perf", "usertags", unpack (redis.call ("time")));',
```

We now have to compute the number of all the available pivs to the user (`'a::'`), without double counting pivs that have the same hash. If the query has no tags and we have no minimum or maximum date range specified, *and* `query.toOrganize` is not enabled, we already have this number - it is `output.total`, since the query intends to match all available pivs. In this case, we set it on the proper entry at `QID-tags`.

```javascript
   '   if #query.query.tags == 0 and not query.query.mindate and not query.query.maxdate and not query.toOrganize then',
   '      redis.call ("hset", KEYS [1] .. "-tags", "a::", output.total);',
```

If the query has one or more tags, we cannot use the work we did so far to calculate this number. Instead, we will iterate all the pivs available to the user and add their hashes to a new set at `QID-allHashes`.

```javascript
   '   else',
   '      for k, v in ipairs (redis.call ("sunion", "tag:" .. query.username .. ":a::", unpack (query.sharedTagsPre))) do',
   '         redis.call ("sadd", KEYS [1] .. "-allHashes", redis.call ("hget", "piv:" .. v, "hash"));',
   '      end',
```

We add the entry in `QID-tags` using the cardinality of the `QID-allHashes` set we just created. We then delete the `QID-allHashes` set since we don't need it anymore.

```javascript
   '      redis.call ("hset", KEYS [1] .. "-tags", "a::", redis.call ("scard", KEYS [1] .. "-allHashes"));',
   '      redis.call ("del", KEYS [1] .. "-allHashes");',
   '   end',
```

We need to add an entry that matches all the untagged pivs in the current query. Since no shared pivs can be untagged, we can quickly compute this by intersecting all the ids in `QID-ids` and the set of untagged pivs of the user. Since a user cannot have more than one own piv with the same hash, there's no double counting we need to take care of.

```javascript
   '   redis.call ("hset", KEYS [1] .. "-tags", "u::", #redis.call ("sinter", KEYS [1] .. "-ids", "tag:" .. query.username .. ":u::"));',
```

We need to add entries for `'o::'` and `'t::'`. We start by getting the number of pivs with `'o::'`, since that's a tag - if there are no entries, the number will be 0.

```javascript
   '   local organized = redis.call ("hget", KEYS [1] .. "-tags", "o::") or 0;',
```

We then set an entry for `'o::'` (this will only make a difference if there was there was no entry for it, in which case we'll place a `0`) and an entry for `'t::'` which will be the total pivs of the query minus the organized ones.

```javascript
   '   redis.call ("hmset", KEYS [1] .. "-tags", "o::", organized, "t::", output.total - tonumber (organized));',
```

We add an entry labelled `'systags'` to `QID-perf`, since the work since the last performance entry was done to compute the amount of pivs per "system" tags (`a::`, `u::`, `o::` and `t::`).

```javascript
   '   redis.call ("rpush", KEYS [1] .. "-perf", "systags", unpack (redis.call ("time")));',
```

We read `QID-tags` onto `output.tags` and then delete `QID-tags` since we don't need it anymore.


```javascript
   '   output.tags = redis.call ("hgetall", KEYS [1] .. "-tags");',
   '   redis.call ("del", KEYS [1] .. "-hashes", KEYS [1] .. "-tags");',
```

This concludes the code for calculating the tags.

```javascript
   'end',
```

We will now apply the `fromDate` parameter. This parameter tells us to consider the piv with offset 1 as the one with a date equal to `fromDate`. So, if for example, `fromDate` is `X`, `sort` is newest, and `to` is `1`, we will want all the pivs newest than `X`, as well as one piv that is older or equal than `X`. The `fromDate` functionality enables the client to do a "deep scroll" query, in which we only bring the information above the current date offset, but we don't bring more than a few pivs below the current date offset - and note how this allows the client to not have to know how many pivs are "above" the `fromDate` - the server takes care of this.

```javascript
   'if query.query.fromDate then',
```

We initialize `from` to `1` - if `fromDate` is passed, then `from` has to be `undefined`, as per the validations done in Javascript. By setting it to `1`, we always start bringing pivs from the first one.

The goal of this section is actually to figure out what the actual `to` parameter should be.

```javascript
   '   query.query.from = 1;',
```

We set a variable `fromPiv` which will contain the piv from which we will count the offset.

```javascript
   '   local fromPiv;',
```

In a sorted set, Redis puts the elements with the lowest score first.

If the `sort` field is `oldest`, we want the index of the *last* piv that has a date lesser or equal to `fromDate`. To get that index, we ask Redis to give us all the elements between 0 and `fromDate`. If there are none, we won't modify the `to` parameter. If there are one or more items, we want the *last* one. To get the last element, we can invoke `zrevbyrange`, which returns elements in reverse order. By passing the arguments `LIMIT, 0, 1` we ensure we only get one.

```javascript
   '   if query.query.sort == "oldest" then',
   '      fromPiv = redis.call ("zrevrangebyscore", KEYS [1] .. "-sort", 0, query.query.fromDate,      "LIMIT", 0, 1);',
```

If the sort field is `newest` or `upload`, we want the index of the last piv that is >= than `fromDate`. For that, we get the elements between `fromDate` and infinite (`+inf`), and just get the first element of the resulting list.

```javascript
   '   else',
   '      fromPiv = redis.call ("zrangebyscore",    KEYS [1] .. "-sort", query.query.fromDate, "+inf", "LIMIT", 0, 1);',
```

If there is a piv that fulfills this condition, then we will increment `query.query.to` by the index of that piv in the `QID-sort` array. We get the index of the piv by using either the `zrank` command (if `sort` is `oldest`) or `zrevrank` (if `sort` is `newest` or `upload`); we use the reverse operation for `newest`/`upload` because those queries put the pivs with highest score *first*, which is the opposite of Redis' default ordering of sorted sets.

```javascript
   '   if #fromPiv > 0 then',
   '      query.query.to = query.query.to + redis.call (query.query.sort == "oldest" and "zrank" or "zrevrank", KEYS [1] .. "-sort", fromPiv [1]);',
   '   end',
   'end',
```

If we only want the ids, there's precious little left to do. We can use the `from` and `to` parameters to get the elements out of `QID-sort`. If `sort` is `oldest`, we use the normal command (`zrange`), otherwise we use the reverse one (`zrevrange`). Note we substract 1 from both parameters since they are 1-indexed (that is, they start at 1) whereas Redis is 0-indexed.

We'll store the ids in `output.ids`.

```javascript
   'if query.query.idsOnly then',
   '   output.ids = redis.call (query.query.sort == "oldest" and "zrange" or "zrevrange", KEYS [1] .. "-sort", query.query.from - 1, query.query.to - 1);',
```

If `idsOnly` is not set, we need to get the piv information for the requested amount of pivs. Because of shared pivs, which can have the same hash as other pivs in the query, things are quite less straightforward.

What we want to do is to start getting pivs in the order in which the appear (and respecting the `from` and `to` offsets); if we find a piv that has the same hash as another piv we already got, we either remove the previous piv and add the current one, or ignore the current piv.

Whether to remove the previous piv or ignore the current one boils down to this: own pivs have priority, and if both pivs are shared, that with the lowest username gets priority. This allows us to return as many own pivs as possible (which have operations available that shared pivs don't) and to always return the same pivs, given the same query and pivs on the database.

This is probably the trickiest piece of code of the Lua script, and perhaps only less tricky than the taghash/hashtag cleanup logic in the context of the entire codebase.

We set three variables: `pivCount`, the amount of pivs we already have collected; `index`, which tells us which element to look up next in `QID-sort`; and hashes, a list where each key is a hash and its corresponding value is the id of the piv that has that hash.

```javascript
   '   local pivCount = 0;',
   '   local index    = 0;',
   '   local hashes   = {};',
```

While the amount of pivs is less than what we want (`to - from + 1`):

```javascript
   '   while pivCount < query.query.to - query.query.from + 1 do',
```

We get the id at index `index` from `QID-sort`. As we did above, we use `zrevrange` if we want the pivs with highest date first. And since `from` and `to` are 1-indexed but Redis is 0-indexed, we need to substract 1 from both.

```javascript
   '      local id = redis.call (query.query.sort == "oldest" and "zrange" or "zrevrange", KEYS [1] .. "-sort", query.query.from - 1 + index, query.query.from - 1 + index) [1];',
```

If there are no more pivs, we stop the loop. This can happen if there are less pivs to be returned than what the parameters require.

```javascript
   '      if not id then break end',
```

We increment `index` for when the next iteration happens.

```javascript
   '      index = index + 1',
```

We get the piv with id `id`; more specifically, we only get its hash, owner and date (or dateup, depending on `sortField`), and store it in a variable `piv`.

```javascript
   '      local piv = redis.call ("hmget", "piv:" .. id, "hash", "owner", sortField);',
```

If we haven't seen the hash of this piv, then we start by setting `hashes.HASH` to the `id`.

```javascript
   '      if not hashes [piv [1]] then',
   '         hashes [piv [1]] = id;',
```

We add the piv to a new sorted set at key `QID-sortFiltered`. This sorted set will only contain the ids that we select to be sent to the user.

```javascript
   '         redis.call ("zadd", KEYS [1] .. "-sortFiltered", piv [3], id);',
```

We increment `pivCount`, since we now have another piv ready to be sent to the user.

```javascript
   '         pivCount = pivCount + 1;',
```

Now for the interesting case! If we already have a piv with this hash in `QID-sortFiltered`, we need to decide whether this piv should have priority, or if instead the previous piv should remain - remember we cannot allow both in the list of pivs to be sent to the user since both have the same hash.

```javascript
   '      else',
```

If the current piv is owned by the user, then this piv should stay and the previous piv with this hash should be removed; the same will happen if the username of whoever owns this piv is alphabetically lower than the owner of the other piv.

```javascript
   '         if piv [2] == query.username or piv [2] < redis.call ("hget", "piv:" .. hashes [piv [1]], "owner") then',
```

We update `hashes.HASH` to the new `id`.

```javascript
   '            hashes [piv [1]] = id;',
```

We remove the other piv with the same hash from `QID-sortFiltered` and add the curent one.

Notice we haven't incremented `pivCount`, since we have the same amount of pivs in `sortFiltered`.

```javascript
   '            redis.call ("zrem", KEYS [1] .. "-sortFiltered", hashes [piv [1]]);',
   '            redis.call ("zadd", KEYS [1] .. "-sortFiltered", piv [3], id);',
```

If the piv has the same hash as the previous one, but it neither belongs to the querying user nor it belongs to a user with a username lower than the other owner's username, we don't do anything.

We can now close both conditionals and the `while` loop.

```javascript
   '         end',
   '      end',
   '   end',
```

We now have all the pivs we want to return to the user inside the sorted set `QID-sortFiltered`. We will now set `output.pivs` to an empty list, to which we'll append the pivs.

```javascript
   '   output.pivs = {};',
```

We iterate all the pivs in `QID-sortFiltered`. Note we use `zrevrange` for `sort` being `'newest'` or `'upload'`, since in those cases we want the items with highest score (date) first.

```javascript
   '   for k, v in ipairs (redis.call (query.query.sort == "oldest" and "zrange" or "zrevrange", KEYS [1] .. "-sortFiltered", 0, -1)) do',
```

We get all the info from the piv and store it in a variable `piv`.

```javascript
   '      local piv = redis.call ("hgetall", "piv:" .. v);',
```

We append a string `tags` to `piv`. Lua doesn't distinguish objects from arrays - it has only one complex data structure, [tables](https://www.lua.org/pil/3.6.html). This means that we need to first add a key and then a value, rather than writing `piv.tags = ...`.

```javascript
   '      table.insert (piv, "tags");',
```

If the piv is owned by the querying user, we should put all the piv's tags onto `piv.tags`.

```javascript
   '      local owner = redis.call ("hget", "piv:" .. v, "owner");',
   '      if owner == query.username then',
   '         table.insert (piv, redis.call ("smembers", "pivt:" .. v));',
```

If the piv is not owned by the querying user, but rather shared with them, then we should only let through a few tags, namely: tags shared with the querying user, or date and geo tags. We create a variable for holding the tags for this piv.

```javascript
   '      else',
   '         local tags = {};',
```

We iterate the tags on the piv.

```javascript
   '         for k2, v2 in ipairs (redis.call ("smembers", "pivt:" .. v)) do',
```

We use `query.sharedTags` to see if the tag is shared with the querying user. If it is, we add it to `tags`.

```javascript
   '            if query.sharedTags [owner .. ":" .. v2] then',
   '               table.insert (tags, owner .. ":" .. v2);',
```

If the tag starts with `'d::'` or `'g::'`, it is a date or geo tag, and we also add it to `tags`.

```javascript
   '            elseif string.sub (v2, 0, 3) == "d::" or string.sub (v2, 0, 3) == "g::" then',
   '               table.insert (tags, v2);',
```

We close all the conditionals and insert the list of tags into `piv`. We then close the `for` loop that iterate tags.

```javascript
   '            end',
   '         end',
   '         table.insert (piv, tags);',
   '      end',
```

We insert `piv` onto `output.pivs` and close the `for` loop that iterates pivs.

```javascript
   '      table.insert (output.pivs, piv);',
   '   end',
```

We close the conditional branch that picks the pivs to be sent to the user. We are almost done!

```javascript
   'end',
```

We add an entry labelled `'pivs'` to `QID-perf`, since the work since the last performance entry was done to select collect a list of pivs (with the exception of the `idsOnly` case, in which case we'll have compiled instead a list of ids).

We get `QID-perf` in its entirety and store it in `output.perf`.

```javascript
   'redis.call ("rpush", KEYS [1] .. "-perf", "pivs", unpack (redis.call ("time")));',
   'output.perf = redis.call ("lrange", KEYS [1] .. "-perf", 0, -1);',
```

We do all the remaining cleanup, by deleting `QID-ids`, `QID-sort`, `QID-sortFiltered`, `QID-tags` and `QID-perf`. `QID-sortFiltered` won't be set if `idsOnly` is passed, but in this case that deletion will be a no-op.

```javascript
   'redis.call ("del", KEYS [1], KEYS [1] .. "-ids", KEYS [1] .. "-sort", KEYS [1] .. "-sortFiltered", KEYS [1] .. "-tags", KEYS [1] .. "-perf");',
```

`output` will be now ready; in the case of `idsOnly`, it will contain only a key `ids` with a list of values. Otherwise, it will contain three keys: `total`, `tags` and `pivs`.

We stringify `output` through `cjson.encode` and return it. This concludes the Lua script!

```javascript
   'return cjson.encode (output);'
```

We concatenate the script lines into a single string, with each line separated by a newline (`\n`) character. If we get an error when we load the script, we notify it. Otherwise, we set the `sha` of the script (which is the script id) to `H.query`.

```javascript
].join ('\n'), function (error, sha) {
   if (error) return notify (a.creat (), {priority: 'critical', type: 'Redis script loading error', error: error});
   H.query = sha;
});
```

And with that, we're back on the `POST /query` endpoint and ready to invoke the script. Which we do, passing `1` (the number of keys) as an argument, as well as `qid` proper.

```javascript
            multi.evalsha (H.query, 1, qid);
```

Now, it is squarely unorthodox to write a Redis script that reads and writes keys that are not directly passed as arguments. Normally, these keys have to be passed, one by one, to the script. This restriction is absolutely impossible to work with in this case, where we don't even know some of the keys that we might have to access (for example, which `piv:ID` keys should we access?).

However, taking a look at this [Redis issue](https://github.com/redis/redis/issues/10296), it seems that the possible issues shouldn't affect us: we're not dynamically creating a script every time with `EVAL`, so we should have no issues with script cache growth. We also don't use (nor plan to use) Redis Cluster nor ACL, so this shouldn't generate issues.

Our future plans to create a consistent partitioned Redis architecture will, however, have to take this script into account - and viceversa. For now, we proceed.

One final note: while the script reads all sorts of keys, it only writes keys with a certain prefix (starting with `qid`).

```javascript
            mexec (s, multi);
```

The output of the script will be in `s.last [1]` (since we used the same `multi` operation to set `qid`). We'll place it in the variable `output`.

```javascript
         function (s) {
            var output = JSON.parse (s.last [1]);
```

We will now process `output.perf` to construct an object of the shape `{LABEL1: INT, ...}`, where each performance segment gets a number in milliseconds that represents its execution time. We will store the result in a variable `perf`. We start initializing it to `{total: INT}`, using as value the current time minus `s.startLua`, which was the time at which the Lua script started executing.

```javascript
            var lastTimeEntry = s.startLua;
            var perf = dale.obj (output.perf, {total: Date.now () - s.startLua}, function (v, k) {
```

`output.perf` is a list of the shape `[LABEL, SECONDS, MICROSECONDS, ...]`. We need to see every third entry, and then retrieve the associated seconds & milliseconds values. This conditional will avoid us processing any entry that's not a label.

```javascript
               if (k % 3 !== 0) return;
```

We compute the `date` for the label, getting the seconds entry (the one after the label) and concatenating it with the first three digits of the microseconds entry.

```javascript
               var date = parseInt (output.perf [k + 1] + output.perf [k + 2].slice (0, 3));
```

We compute the time difference between the current date and the `lastTimeEntry`. We then update `lastTimeEntry` to this date.

```javascript
               var total = date - lastTimeEntry;
               lastTimeEntry = date;
```

We return the label as key, plus the `total` processing time as a value. This concludes the iteration to construct `perf`.

```javascript
               return [v, total];
            });
```

If `b.idsOnly` is set, we merely reply with `output.ids`; however, if `output.ids` is empty, it will be an object rather than an array (because Lua will have sent it as an empty list, which Javascript will interpret as an empty object, in which case, we reply with an empty array rather than an empty object.

```javascript
            if (b.idsOnly) return reply (rs, 200, teishi.eq (output.ids, {}) ? [] : output.ids);
```

If we're here, we'll have to return `total`, `tags` and `pivs`.

We now have to do some work to shape the outputs of the Lua script into the exact shape that we want to send back to the client. We don't do this in Lua because some things simply take more code to be done in Lua.

We transform `output.tags` from an array of the form `[KEY1, VALUE1, KEY2, VALUE2, ...]` into `{KEY1: VALUE1, KEY2: VALUE2, ...}`. We also convert the values into integers, since they come back as strings.

```javascript
            output.tags = dale.obj (output.tags, function (v, k) {
               if (k % 2 === 0) return [v, parseInt (output.tags [k + 1])];
            });
```

We do the same thing for each of the pivs in `output.pivs`; `output.pivs` has the shape `[ID1, PIV1, ID2, PIV2, ...]`. Note that `PIV1` and such come back as objects, so we only have to manipulate `output.pivs` at its highest level.

```javascript
            output.pivs = dale.go (output.pivs, function (piv) {
               return dale.obj (piv, function (v, k) {
                  if (k % 2 === 0) return [v, piv [k + 1]];
               });
            });
```

We now iterate the pivs to apply some modifications to them.

```javascript
            output.pivs = dale.go (output.pivs, function (piv) {
```

If the `piv.vid` field is set, this piv is a video. In this case, we set a variable `vid` to `true`.

```javascript
               var vid = piv.vid ? true : undefined;
```

If `vid` is set, it can either be four things: 1) if the video is an mp4, it is merely a `1`, to indicate that the piv is a video; 2) if it is a non-mp4 video and its mp4 version has been finished already, it will be the id of the mp4 version; 3) if it's a string starting with `'pending'`, it means that the mp4 conversion is still taking place; 4) if it's a string starting with `'error'`, it means the mp4 conversion finished in an error.

If we are in cases #3 or #4, we set `vid` to either `'pending'` or `'error'`.

```javascript
               if (piv.vid && piv.vid.match ('pending')) vid = 'pending';
               if (piv.vid && piv.vid.match ('error'))   vid = 'error';
```

We now construct a new piv object, using only the fields that we need.

```javascript
               return {
```

We put the fields `id`, `name` and `owner` as they appear.

```javascript
                  id:      piv.id,
                  name:    piv.name,
                  owner:   piv.owner,
```

We sort the `tags` array and then put it.

```javascript
                  tags:    piv.tags.sort (),
```

We convert the following fields to integer and then place them: `date`, `dateup`, `dimh`, `dimw`.

```javascript
                  date:    parseInt (piv.date),
                  dateup:  parseInt (piv.dateup),
                  dimh:    parseInt (piv.dimh),
                  dimw:    parseInt (piv.dimw),
```

We put the `vid` field using the value of `vid`. It can only have one of the following values: `true`, `'pending'` or `'error'`.

```javascript
                  vid:     vid,
```

If `vid` is not set, `deg` will be either be `piv.deg` converted to an integer, or `undefined`.

```javascript
                  deg:     vid ? undefined : (parseInt (piv.deg) || undefined),
```

If `piv.loc` exists, we will parse it into an array of the shape `[LAT, LON]` and place it in the object.

```javascript
                  loc:     piv.loc ? teishi.parse (piv.loc) : undefined,
```

The following fields are only put in the test environment: `thumbS`, `thumbM`, `dates`, `dateSource`, `format`.

```javascript
                  thumbS:     ! ENV ? piv.thumbS             : undefined,
                  thumbM:     ! ENV ? piv.thumbM             : undefined,
                  dates:      ! ENV ? JSON.parse (piv.dates) : undefined,
                  dateSource: ! ENV ? piv.dateSource         : undefined,
                  format:     ! ENV ? piv.format             : undefined
```

This concludes the data manipulation on `output.pivs`.

```javascript
               };
            });
```

We reply with an object of the shape `{total: INT, tags: {...}, pivs: [{...}, ...], refreshQuery: TRUE|UNDEFINED, perf: {...}}`. This concludes the endpoint.

Note: the `refreshQuery` parameter will be soon removed.

The `timeHeader` key will be added only if `b.timeHeader` is set. For setting this object, we use the information brought to us from the Lua query. The only processing we do is that if, for a given month, there's both organized and unorganized pivs, we consider that month to be unorganized (`'t'` takes precedence over `'o'`).

The `perf` object in the output has three fields: `total`, which is the total processing time for the entire request, `node`, which is all the processing of the request minus the time that Lua spent processing, and `lua`, which will be an object with the labels and associated lengths, including `total`, which will be equal to the total execution time of the Lua script.

```javascript
            reply (rs, 200, {
               refreshQuery: s.refreshQuery || undefined,
               total:        output.total,
               tags:         output.tags,
               pivs:         output.pivs,
               timeHeader:   ! b.timeHeader ? undefined : dale.obj (output.timeHeader, function (v, k) {
                  if (k.slice (-1) === 't') return [k.slice (0, -2), false];
                  if (! output.timeHeader [k.replace ('o', 't')]) return [k.slice (0, -2), true];
               }),
               perf:         {total: Date.now () - rs.log.startTime, node: Date.now () - perf.total - rs.log.startTime, lua: perf}
            });
         }
      ]);
   }],
```

We now define `POST /sho` and `POST /shm`. Because of the similarities in the code for both endpoints, we define them within one function. These endpoints handle four operations:

- Share a tag with an user (`sho` & `b.del` set to `false` or `undefined`).
- Accept a tag shared by another user (`shm` & `b.del` set to `false` or `undefined`).
- Unshare a tag with an user (`sho` & `b.del` set to `true`).
- Remove a tag shared by another user (`shm` & `b.del` set to `true`).

```javascript
   ['post', /sho|shm/, function (rq, rs) {
```

We define two variables, one to hold the body in `b`, another one to contain the `action` we're performing (`sho` for sharing, `shm` for accepting share).

```javascript
      var b = rq.body, action = rq.url.replace ('/', '');
```


The body should be of the form `{tag: STRING, whom: STRING, del: BOOLEAN|UNDEFINED}`. If any of these requirements is not met, a 400 will be returned with the corresponding validation error.

```javascript
      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tag', 'whom', 'del'], 'eachOf', teishi.test.equal],
         ['body.tag',  b.tag, 'string'],
         ['body.whom', b.whom, 'string'],
         ['body.del', b.del, [true, false, undefined], 'oneOf', teishi.test.equal],
      ])) return;
```

`b.tag` should be a valid user tag - that is, a string that, after being trimmed, should have length of at least 1 and should *not* start with a lowercase letter followed by two colons.

If after trimming it the conditions are not met, we return a 400 error with body `{error: 'tag'}`.

```javascript
      b.tag = H.trim (b.tag);
      if (! H.isUserTag (b.tag)) return reply (rs, 400, {error: 'tag'});
```

Note that after this, `b.tag` will be trimmed.

We now check whether `b.whom` matches an email address from an existing user in the system.

```javascript
      astop (rs, [
         [Redis, 'get', 'email:' + b.whom],
```

We now store `b.whom` into `s.email`, and set `b.whom` to `s.last`. This will have the effect of putting the email address of the target user in `s.email`, whereas the user's email will now be in `b.whom`.

```javascript
         [function (s) {
            s.email = b.whom;
            b.whom = s.last;
```

If there's no user entry for the provided email, we return a 404 with body `{error: 'user'}`, since there's no user already signed up with that email.

```javascript
            if (! b.whom) return reply (rs, 404, {error: 'user'});
```

If our silly user is trying to perform a share operation with themselves, we will return a 400 with body `{error: 'self'}`.

```javascript
            if (b.whom === rq.user.username) return reply (rs, 400, {error: 'self'});
            s.next ();
         }],
```

If the user is sharing/unsharing a tag with others, we will check whether `tag:USERNAME:TAG` exists, since that tag should at least have one piv owned by the user. This actually can happen if the user tries to share a tag that they have applied only on pivs shared with them, but not owned by them.

```javascript
         function (s) {
            if (action === 'sho') Redis (s, 'exists',    'tag:' + rq.user.username + ':' + b.tag);
```

If the user is accepting/removing a share from another user, we will check whether that other user indeed shared the tag with them.

```javascript
            if (action === 'shm') Redis (s, 'sismember', 'sho:' + b.whom, rq.user.username + ':' + b.tag);
         },
```

If the user is attempting a share/unshare and has no own pivs with that tag, a 404 error will be returned with body `{error: 'tag'}`.

```javascript
         function (s) {
            if (! s.last && action === 'sho') return reply (rs, 404, {error: 'tag'});
```

If the user is attempting to accept/remove a share that hasn't been provided by the other user, we return a 403 error with no body.

```javascript
            if (! s.last && action === 'shm') return reply (rs, 403);
```

If we're here, we have performed all validations and are ready to perform the operation in question.

If this is a share/unshare operation, we will add/remove the entry `WHOM:TAG` to/from `sho:USERNAME`. If it is an accept/remove share operation, we will add/remove the entry `WHOM:TAG` to/from `shm:USERNAME`.

```javascript
            var multi = redis.multi ();
            multi [b.del ? 'srem' : 'sadd'] (action + ':' + rq.user.username, b.whom + ':' + b.tag);
```

If this is an unshare operation, we will also remove the entry `USERNAME:TAG` from `shm:WHOM`; the unshare operation removes the entry from the `shm` entry of the targeted user. Note this is the only of the four operations that affects the other user's data directly. In the case of a share, the tag still must be accepted by the target user; and accepting or removing a share will not affect the keys of the user sharing the tag.

```javascript
            if (action === 'sho' && b.del) multi.srem ('shm:' + b.whom, rq.user.username + ':' + b.tag);
```

Finally, in the case of an unshare or a remove operation, we get the list of piv ids tagged with the tag, which will be necessary to our invocation of `H.tagCleanup` below. We then execute this set of redis operations.

```javascript
            if (b.del) multi.smembers ('tag:' + (action === 'sho' ? rq.user.username : b.whom) + ':' + b.tag);
            mexec (s, multi);
         },
```

If the adding/removing of the entry `WHOM:TAG` was a no-op (which means that the contents of the DB were not changed since the entry either wasn't there  (in an unshare) or it was there already (in the case of a share)), we simply return a 200 code and do no further work. We are able to determine a no-op since Redis will return the number of items added/removed if a `sadd`/`srem` operation produces a change - in this case, it should be a `'1'`.

```javascript
         function (s) {
            if (! s.last [0]) return reply (rs, 200);
```

```javascript
            s.next ();
         },

If we're here, the operation was successful and it is not a no-op. We move on to the next asynchronous function.

If this is either an unshare or a remove share operation, we invoke `H.tagCleanup`. Note this is done after removing the relevant `sho`/`shm` entries, which is necessary for `H.tagCleanup` to work properly. As arguments to `H.tagCleanup` we pass the tag wrapped in an array, the list of ids of the pivs tagged with the tag. Finally, we create a fake `sho` entry, composed of the name of the user losing access to the given tag (`username` in the case of a remove share, `b.whom` in the case of an unshare). This fake `sho` with one entry will be used for hashtag/taghash cleanup - for more details, please refer to the implementation of `H.tagCleanup`, which describes hashtag/taghash cleanup in detail.

```javascript
         ! b.del ? [] : [
            [Redis, 'smembers', 'tag:' + action === 'sho' ? rq.user.username : b.whom],
            [a.get, H.tagCleanup, rq.user.username, [b.tag], '@last', [(action === 'sho' ? b.whom : rq.user.username) + ':' + b.tag]],
         ],
```

 We define `eventType` to be either `'share'`, `'unshare'`, `'accept'` or `'remove'`.

```javascript
         function (s) {
            var eventType;
            if (action === 'sho') eventType = b.del ? 'unshare' : 'share';
            if (action === 'shm') eventType = b.del ? 'remove'  : 'accept';
```

We create a log entry for the user with the right `eventType` as `type`. In all cases, the `ev` is `'share'`. We also pass `tag` and `whom` to the log entry.

```javascript
            H.log (s, rq.user.username, {ev: 'share', type: eventType, tag: b.tag, whom: b.whom});
         },
```

If this is a share operation and we are not in a local or test environment, we send the share email to the targeted user, using the `sendmail` function. We use the email template `share`, which is available at `config.js`.

```javascript
         ENV && action === 'sho' && ! b.del ? function (s) {
            sendmail (s, {
               to1:     b.whom,
               to2:     s.email,
               subject: CONFIG.etemplates.share.subject,
               message: CONFIG.etemplates.share.message (b.whom, rq.user.username, b.tag)
            });
         },
```

We return a 200 code and close the endpoint.

```javascript
         [reply, rs, 200],
      ]);
   }],
```

We now define `GET /share`. This endpoint will return a list of all the tags shared *by* the user (inside the `sho` key - *sho* stands for *shared with **o**thers*), as well as all the tags shared *with* the user (inside the `shm` key - *shm* stands for *shared with **m**e*).

```javascript
   ['get', 'share', function (rq, rs) {
```

We start by getting the `sho:USERNAME` and `SHM:username`.

```javascript
      var multi = redis.multi ();
      multi.smembers ('sho:' + rq.user.username);
      multi.smembers ('shm:' + rq.user.username);
      astop (rs, [
         [mexec, multi],
```

All that's left is to do some text processing from the obtained outputs. Both `sho` and `shm` entries are of the form `USERNAME:TAG`. We merely split the username from the tag, so that each entry will be of the form `[USERNAME, TAG]`. We return a 200 code with the body `{sho: [...], shm: [...]}`. This concludes the endpoint.

```javascript
         function (s) {
            reply (rs, 200, {
               sho: dale.go (s.last [0], function (v) {
                  return [v.split (':') [0], v.split (':').slice (1).join (':')];
               }),
               shm: dale.go (s.last [1], function (v) {
                  return [v.split (':') [0], v.split (':').slice (1).join (':')];
               })
            });
         }
      ]);
   }],
```

We now define `POST /rename`, the endpoint responsible for renaming a tag.

```javascript
   ['post', 'rename', function (rq, rs) {
```

We create a shorthand `b` for the request's body.

```javascript
      var b = rq.body;
```

The body must be of the form `{from: STRING, to: STRING}`, where `from` is the name of the tag to be renamed, and `to` is the desired name for the tag.

```javascript
      if (stop (rs, [
         ['keys of body', dale.keys (b), ['from', 'to'], 'eachOf', teishi.test.equal],
         ['body.from', b.from, 'string'],
         ['body.to', b.to, 'string'],
      ])) return;
```

We trim the `to` field. If it's not a user tag, we will return a 400 with body `{error: 'tag'}`.

The `from` should be trimmed and a valid user tag - we'll check for this in a minute.

```javascript
      b.to = H.trim (b.to);
      if (! H.isUserTag (b.to)) return reply (rs, 400, {error: 'tag'});
```

We check for the existence of `tag:USERNAME:FROM`, `tag:USERNAME:TO`; also, we get the list of all tags shared by the user, as well as all the user's taghashes.

```javascript
      astop (rs, [
         [function (s) {
            var multi = redis.multi ();
            multi.smembers ('tag:'     + rq.user.username + ':' + b.from);
            multi.exists   ('tag:'     + rq.user.username + ':' + b.to);
            multi.smembers ('sho:'     + rq.user.username);
            multi.smembers ('taghash:' + rq.user.username + ':' + b.from);
            mexec (s, multi);
         }],
```

If the tag `from` doesn't exist for the user, we return a 404 with body `{error: 'tag'}`.

```javascript
         function (s) {
            if (! s.last [0].length) return reply (rs, 404, {error: 'tag'});
```

If the tag `to` already exists for the user, we return a 409 with body `{error: 'exists'}`. This avoids merging an existing tag onto a new tag through a rename operation.

```javascript
            if (s.last [1])          return reply (rs, 409, {error: 'exists'});
```

If the tag is shared with one or more users, we return a 409 with body `{error: 'shared'}`. We do not want shared tags to be renamed because this can cause confusion for users with whom tags are shared.

```javascript
            var tagIsShared = dale.stop (s.last [2], true, function (shared) {
               return b.to === shared.split (':').slice (1).join (':');
            });
            if (tagIsShared) return reply (rs, 409, {error: 'shared'});
```

If we're here, all validations have passed and we are ready to perform the tag renaming.

We rename `tag:USERNAME:FROM` to `tag:USERNAME:TO`.

```javascript
            var multi = redis.multi ();
            multi.rename ('tag:' + rq.user.username + ':' + b.from, 'tag:' + rq.user.username + ':' + b.to);
```

We remove `from` and add `to` to `tags:USERNAME`.

```javascript
            multi.srem ('tags:' + rq.user.username, b.from);
            multi.sadd ('tags:' + rq.user.username, b.to);
```

For each of the pivs that have the `from` tag, we remove the `from` tag and add `to` in each `pivt:ID` entry.

```javascript
            dale.go (s.last [0], function (id) {
               multi.srem ('pivt:' + id, b.from);
               multi.sadd ('pivt:' + id, b.to);
            });
```

If there are taghashes of the form `taghash:USERNAME:FROM`, we rename `taghash:USERNAME:FROM` to `taghash:USERNAME:TO` and iterate the entries inside `taghash:USERNAME:TO` to remove `from` and add `to` to the `hashtag:USERNAME:HASH` entries that contain `from`.

```javascript
            if (s.last [3].length) {
               multi.rename ('taghash:' + rq.user.username + ':' + b.from, 'taghash:' + rq.user.username + ':' + b.to);
               dale.go (s.last [3], function (hash) {
                  multi.srem ('hashtag:' + rq.user.username + ':' + hash, b.from);
                  multi.srem ('hashtag:' + rq.user.username + ':' + hash, b.to);
               });
            }
```

We execute the operations and return a 200 if the operation is successful. This concludes the endpoint.

```javascript
            mexec (s, multi);
         },
         [reply, rs, 200]
      ]);
   }],
```

TODO: add annotated source code from here to the end of the file.

## License

tagaway is written by [Altocode](https://altocode.nl) and released into the public domain.

The geographical information data file at `utils/cities500.txt` comes straight from the [GeoNames geographical database](http://www.geonames.org/), more precisely, [this file](http://download.geonames.org/export/dump/cities500.zip). We're very grateful to the GeoNames team for making this information available.
