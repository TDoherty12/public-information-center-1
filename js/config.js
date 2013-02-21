/** @license
| Version 10.1.1
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
dojo.provide("js.config");
dojo.declare("js.config", null, {

    // This file contains various configuration settings for "Citizen Service Portal" template
    //
    // Use this file to perform the following:

    // 1.  Specify application title                  - [ Tag(s) to look for: ApplicationName ]
    // 2.  Set path for application icon              - [ Tag(s) to look for: ApplicationIcon ]
    // 3.  Set splash screen message                  - [ Tag(s) to look for: SplashScreenMessage ]
    // 4.  Set URL for help page                      - [ Tag(s) to look for: HelpURL ]
    // 5.  Specify URLs for basemaps                  - [ Tag(s) to look for: BaseMapLayers ]
    // 6.  Set initial map extent                     - [ Tag(s) to look for: DefaultExtent ]
    // 7.  Customize data formatting                  - [ Tag(s) to look for: ShowNullValueAs]   
    // 8. Set URL for geometry service                - [ Tag(s) to look for: GeometryService ]
    // 9.  Specify URL(s) for operational layers      - [ Tag(s) to look for: ServiceRequest,CommentsLayer]
    // 10. Customize info-Window settings             - [ Tag(s) to look for: InfoWindowHeader ]
    // 10a.Customize info-Popup settings              - [ Tag(s) to look for: InfoPopupFieldsCollection]
    // 11.  Customize address search settings         - [ Tag(s) to look for: LocatorURL]
    // 12. Specify URLs for map sharing               - [ Tag(s) to look for: FacebookShareURL, TwitterShareURL, ShareByMailLink ]
    // 12a.In case of changing the TinyURL service
    //     Specify URL for the new service            - [ Tag(s) to look for: MapSharingOptions (set MapSharingOptions, TinyURLResponseAttribute) ]


    // ------------------------------------------------------------------------------------------------------------------------
    // GENERAL SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    //Application name to be displayed in the application header.
    ApplicationName: "<b>Public Information Center</b>",

    //Application icon to be displayed in the application header.
    ApplicationIcon: "images/PubInfoLogo.png",

    //Application start splash screen message.
    SplashScreenMessage: "Lorem ipsum dolor sit er elit lamet, consectetaur cillium adipisicing pecu, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Nam liber te conscient to factor tum poen legum odioque civiuda.",

    //Path for help file.
    HelpURL: "help.htm",

    // ------------------------------------------------------------------------------------------------------------------------
    // BASEMAP SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------
    // Set baseMap layers
    //Basemap layers:Basemap layer collection. (All the basemap’s need to be in the same spatial reference)
    BaseMapLayers: [{
        Key: "streetMap",
        ThumbnailSource: "images/Parcel map.png",
        Name: "Streets",
        MapURL: "http://localgovtemplates.esri.com/ArcGIS/rest/services/ParcelPublicAccess/MapServer"

    }, {
        Key: "imageryMap",
        ThumbnailSource: "images/Imagery Hybrid.png",
        Name: "Imagery",
        MapURL: "http://localgovtemplates.esri.com/ArcGIS/rest/services/ImageryHybrid/MapServer"
    }],

    //Default initial map extent.
    DefaultExtent: "-9815317.353,5126118.542,-9811259.298,5127735.811",

    // Set size of the info-Popup - select maximum height and width in pixels (not applicable for tabbed info-Popup)
    //minimum height should be 270 for the info-popup in pixels
    InfoPopupHeight: 310,

    //minimum width should be 330 for the info-popup in pixels 
    InfoPopupWidth: 330,

    // Set string value to be shown for null or blank values
    ShowNullValueAs: "N/A",

    //Note: Please set different values for defaultServiceTab & tabHeaders as tab selected on load & tab to be removed cannot be same
    //0 = Information, 1=RequestService, 2=SocialMedia
    //Set the value for the tab enabled on load
    DefaultServiceTab: 0,

    //Set the value for the tab to be removed on load as false
    TabHeaders: {
        Information: true,
        RequestService: true,
        SocialMedia: true
    },

    //Set the attribute for displaying status of serviceRequest
    Status: "${STATUS}",

    // Set Service Request Info-window title. Configure this with text/fields
    InfoWindowHeader: "Request ID: ${REQUESTID}",

    // Set Social Media Info-window title. Configure this with text/fields
    SocialMediaTitle: "${TITLE}",

    // Set this to true to show "Comments" tab in the info-Popup 
    ShowCommentsTab: true,

    // Set date format
    FormatDateAs: "MMM dd, yyyy",

    // Sets the object id for querying while sharing the infowindow for the alerts tab
    ShareQuery: "OBJECTID = '${0}'",

    // Set the title to be displayed on the tab header
    TabHeaderText: [
        "Information",
        "Request Service",
        "Social Media"],

    // Set info-pop fields for adding and displaying comment
    CommentsInfoPopupFieldsCollection: {
        Rank: "${RANK}",
        Submitdate: "${SUBMITDT}",
        Comments: "${COMMENTS}"
    },

    //Geometry service url
    GeometryService: "http://203.199.47.146/arcgis/rest/services/Utilities/Geometry/GeometryServer",

    // ------------------------------------------------------------------------------------------------------------------------
    // ServiceRequest
    // ------------------------------------------------------------------------------------------------------------------------
    ServiceRequest: {
        Instructions: "<br/><b>Submit a Request for Service:</b> <br/> <br/>Please search for an address or click directly on the map to locate your request for service. Then, provide details about the request below and click Submit to initiate your request. You'll be provided a Request # that can be used to track the status of your request. If you find a request has already been submitted by another party, you can click on the existing request, provide additional comments and increase the importance of the request.<br /><br/><b>Please note:</b> Attachments can be used to submit a photo, video or other document related to a service request.<br/>",
        LayerInfo: {
            Key: "serviceRequest",
            LayerURL: "http://arcgis-two-1334003536.us-west-1.elb.amazonaws.com/arcgis/rest/services/ServiceRequesthostsymbol/FeatureServer/0",
            OutFields: "*",
            RequestTypeFieldName: "REQUESTTYPE",
            //Set the attribute for requestID used for creating a new request
            RequestId: "${REQUESTID}",

            CommentsLayerURL: "http://arcgis-two-1334003536.us-west-1.elb.amazonaws.com/arcgis/rest/services/ServiceRequesthostsymbol/FeatureServer/1",
            CommentsOutFields: "*",
            //Set the primary key attribute for the comments
            CommentId: "${REQUESTID}"
        },

        // ------------------------------------------------------------------------------------------------------------------------
        //  SERVICE REQUEST INFO-POPUP SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------
        InfoPopupFieldsCollection: [{
            DisplayText: "Problem:",
            AttributeValue: "${REQUESTTYPE}",
            DataType: "string"
        }, {
            Id: "description",
            DisplayText: "Comment:",
            AttributeValue: "${COMMENTS}",
            DataType: "string"
        }, {
            DisplayText: "Date Submitted:",
            AttributeValue: "${REQUESTDATE}",
            DataType: "date",
            dateFormat: "MMM dd, yyyy"
        }, {
            DisplayText: "Status:",
            AttributeValue: "${STATUS}",
            DataType: "string"
        }]
    },

    // ------------------------------------------------------------------------------------------------------------------------
    // Alerts
    // ------------------------------------------------------------------------------------------------------------------------
    // Key: This is a unique value for the layer
    // DisplayText: Text to be displayed as Title in the accordian for the layer
    // LayerURL: Feature/Map service URL which is added to the alerts
    // RippleColor: Ripple color when feature is selected
    // isLayerVisible: true will make the layer visible when application is loaded
    // defaultTabOpen: true will open the accordian open. Only one accordian can be opened at a time.
    // DateFields: Date fields used in displaying data in the applicaiton. This is used for formatting date datetypes
    // ListViewFormat: Formatted text to be displayed for every feature in the layer
    // InfoWindowHeader: Infowindow header text
    // InfoWindowSize: Size of the infowindow to be displayed for the layer
    // InfoWindowFields: infowindow content to be displayed for feature. This is shown when feature is clicked
    // hasDefinitionExpression: true will apply a definition expression (filter condition) to the layer
    // DefinitionExpression: Definition expression (filter) to be applied to the layer. This will be applied only if hasDefinitionExpression is true
    // FilterDays: Permits DefinitionExpression to be dynamic. A date FilterDays before the current day is substituted into DefinitionExpression where it contains the text ${0}. In this case the DefinitionExpression should be of esriFieldTypeDate type field.
    // ------------------------------------------------------------------------------------------------------------------------
    Alerts: {
        Instructions: "<br/><b>General Information:</b> <br/> <br/>The location of construction projects, public notices or alerts, out of service hydrants, and main breaks can be found below.  You can turn on and off projects and assets in the left navigation pane.  When you find a project or asset you're interested in, select it from the list and it will be highlighted on the map.  If you click on an individual asset or project on the map, additional detail will be provided.",
        LayerInfo: [{
            Key: "capitalProjects",
            DisplayText: "City Construction Projects",
            LayerURL: "http://arcgis-two-1334003536.us-west-1.elb.amazonaws.com/arcgis/rest/services/InfrastructureAlertsHostSimple/MapServer/6",
            RippleColor: "#C35617",
            isLayerVisible: true,
            defaultTabOpen: true,
            OutFields: "*",
            DateFields: "PLANSTART,PLANEND",
            ListViewFormat: "<b>Project Name:</b> ${WORKID}<br/><b>Location:</b> ${LOCATION}<br/><b>Planned Start Date:</b> ${PLANSTART}",
            InfoWindowHeader: "${WORKID}",
            InfoWindowSize: "330,310",
            InfoWindowFields: "Location:${LOCATION},Project Status:${WORKSTATUS},Planned Start Date:${PLANSTART},Planned End Date:${PLANEND},Responsible Agency:${ASSIGNEDTO},Supervisor:${SUPERVISOR}",
            hasDefinitionExpression: false,
            DefinitionExpression: "",
            FilterDays: 0
        }, {
            Key: "externalAgencyProjects",
            DisplayText: "Private Utility and Transit Projects",
            LayerURL: "http://arcgis-two-1334003536.us-west-1.elb.amazonaws.com/arcgis/rest/services/InfrastructureAlertsHostSimple/MapServer/7",
            RippleColor: "#BCE954",
            isLayerVisible: false,
            defaultTabOpen: false,
            OutFields: "*",
            DateFields: "STARTDATE,ENDDATE",
            ListViewFormat: "<b>Project Name:</b> ${PROJNAME}<br/><b>Planned Start Date:</b> ${STARTDATE}",
            InfoWindowHeader: "${PROJNAME}",
            InfoWindowSize: "330,310",
            InfoWindowFields: "Planned Start Date:${STARTDATE},Planned End Date:${ENDDATE},Responsible Agency:${AGENCY},Contact:${CONTACTNAME},Phone:${PHONE},Email:${EMAIL}",
            hasDefinitionExpression: false,
            DefinitionExpression: "",
            FilterDays: 712
        }, {
            Key: "infrastructureAlerts",
            DisplayText: "Public Notices and Alerts",
            LayerURL: "http://arcgis-two-1334003536.us-west-1.elb.amazonaws.com/arcgis/rest/services/InfrastructureAlertsHostSimple/MapServer/5",
            RippleColor: "#C11B17",
            isLayerVisible: false,
            defaultTabOpen: false,
            OutFields: "*",
            DateFields: "START,ALERTEND",
            ListViewFormat: "<b>Alert Type:</b> ${ALERTTYPE}<br/><b>Description:</b> ${DESCRIPTION}<br/><b>Start:</b> ${START}<br/><b>End:</b> ${ALERTEND}<br/><b>Contact:</b> ${CONTACT}",
            InfoWindowHeader: "${ALERTTYPE}",
            InfoWindowSize: "330,310",
            InfoWindowFields: "Start:${START},End:${ALERTEND},Description:${DESCRIPTION},Contact Name:${CONTACT}",
            hasDefinitionExpression: false,
            DefinitionExpression: "",
            FilterDays: 0
        }, {
            Key: "leaksMainBreaks",
            DisplayText: "Water Main Leaks and Breaks",
            LayerURL: "http://arcgis-two-1334003536.us-west-1.elb.amazonaws.com/arcgis/rest/services/InfrastructureAlertsHostSimple/MapServer/2",
            RippleColor: "#C11B17",
            isLayerVisible: false,
            defaultTabOpen: false,
            OutFields: "*",
            DateFields: "LEAKSTART,LEAKEND",
            ListViewFormat: "<b>Problem Type:</b> ${LEAKTYPE}<br/><b>Start:</b> ${LEAKSTART}<br/><b>End:</b> ${LEAKEND}<br/><b>Total Gallons Lost:</b> ${TOTALGALL}",
            InfoWindowHeader: "${LEAKTYPE}",
            InfoWindowSize: "330,310",
            InfoWindowFields: "Description:${NOTES},Repair Status:${REPSTATUS},Start:${LEAKSTART},End:${LEAKEND},Total Gallons Lost:${TOTALGALL},Repair Method:${REPAIRMETH},Pipe Condition:${PIPECOND}",
            hasDefinitionExpression: true,
            DefinitionExpression: "REPSTATUS = 'In Progress'",
            FilterDays: null
        }, {
            Key: "sanitaryBackup",
            DisplayText: "Sewer Backups",
            LayerURL: "http://arcgis-two-1334003536.us-west-1.elb.amazonaws.com/arcgis/rest/services/InfrastructureAlertsHostSimple/MapServer/3",
            RippleColor: "#4AA02C",
            isLayerVisible: false,
            defaultTabOpen: false,
            OutFields: "*",
            DateFields: "BACKUPSTART,BACKUPEND",
            ListViewFormat: "<b>Start:</b> ${BACKUPSTART}<br/><b>End:</b> ${BACKUPEND}<br/><b>Repair Status:</b> ${REPSTATUS}",
            InfoWindowHeader: "Sewer Backups",
            InfoWindowSize: "330,310",
            InfoWindowFields: "Start:${BACKUPSTART},End:${BACKUPEND},Repair Status:${REPSTATUS},Total Gallons Lost:${TOTALGALL}",
            hasDefinitionExpression: false,
            DefinitionExpression: "",
            FilterDays: 0
        }, {
            Key: "sanitaryOverflow",
            DisplayText: "Sewer Overflows",
            LayerURL: "http://arcgis-two-1334003536.us-west-1.elb.amazonaws.com/arcgis/rest/services/InfrastructureAlertsHostSimple/MapServer/4",
            RippleColor: "#4AA02C",
            isLayerVisible: false,
            defaultTabOpen: false,
            OutFields: "*",
            DateFields: "OVRFLWSTART,OVRFLWEND",
            ListViewFormat: "<b>Start:</b> ${OVRFLWSTART}<br/><b>End:</b> ${OVRFLWEND}<br/><b>Repair Status:</b> ${REPSTATUS}",
            InfoWindowHeader: "Sewer Overflows",
            InfoWindowSize: "330,310",
            InfoWindowFields: "Start:${OVRFLWSTART},End:${OVRFLWEND},Repair Status:${REPSTATUS},Total Gallons Lost:${TOTALGALL}",
            hasDefinitionExpression: false,
            DefinitionExpression: "",
            FilterDays: 0
        }]
    },

    // ------------------------------------------------------------------------------------------------------------------------
    // SocialMedia
    // ------------------------------------------------------------------------------------------------------------------------
    SocialMedia: {
        Instructions: "<br/><b>Social Media Feeds:</b> <br/> <br/>You can also discover what is being said about events and activities happening in and around the City of Naperville by looking closer at social media feeds from <b>YouTube, Twitter and Flickr</b>. <br/> <br/><b>Please note:</b> <br/> <br/>This information is being provided directly from YouTube, Twitter and Flickr sources and is not filtered before being displayed in this application.<br/>",
        MediaSearchAttributes: "TIME,POINTY,POINTX,SEARCHTAG",
        LayerInfo: [{
            Key: "yt",
            DisplayText: "YouTube",
            imageURL: "images/YouTubePin.png",
            mediaDetail: 'Geotaggedvideosfilteredby"${0}"fromYouTube',
            searchTag: "Naperville",
            requireGeometry: true,
            FeedURL: "http://gdata.youtube.com/feeds/api/videos?q=${SEARCHTAG}&max-results=50&time=${TIME}&v=2&lr=en&location=${POINTY},${POINTX}&location-radius=30mi&alt=json",
            UseUTCDate: false,
            MonthRangeKey: "all_time",
            DayRangeKey: "today",
            DateFormat: "",
            CallBackParamName: "callback",
            FeedAttribute: "feed.entry",
            FeedSource: "content.src",
            FeedTitle: "title.$t",
            FeedID: "id.$t",
            FeedLocation: "georss$where.gml$Point.gml$pos.$t",
            FeedLocationSplit: " ",
            CheckValidFeed: "georss$where",
            CheckHyperLinks: false,
            InfoWindowSize: "330,310",
            InfoWindowTemplate: '<div style="text-align:center; margin:0 auto;"><object width="275" height="200"><param name="movie" value= ${CONTENT}></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src=${CONTENT} type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" wmode="transparent" width="225" height="225"></embed></object></div>'
        }, {
            Key: "tw",
            DisplayText: "Twitter",
            imageURL: "images/TwitterPin.png",
            mediaDetail: 'Geotaggedtweetsfilteredby"${0}"fromTwitter',
            searchTag: "Naperville",
            requireGeometry: true,
            FeedURL: "http://search.twitter.com/search.json?q=${SEARCHTAG}&since date=${TIME}&geocode=${POINTY}%2c${POINTX}%2c30mi&rpp=100&result_type=mixed",
            UseUTCDate: true,
            MonthRangeDays: 4,
            DateFormat: "yyyy-MM-dd",
            CallBackParamName: "callback",
            FeedAttribute: "results",
            FeedSource: "text",
            FeedTitle: "from_user",
            FeedID: "id",
            FeedLocation: "location",
            FeedLocationSplit: ",",
            CheckHyperLinks: true,
            InfoWindowSize: "330,310",
            InfoWindowTemplate: '${TITLE}says: <br/>${CONTENT}'
        }, {
            Key: "fl",
            DisplayText: "Flickr",
            imageURL: "images/FlickrPin.png",
            mediaDetail: 'Geotaggedphotosfilteredby"${0}"fromFlickr',
            searchTag: "Naperville",
            requireGeometry: false,
            FeedURL: "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=404ebea7d5bc27aa5251d1207620e99b&tags=${SEARCHTAG}&min_taken_date=${TIME}&accuracy=6&has_geo=1&extras=date_taken%2Call_extras%2Cgeo%2Cowner_name%2Clicense%2Co_dims&per_page=500&format=json",
            UseUTCDate: true,
            MonthRangeDays: 30,
            DateFormat: "yyyy-MM-dd",
            hasCustomFeedSource: true,
            CallBackParamName: "jsoncallback",
            FeedAttribute: "photos.photo",
            FeedSource: "http://farm${farm}.static.flickr.com/${server}/${id}_${secret}.jpg",
            FeedTitle: "title",
            FeedID: "id",
            FeedLatitude: "latitude",
            FeedLongitude: "longitude",
            CheckValidFeed: "latitude",
            CheckHyperLinks: false,
            InfoWindowSize: "330,310",
            InfoWindowTemplate: '<div style="text-align:center; margin:0 auto;"><img style="width:275px;height:180px;" src=${CONTENT}>'
        }]
    },

    // ------------------------------------------------------------------------------------------------------------------------
    // ADDRESS SEARCH SETTINGS
    // ------------------------------------------------------------------------------------------------------------------------

    LocatorSettings: {
        DefaultLocatorSymbol: "images/pushpin.png",
        MarkupSymbolSize: {
            width: 35,
            height: 35
        },
        Locators: [{
            DisplayText: "Address",
            DefaultValue: "971 Sylvan Cir,Naperville,IL,60540",
            LocatorParamaters: ["SingleLine"],
            LocatorURL: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Locators/TA_Address_NA_10/GeocodeServer",
            CandidateFields: "Loc_name, Score, Match_addr",
            DisplayField: "${Match_addr}",
            ZoomLevel: 7,
            AddressMatchScore: 80,
            LocatorFieldName: 'Loc_name',
            LocatorFieldValues: ["US_Streets", "US_StreetName"]
        }, {
            DisplayText: "Request ID",
            DefaultValue: "152",
            QueryString: "REQUESTID like '%${0}%'",
            DisplayField: "${REQUESTID}"
        }]
    },
       

    // ------------------------------------------------------------------------------------------------------------------------
    // SETTINGS FOR MAP SHARING
    // ------------------------------------------------------------------------------------------------------------------------
    // Set URL for TinyURL service, and URLs for social media
    MapSharingOptions: {
        TinyURLServiceURL: "http://api.bit.ly/v3/shorten?login=esri&apiKey=f53ad40a4f3baac4331e18da680c071c&uri=${0}&format=json",
        TinyURLResponseAttribute: "data.url",
        FacebookShareURL: "http://www.facebook.com/sharer.php?u=${0}&t=Public%20Information%20Center",
        TwitterShareURL: "http://twitter.com/home/?status=Public%20Information%20Center' ${0}",
        ShareByMailLink: "mailto:%20?subject=Public%20Information%20Center&body=${0}"
    }
});

