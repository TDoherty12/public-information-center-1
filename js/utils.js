/** @license
 | Version 10.2
 | Copyright 2012 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
var tinyResponse; //variable for storing the response getting from tiny URL api
var tinyUrl; //variable for storing the tiny URL
var shareSelectedTab;

//Remove scroll bar
function RemoveScrollBar(container) {
    if (dojo.byId(container.id + 'scrollbar_track')) {
        container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
    }
}

//For creating image
function CreateImage(imageSrc, title, isCursorPointer, imageWidth, imageHeight) {
    var imgLocate = document.createElement("img");
    imgLocate.style.width = imageWidth + 'px';
    imgLocate.style.height = imageHeight + 'px';
    if (isCursorPointer) {
        imgLocate.style.cursor = 'pointer';
    }
    imgLocate.src = imageSrc;
    imgLocate.title = title;
    return imgLocate;
}

//Create rating control
function CreateRatingControl(readonly, ctlId, intitalValue, numStars) {
    var ratingCtl = document.createElement("ul");
    ratingCtl.setAttribute("readonly", readonly);
    ratingCtl.id = ctlId;
    ratingCtl.setAttribute("value", intitalValue);
    ratingCtl.setAttribute("numStars", numStars);
    ratingCtl.style.padding = 0;
    ratingCtl.style.margin = 0;
    return ratingCtl;
}

//Refreshing address container div
function RemoveChildren(parentNode) {
    while (parentNode.hasChildNodes()) {
        parentNode.removeChild(parentNode.lastChild);
    }
}

//Clearing graphics on map
function ClearGraphics() {
    if (map.getLayer(tempGraphicsLayerId)) {
        map.getLayer(tempGraphicsLayerId).clear();
    }
    if (map.getLayer(tempServiceRequestLayerId)) {
        map.getLayer(tempServiceRequestLayerId).clear();
    }
}

//Open login page for flickr,tweet,email
function ShareLink(ext) {
    tinyUrl = null;
    mapExtent = GetMapExtent();
    var url = esri.urlToObject(windowURL);
    var selectedAlerts = [];
    var selectedSocialMediaFeeds = [];

    dojo.query('input[type="checkbox"]', dojo.byId("divAccordianContainer")).forEach(function (node, index, arr) {
        if (node.checked) {
            selectedAlerts.push(index);
        }
    });

    dojo.query('input[type="checkbox"]', dojo.byId("tableSocialServiceMedia")).forEach(function (node, index, arr) {
        if (node.checked) {
            selectedSocialMediaFeeds.push(dojo.attr(node, "feedKey"));
        }
    });
    if (featureID) {
        var urlStr = encodeURI(url.path) + "?e=" + mapExtent + "@t=" + shareSelectedTab + "@a=" + selectedAlerts.join(',') + "@s=" + selectedSocialMediaFeeds.join(',') + "@sd=" + shareSelectedRb + "@objectId=" + objectId + "@alertLayerID=" + alertLayerID + "@featureID=" + featureID;
    } else if (objectId && alertLayerID) {
        var urlStr = encodeURI(url.path) + "?e=" + mapExtent + "@t=" + shareSelectedTab + "@a=" + selectedAlerts.join(',') + "@s=" + selectedSocialMediaFeeds.join(',') + "@sd=" + shareSelectedRb + "@objectId=" + objectId + "@alertLayerID=" + alertLayerID;
    } else if (feedID) {
        var urlStr = encodeURI(url.path) + "?e=" + mapExtent + "@t=" + shareSelectedTab + "@a=" + selectedAlerts.join(',') + "@s=" + selectedSocialMediaFeeds.join(',') + "@sd=" + shareSelectedRb + "@f=" + feedID + "@socialLayerID=" + socialLayerID;
    } else {
        var urlStr = encodeURI(url.path) + "?e=" + mapExtent + "@t=" + shareSelectedTab + "@a=" + selectedAlerts.join(',') + "@s=" + selectedSocialMediaFeeds.join(',') + "@sd=" + shareSelectedRb;
    }
    url = dojo.string.substitute(mapSharingOptions.TinyURLServiceURL, [urlStr]);

    dojo.io.script.get({
        url: url,
        callbackParamName: "callback",
        load: function (data) {
            tinyResponse = data;
            tinyUrl = data;
            var attr = mapSharingOptions.TinyURLResponseAttribute.split(".");
            for (var x = 0; x < attr.length; x++) {
                tinyUrl = tinyUrl[attr[x]];
            }
            if (ext) {
                HideBaseMapLayerContainer();
                HideAddressContainer();
                var cellHeight = 60;

                if (dojo.coords("divAppContainer").h > 0) {
                    HideShareAppContainer();
                } else {
                    dojo.byId('divAppContainer').style.height = cellHeight + "px";
                    dojo.replaceClass("divAppContainer", "showContainerHeight", "hideContainerHeight");
                }
            }
        },
        error: function (error) {
            alert(tinyResponse.error);
        }
    });
    setTimeout(function () {
        if (!tinyResponse) {
            alert(messages.getElementsByTagName("tinyURLEngine")[0].childNodes[0].nodeValue);
            return;
        }
    }, 6000);
}

//Open login page for facebook,tweet and open Email client with shared link for Email
function Share(site) {
    if (dojo.coords("divAppContainer").h > 0) {
        dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
        dojo.byId('divAppContainer').style.height = '0px';
    }
    if (tinyUrl) {
        switch (site) {
            case "facebook":
                window.open(dojo.string.substitute(mapSharingOptions.FacebookShareURL, [tinyUrl]));
                break;
            case "twitter":
                window.open(dojo.string.substitute(mapSharingOptions.TwitterShareURL, [tinyUrl]));
                break;
            case "mail":
                parent.location = dojo.string.substitute(mapSharingOptions.ShareByMailLink, [tinyUrl]);
                break;
        }
    } else {
        alert(messages.getElementsByTagName("tinyURLEngine")[0].childNodes[0].nodeValue);
        return;
    }
}

//Displaying Standby text
function ShowProgressIndicator() {
    dojo.byId('divLoadingIndicator').style.display = 'block';
}

//Hiding Standby text
function HideProgressIndicator() {
    dojo.byId('divLoadingIndicator').style.display = 'none';
}

//Get current map Extent
function GetMapExtent() {
    var extents = Math.round(map.extent.xmin).toString() + "," + Math.round(map.extent.ymin).toString() + "," +
                  Math.round(map.extent.xmax).toString() + "," + Math.round(map.extent.ymax).toString();
    return (extents);
}

//Get width of a control when text and font size are specified
String.prototype.getWidth = function (fontSize) {
    var test = document.createElement("span");
    document.body.appendChild(test);
    test.style.visibility = "hidden";
    test.style.fontSize = fontSize + "px";
    test.innerHTML = this;
    var w = test.offsetWidth;
    document.body.removeChild(test);
    return w;
}

//Create tab container
function CreateTabContainer(containerId) {
    var i, tabContainer, tabContents, title, tabElement;
    var divElement, ulElement, liElement, tabLink, linkText;

    tabContainer = dojo.byId(containerId);
    tabContents = dojo.query(".tabContent", tabContainer);
    if (tabContents.length == 0) return;

    divElement = document.createElement("div");
    divElement.className = 'tab-header'
    divElement.id = containerId + '-header';
    ulElement = document.createElement("ul");
    ulElement.className = 'tab-list'

    tabContainer.insertBefore(divElement, tabContents[0]);
    divElement.appendChild(ulElement);

    for (i = 0; i < tabContents.length; i++) {
        title = tabContents[i].getAttribute("header");
        // create the tabs as an unsigned list
        liElement = document.createElement("li");
        liElement.id = containerId + '-tab-' + i;

        tabLink = document.createElement("a");
        linkText = document.createTextNode(title);

        tabLink.className = "tab-item";
        tabLink.id = "tab" + i;

        tabLink.setAttribute("href", "javascript://");
        tabLink.setAttribute("title", tabContents[i].getAttribute("headerTitle"));
        tabLink.onclick = new Function("ActivateTab('" + containerId + "', " + i + ", " + true + ")");

        ulElement.appendChild(liElement);
        liElement.appendChild(tabLink);
        tabLink.appendChild(linkText);
    }
}

//Set active tab
function ActivateTab(containerId, activeTabIndex, isMapInitialized) {
    featureID = null;
    objectId = null;
    alertLayerID = null;
    var i, tabContainer, tabContents;
    shareSelectedTab = activeTabIndex;
    tabContainer = document.getElementById(containerId);

    tabContents = dojo.query(".tabContent", tabContainer);
    if (tabContents[activeTabIndex].style.display == "block") {
        return;
    }
    dojo.disconnect(mapClickHandle);
    if (tabContents.length > 0) {
        if (activeTabIndex == 1) {
            if (dojo.byId("tab" + 1).style.display != "none") {
                if (dojo.byId("tab" + 1).style.color == "none") {
                    tabContents[1].style.display = "none";
                }
                else {

                    for (i = 0; i < tabContents.length; i++) {
                        tabContents[i].style.display = "none";
                    }
                    tabContents[activeTabIndex].style.display = "block";

                    tabList = document.getElementById(containerId + '-list');
                    tabs = dojo.query(".tab-item", tabContainer);
                    if (tabs.length > 0) {
                        for (i = 0; i < tabs.length; i++) {
                            tabs[i].className = "tab-item";
                        }
                        tabs[activeTabIndex].className = "tab-item tab-active";
                        tabs[activeTabIndex].blur();
                    }

                }
            }
        }
        else {
            for (i = 0; i < tabContents.length; i++) {
                tabContents[i].style.display = "none";
            }
            tabContents[activeTabIndex].style.display = "block";

            tabList = document.getElementById(containerId + '-list');
            tabs = dojo.query(".tab-item", tabContainer);
            if (tabs.length > 0) {
                for (i = 0; i < tabs.length; i++) {
                    tabs[i].className = "tab-item";
                }
                tabs[activeTabIndex].className = "tab-item tab-active";
                tabs[activeTabIndex].blur();
            }
        }

    }

    if (isMapInitialized) {
        map.infoWindow.hide();
        map.getLayer(tempGraphicsLayerId).clear();
        selectedGraphic = null;
        //To store the current state of layers info and populate it when clicked on Alerts tab
        if (activeTabIndex == 0) {
            map.getLayer(serviceRequestLayerInfo.Key).hide();
            dojo.byId('divAlertsLegend').style.display = 'block';
            dojo.byId('divServiceRequestLegend').style.display = "none";
            map.getLayer(tempServiceRequestLayerId).clear();
            map.setMapCursor('default');
            RestoreAlertLayers();
            ClearHideSocialMediaLayers();
            ToggleServiceRequestLayer(false);

            var counter = 0;
            dojo.query('[layerID]', dojo.byId("divAlertsLegend")).forEach(function (node, index, arr) {
                if (node.style.display == 'none') {
                    counter++;
                }
                if (counter == arr.length) {
                    dojo.byId('divAlertsLegend').style.display = 'none';
                }
            });

            var selectedTab = dojo.query(".accordionExpand", dojo.byId('divAccordianContainer'));
            if (selectedTab.length > 0) {
                var id = selectedTab[0].getAttribute("key");
                CreateScrollbar(dojo.byId(id), dojo.byId(id + "Content"));
            }
        } else if (activeTabIndex == 1) {
            mapClickHandle = dojo.connect(map, "onClick", function (evt) {
                map.infoWindow.hide();
                // Remove any existing graphics
                map.getLayer(tempServiceRequestLayerId).clear();
                selectedGraphic = null;
                if (serviceRequestSymbolURL) {
                    var symbol = new esri.symbol.PictureMarkerSymbol(serviceRequestSymbolURL, 22, 22);
                } else {
                    // Add a graphic to the display at the map click point
                    var symbol = new esri.symbol.SimpleMarkerSymbol(serviceRequestSymbolStyle, serviceRequestSymbolSize,
                    new esri.symbol.SimpleLineSymbol(serviceRequestSymbolOutlineStyle, new dojo.Color(serviceRequestSymbolOutlineColor), serviceRequestSymbolOutlineWidth), new dojo.Color(serviceRequestSymbolColor));
                }
                var graphic = new esri.Graphic(evt.mapPoint, symbol, null, null);
                map.getLayer(tempServiceRequestLayerId).add(graphic);
            });
            // Do other tab setups
            ClearHideSocialMediaLayers();
            ToggleServiceRequestLayer(true);
            ResetRequestValues();
            SaveAlertState();
            dojo.byId('divDataContainer').style.height = (map.height - 277) + "px";
            dojo.byId('divDataContent').style.height = (map.height - 277) + "px";
            CreateScrollbar(dojo.byId('divDataContainer'), dojo.byId('divDataContent'));
        } else {
            map.getLayer(serviceRequestLayerInfo.Key).hide();
            dojo.byId('divAlertsLegend').style.display = 'block';
            dojo.byId('divServiceRequestLegend').style.display = "none";
            map.getLayer(tempServiceRequestLayerId).clear();
            map.setMapCursor('default');
            ToggleServiceRequestLayer(false);
            SaveAlertState();
        }
    }
}

//Slide left panel
function AnimateDetailsView() {
    if (dojo.byId("divToggleDetail").style.cursor != "default") {
        var node = dojo.byId('divLeftPanelBackground');
        if (dojo.coords(node).l == 0) {
            dojo.byId('divToggleDetail').className = "divToggleDetailCollapse";
            dojo.addClass(dojo.byId('divToggleDetail'), "divToggleDetail");
            dojo.byId('divToggleDetail').title = "Show Panel";
            node.style.left = "-400px";
            dojo.addClass(node, "slidePanel");
            dojo.byId('divServiceDetailPanel').style.left = "-400px";
            dojo.addClass(dojo.byId('divServiceDetailPanel'), "slidePanel");
            dojo.byId('divToggleDetail').style.left = "0px";
            dojo.addClass(dojo.byId('divToggleDetail'), "slidePanel");
            dojo.query('.esriLogo', dojo.byId('map'))[0].style.left = "15px";
            dojo.addClass(dojo.query('.esriLogo', dojo.byId('map'))[0], "slidePanel");
            dojo.byId('map_zoom_slider').style.left = "15px";
            dojo.addClass(dojo.byId('map_zoom_slider'), "slidePanel");
        } else {
            dojo.byId('divToggleDetail').className = "divToggleDetailExpand";
            dojo.addClass(dojo.byId('divToggleDetail'), "divToggleDetail");
            dojo.byId('divToggleDetail').title = "Hide Panel";
            node.style.left = "0px";
            dojo.addClass(node, "slidePanel");
            dojo.byId('divServiceDetailPanel').style.left = "0px";
            dojo.addClass(dojo.byId('divServiceDetailPanel'), "slidePanel");
            dojo.byId('divToggleDetail').style.left = "400px";
            dojo.addClass(dojo.byId('divToggleDetail'), "slidePanel");
            dojo.query('.esriLogo', dojo.byId('map'))[0].style.left = "415px";
            dojo.addClass(dojo.query('.esriLogo', dojo.byId('map'))[0], "slidePanel");
            dojo.byId('map_zoom_slider').style.left = "415px";
            dojo.addClass(dojo.byId('map_zoom_slider'), "slidePanel");
        }
    }
}

//Highlight layer
function HighlightFeature(mapPoint, highlightColor) {
    HideRipple();
    var layer = map.getLayer(tempGlowLayerId);
    var i = 20;
    var flag = true;
    var intervalID = setInterval(function () {
        layer.clear();
        if (i == 20) {
            flag = false;
        } else if (i == 16) {
            flag = true;
        }
        var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, (i - 1) * 2.5,
        new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
        new dojo.Color(highlightColor), 5),
        new dojo.Color([0, 0, 0, 0]));

        var graphic = new esri.Graphic(mapPoint, symbol, null, null);
        layer.add(graphic);
        if (flag) i++;
        else i--;
    }, 100);
    intervalIDs[intervalIDs.length] = intervalID;
}

//Hide the ripple
function HideRipple() {
    ClearAllIntervals();
    map.getLayer(tempGlowLayerId).clear();
}

//Clears all the intervals
function ClearAllIntervals() {
    for (var i = 0; i < intervalIDs.length; i++) {
        clearInterval(intervalIDs[i]);
        delete intervalIDs[i];
    }
    intervalIDs.length = 0;
}

//Show error message span
function ShowSpanErrorMessage(controlId, message) {
    dojo.byId(controlId).style.display = "block";
    dojo.byId(controlId).innerHTML = message;
}

//Validating Email in comments tab
function CheckMailFormat(emailValue) {
    var pattern = /^([a-zA-Z])([a-zA-Z0-9])*((\.){0,1}(\_){0,1}(\-){0,1}([a-zA-Z0-9])+)*@(([a-zA-Z0-9])+(\.))+([a-zA-Z]{2,4})+$/;
    if (pattern.test(emailValue)) {
        return true;
    } else {
        return false;
    }
}

//Validate name
function IsName(name) {
    var namePattern = /^[A-Za-z\.\-\-', ]{3,100}$/;
    if (namePattern.test(name)) {
        return true;
    } else {
        return false;
    }
}

//Validate US ZIP code
function isValidZipCode(value) {
    var re = /^\d{5}([\-]\d{4})?$/;
    return re.test(value);
}

//Trim string
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
}

//Function to append ... for a string
String.prototype.trimString = function (len) {
    return (this.length > len) ? this.substring(0, len) + "..." : this;
}

//Create custom scroll-bar
function CreateScrollbar(container, content) {
    var yMax;
    var pxLeft, pxTop, xCoord, yCoord;
    var scrollbar_track;
    var isHandleClicked = false;
    this.container = container;
    this.content = content;

    if (dojo.byId(container.id + 'scrollbar_track')) {
        dojo.empty(dojo.byId(container.id + 'scrollbar_track'));
        container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
    }
    if (!dojo.byId(container.id + 'scrollbar_track')) {
        scrollbar_track = document.createElement('div');
        scrollbar_track.id = container.id + "scrollbar_track";
        scrollbar_track.className = "scrollbar_track";
    } else {
        scrollbar_track = dojo.byId(container.id + 'scrollbar_track');
    }

    var containerHeight = dojo.coords(container);
    scrollbar_track.style.height = containerHeight.h + "px";

    var scrollbar_handle = document.createElement('div');
    scrollbar_handle.className = 'scrollbar_handle';
    scrollbar_handle.id = container.id + "scrollbar_handle";

    scrollbar_track.appendChild(scrollbar_handle);
    container.appendChild(scrollbar_track);

    if (content.scrollHeight <= content.offsetHeight) {
        scrollbar_handle.style.display = 'none';
        return;
    } else {
        scrollbar_handle.style.display = 'block';
        scrollbar_handle.style.height = Math.max(this.content.offsetHeight * (this.content.offsetHeight / this.content.scrollHeight), 25) + 'px';
        yMax = this.content.offsetHeight - scrollbar_handle.offsetHeight;

        if (window.addEventListener) {
            content.addEventListener('DOMMouseScroll', ScrollDiv, false);
        }
        content.onmousewheel = function (evt) {
            ScrollDiv(evt);
        }
    }

    function ScrollDiv(evt) {
        var evt = window.event || evt //equalize event object
        var delta = evt.detail ? evt.detail * (-120) : evt.wheelDelta //delta returns +120 when wheel is scrolled up, -120 when scrolled down
        pxTop = scrollbar_handle.offsetTop;

        if (delta <= -120) {
            var y = pxTop + 10;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        } else {
            var y = pxTop - 10;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    }

    //Attaching events to scrollbar components
    scrollbar_track.onclick = function (evt) {
        if (!isHandleClicked) {
            evt = (evt) ? evt : event;
            pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
            var offsetY;
            if (!evt.offsetY) {
                var coords = dojo.coords(evt.target);
                offsetY = evt.layerY - coords.t;
            } else offsetY = evt.offsetY;
            if (offsetY < scrollbar_handle.offsetTop) {
                scrollbar_handle.style.top = offsetY + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            } else if (offsetY > (scrollbar_handle.offsetTop + scrollbar_handle.clientHeight)) {
                var y = offsetY - scrollbar_handle.clientHeight;
                if (y > yMax) y = yMax // Limit vertical movement
                if (y < 0) y = 0 // Limit vertical movement
                scrollbar_handle.style.top = y + "px";
                content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
            } else {
                return;
            }
        }
        isHandleClicked = false;
    };

    //Attaching events to scrollbar components
    scrollbar_handle.onmousedown = function (evt) {
        isHandleClicked = true;
        evt = (evt) ? evt : event;
        evt.cancelBubble = true;
        if (evt.stopPropagation) evt.stopPropagation();
        pxTop = scrollbar_handle.offsetTop // Sliders vertical position at start of slide.
        yCoord = evt.screenY // Vertical mouse position at start of slide.
        document.body.style.MozUserSelect = 'none';
        document.body.style.userSelect = 'none';
        document.onselectstart = function () {
            return false;
        }
        document.onmousemove = function (evt) {
            evt = (evt) ? evt : event;
            evt.cancelBubble = true;
            if (evt.stopPropagation) evt.stopPropagation();
            var y = pxTop + evt.screenY - yCoord;
            if (y > yMax) y = yMax // Limit vertical movement
            if (y < 0) y = 0 // Limit vertical movement
            scrollbar_handle.style.top = y + "px";
            content.scrollTop = Math.round(scrollbar_handle.offsetTop / yMax * (content.scrollHeight - content.offsetHeight));
        }
    };

    document.onmouseup = function () {
        document.body.onselectstart = null;
        document.onmousemove = null;
    };

    scrollbar_handle.onmouseout = function (evt) {
        document.body.onselectstart = null;
    };
}

//Refresh scrollbar
function RefreshScrollBar(container, handle) {
    var container = dojo.byId(container);
    var handle = dojo.byId(handle);
    this.handle.style.height = Math.max(this.container.offsetHeight * (this.container.offsetHeight / this.container.scrollHeight), 25) + 'px';
    //Set scroll height
    yMax = this.container.offsetHeight - this.handle.offsetHeight;
}

//Create checkbox
function CreateCheckBox(chkBoxId, chkBoxValue, isChecked) {
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = chkBoxId;
    cb.checked = isChecked;
    cb.value = chkBoxValue;
    return cb;
}

//Get UTC date for the given days
function GetUTCDate(days, dateFormat) {
    var date = new js.date();
    var today = date.utcTimestampNow();
    today.setDate(today.getDate() - days);
    if (dateFormat) {
        return dojo.date.locale.format(today, {
            datePattern: dateFormat,
            selector: "date"
        });
    } else {
        return date.utcMsFromTimestamp(date.localToUtc(date.localTimestampNow()));
    }
}

//Create Rating widget
function CreateRatingWidget(rating) {
    var numberStars = Number(rating.getAttribute("numstars"));
    var isReadOnly = String(rating.getAttribute("readonly")).bool();
    for (var i = 0; i < numberStars; i++) {
        var li = document.createElement("li");
        li.value = (i + 1);
        li.className = isReadOnly ? "ratingStar" : "ratingStarBig";
        rating.appendChild(li);
        if (i < rating.value) {
            dojo.addClass(li, isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
        }
        li.onmouseover = function () {
            if (!isReadOnly) {
                var ratingValue = Number(this.value);
                var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", rating);
                for (var i = 0; i < ratingValue; i++) {
                    dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                }
            }
        }
        li.onmouseout = function () {
            if (!isReadOnly) {
                var ratings = Number(rating.value);
                var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", rating);
                for (var i = 0; i < ratingStars.length; i++) {
                    if (i < ratings) {
                        dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                    } else {
                        dojo.removeClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                    }
                }
            }
        }
        li.onclick = function () {
            if (!isReadOnly) {
                rating.value = Number(this.value);
                var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", rating);
                for (var i = 0; i < ratingStars.length; i++) {
                    if (i < this.value) {
                        dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                    } else {
                        dojo.removeClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
                    }
                }
            }
        }
    }
}

//Set rating for rating control
function SetRating(control, rating) {
    control.value = rating;
    var isReadOnly = String(control.getAttribute("readonly")).bool();
    var ratingStars = dojo.query(isReadOnly ? ".ratingStar" : ".ratingStarBig", control);
    for (var i = 0; i < ratingStars.length; i++) {
        if (i < rating) {
            dojo.addClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
        } else {
            dojo.removeClass(ratingStars[i], isReadOnly ? "ratingStarChecked" : "ratingStarBigChecked");
        }
    }
}

//Convert string to bool
String.prototype.bool = function () {
    return (/^true$/i).test(this);
};

//Return index of an element
function ElementIndexOf(array, element) {
    for (var index in array) {
        if (array[index] == element) {
            return index;
        }
    }
    return -1;
}

//Get the query string value of the provided key if not found the function returns empty string
function GetQuerystring(key) {
    var _default;
    if (_default == null) _default = "";
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if (qs == null) return _default;
    else return qs[1];
}

//Hide splash screen container
function HideSplashScreenMessage() {
    if (dojo.isIE < 9) {
        dojo.byId("divSplashScreenContent").style.display = "none";
    }
    dojo.addClass('divSplashScreenContainer', "opacityHideAnimation");
    dojo.replaceClass("divSplashScreenContent", "hideContainer", "showContainer");
}

//Set height for splash screen
function SetSplashScreenHeight() {
    var height = dojo.coords(dojo.byId('divSplashScreenContent')).h - 80;
    dojo.byId('divSplashContent').style.height = (height + 14) + "px";
    CreateScrollbar(dojo.byId("divSplashContainer"), dojo.byId("divSplashContent"));
}

//Hide share link container
function HideShareAppContainer() {
    dojo.replaceClass("divAppContainer", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divAppContainer').style.height = '0px';
}

//Show address container with wipe-in animation
function ShowLocateContainer() {
    HideBaseMapLayerContainer();
    HideShareAppContainer();

    if (dojo.coords("divAddressContent").h > 0) {
        HideAddressContainer();
        dojo.byId('txtAddress').blur();
    } else {
        ResetSearchContainer();
        dojo.byId('divAddressContent').style.height = "300px";
        dojo.replaceClass("divAddressContent", "showContainerHeight", "hideContainerHeight");
    }
    RemoveChildren(dojo.byId('tblAddressResults'));
    SetAddressResultsHeight();
}

function ResetSearchContainer() {
    if (dojo.byId("tdSearchAddress").className.trim() == "tdSearchByAddress") {
        dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultAddress");
    } else {
        dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultRequestId");
    }
    dojo.byId("txtAddress").style.color = "gray";
    dojo.byId("imgSearchLoader").style.display == "none";
}

//Set height for address results and create scrollbar
function SetAddressResultsHeight() {
    var height = dojo.coords(dojo.byId('divAddressContent')).h;
    var containerHeight;
    if (dojo.byId("tdSearchAddress").style.display != "none") {
        containerHeight = 165;
    }
    else {
        containerHeight = 150;
    }

    if (height > 0) {
        dojo.byId('divAddressScrollContent').style.height = (height - containerHeight) + "px";
    }
    CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
}

//Set height for view details
function SetAlertDetailsHeight() {
    var height = dojo.coords(dojo.byId('divInfoWindowContent')).h;
    if (height > 0) {
        dojo.byId('divInfoWindowDetailsScroll').style.height = (height - 55) + "px";
    }
    CreateScrollbar(dojo.byId("divInfoWindowDetails"), dojo.byId("divInfoWindowDetailsScroll"));
}

//Hide address container with wipe-out animation
function HideAddressContainer() {
    dojo.byId("imgSearchLoader").style.display = "none";
    dojo.byId("txtAddress").blur();
    dojo.replaceClass("divAddressContent", "hideContainerHeight", "showContainerHeight");
    dojo.byId('divAddressContent').style.height = '0px';
    isContainerVisible = false;
}

//Clear default value for text box controls
function ClearDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;
    target.style.color = "#FFF";
    target.value = '';
}

//Set default value on blur
function ReplaceDefaultText(e) {
    var target = window.event ? window.event.srcElement : e ? e.target : null;
    if (!target) return;

    if (dojo.byId("tdSearchServiceId").className == "tdSearchByServiceId") {
        ResetTargetValue(target, "defaultRequestId", "gray");
    } else {
        ResetTargetValue(target, "defaultAddress", "gray");
    }
}

//Set changed value for address/request id
function ResetTargetValue(target, title, color) {
    if (target.value == '' && target.getAttribute(title)) {
        target.value = target.title;
        if (target.title == "") {
            target.value = target.getAttribute(title);
        }
    }
    target.style.color = color;
    lastSearchString = dojo.byId("txtAddress").value.trim();
}

//Display the current location of the user
function ShowMyLocation() {
    HideBaseMapLayerContainer();
    HideShareAppContainer();
    HideAddressContainer();
    navigator.geolocation.getCurrentPosition(

    function (position) {
        ShowProgressIndicator();
        mapPoint = new esri.geometry.Point(position.coords.longitude, position.coords.latitude, new esri.SpatialReference({
            wkid: 4326
        }));
        var graphicCollection = new esri.geometry.Multipoint(new esri.SpatialReference({
            wkid: 4326
        }));
        graphicCollection.addPoint(mapPoint);
        geometryService.project([graphicCollection], map.spatialReference, function (newPointCollection) {
            for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
                if (map.getLayer(baseMapLayers[bMap].Key).visible) {
                    var bmap = baseMapLayers[bMap].Key;
                }
            }
            if (!map.getLayer(bmap).fullExtent.contains(newPointCollection[0].getPoint(0))) {
                mapPoint = null;
                selectedGraphic = null;
                map.getLayer(tempGraphicsLayerId).clear();
                map.infoWindow.hide();
                HideProgressIndicator();
                alert(messages.getElementsByTagName("geoLocation")[0].childNodes[0].nodeValue);
                return;
            }
            mapPoint = newPointCollection[0].getPoint(0);
            map.setLevel(locatorSettings.Locators[0].ZoomLevel);
            map.centerAt(mapPoint);
            var graphic = new esri.Graphic(mapPoint, locatorMarkupSymbol, {
                "Locator": true
            }, null);
            map.getLayer(tempGraphicsLayerId).add(graphic);

            HideProgressIndicator();
        });
    },

    function (error) {
        HideProgressIndicator();
        switch (error.code) {
            case error.TIMEOUT:
                alert(messages.getElementsByTagName("geolocationTimeout")[0].childNodes[0].nodeValue);
                break;
            case error.POSITION_UNAVAILABLE:
                alert(messages.getElementsByTagName("geolocationPositionUnavailable")[0].childNodes[0].nodeValue);
                break;
            case error.PERMISSION_DENIED:
                alert(messages.getElementsByTagName("geolocationPermissionDenied")[0].childNodes[0].nodeValue);
                break;
            case error.UNKNOWN_ERROR:
                alert(messages.getElementsByTagName("geolocationUnKnownError")[0].childNodes[0].nodeValue);
                break;
        }
    }, {
        timeout: 10000
    });
}

//Show Info request directions view
function ShowInfoDirectionsView() {
    if (dojo.byId('imgDirections').getAttribute("disp") == "Details") {
        dojo.byId('tdDirections').appendChild(dojo.byId('imgDirections'));
        dojo.byId('imgComments').src = "images/comments.png";
        dojo.byId('imgComments').title = "Comments";
        dojo.byId('imgComments').setAttribute("disp", "Comments");
        dojo.byId('divInfoComments').style.display = "none";
        dojo.byId('divInfoAttachments').style.display = "none";
        dojo.byId('divInfoDetails').style.display = "block";
        dojo.byId('imgDirections').style.display = "none";
        dojo.byId('imgComments').style.display = "block";
        dojo.byId("imgAttachments").style.display = "block";
        SetViewDetailsHeight();
    }
}

//Show comments view
function ShowCommentsView() {
    if (showCommentsTab) {
        dojo.byId("imgComments").style.display = "none";
        dojo.byId('tdComments').appendChild(dojo.byId('imgDirections'));
        dojo.byId('imgDirections').src = "images/Details.png";
        dojo.byId('imgDirections').title = "Details";
        dojo.byId('imgDirections').setAttribute("disp", "Details");
        dojo.byId("imgDirections").style.display = "block";
        dojo.byId("imgAttachments").style.display = "block";
        ResetCommentValues();
        dojo.byId('divInfoComments').style.display = "block";
        dojo.byId('divInfoDetails').style.display = "none";
        dojo.byId('divInfoAttachments').style.display = "none";
        SetCommentHeight();
    }
}

//Show attachments view
function ShowAttachmentsView() {
    dojo.byId('tdDirections').appendChild(dojo.byId('imgDirections'));
    dojo.byId("imgAttachments").style.display = "none";
    dojo.byId("imgComments").style.display = "block";
    dojo.byId('imgDirections').src = "images/Details.png";
    dojo.byId('imgDirections').title = "Details";
    dojo.byId('imgDirections').setAttribute("disp", "Details");
    dojo.byId("imgDirections").style.display = "block";
    dojo.byId('divInfoAttachments').style.display = "block";
    dojo.byId('divInfoDetails').style.display = "none";
    dojo.byId('divInfoComments').style.display = "none";
    SetAttachmentsHeight();
}

//Set height and create scrollbar for comments
function SetCommentHeight() {
    var height = dojo.coords(dojo.byId('divInfoContent')).h - 10;
    if (height > 0) {
        dojo.byId('divCommentsContent').style.height = (height - 70) + "px";
    }
    CreateScrollbar(dojo.byId("divCommentsContainer"), dojo.byId("divCommentsContent"));

}

//Reset the comments textarea
function ResetTextArea() {
    dojo.byId('txtComments').style.overflow = "hidden";
    ResetCommentValues();
}

//Reset comments data
function ResetCommentValues() {
    dojo.byId('txtComments').value = '';
    SetRating(dojo.byId('commentRating'), 0);
    document.getElementById('spanCommentError').innerHTML = "";
    document.getElementById('spanCommentError').style.display = 'none';
    dojo.byId('divAddComment').style.display = "none";
    dojo.byId('divCommentsView').style.display = "block";
    dojo.byId('divCommentsList').style.display = "block";
}

//Display view to add comments
function ShowAddCommentsView() {
    dojo.byId('divAddComment').style.display = "block";
    dojo.byId('divCommentsView').style.display = "none";
    dojo.byId('divCommentsList').style.display = "none";
    SetCmtControlsHeight();
    setTimeout(function () {
        dojo.byId('txtComments').focus();
    }, 50);
}

//Show comments controls with scrollbar
function SetCmtControlsHeight() {
    var height = dojo.coords(dojo.byId('divInfoContent')).h;
    dojo.byId("divCmtIpContainer").style.height = (height - 80) + "px";
    dojo.byId('divCmtIpContent').style.height = (height - 80) + "px";
    CreateScrollbar(dojo.byId("divCmtIpContainer"), dojo.byId("divCmtIpContent"));
}

//Restrict the maximum number of characters in the text area control
function ImposeMaxLength(Object, MaxLen) {
    return (Object.value.length <= MaxLen);
}

//function to hide Info request container
function HideInformationContainer() {
    map.getLayer(tempGraphicsLayerId).clear();
    selectedGraphic = null;
    featureID = null;
    objectId = null;
    alertLayerID = null;
    passedId = null;
    map.infoWindow.hide();
}

//Get the extent based on the map point for browser
function GetBrowserMapExtent(mapPoint) {
    var width = map.extent.getWidth();
    var height = map.extent.getHeight();
    var xmin = mapPoint.x - (width / 2);
    var ymin = mapPoint.y - (height / 2.7);
    var xmax = xmin + width;
    var ymax = ymin + height;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}