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
	- Test 2-character username.
	- Test mismatching passwords.
	- Test passwords with 4 characters. 
	- Test passwords with special characters '@' '$' '%' '^' '*' '!'
	- On invite-requesting email inbox, the user should receive an "Welcome to ac;pic!" email.  

##Log In
	- Click 'log in' with empty form. 
		- Please submit valid credentials.
	- Insert incorrect username and correct password. 
		- Please submit valid credentials.
	- Insert correct username and incorrect password.
		- Please submit valid credentials.
	- Insert correct user and password. 
	- Should be logged in and redirected to 'empty' View Pictures view. 	

##Recover password
Not developed yet

##Change password
Not developed yet

##Upload pictures
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


