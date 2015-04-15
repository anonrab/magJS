var Gallery = (function() {
    //html element
    var pswpElement;

    //Pswp class instance 
    var pswpGallery = null;

    //Current journal data
    var currentJournal;

    //rotation
    var baseURL = 'http://app.hair.su/stuff/journal/good/data/';

    function Gallery(pswpElement) {
    	var self = this;
        this.pswpElement = pswpElement;

        //block right click on images
        document.oncontextmenu = function(e) {
            var target = (typeof e != "undefined") ? e.target : event.srcElement;
            if (target.tagName == "IMG" && target.className.indexOf("pswp__img") >= 0)
                return false;
        };

        //Popups
		var openMinisPopUp = function() {
            console.log("showing gallery contents");
			
            var minis = self.initMinis(self.currentJournal);

            var cl = document.querySelector(".gallery-contents__list");
            //удаляем всех детей и добавляем новых
            while (cl.firstChild) {
                cl.removeChild(cl.firstChild);
            }

            while (minis.firstChild) {
                cl.appendChild(minis.removeChild(minis.firstChild));
            }

            //отображаем попап
            document.querySelector(".gallery-contents").style.display = "block";
		};
    
        var pc = document.querySelector('.pswp__button--minis');
        pc.addEventListener('click', openMinisPopUp);
        pc.addEventListener('touchstart', openMinisPopUp);

        // var pc = document.querySelector('.pswp__button--minis');
        // pc.addEventListener('click', this.rotate);
        // pc.addEventListener('touchstart', this.rotate);

        var close = document.querySelector('.gallery-contents__button--close');
        close.addEventListener('click', closePopUp);
        close.addEventListener('touchstart', closePopUp);

        var close1 = document.querySelector('.gallery-contents');
        close1.addEventListener('click', closePopUp);
        close1.addEventListener('touchstart', closePopUp);

        // this.startRotationChecking();

        // var self = this;
        // var test = function(s) {
        //     setTimeout(function() {
        //         self.rotate();
        //         test(s);
        //     }, 4000)
        // }
        // test(self);
    }

    

    var closePopUp = function(e) {
    	if (!e) {
    		document.querySelector(".gallery-contents").style.display = "none";
    		return;
    	}


    	if (e.target.className == 'gallery-contents__button--close' || 
    		e.target.className == 'gallery-contents') {
    		document.querySelector(".gallery-contents").style.display = "none";
    		return;
    	}
    };

    Gallery.prototype.show = function(config) {
        console.log("starting gallery url: " + config.url);
		var url = config.url;
    	var self = this;
        getJSON(url + 'config.json', function(data) {
        	var j = {};
	        j.pageW = data.width;
	        j.pageH = data.height;
            j.maxPage = data.pages;

            if (config.page > 0) {
                j.page  = config.page;
            } else {
                console.log("no config found");
                j.page = 0;
            }

            //требуются, не удалять
	        j.url = url;
	        j.base = url;
	        j.id = url;
	        j.img = url + 'cover.jpg';
	        
	        j.rotating = false;
	        j.closed = false;

            var hash = Gallery.photoswipeParseHash();
            if (hash.isPortrait) {
                var bool = (hash.isPortrait === 'true');
                j.isPortrait = bool;
            } else {
                j.isPortrait = checkScreenRotation();
            }
            

        	self.currentJournal = j;
            self.openPhotoSwipe();
        });
    };

    Gallery.prototype.showByLink = function(url) {
        var j = {};
        j.url = url;
        j.page = 0;
        this.show(j);
    };

    Gallery.prototype.openPhotoSwipe = function() {
        var self = this;

        this.currentJournal.items = this.generateItems();
        var options = getPhotoSwipeConfig(this.currentJournal.id);

        this.pswpGallery = new PhotoSwipe(this.pswpElement, PhotoSwipeUI_Default, this.currentJournal.items, options);
        this.pswpGallery.listen('destroy', function() {
            console.log('gallery destroyed: ' + self.currentJournal.url);  
        });
        // this.pswpGallery.listen('hashchange', function() {
        //     console.log('hash chagned');
        // });
        this.pswpGallery.init();

        if (this.currentJournal.page > 0) {
            this.pswpGallery.goTo(this.currentJournal.page);
        }
    };

    Gallery.prototype.initMinis = function() {
        var pageSelected = function(e) {
            console.log("minis clicked: " + e.currentTarget.name);

            closePopUp();
            var p = parseInt(e.currentTarget.name);
            if (self.currentJournal.isPortrait) {
                self.currentJournal.page = p;
            } else {
                self.currentJournal.page = Math.floor(p / 2);
            }

            console.log("opening: " + self.currentJournal.page);
            self.pswpGallery.goTo(self.currentJournal.page);
        };

        var createImage = function(url, pageId, descr) {
            var div = document.createElement("figure");
            div.name = pageId;
            div.addEventListener("click", pageSelected);

            // var img = document.createElement("img");
            // img.src = url;
            // var img = document

            var s = '<img src="' + url + '">';
            var d = document.createElement('div');
            d.innerHTML = s;
            var img = d.firstChild;

            var textNode = document.createTextNode(descr);
            var capt = document.createElement("figcaption");
            capt.appendChild(textNode);

            div.appendChild(img);
            div.appendChild(capt);
            div.className = "gallery-contents__element";
            return div;
        };

    	
        //SINGLE
        var genSingle = function() {
            var container = document.createElement("div");
            var id = 0;
            for (var i = 0; i < items.length; i++) {
                var base = items[id].singleMini;

                var name = id;
                if (id === 0) {
                    name = "обложка";
                }

                container.appendChild(createImage(base, id, name));
                id++;
            }
            return container;
        };

        //DOUBLE
        var genDouble = function() {
            var container = document.createElement("div");
            var id = 0;
            for (var i = 0; i < items.length; i++) {
                var m = Math.floor(id / 2);
                var base = items[m].doubleMini;

                //var pageId = id-1;
                var name = (id - 1) + "-" + id;
                if (id === 0) {
                    name = "обложка";
                }

                container.appendChild(createImage(base, id, name));
                id += 2;
            }
            return container;
        };

        var items = this.currentJournal.items;
        var self = this;
        if(this.currentJournal.isPortrait) {
            return genSingle();    
        } else {
            return genDouble();    
        }
    };

    //screen rotation in photoswipe
    // Gallery.prototype.startRotationChecking = function() {
    //     var self = this;
    //     var onResize = function() {
    //     	console.log("resize start");
    //     	if (self.currentJournal === undefined)
    //     		return;

    //     	if (self.currentJournal.closed === true)
    //     		return

    //     	if (self.currentJournal.rotating === true)
    //     		return;
        	
    //         var check = checkScreenRotation();
    //         if (self.currentJournal.isPortrait != check) {
    //         	console.log("DEVICE ROTATED");
    //             self.currentJournal.rotating = true;
    //             self.rotate();
    //             self.currentJournal.rotating = false;
    //         }
    //         console.log("resize end");
    //     };

    //     window.addEventListener("resize", onResize, false);
    // };

    // Gallery.prototype.rotate = function() {
    //     if (this.currentJournal.closed === true) {
    //         return;
    //     }

    //     this.currentJournal.isPortrait = !this.currentJournal.isPortrait;
    //     console.log("rotation: " + this.currentJournal.isPortrait);

    //     this.currentJournal.page = this.pswpGallery.getCurrentIndex();
    //     if (this.currentJournal.page > 0) {
    //         if (this.currentJournal.isPortrait) {
    //             this.currentJournal.page = this.currentJournal.page * 2 - 1;
    //         } else {
    //             this.currentJournal.page = Math.ceil(this.currentJournal.page / 2);
    //         }
    //     }

    //     this.updateJournalRotation();
    // }

    // Gallery.prototype.updateJournalRotation = function() {
    //     var self = this;
    //     this.pswpGallery.close();
    //     self.openPhotoSwipe(this.currentJournal);
    // }

    Gallery.prototype.generateItems = function() {
        var j = this.currentJournal;
        var addNulls = function(numbers, nulls) {
            var nullsLen = nulls - (numbers + "").length;
            var res = Array(nullsLen + 1).join("0") + numbers;
            return res;
        };

        var items = [];
        var max = j.maxPage;
        if (!this.currentJournal.isPortrait) {
            //двойных разворотов в два раза меньше. Обложки пополам не делим
            console.log("generating landscape items");
            max = Math.ceil((max - 2) / 2) + 2;
        } else {
            console.log("generating portrait items");
        }
        for (var i = 1; i <= max; i++) {
            var imgUrl, imgW;
            if (this.currentJournal.isPortrait) {
                imgUrl = j.base + 'single/' + addNulls(i, 4) + '.jpg';
                imgW = j.pageW;
            } else {
                imgUrl = j.base + 'double/' + addNulls(i, 4) + '.jpg';
                imgW = j.pageW * 2;
            }

            items[i - 1] = {
                src: imgUrl,
                singleMini: j.base + 'single_mini/' + addNulls(i, 4) + '.jpg',
                doubleMini: j.base + 'double_mini/' + addNulls(i, 4) + '.jpg',
                w: imgW,
                h: j.pageH
            };
        }
        items[0].w = j.pageW;
        items[max - 1].w = j.pageW;
        return items;
    };

    //Immutable functions
    // false - landscape
    // true - portrait
    var checkScreenRotation = function() {
        var w = window.innerWidth;
        var h = window.innerHeight;
        var orientation = w / h;
        return (orientation > 1) ? false : true;
    };

    var getPhotoSwipeConfig = function(id) {
        var options = {};
        options.galleryUID = id;
        options.history = true;
        options.focus = true;
        options.closeOnScroll = false;
        // options.pinchToClose = false;
        options.preload = [0, 2];
        // options.index = this.currentJournal.page;
        // options.showAnimationDuration = 10;
        // options.hideAnimationDuration = 10;
        // options.shareEl = false;
        // options.bgOpacity = 0.85;
        options.tapToToggleControls = true;
        options.maxSpreadZoom = 2;
        return options;
    };

    var getJSON = function(url, callback) {
        function createCORSRequest(method, url) {
          var xhr = new XMLHttpRequest();
          if ("withCredentials" in xhr) {
            xhr.open(method, url, true);
          } else if (typeof XDomainRequest != "undefined") {
            xhr = new XDomainRequest();
            xhr.open(method, url);
          } else {
            xhr = null;
          }
          return xhr;
        }
    	var xhr = createCORSRequest('get', url);
        xhr.onload = function() {
          var status = xhr.status;
          if (status == 200) {
          	var obj = JSON.parse(xhr.responseText);
            callback(obj);
          } else {
            callback(status);
          }
        };
        xhr.send();
    };

    return Gallery;
})();

Gallery.photoswipeParseHash = function() {
    var hash = window.location.hash.substring(1),
        params = {};

    // if (hash.length < 5) {
    //     return params;
    // }

    var vars = hash.split('&');
    for (var i = 0; i < vars.length; i++) {
        if (!vars[i]) {
            continue;
        }
        var pair = vars[i].split('=');
        if (pair.length < 2) {
            continue;
        }
        params[pair[0]] = pair[1];
    }

    if (!params.hasOwnProperty('pid')) {
        return params;
    }
    params.pid = parseInt(params.pid, 10);
    return params;
};