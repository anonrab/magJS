if (window.addEventListener)
	window.addEventListener("load", onPageLoad, false);
else if (window.attachEvent)
	window.attachEvent("onload", onPageLoad);
else window.onload =onPageLoad;

var gallery = null;
var ractive;
function onPageLoad() {
    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = Gallery.photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        var j = {};
        j.url = hashData.gid;
        j.page = hashData.pid - 1;

        gallery = new Gallery(document.querySelector('.pswp'));
        gallery.show(j);
    }

    var galleryInitClasses = ['journal-block', 'gallery-element__image', 'gallery-element__button--read', 'gallery-element__header', 'gallery-element__button--share'];
    galleryInitClasses.forEach(function(jClass) {
    	console.log('init photoswipe for' + jClass);
    	addEventListenerByClass(jClass, 'click', galleryElementClick);
    });
}

function addEventListenerByClass(className, event, fn) {
    var list = document.getElementsByClassName(className);
    for (var i = 0, len = list.length; i < len; i++) {
        list[i].addEventListener(event, fn, false);
    }
}

function showSpinner() {
    var opts = {
      lines: 13, // The number of lines to draw
      length: 20, // The length of each line
      width: 10, // The line thickness
      radius: 30, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#FFFFFF', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '50%', // Top position relative to parent
      left: '50%' // Left position relative to parent
    };
    var target = document.getElementById('spinner');
    target.className = 'gallery-spinner';
    window.spinner = new Spinner(opts).spin(target);
}

function stopSpinner() {
    var target = document.getElementById('spinner');
    target.className = '';
    window.spinner.stop();
    // document.querySelector('#spinner').innerHTML = '';
}

function galleryElementClick(e) {
    e = e || window.event;
    e.preventDefault ? e.preventDefault() : e.returnValue = false;

    var eTarget = e.target || e.srcElement;

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    var clickedListItem = closest(eTarget, function(el) {
        return el.tagName === 'A';
        // return el.className.indexOf("gallery-element") > 0;
    });

    if(!clickedListItem) {
        return;
    }
   
    var url = clickedListItem.getAttribute('url');

    if(url.length >= 0) {
        gallery = new Gallery(document.querySelector('.pswp'));

        var j = {};
        j.url = url;
        j.page = 0;
        gallery.show(j);
    }
    return false;
}