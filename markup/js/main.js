"use strict";

// -------------------------
// Tags in view pictures
// -------------------------
var showingAllPictures = true;
var allPicturesTrigger = document.querySelector('.tag--all-pictures');
var viewableTags = document.querySelectorAll('.tag-list--view .tag');
var selectedTagsCountElements = document.querySelectorAll('.js_tags-selected-count');
var selectedTagsCount = 0;


viewableTags.forEach( function(trigger) {
  // turn off all-pictures-tag
  trigger.addEventListener('click', function(){
    if(trigger.classList.contains('tag--all-pictures')) {
      if(!showingAllPictures) {
        showingAllPictures = true;
        // remove all active tags
        viewableTags.forEach( function(tag) {
          tag.classList.remove('tag--selected');
        });
        selectedTagsCount = 0;
        // add active class to all pictures
        allPicturesTrigger.classList.add('tag--selected');
      }
    } else {
      showingAllPictures = false;
      allPicturesTrigger.classList.remove('tag--selected');
      if(this.classList.contains('tag--selected')) {
        this.classList.remove('tag--selected');
        selectedTagsCount--;
        if(selectedTagsCount === 0) {
          allPicturesTrigger.classList.add('tag--selected');
        }
      } else {
        this.classList.add('tag--selected');
        selectedTagsCount++;
      }
    }
    updateSelectedTagsCount(selectedTagsCountElements);
  })
})

// update selected tags count

function updateSelectedTagsCount(elements) {
  elements.forEach(function(element){
    element.innerHTML = selectedTagsCount;
  });
}

// -------------------------
// Tags in Organise pictures
// -------------------------

var attachableTags = document.querySelectorAll('.tag-list--attach .tag');

attachableTags.forEach(tag => {
  tag.addEventListener('click', function(){
    tag.classList.toggle('tag--attached');
  });
});

// -------------------------
// The switch
// -------------------------
var viewSelectedTrigger = document.querySelector('.js_toggle-selected-tags');
if(viewSelectedTrigger) {
  viewSelectedTrigger.addEventListener('click', function(){
    document.body.classList.toggle('app-selected-tags');
    document.body.classList.toggle('app-all-tags');
  });
}


var viewAllTagsTrigger = document.querySelector('.js_open-all-tags');
if(viewAllTagsTrigger) {
  viewAllTagsTrigger.addEventListener('click', function(){
    document.body.classList.add('app-all-tags');
    document.body.classList.remove('app-selected-tags');
  });
}


var viewAttachTagsTrigger = document.querySelector('.js_open-attach-tags');

if(viewAttachTagsTrigger) {
  viewAttachTagsTrigger.addEventListener('click', function(){
    document.body.classList.add('app-attach-tags');
    document.body.classList.remove('app-untag-tags');
  });
}

var viewRemoveTagsTrigger = document.querySelector('.js_open-untag-tags');

if(viewRemoveTagsTrigger) {
  viewRemoveTagsTrigger.addEventListener('click', function(){
    document.body.classList.add('app-untag-tags');
    document.body.classList.remove('app-attach-tags');
  });
}

// update selected pictures count

var selectedCount = 0;

function updateCount(elements) {
  elements.forEach(function(element){
    element.innerHTML = selectedCount;
  });

  // show bar if selectedcount is 1

  if(selectedCount === 1) {
    document.body.classList.add('app-show-organise-bar');
    switchToOrganise();
  } else if (selectedCount === 0) {
    document.body.classList.remove('app-show-organise-bar');
  }
}

// update selected pictures

var selectedCountElements = document.querySelectorAll('.js_selected-count');
var pictures = document.querySelectorAll('.pictures-grid__item-picture');

if(pictures && selectedCountElements) {
  pictures.forEach(picture => {
    picture.addEventListener('click', function(e){
      if(picture.classList.contains('selected')) {
        selectedCount--;
      } else {
        selectedCount++;
      }
      picture.classList.toggle('selected');
      updateCount(selectedCountElements);
    });
  })
}

// Go to organise

function switchToOrganise() {
  console.log(document.body.classList);
  document.body.classList.remove('app-pictures');
  document.body.classList.add('app-organise');
  document.body.classList.remove('app-all-tags');
  document.body.classList.remove('app-selected-tags');
  document.body.classList.add('app-attach-tags');
  return true;
  console.log(document.body.classList);
}

// -------------------------
// Go to organise trigger
// -------------------------

var goToOrganiseTriggers = document.querySelectorAll('.js_go-to-organise');

goToOrganiseTriggers.forEach(trigger => {
  trigger.addEventListener('click', function(e){
    e.preventDefault();
    switchToOrganise();
  });
});

// Go to pictures

function switchToPictures() {
  document.body.classList.remove('app-organise');
  document.body.classList.add('app-pictures');
  document.body.classList.remove('app-attach-tags');
  document.body.classList.remove('app-untag-tags');
  document.body.classList.add('app-all-tags');
}

var goToPicturesTrigger = document.querySelectorAll('.js_go-to-pictures');

goToPicturesTrigger.forEach(trigger => {
  trigger.addEventListener('click', function(e){
    console.log(1);
    e.preventDefault();
    switchToPictures();
  });
});

// Deselect all pictures

function deselectAllPictures() {
  pictures.forEach(function(picture){
    picture.classList.remove('selected');
  })
}

// close/reset organise bar

function closeOrganiseBar() {
  deselectAllPictures();
  document.body.classList.remove('app-show-organise-bar');
  selectedCount = 0;
  updateCount(selectedCountElements);
}

// deselect all pictures

var deselectAllPicturesTrigger = document.querySelector('.js_deselect-all-pictures');
if (deselectAllPicturesTrigger) {
  deselectAllPicturesTrigger.addEventListener('click', function(){
    closeOrganiseBar();
  });
}


// clear selected count

if(selectedCountElements) {
  selectedCountElements.forEach(function(selectedCountElement){
    selectedCountElement.addEventListener('click', function(){
      closeOrganiseBar();
    });
  })
}

// switch back to pictures button 

var viewPicturesTriggers = document.querySelectorAll('.js_switch-to-pictures'); 

viewPicturesTriggers.forEach(trigger => {
  trigger.addEventListener('click', function(){
    closeOrganiseBar();
    switchToPictures();
  });
});

// -------------------------
// Toggle hidden tags
// -------------------------

var toggleHiddenTagsTriggers = document.querySelectorAll('.js_toggle-hidden');

toggleHiddenTagsTriggers.forEach(trigger => {
  trigger.addEventListener('click', function(){
    toggleHiddenTags();
  });
});

function toggleHiddenTags() {
  document.body.classList.toggle('app-tags-hidden');
  document.body.classList.toggle('app-tags-hidden-open');
}

// -------------------------
// Toggle shared tags
// -------------------------

var toggleSharedTagsTriggers = document.querySelectorAll('.js_toggle-shared');

toggleSharedTagsTriggers.forEach(trigger => {
  trigger.addEventListener('click', function(){
    toggleSharedTags();
  });
});

function toggleSharedTags() {
  document.body.classList.toggle('app-shared-tags-filtered');
}

// -------------------------
// Manage tags - expand tag
// -------------------------

var expandTagInfoTriggers = document.querySelectorAll('.tag-list-extended__item .tag');

expandTagInfoTriggers.forEach(trigger => {
  let expanded = false;
  const parentEl = trigger.parentElement;
  const extraInfoElement = parentEl.querySelector('.tag-list-extended__item-info');
  // get base height
  const baseHeight = parentEl.getBoundingClientRect().height;
  // set current height for animation
  parentEl.style.height = baseHeight + 'px';
  // position info element
  extraInfoElement.style.top = baseHeight + 'px';
  // get expanded height
  const expandedHeight = extraInfoElement.getBoundingClientRect().height + baseHeight;
  // on click expand
  trigger.addEventListener('click',function(){
    if(!expanded) {
      // expand
      parentEl.style.height = expandedHeight + 'px';
    } else {
      parentEl.style.height = baseHeight + 'px';
    }
    expanded =! expanded;
    console.log(expanded);
  });
});

// -------------------------
// Open picture fullscreen
// -------------------------
var OpenPopupPicTriggers = document.querySelectorAll('.js_open-fullscreen');

OpenPopupPicTriggers.forEach( function(trigger) {
  trigger.addEventListener('click', function(){
    document.body.classList.add('app-fullscreen');
  })
})

// -------------------------
// Open picture
// -------------------------
var CanelPopupPicTriggers = document.querySelectorAll('.js_cancel-fullscreen');

CanelPopupPicTriggers.forEach( function(trigger) {
  trigger.addEventListener('click', function(){
    document.body.classList.remove('app-fullscreen');
  })
})