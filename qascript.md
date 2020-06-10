#ac;pic QA

- All processes must be executed in the Development Environment.
- Must be initially logged out of the environment.
- Browser must NOT be on "Incognito" Mode.
- Reliable internet connection must be available (WiFi)
- Tests must be conducted in the following browsers (versions TBD):
	- Google Chrome
	- Mozilla Firefox
	- Safari
	- Opera
	- Internet Explorer
	- Miscrosoft Edge
- Tests on slower connections TBD
- Tester must have access to Development Environment admin and altocode's email. 


##Invite process
	- On log in view, click on "Don't have an account? Request an invite."
	- Browser prompt "Send us your email and we'll send you an invite link to create your account! We will *only* use your email to send you an invite."
	- Insert an invalid address, such as 'test','test@' or 'test@test'
		- Red snackbar with "Please enter a valid email address." should appear. 
	- Insert valid email address (tester must have access to the corresponding inbox to conduct the rest of the test).
	- Once entered, a green snackbar with "We received your request successfully, hang tight!" should appear.
	- Email should arrive to info@altocode.nl with subject "Request for ac;pic invite" and email of requester.
	- In DEV admin, create invite for the entered email address. 
	- Invite should arrive to entered email address. 
	- Click on email link "Please click on this link to create your account.", should be directed to "Sign Up" view. 

##Sign Up
	- Upon clicking on "Please click on this link to create your account." on invite email, the Sign Up view should be accesed.
	- There should be 3 placeholders:
		- Username 
		- Password
		- Repeat password
	- Enter a 2-character username: 
		- Red snackbar of "Please enter a username with 3 or more characters" should appear on clicking "create account".
	- Enter email address on username placeholder: 
		- Red snackbar of "Your username cannot be an email" should appear on clicking "create account". 
	- Enter username that tester knows its being used, like 'admin':
		- Red snackbar of "That username is already in use" should appear. 
	- Test mismatching passwords:
		- Red snackbar of "Repeated password does not match." should appear on clicking "create account":
	- Test passwords with 5 characters or less:
		- Red snackbar of "Please enter a password with six or more characters" on clicking "create account". 
	- Test passwords with special characters '@' '$' '%' '^' '*' '!'
		- Password should be accepted.
	- Account is created:
		- Green snackbar of "Your account has been created." should appear." 
	- On invite-requesting email inbox, the user should receive an "Welcome to ac;pic!" email.  

##Log In
	- Click 'log in' with empty form:
		- Red snackbar of "Please submit valid credentials." should appear on clicking "log in".
	- Insert incorrect username and correct password:
		- Red snackbar of "Please submit valid credentials." should appear on clicking "log in". 
	- Insert correct username and incorrect password:
		- Red snackbar of "Please submit valid credentials." should appear on clicking "log in".
	- Insert correct user and password
	- Should be logged in and redirected to 'empty' View Pictures view.
	- Refresh browser. 
	- User should be logged in. 
	- Close browser tab.
	- Open new tab and go to app. 
	- The user should be logged in. 
	- Close browser (all tabs, both incognito and regular browsing). 
	- Open browser and go to app. 
	- The user should be logged in. 
	- Log out
	- Should be back to "log in" view. 
	- Refresh broswer. 
	- Should be back to "Log in" view. 
	- Log in 
	- Should be logged in and redirected to 'empty' View Pictures view. 	

##Recover password
Not developed yet

##Change password
Not developed yet

##Upload pictures
(Flow will change before Beta release. It will be updated when flow change is implemented)
	- Go to upload view
	- Choose 'upload files'
	- Select at least 2 photos to upload.
	- Do not add tags. 
	- Upload
	- When uploading finished - and not sooner -, green snackbar of "Upload completed successfully. You can see the pictures in the "View Pictures" section." should appear.
	- Upload same photos as the initial batch. 
	- Repeated photos should not be uploaded. On "Recent uploads" list it should appear as "X pictures uploaded (X repeated)".
	- In your device, duplicate the same photo, making sure it has a different filename.
	- Upload this duplicated photo with new name. 
	- Repeated photo should not be uploaded. On "Recent uploads" list it should appear as "0 pictures uploaded (1 repeated)".
	- Choose 'upload files'
	- Select a photos for upload that has not been uploaded before. 
	- Add a tag on upload.
	- Upload photo
	- Check in "View Pictures" view that photo has been tagged correctly. 
	- Choose "upload files".
	- Select a video.
	- Upload
	- In device, duplicate the same video and make sure it has a different name. 
	- Upload video with same name. 
	- Repeated photo should not be uploaded. On "Recent uploads" list it should appear as "0 pictures uploaded (1 repeated)".

Check for duplicates

##Import Pictures
###Google Drive
Not developed yet
	Check for duplicates
	Email when import done or stopped.
###Dropbox
Not developed yet
	Check for duplicates
	Email when import done or stopped.

##Enabling Geo Tagging
Not developed yet

##View pictures view

###All Pictures
Sorting
Scrolling
 
###Untagged
Sorting
Scrolling

###Tagging from "all pictures"
Sorting

###Tagging from "untagged"
Sorting

###Changing tags (adding tags & changing tags)

###Removing tags
When untagging, if no pictures left with that tag, remove tag from query.

###Navigation with tags

###Image selection
**Select image**
Select single image
Select multiple images
**Download image(s)**
**Rotate**
**Select all**
Scrolling
**Unselect all**
Scrolling

###View image
Open picture and trigger fullscreen.
Navigate images using arrows and keyboard left and right
Video reproduction 
If exit fullscreen, exit picture too. (using ESC key or arrows on top right)

##Share image
Not developed yet

##Share tag
Not developed yet

##Manage Tags view
Not developed yet

##My Account
Not developed yet

##Search tag

##Filter tag

##2GB limit reached
Not developed yet

##Payment process
Not developed yet


