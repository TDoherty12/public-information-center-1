dojo.require("esri.map");
dojo.require("esri.tasks.query");
dojo.require("esri.tasks.geometry");
dojo.require("esri.layers.FeatureLayer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.ToggleButton");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojox.gfx");
dojo.require("dojox.gfx.fx");
dojo.require("dojox.widget.Standby");
dojo.require("dojo.date.locale");
dojo.require("js.config");
dojo.require("js.date");

var map; //ESRI map object
var baseMapLayers; //variable to store basemap collection
var tempGraphicsLayerId = 'tempGraphicsLayerId'; //Temp Graphics layer ID
var geometryService; //Geometry used for Geocoding
var helpFileURL; //variable for storing Help URL
var alertLayerInfo; //variable to store alert layers information
var serviceRequestLayerInfo; //variable to store service request information
var socialMediaInfo; //variable to socialmedia information
var tempGlowLayerId = "tempGlowLayerID" //variable to store graphics layer id for glow ripple
var intervalIDs = []; //variable to store intervals of glow ripple
var tempPolygonSelectLayerId = "tempPolygonSelectLayerID"; //variable to store polygon select layer
var tempServiceRequestLayerId = "tempServiceRequestLayerID"; //variable to store service request graphics layer id
var mapClickHandle; //variable to store mapclick event for service request
var socialMediaAttributes = []; //variable to store social media attributes
var mapSharingOptions; //variable to store tinyurl generator
var defaultServiceTab; //variable to store default tab
var tabHeaders; //variable to store removed tab
var defaultAlertServicePanel; //variable to store default service panel on startup
var serviceRequestSymbolStyle; //Default symbol style for service request
var serviceRequestSymbolSize;//Default symbol size for service request
var serviceRequestSymbolOutlineColor; //Default symbol Outline color for service request
var serviceRequestSymbolOutlineWidth; //Default symbol Outline width for service request
var serviceRequestSymbolColor; //Default symbol color for service request
var serviceRequestSymbolURL; //Default symbol URL for service request
var serviceRequestInfoPopupFields; //variable to store Service request infopopup fields
var selectedServiceStatus; //variable to store selected service request
var infoWindowDescriptionFields; //variable to store infowindow description fields for creating scrollbars
var messages; //variable used for storing the error messages
var status; //variable to store the status of serviceRequest
var requestId; //variable to store the id of a new serviceRequest
var selectedRequest; //variable to store the request id to be searched
var selectedGraphic = null; //variable to store the selected graphics layer
var featureID; //variable to store feature Id while sharing
var alertLayerID; //variable to store the selected layer (for alerts tab while sharing)
var socialLayerID; //variable to store the selected layer (for social media tab while sharing)
var objectId; //variable to store the id for infowindow while sharing (for alerts tab)
var showCommentsTab; //variable to store state of "Comments" tab in the info-Popup
var formatDateAs; //variable to store date format
var windowURL = window.location.toString();
var locatorSettings; //variable to store address search settings
var shareQuery; //variable to store the object id for querying while sharing infowindow for alerts tab
var socialMediaTitle; ///variable to store Social Media Info-window title
var commentId; //variable to store the primary key attribute for comments
var lastSearchString; //variable for storing the last search string value
var stagedSearch; //variable for storing the time limit for search
var lastSearchTime; //variable for storing the time of last searched value
var commentsInfoPopupFieldsCollection; //variable for storing the info-pop fields for adding and displaying comments
var socialMediaIndex; //variable for storing the index for social media
var shareSelectedRb; //variable for storing selected radio button (for social media tab)
var queryObject;//variable for retrieving the parameters from the URL after sharing
var feedID; //variable to store the id for infowindow while sharing (for social media tab)
var passedId; //variable to store the shared infowindow-id to compare with the infowindow-id before sharing(for social media tab while sharing)

//Function to initialize the map and read data from Configuration file
function init() {
    ShowProgressIndicator();
  
    if (!Modernizr.geolocation) {
        dojo.byId("tdGeolocation").style.display = "none";
    }
    esri.config.defaults.io.proxyUrl = "proxy.ashx";
    esri.config.defaults.io.alwaysUseProxy = false;
    esri.config.defaults.io.timeout = 600000; //timeout for query task

    dojo.connect(window, "onresize", function () {
        if (map) {
            map.resize();
            map.reposition();
        }
        SetAccordionContainerHeight(currentAccordianTab);
    });

    dojo.xhrGet({
        url: "errorMessages.xml",
        handleAs: "xml",
        preventCache: true,
        load: function (xmlResponse) {
            messages = xmlResponse;
        }
    });

    // Identify the key presses while implementing auto-complete and assign appropriate actions
    dojo.connect(dojo.byId("txtAddress"), 'onkeyup', function (evt) {
        if (evt) {
            if (evt.keyCode == dojo.keys.ENTER) {
                if (dojo.byId("txtAddress").value != '') {
                    dojo.byId("imgSearchLoader").style.display = "block";
                    LocateAddress();
                    return;
                }
            }
            if (!((evt.keyCode >= 46 && evt.keyCode < 58) || (evt.keyCode > 64 && evt.keyCode < 91) || (evt.keyCode > 95 && evt.keyCode < 106) || evt.keyCode == 8 || evt.keyCode == 110 || evt.keyCode == 188)) {
                evt = (evt) ? evt : event;
                evt.cancelBubble = true;
                if (evt.stopPropagation) evt.stopPropagation();
                return;
            }
            if (dojo.coords("divAddressContent").h > 0) {
                if (dojo.byId("txtAddress").value.trim() != '') {
                    if (lastSearchString !== dojo.byId("txtAddress").value.trim()) {
                        lastSearchString = dojo.byId("txtAddress").value.trim();
                        RemoveChildren(dojo.byId('tblAddressResults'));

                        // Clear any staged search
                        clearTimeout(stagedSearch);

                        if (dojo.byId("txtAddress").value.trim().length > 0) {
                            // Stage a new search, which will launch if no new searches show up 
                            // before the timeout
                            stagedSearch = setTimeout(function () {
                                dojo.byId("imgSearchLoader").style.display = "block";
                                LocateAddress();
                                lastSearchedValue = dojo.byId("txtAddress").value.trim();
                            }, 500);
                        }
                    }
                } else {
                    lastSearchString = dojo.byId("txtAddress").value.trim();
                    dojo.byId("imgSearchLoader").style.display = "none";
                    dojo.empty(dojo.byId('tblAddressResults'));
                    CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
                }
            }
        }
    });

    dojo.connect(dojo.byId("txtAddress"), 'onpaste', function (evt) {
        setTimeout(function () {
            LocateAddress();
        }, 100);
    });

    dojo.connect(dojo.byId("txtAddress"), 'oncut', function (evt) {
        setTimeout(function () {
            LocateAddress();
        }, 100);
    });

    var responseObject = new js.config();

    defaultServiceTab = responseObject.DefaultServiceTab;
    tabHeaders = responseObject.TabHeaders;
    var tabValue = 0;
    for (var c in tabHeaders) {
        tabValue++;
        if (!tabHeaders[c]) {
            if (defaultServiceTab == (tabValue - 1)) {
                alert("A hidden tab cannot be selected on load, so please set different values for defaultServiceTab(Tab selected on load) & tabHeaders(flags set to show/ hide tabs)");
                window.close();
            }
        }
    }

    var infoWindow = new mobile.InfoWindow({
        domNode: dojo.create("div", null, dojo.byId("map"))
    });

    map = new esri.Map("map", {
        slider: true,
        infoWindow: infoWindow
    });

    locatorSettings = responseObject.LocatorSettings;
    helpFileURL = responseObject.HelpURL;
    baseMapLayers = responseObject.BaseMapLayers;
    formatDateAs = responseObject.FormatDateAs;
    showNullValueAs = responseObject.ShowNullValueAs;
    mapSharingOptions = responseObject.MapSharingOptions;
    requestId = responseObject.ServiceRequest.LayerInfo.RequestId;
    commentId = responseObject.ServiceRequest.LayerInfo.CommentId;
    status = responseObject.Status;
    infoPopupHeight = responseObject.InfoPopupHeight;
    infoPopupWidth = responseObject.InfoPopupWidth;
    infoWindowHeader = responseObject.InfoWindowHeader;
    showCommentsTab = responseObject.ShowCommentsTab;
    commentsInfoPopupFieldsCollection = responseObject.CommentsInfoPopupFieldsCollection;
    shareQuery = responseObject.ShareQuery;
    socialMediaTitle = responseObject.SocialMediaTitle;
    alertLayerInfo = responseObject.Alerts.LayerInfo;
    serviceRequestLayerInfo = responseObject.ServiceRequest.LayerInfo;
    socialMediaInfo = responseObject.SocialMedia.LayerInfo;
    

    serviceRequestInfoPopupFields = responseObject.ServiceRequest.InfoPopupFieldsCollection;
    geometryService = new esri.tasks.GeometryService(responseObject.GeometryService);
    dojo.byId('imgApp').src = responseObject.ApplicationIcon;
    dojo.byId('lblAppName').innerHTML = responseObject.ApplicationName;
    dojo.byId('imgDirections').src = "images/details.png";
    dojo.byId('imgDirections').title = "Details";
    dojo.byId('imgDirections').style.display = "none";

    CreateBaseMapComponent();

    dojo.byId("divAddressContainer").style.display = "block";
    dojo.byId("divSplashScreenContent").style.width = "350px";
    dojo.byId("divSplashScreenContent").style.height = "290px";
    dojo.byId('divSplashContent').innerHTML = responseObject.SplashScreenMessage;

    dojo.byId('spanAlertInstructions').innerHTML = responseObject.Alerts.Instructions;
    dojo.byId('spanServiceRequestInstructions').innerHTML = responseObject.ServiceRequest.Instructions;
    dojo.byId('spanCommunityActivityDescription').innerHTML = responseObject.SocialMedia.Instructions;

    //     Set address search parameters
    dojo.byId("tdSearchAddress").innerHTML = responseObject.LocatorSettings.Locators[0].DisplayText;
    dojo.byId("tdSearchServiceId").innerHTML = responseObject.LocatorSettings.Locators[1].DisplayText;
    dojo.byId("txtAddress").setAttribute("defaultAddress", responseObject.LocatorSettings.Locators[0].DefaultValue);
    dojo.byId('txtAddress').value = responseObject.LocatorSettings.Locators[0].DefaultValue;
    lastSearchString = dojo.byId("txtAddress").value.trim();
    dojo.byId("txtAddress").style.color = "gray";
    dojo.byId("txtAddress").setAttribute("defaultRequestId", responseObject.LocatorSettings.Locators[1].DefaultValue);

    dojo.connect(dojo.byId('txtAddress'), "ondblclick", ClearDefaultText);

    dojo.connect(dojo.byId('txtAddress'), "onfocus", function (evt) {
        this.style.color = "#FFF";
    });
    dojo.connect(dojo.byId('txtAddress'), "onblur", ReplaceDefaultText);

    dojo.connect(dojo.byId('imgHelp'), "onclick", function () {
        window.open(responseObject.HelpURL);
    });

    var query = windowURL.substring(windowURL.indexOf("?") + 1, windowURL.length);
    queryObject = dojo.queryToObject(query.replace(/@/g, "&"));

    defaultServiceTab = (queryObject.t) ? queryObject.t : responseObject.DefaultServiceTab;

    if (queryObject.a) {
        var alertIndexes = queryObject.a.split(",");
        for (var i in alertLayerInfo) {
            alertLayerInfo[i].isLayerVisible = false;
            alertLayerInfo[i].defaultTabOpen = false;
        }
        for (var i in alertIndexes) {
            alertLayerInfo[Number(alertIndexes[i])].isLayerVisible = true;
        }
        alertLayerInfo[Number(alertIndexes[i])].defaultTabOpen = true;
    } else if (queryObject.a === "") {
        for (var i in alertLayerInfo) {
            alertLayerInfo[i].isLayerVisible = false;
            alertLayerInfo[i].defaultTabOpen = false;
        }
    }
    if (queryObject.s) {
        socialMediaIndex = queryObject.s.split(",");
    }

    if (queryObject.sd) {
        if (queryObject.sd == "rbShowTodayFeeds") {
            dojo.byId('rbShowAllFeeds').checked = false;
            dojo.byId('rbShowTodayFeeds').checked = true;
        } else {
            dojo.byId('rbShowAllFeeds').checked = true;
            dojo.byId('rbShowTodayFeeds').checked = false;
        }
    }

    if (queryObject.f && queryObject.socialLayerID) {
        passedId = queryObject.f;
    }

    if (queryObject.objectId && queryObject.alertLayerID) {
        for (var index in alertLayerInfo) {
            if (alertLayerInfo[index].Key == queryObject.alertLayerID) {
                var layerIndex = index;
                var queryTask = new esri.tasks.QueryTask(alertLayerInfo[index].LayerURL);
                var query = new esri.tasks.Query();
                query.where = shareQuery.split("${0}")[0] + queryObject.objectId + shareQuery.split("${0}")[1];
                query.outFields = ["*"];
                query.outSpatialReference = map.spatialReference;
                query.returnGeometry = true;
                queryTask.execute(query, function (features) {
                    if (features.features[0].geometry.type == "point") {
                        mapPoint = features.features[0].geometry;
                    } else {

                        mapPoint = features.features[0].geometry.getExtent().getCenter();
                    }
                    setTimeout(function () {
                        for (var i in features.features[0].attributes) {
                            if (!features.features[0].attributes[i]) {
                                features.features[0].attributes[i] = showNullValueAs;
                            }
                        }
                        var dateFields = alertLayerInfo[layerIndex].DateFields.split(",");
                        for (var j = 0; j < dateFields.length; j++) { //check for date type attributes and format date
                            if (features.features[0].attributes[dateFields[j]]) {
                                var timeStamp = features.features[0].attributes[dateFields[j]];
                                var date = new js.date();
                                var utcMilliseconds = Number(timeStamp);

                                features.features[0].attributes[dateFields[j]] = date.utcTimestampFromMs(utcMilliseconds).toDateString();
                            }
                        }
                        ShowAlertsInfoWindow(alertLayerInfo[layerIndex].InfoWindowHeader, alertLayerInfo[layerIndex].InfoWindowFields, alertLayerInfo[layerIndex].InfoWindowSize, mapPoint, features.features[0].attributes, alertLayerInfo[layerIndex].Key);
                    }, 500);

                });
            }
        }
    }
    var mapExtent = responseObject.DefaultExtent;
    var zoomExtent;
    zoomExtent = mapExtent.split(',');
    var extent = GetQuerystring('e');
    if (extent != "") {
        zoomExtent = extent.split(',');
    }
    startExtent = new esri.geometry.Extent(parseFloat(zoomExtent[0]), parseFloat(zoomExtent[1]), parseFloat(zoomExtent[2]), parseFloat(zoomExtent[3]), new esri.SpatialReference({
        wkid: 102100
    }));
    map.setExtent(startExtent);
    dojo.connect(map, "onLoad", MapInitFunction);
    CreateScrollbar(dojo.byId('divAlertInstructionsContainer'), dojo.byId('divAlertInstructionsContent'));
    CreateScrollbar(dojo.byId('divServiceRequestInstructionsContainer'), dojo.byId('divServiceRequestInstructionsContent'));
    CreateScrollbar(dojo.byId('divSocialMediaInstructionsContainer'), dojo.byId('divSocialMediaInstructionsContent'));

    var headerText = responseObject.TabHeaderText;
    dojo.query(".tabContent", dojo.byId('divServiceTabContainer')).forEach(function (header, i) {
        header.setAttribute("header", headerText[i].trimString(18));
        header.setAttribute("headertitle", headerText[i]);
    });

    CreateTabContainer('divServiceTabContainer');

    ActivateTab('divServiceTabContainer', 0, false);

    var attributes = responseObject.SocialMedia.MediaSearchAttributes.split(",");
    for (var i in attributes) {
        socialMediaAttributes[attributes[i]] = "";
    }

    CreateAccordian(dojo.byId('divAccordianContainer'), alertLayerInfo);

    for (var i in alertLayerInfo) {
        if (alertLayerInfo[i].defaultTabOpen) {
            defaultAlertServicePanel = i;
            dojo.byId(alertLayerInfo[i].Key).style.display = 'block';
            currentAccordianTab = alertLayerInfo[i].Key;
            SetAccordionContainerHeight(alertLayerInfo[i].Key);
            if (!alertLayerInfo[i].isLayerVisible) {
                alertLayerInfo[i].isLayerVisible = true;
                dojo.byId("chk" + alertLayerInfo[i].Key).checked = true;
            }
            break;
        }
    }
    dojo.byId('tableServiceRequestDetails').style.display = 'block';
    dojo.byId('tableSocialMediaOptions').style.display = "block";
}

//function for map initialized
function MapInitFunction() {
    if (dojo.query('.logo-med', dojo.byId('map')).length > 0) {
        dojo.query('.logo-med', dojo.byId('map'))[0].id = "esriLogo";
    } else if (dojo.query('.logo-sm', dojo.byId('map')).length > 0) {
        dojo.query('.logo-sm', dojo.byId('map'))[0].id = "esriLogo";
    }

    dojo.addClass("esriLogo", "esriLogo");
    //setting Map slider position
    if (dojo.byId('map_zoom_slider')) {
        dojo.byId('map_zoom_slider').style.height = '150px';
        dojo.byId('map_zoom_slider').style.top = '175px';
        dojo.byId('map_zoom_slider').style.left = '415px';
    }

    dojo.byId('divSplashScreenContainer').style.display = "block";
    dojo.addClass(dojo.byId('divSplashScreenContent'), "divSplashScreenDialogContent");
    SetSplashScreenHeight();
    CreateRatingWidget(dojo.byId('commentRating'));

    var gLayer = new esri.layers.GraphicsLayer();
    gLayer.id = tempGraphicsLayerId;
    map.addLayer(gLayer);
    AddAlertLayersOnMap();

    AddServiceRequestLayerOnMap();

    CreateSocialMediaItems();

    glayer = new esri.layers.GraphicsLayer();
    glayer.id = tempPolygonSelectLayerId;
    map.addLayer(glayer);

    glayer = new esri.layers.GraphicsLayer();
    glayer.id = tempGlowLayerId;
    map.addLayer(glayer);

    glayer = new esri.layers.GraphicsLayer();
    glayer.id = tempServiceRequestLayerId;
    map.addLayer(glayer);

    dojo.connect(map, "onExtentChange", function (evt) {
        if (selectedGraphic) {
            var screenPoint = map.toScreen(selectedGraphic);
            screenPoint.y = map.height - screenPoint.y;
            map.infoWindow.setLocation(screenPoint);
            return;
        }
    });

    var tab = false;
    for (var t in tabHeaders) {
        if (t == "Information") {
            if (!tabHeaders[t]) {
                dojo.byId("tab" + 0).style.display = "none";
            }
            else {
                tab = true;
                ActivateTab('divServiceTabContainer', 0, true);
            }
        }
        else if (t == "RequestService") {
            if (!tabHeaders[t]) {
                dojo.byId("tab" + 1).style.display = "none";
            }
            else {
                if (!tab) {
                    tab = true;
                    ActivateTab('divServiceTabContainer', 1, true);
                }
            }
        }
        else {
            if (!tabHeaders[t]) {
                dojo.byId("tab" + 2).style.display = "none";
            }
            else {
                if (!tab) {
                    tab = true;
                    ActivateTab('divServiceTabContainer', 2, true);
                }
            }
        }
    }

    if (!tab) {
        AnimateDetailsView();
        dojo.byId("divToggleDetail").style.cursor = "default";
        dojo.byId("divToggleDetail").title = "";
    }

}

dojo.addOnLoad(init);