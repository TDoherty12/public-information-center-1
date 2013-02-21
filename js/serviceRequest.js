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
var selectedRequestID;

//Add service request layer on map
function AddServiceRequestLayerOnMap() {
    var serviceRequestLayer = new esri.layers.FeatureLayer(serviceRequestLayerInfo.LayerURL, {
        mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: [serviceRequestLayerInfo.OutFields],
        id: serviceRequestLayerInfo.Key,
        displayOnPan: false,
        visible: false
    });
    map.addLayer(serviceRequestLayer);

    if (defaultServiceTab == 1) {
        ShowProgressIndicator();
    }
    var serviceRequestLayerHandle = dojo.connect(serviceRequestLayer, "onUpdateEnd", function (features) {
        AddServiceLegendItem(this);
        PopulateRequestTypes(serviceRequestLayer.fields);
        HideProgressIndicator();
        if (queryObject.featureID) {
            ExecuteQueryTask(queryObject.featureID);
        }
    });

    dojo.connect(serviceRequestLayer, "onClick", function (evt) {
        selectedGraphic = null;
        map.infoWindow.hide();
        map.getLayer(tempGraphicsLayerId).clear();

        //For cancelling event propagation
        evt = (evt) ? evt : event;
        evt.cancelBubble = true;
        if (evt.stopPropagation) {
            evt.stopPropagation();
        }
        ShowProgressIndicator();
        ShowServiceRequestDetails(evt.graphic.geometry, evt.graphic.attributes);
        HideProgressIndicator();
    });

    dojo.connect(serviceRequestLayer, "onMouseOver", function (evt) {
        map.setMapCursor('pointer');
    });

    dojo.connect(serviceRequestLayer, "onMouseOut", function (evt) {
        map.setMapCursor('crosshair');
    });

    var serviceRequestCommentLayer = new esri.layers.FeatureLayer(serviceRequestLayerInfo.CommentsLayerURL, {
        mode: esri.layers.FeatureLayer.MODE_SELECTION,
        outFields: [serviceRequestLayerInfo.CommentsOutFields],
        id: serviceRequestLayerInfo.Key + "Comments"
    });
    map.addLayer(serviceRequestCommentLayer);
}

//Show infowindow
function ShowServiceRequestDetails(mapPoint, attributes) {
    featureID = attributes[map.getLayer(serviceRequestLayerInfo.Key).objectIdField];
    dojo.byId('divInfoDetails').style.position = "relative";
    RemoveScrollBar(dojo.byId('divInfoWindowDetails'));
    for (var i in attributes) {
        if (!attributes[i]) {
            attributes[i] = "";
        }
    }
    dojo.byId('divInfoWindowContent').style.display = "none";
    dojo.byId('divSocialInfoContent').style.display = "none";
    dojo.byId('divInfoContent').style.display = "none";
    map.infoWindow.resize(infoPopupWidth, infoPopupHeight);

    selectedServiceStatus = dojo.string.substitute(status, attributes);

    map.setExtent(GetBrowserMapExtent(mapPoint));
    setTimeout(function () {
        selectedGraphic = mapPoint;
        var screenPoint = map.toScreen(selectedGraphic);
        screenPoint.y = map.height - screenPoint.y;

        map.infoWindow.show(screenPoint);
        dojo.byId('divInfoContent').style.display = "block";
        dojo.byId('divInfoContent').style.height = "100%";
        ServiceRequestDetails(attributes);
    }, 500);
}

//Create service request details view
function ServiceRequestDetails(attributes) {
    ShowInfoDirectionsView();
    dojo.byId('divInfoContent').style.display = "block";
    dojo.byId("divInfoDetails").style.display = "block";
    RemoveChildren(dojo.byId('tblInfoDetails'));
    RemoveChildren(dojo.byId('divCommentsContent'));
    RemoveChildren(dojo.byId('divInfoAttachmentsScroll'));

    value = dojo.string.substitute(infoWindowHeader, attributes).trim();
    value = value.trimString(Math.round(infoPopupWidth / 6));

    if (value.length > Math.round(infoPopupWidth / 6)) {
        dojo.byId('tdInfoHeader').title = dojo.string.substitute(infoWindowHeader, attributes);
    }
    dojo.byId('tdInfoHeader').innerHTML = value;
    var tblInfoDetails = dojo.byId('tblInfoDetails');
    var tbody = document.createElement("tbody");
    tblInfoDetails.appendChild(tbody);
    var date = new js.date();
    for (var index in serviceRequestInfoPopupFields) {
        switch (serviceRequestInfoPopupFields[index].DataType) {
            case "string":
                tbody.appendChild(CreateTableRow(serviceRequestInfoPopupFields[index].DisplayText, dojo.string.substitute(serviceRequestInfoPopupFields[index].AttributeValue, attributes)));
                break;
            case "date":
                var utcMilliseconds = Number(dojo.string.substitute(serviceRequestInfoPopupFields[index].AttributeValue, attributes));
                tbody.appendChild(CreateTableRow(serviceRequestInfoPopupFields[index].DisplayText, dojo.date.locale.format(date.utcToLocal(date.utcTimestampFromMs(utcMilliseconds)), {
                    datePattern: serviceRequestInfoPopupFields[index].dateFormat,
                    selector: "date"
                })));
                break;
        }
    }
    FetchRequestComments(dojo.string.substitute(requestId, attributes));
    FetchAttachmentDetails(attributes[map.getLayer(serviceRequestLayerInfo.Key).objectIdField]);
    SetViewDetailsHeight();
}

//Set height for view details in info window
function SetViewDetailsHeight() {
    var height = dojo.coords(dojo.byId('divInfoContent')).h;
    if (height > 0) {
        dojo.byId('divInfoDetailsScroll').style.height = (height - 55) + "px";
    }
    CreateScrollbar(dojo.byId("divInfoDetails"), dojo.byId("divInfoDetailsScroll"));
}

//Set height for attachment details in info window
function SetAttachmentsHeight() {
    var height = dojo.coords(dojo.byId('divInfoContent')).h;
    if (height > 0) {
        dojo.byId('divInfoAttachmentsScroll').style.height = (height - 55) + "px";
    }
    CreateScrollbar(dojo.byId("divInfoAttachments"), dojo.byId("divInfoAttachmentsScroll"));
}


//Fetch attachment details
function FetchAttachmentDetails(objectID) {
    map.getLayer(serviceRequestLayerInfo.Key).queryAttachmentInfos(objectID, function (files) {
        var fileTable = document.createElement("table");
        var fileTBody = document.createElement("tbody");
        fileTable.appendChild(fileTBody);

        for (var i = 0; i < files.length; i++) {
            if (files[i].contentType.indexOf("image") != 0) {
                fileTBody.appendChild(CreateData(files[i].name, files[i].url, files[i].size, files[i].contentType));
            }
        }

        for (var i = 0; i < files.length; i++) {
            if (files[i].contentType.indexOf("image") >= 0) {
                fileTBody.appendChild(CreateData(files[i].name, files[i].url, files[i].size, files[i].contentType));
            }
        }
        fileTable.appendChild(fileTBody);

        if (files.length == 0) {
            var trNoAttachments = document.createElement("tr");
            var tdNoAttachments = document.createElement("td");
            trNoAttachments.appendChild(tdNoAttachments);
            tdNoAttachments.innerHTML = "No attachments found.";
            fileTBody.appendChild(trNoAttachments);
        }
        dojo.byId("divInfoAttachmentsScroll").appendChild(fileTable);
    });
}

//Creating data for the attachments
function CreateData(text, attachmentURL, fileSize, contentType) {
    var filetr = document.createElement("tr");
    var filetd = document.createElement("td");
    if (contentType.indexOf("image") >= 0) {
        var filePreview = dojo.create("img");
        filePreview.style.width = "275px";
        filePreview.style.height = "275px";
        filePreview.style.cursor = "pointer";
        filePreview.src = attachmentURL;
        filePreview.onclick = function () {
            window.open(attachmentURL);
        }
        filetd.appendChild(filePreview);
    } else {
        var filespan = document.createElement("span");
        filespan.id = "fileTab";
        filespan.innerHTML = text;
        filespan.onclick = function () {
            window.open(attachmentURL);
        }

        filespan.className = 'spanFileDetails';
        filetd.appendChild(filespan);
    }
    filetr.appendChild(filetd);
    return filetr;
}

//Fetch service request comments
function FetchRequestComments(requestID) {
    var reqId;
    dojo.byId('btnAddComments').disabled = false;
    selectedRequestID = requestID;
    var query = new esri.tasks.Query();
    commentId.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key) {
        reqId = key;
    });
    query.where = reqId + "= '" + requestID + "'";
    query.outFields = ["*"];
    //execute query
    map.getLayer(serviceRequestLayerInfo.Key + "Comments").selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW, function (features) {
        var commentsTable = document.createElement("table");
        commentsTable.style.width = "95%";
        var commentsTBody = document.createElement("tbody");
        commentsTable.appendChild(commentsTBody);
        dojo.byId("divCommentsContent").appendChild(commentsTable);
        if (features.length > 0) {
            features.sort(SortResultFeatures); //function to sort comments based on submitted date
            for (var i = 0; i < features.length; i++) {
                var trComments = document.createElement("tr");
                var commentsCell = document.createElement("td");
                commentsCell.className = "bottomborder";
                commentsCell.appendChild(CreateCommentRecord(features[i].attributes, i));
                trComments.appendChild(commentsCell);
                commentsTBody.appendChild(trComments);
                CreateRatingWidget(dojo.byId('commentRating' + i));
                SetRating(dojo.byId('commentRating' + i), dojo.string.substitute(commentsInfoPopupFieldsCollection.Rank, features[i].attributes));
            }
            SetCommentHeight();
        } else {
            var trComments = document.createElement("tr");
            var commentsCell = document.createElement("td");
            commentsCell.appendChild(document.createTextNode("No comments available"));
            trComments.setAttribute("noComments", "true");
            trComments.appendChild(commentsCell);
            commentsTBody.appendChild(trComments);
        }
    }, function (err) { });
}

//Create comment record
function CreateCommentRecord(attributes, i) {
    var table = document.createElement("table");
    table.style.width = "100%";
    var tbody = document.createElement("tbody");
    var tr = document.createElement("tr");
    tbody.appendChild(tr);
    var td3 = document.createElement("td");
    td3.align = "left";
    td3.appendChild(CreateRatingControl(true, "commentRating" + i, 0, 5));
    var trDate = document.createElement("tr");
    tbody.appendChild(trDate);
    var td1 = document.createElement("td");
    var utcMilliseconds = Number(dojo.string.substitute(commentsInfoPopupFieldsCollection.Submitdate, attributes));
    var date = new js.date();
    td1.innerHTML = "Date: " + dojo.date.locale.format(date.utcToLocal(date.utcTimestampFromMs(utcMilliseconds)), {
        datePattern: formatDateAs,
        selector: "date"
    });
    td1.align = "left";
    td1.colSpan = 2;
    tr.appendChild(td3);
    trDate.appendChild(td1);
    var tr1 = document.createElement("tr");
    var td2 = document.createElement("td");
    td2.colSpan = 2;
    td2.id = "tdComment";
    td2.style.width = (infoPopupWidth - 40) + "px";
    td2.colSpan = 2;
    if (dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes)) {
        var wordCount = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/).length;
        if (wordCount > 1) {
            var value = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[0].length == 0 ? "<br>" : dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[0].trim();
            for (var c = 1; c < wordCount; c++) {
                var comment;
                if (value != "<br>") {
                    comment = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[c].trim().replace("", "<br>");
                } else {
                    comment = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[c].trim();
                }
                value += dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(/\n/)[c].length == 0 ? "<br>" : comment;
            }
        } else {
            value = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes);
        }
        td2.innerHTML += value;
        if (CheckMailFormat(dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes)) || dojo.string.substitute(dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes)).match("http:" || "https:")) {
            td2.className = "tdBreakWord";
        } else {
            td2.className = "tdBreak";
        }
        var x = dojo.string.substitute(commentsInfoPopupFieldsCollection.Comments, attributes).split(" ");
        for (var i in x) {
            w = x[i].getWidth(15) - 50;
            var boxWidth = infoPopupWidth - 40;
            if (boxWidth < w) {
                td2.className = "tdBreakWord";
                continue;
            }
        }
    } else {
        td2.innerHTML = showNullValueAs;
    }
    tr1.appendChild(td2);
    tbody.appendChild(tr1);
    table.appendChild(tbody);
    return table;
}

//Add service request comment
function AddRequestComment() {
    var text = dojo.byId('txtComments').value.trim();
    if (text == "") {
        dojo.byId('txtComments').focus();
        ShowSpanErrorMessage('spanCommentError', messages.getElementsByTagName("textComment")[0].childNodes[0].nodeValue);
        return;
    }
    if (text.length > 250) {
        dojo.byId('txtComments').focus();
        ShowSpanErrorMessage('spanCommentError', messages.getElementsByTagName("textCommentLimit")[0].childNodes[0].nodeValue);
        return;
    }
    var commentGraphic = new esri.Graphic();
    var date = new js.date();
    var attr = {
        "REQUESTID": selectedRequestID,
        "COMMENTS": text,
        "SUBMITDT": date.utcMsFromTimestamp(date.localToUtc(date.localTimestampNow())),
        "RANK": Number(dojo.byId('commentRating').value)
    };
    commentGraphic.setAttributes(attr);
    dojo.byId('btnAddComments').disabled = true;
    map.getLayer(serviceRequestLayerInfo.Key + "Comments").applyEdits([commentGraphic], null, null, function (msg) {
        if (msg[0].error) { } else {
            var table = dojo.query('table', dojo.byId("divCommentsContent"));
            if (table.length > 0) {
                var noComments = dojo.query("tr[noComments = 'true']", table[0]);
                if (noComments.length > 0) {
                    RemoveChildren(table[0]);
                }
                var tr = table[0].insertRow(0);
                var commentsCell = document.createElement("td");
                commentsCell.className = "bottomborder";
                commentsCell.title = attr.COMMENTS;
                var index = dojo.query("tr", table[0]).length;
                if (index) {
                    index = 0;
                }
                commentsCell.appendChild(CreateCommentRecord(attr, index));
                tr.appendChild(commentsCell);
                CreateRatingWidget(dojo.byId('commentRating' + index));
                SetRating(dojo.byId('commentRating' + index), attr.RANK);
            }
        }
        dojo.byId('btnAddComments').disabled = false;
        ResetCommentValues();
        HideProgressIndicator();
        SetCommentHeight();
    }, function (err) {
        dojo.byId('btnAddComments').disabled = false;
        HideProgressIndicator();
    });
}

//Sorting comments according to date
function SortResultFeatures(a, b) {
    var x = dojo.string.substitute(commentsInfoPopupFieldsCollection.Submitdate, a.attributes);
    var y = dojo.string.substitute(commentsInfoPopupFieldsCollection.Submitdate, b.attributes);
    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
}

//Create table row
function CreateTableRow(displayName, value) {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.innerHTML = displayName;
    td.style.height = "18px";
    td.style.width = "120px";
    td.vAlign = "middle";
    td.style.paddingTop = "5px";

    var td1 = document.createElement("td");
    td1.style.width = "180px";
    td1.style.paddingTop = "5px";
    if (displayName == "Comment:") {
        td.vAlign = "top";
        if (value == "") {
            value = messages.getElementsByTagName("noComment")[0].childNodes[0].nodeValue;
        } else {
            var wordCount = value.split(/\n/).length;
            if (wordCount > 1) {
                var value1 = value.split(/\n/)[0].length == 0 ? "<br>" : value.split(/\n/)[0].trim();
                for (var c = 1; c < wordCount; c++) {
                    var comment;
                    if (value1 != "<br>") {
                        comment = value.split(/\n/)[c].trim().replace("", "<br>");
                    } else {
                        comment = value.split(/\n/)[c].trim();
                    }
                    value1 += value.split(/\n/)[c].length == 0 ? "<br>" : comment;
                }
            } else {
                value1 = value;
            }
            td1.innerHTML += value1;
            if (CheckMailFormat(value) || dojo.string.substitute(value).match("http:" || "https:")) {
                td1.className = "tdBreakWord";
            } else {
                td1.className = "tdBreak";
            }
            var x = value.split(" ");
            for (var i in x) {
                w = x[i].getWidth(15) - 50;
                var boxWidth = infoPopupWidth - 40;
                if (boxWidth < w) {
                    td1.className = "tdBreakWord";
                    continue;
                }
            }
        }

    }
    td1.innerHTML = value;
    tr.appendChild(td);
    tr.appendChild(td1);
    return tr;
}

//Create service request details
function CreateServiceRequestDetails(attributes) {
    var divDetails = document.createElement("div");
    divDetails.id = "divDetailsContainer";
    divDetails.className = "divDetailsContainer";
    var divContent = document.createElement("div");
    divContent.id = "divDetailsContent";
    divContent.className = "divDetailsContent";
    var table = document.createElement("table");
    divContent.appendChild(table);

    divDetails.appendChild(divContent);

    table.cellspacing = 2;
    table.cellpadding = 1;
    table.style.fontSize = "11px";
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);

    for (var index in serviceRequestInfoPopupFields) {
        switch (serviceRequestInfoPopupFields[index].DataType) {
            case "string":
                tbody.appendChild(CreateTableRow(serviceRequestInfoPopupFields[index].DisplayText, dojo.string.substitute(serviceRequestInfoPopupFields[index].AttributeValue, attributes)));
                break;
            case "description":
                tr = document.createElement("tr");
                td = document.createElement("td");
                td.colSpan = 2;

                var divDescriptionContainer = document.createElement("div");
                divDescriptionContainer.id = serviceRequestInfoPopupFields[index].Id + "Container";
                divDescriptionContainer.style.height = "55px";
                divDescriptionContainer.style.position = "relative";
                divDescriptionContainer.style.width = "260px";
                divDescriptionContainer.style.border = "1px solid #fff";

                var divDescriptionContent = document.createElement("div");
                divDescriptionContent.id = serviceRequestInfoPopupFields[index].Id + "Content";
                divDescriptionContent.style.width = '95%';
                divDescriptionContent.style.position = "absolute";
                divDescriptionContent.style.height = "55px";
                divDescriptionContent.style.overflow = "hidden";
                divDescriptionContent.className = "wordBreak";

                var spanRequestDesription = document.createElement("span");
                spanRequestDesription.innerHTML = dojo.string.substitute(serviceRequestInfoPopupFields[index].AttributeValue, attributes);

                divDescriptionContainer.appendChild(divDescriptionContent);
                divDescriptionContent.appendChild(spanRequestDesription);
                td.appendChild(divDescriptionContainer);
                tr.appendChild(td);
                tbody.appendChild(tr);
                infoWindowDescriptionFields[divDescriptionContainer.id] = divDescriptionContent.id;
                break;
            case "date":
                var date = new js.date();
                var utcMilliseconds = Number(dojo.string.substitute(serviceRequestInfoPopupFields[index].AttributeValue, attributes));
                tbody.appendChild(CreateTableRow(serviceRequestInfoPopupFields[index].DisplayText, dojo.date.locale.format(date.utcToLocal(date.utcTimestampFromMs(utcMilliseconds)), {
                    datePattern: serviceRequestInfoPopupFields[index].dateFormat,
                    selector: "date"
                })));
                break;
        }
    }
    return divDetails;
}

//Reset comments fields
function ResetCommentFields() {
    dojo.byId('txtComments').value = '';
    dojo.byId('spanCommentError').style.display = "none";
    SetRating(dojo.byId('commentRating'), 0);
}

//Populate Service request types
function PopulateRequestTypes(serviceRequestLayerFields) {
    var serviceRequestFields
    for (var i = 0; i < serviceRequestLayerFields.length; i++) {
        if (serviceRequestLayerFields[i].name == serviceRequestLayerInfo.RequestTypeFieldName) {
            serviceRequestFields = serviceRequestLayerFields[i].domain.codedValues;
            break;
        }
    }

    var serviceRequestTypes = {
        identifier: "id",
        items: []
    };
    for (var i = 0; i < serviceRequestFields.length; i++) {
        serviceRequestTypes.items[i] = {
            id: serviceRequestFields[i].name,
            name: serviceRequestFields[i].name
        };
    }
    serviceRequestTypes.items.sort(function (a, b) {
        var x = a.name;
        var y = b.name;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    var serviceRequestStore = new dojo.data.ItemFileReadStore({
        data: serviceRequestTypes
    });
    dijit.byId('cbRequestType').attr('store', serviceRequestStore);
}

//Hide the request service layer
function ToggleServiceRequestLayer(isLayerVisible) {
    dojo.byId('tableSocialMediaStatus').style.display = "none";
    arrFeeds = [];
    if (!queryObject.sd) {
        dojo.byId('rbShowAllFeeds').checked = true;
    }
    if (isLayerVisible) {
        dojo.byId('spanServiceErrorMessage').style.display = 'none';
        dojo.byId('divServiceRequestLegend').style.display = "block";
        map.getLayer(serviceRequestLayerInfo.Key).show();
    } else {
        dojo.byId('divServiceRequestLegend').style.display = "none";
        map.getLayer(serviceRequestLayerInfo.Key).hide();
    }
}

//Add Service request legend items
function AddServiceLegendItem(layer) {
    var table = dojo.byId("tableServiceRequestLegend");
    if (layer.renderer.infos[0].symbol.url) {
        serviceRequestSymbolURL = layer.renderer.infos[0].symbol.url;
    } else {
        serviceRequestSymbolStyle = layer.renderer.infos[0].symbol.style;
        serviceRequestSymbolSize = layer.renderer.infos[0].symbol.size;
        serviceRequestSymbolOutlineStyle = layer.renderer.infos[0].symbol.outline.style;
        serviceRequestSymbolOutlineColor = layer.renderer.infos[0].symbol.outline.color;
        serviceRequestSymbolOutlineWidth = layer.renderer.infos[0].symbol.outline.width;
        serviceRequestSymbolColor = layer.renderer.infos[0].symbol.color;
    }

    for (var i = 0; i < layer.renderer.infos.length; i++) {
        var tr = table.insertRow(0);
        var td = document.createElement("td");
        if (layer.renderer.infos[i].symbol.url) {
            var image = CreateImage(layer.renderer.infos[i].symbol.url, "", false, layer.renderer.infos[i].symbol.width, layer.renderer.infos[i].symbol.height);
        } else {
            var image = CreateCircleElement(layer.renderer.infos[i].symbol.color.toHex(), layer.renderer.infos[i].symbol.size, layer.renderer.infos[i].symbol.outline.color.toHex());
        }
        td.appendChild(image);
        td.vAlign = "middle";
        tr.appendChild(td);
        var td1 = document.createElement("td");
        td1.innerHTML = layer.renderer.infos[i].label;
        td1.vAlign = "middle";
        tr.appendChild(td1);
    }
}

//Reset values in the request service tab
function ResetRequestValues() {
    map.infoWindow.hide();
    map.setMapCursor('crosshair');
    map.getLayer(tempServiceRequestLayerId).clear();
    RemoveChildren(dojo.byId('tblFileSelect'));
    RemoveChildren(dojo.byId('tblFileList'));
    CreateScrollbar(dojo.byId('divFileUploadList'), dojo.byId('divFileUploadContent'));
    dojo.byId('tblFileSelect').setAttribute("rowindex", 0);
    dijit.byId('cbRequestType').setValue("");
    dojo.byId('txtDescription').value = "";
    dojo.byId('txtName').value = "";
    dojo.byId('txtMail').value = "";
    dojo.byId('txtPhone').value = "";
    dojo.byId('spanServiceErrorMessage').innerHTML = "";
    dojo.byId('spanServiceErrorMessage').style.display = "none";
    AddFileUpload();
}

//Add fileupload row
function AddFileUpload() {
    var table = dojo.byId('tblFileSelect');
    var tbody = table.getElementsByTagName("tbody")[0];
    if (!tbody) {
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
    }
    var tr = document.createElement("tr");
    var td = document.createElement("td");

    tr.appendChild(td);
    tbody.appendChild(tr);

    var rowIndex = table.getAttribute("rowindex");
    tr.id = "trUploadFile" + rowIndex;
    var cloneNode = document.getElementById("divFileSelectComponent").cloneNode(true);
    cloneNode.style.display = "block";
    cloneNode.id = null;
    dojo.query("[id='formFileUplaod']", cloneNode)[0].id = "formFileUpload" + rowIndex;
    var fileUplaodControl = dojo.query("[id='fileUploadControl']", cloneNode)[0];
    var relatedElement = dojo.query("[id='txtFileName']", cloneNode)[0];
    fileUplaodControl.onchange = function () {
        if (this.value.lastIndexOf("\\") > 0) {
            relatedElement.value = this.value.substring(this.value.lastIndexOf("\\") + 1);
        } else {
            relatedElement.value = this.value;
        }
        tr.style.display = "none";
        AddFileUpload();
        AddFileListItem(relatedElement.value, rowIndex);
    };

    td.appendChild(cloneNode);
    table.setAttribute("rowindex", (Number(rowIndex) + 1));
}

//Create fileupload list
function AddFileListItem(fileName, index) {
    var table = dojo.byId('tblFileList');
    var tbody = table.getElementsByTagName("tbody")[0];
    if (!tbody) {
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
    }
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var td1 = document.createElement("td");

    tr.appendChild(td);
    tr.appendChild(td1);
    tbody.appendChild(tr);

    var spanFileName = document.createElement("span");
    spanFileName.innerHTML = fileName.trimString(30);

    td.appendChild(spanFileName);

    var spanDelete = document.createElement("span");
    spanDelete.innerHTML = "( " + "<img style='width: 12px; height:12px; vertical-align:middle;' src='images/delete.png'/>" + " )";
    spanDelete.title = "Remove the selected file";
    td1.appendChild(spanDelete);
    spanDelete.style.cursor = "pointer";
    spanDelete.onclick = function () {
        tbody.removeChild(tr);
        var tblFileSelect = dojo.byId('tblFileSelect');
        var tbodyFileSelect = tblFileSelect.getElementsByTagName("tbody")[0];
        var trFileSelect = dojo.byId('trUploadFile' + index);
        tbodyFileSelect.removeChild(trFileSelect);

        if (dojo.byId('divFileUploadContent').scrollHeight > 58) {
            CreateScrollbar(dojo.byId('divFileUploadList'), dojo.byId('divFileUploadContent'));
            dojo.byId('divFileUploadContent').scrollTop = dojo.byId('divFileUploadContent').scrollHeight;
            dojo.byId("divFileUploadListscrollbar_handle").style.top = dojo.coords(dojo.byId('divFileUploadList')).h - dojo.coords(dojo.byId('divFileUploadListscrollbar_handle')).h + "px"
        } else {
            var container = dojo.byId('divFileUploadList');
            if (dojo.byId(container.id + 'scrollbar_track')) {
                RemoveChildren(dojo.byId(container.id + 'scrollbar_track'));
                container.removeChild(dojo.byId(container.id + 'scrollbar_track'));
            }
        }
    }

    if (dojo.byId('divFileUploadContent').scrollHeight > 58) {
        CreateScrollbar(dojo.byId('divFileUploadList'), dojo.byId('divFileUploadContent'));
        dojo.byId('divFileUploadContent').scrollTop = dojo.byId('divFileUploadContent').scrollHeight;
        dojo.byId("divFileUploadListscrollbar_handle").style.top = dojo.coords(dojo.byId('divFileUploadList')).h - dojo.coords(dojo.byId('divFileUploadListscrollbar_handle')).h + "px"
    }
}

//Validate request type
function ValidateRequestType() {
    if (!dijit.byId('cbRequestType').item) {
        dijit.byId('cbRequestType').setValue("");
    }
}

//Create service request
function CreateServiceRequest() {
    if (map.getLayer(tempServiceRequestLayerId).graphics.length == 0) {
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("mapLocation")[0].childNodes[0].nodeValue);
        return false;
    }

    if (ValidateRequestData()) {
        ShowProgressIndicator();
        var mapPoint = map.getLayer(tempServiceRequestLayerId).graphics[0].geometry;
        var date = new js.date();
        var serviceRequestAttributes = {
            "REQUESTTYPE": dijit.byId("cbRequestType").value,
            "COMMENTS": dojo.byId('txtDescription').value.trim(),
            "NAME": dojo.byId('txtName').value.trim(),
            "PHONE": dojo.byId('txtPhone').value.trim(),
            "EMAIL": dojo.byId('txtMail').value.trim(),
            "STATUS": "Unassigned",
            "REQUESTDATE": date.utcMsFromTimestamp(date.localToUtc(date.localTimestampNow()))
        };
        var serviceRequestGraphic = new esri.Graphic(mapPoint, null, serviceRequestAttributes, null);
        map.getLayer(serviceRequestLayerInfo.Key).applyEdits([serviceRequestGraphic], null, null, function (addResults) {
            if (addResults[0].success) {
                var objectIdField = map.getLayer(serviceRequestLayerInfo.Key).objectIdField;
                var requestID = {
                    "REQUESTID": String(addResults[0].objectId)
                };
                requestID[objectIdField] = addResults[0].objectId;
                var requestGraphic = new esri.Graphic(mapPoint, null, requestID, null);
                map.getLayer(serviceRequestLayerInfo.Key).applyEdits(null, [requestGraphic], null, function () {
                    serviceRequestGraphic.attributes["REQUESTID"] = String(addResults[0].objectId);
                    AddAttachments(addResults[0].objectId, mapPoint, serviceRequestGraphic.attributes);
                }, function (err) {
                    ResetRequestValues();
                    HideProgressIndicator();
                });
            }
        }, function (err) {
            ResetRequestValues();
            HideProgressIndicator();
        });
    }
}

//Add attachments
function AddAttachments(objectID, mapPoint, requestId) {
    var attachmentCount = 0;
    var forms = dojo.query('form', dojo.byId('tblFileSelect'));
    if (forms.length == 0) {
        ResetRequestValues();
        ShowServiceRequestDetails(mapPoint, requestId);
        HideProgressIndicator();
        return;
    }
    for (var i = 0; i < forms.length; i++) {
        var inputFeild = dojo.query("input", forms[i]);
        if (inputFeild[0].value != "") {
            map.getLayer(serviceRequestLayerInfo.Key).addAttachment(objectID, forms[i], function (sucess) {
                attachmentCount++;
                if (attachmentCount == forms.length) {
                    ResetRequestValues();
                    ShowServiceRequestDetails(mapPoint, requestId);
                    HideProgressIndicator();
                }
            },

            function (error) {
                attachmentCount++;
                if (attachmentCount == forms.length) {
                    ResetRequestValues();
                    ShowServiceRequestDetails(mapPoint, requestId);
                    HideProgressIndicator();
                    alert("Service request has been created without attachment because the file type is not accepted");
                }
            });
        } else {
            attachmentCount++;
            if (attachmentCount == forms.length) {
                ResetRequestValues();
                ShowServiceRequestDetails(mapPoint, requestId);
                HideProgressIndicator();
            }
        }
    }
}

//Validate service request data
function ValidateRequestData() {
    if (dijit.byId("cbRequestType").getValue() == "") {
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgType")[0].childNodes[0].nodeValue);
        return false;
    }
    if (dojo.byId('txtDescription').value.trim().length > 0 && dojo.byId('txtDescription').value.trim().length > 250) {
        dojo.byId('txtDescription').focus();
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgLength")[0].childNodes[0].nodeValue);
        return false;
    }
    if (dojo.byId('txtName').value.trim() != 0) {
        if (dojo.byId('txtName').value.trim().length > 50) {
            dojo.byId('txtName').focus();
            ShowSpanErrorMessage('spanServiceErrorMessage', messages.getElementsByTagName("exceededName")[0].childNodes[0].nodeValue);
            return;
        }
        if (!IsName(dojo.byId('txtName').value.trim())) {
            dojo.byId('txtName').focus();
            ShowSpanErrorMessage('spanServiceErrorMessage', messages.getElementsByTagName("spanErrorMsgText")[0].childNodes[0].nodeValue);
            return;
        }
    }
    if (dojo.byId('txtMail').value.trim() == '' && dojo.byId('txtPhone').value.trim() == '') {
        ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgPhoneEmail")[0].childNodes[0].nodeValue);
        return;
    }
    if (dojo.byId('txtMail').value.trim() != '') {
        if (!CheckMailFormat(dojo.byId('txtMail').value.trim())) {
            dojo.byId('txtMail').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidEmail")[0].childNodes[0].nodeValue);
            return;
        }
    }
    if (dojo.byId('txtPhone').value.trim() == '') {
        if (!CheckMailFormat(dojo.byId('txtMail').value.trim())) {
            dojo.byId('txtMail').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidEmail")[0].childNodes[0].nodeValue);
            return false;
        }
        if (dojo.byId('txtMail').value.trim().length > 100) {
            dojo.byId('txtMail').focus();
            ShowSpanErrorMessage('spanServiceErrorMessage', messages.getElementsByTagName("exceededMail")[0].childNodes[0].nodeValue);
            return;
        }
    } else if (dojo.byId('txtMail').value.trim() == '') {
        if (isNaN(dojo.byId('txtPhone').value.trim())) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
        if (dojo.byId('txtPhone').value.trim().length != 10) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
    }
    if (dojo.byId('txtPhone').value.trim().length > 0) {
        if (isNaN(dojo.byId('txtPhone').value.trim())) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
        if (dojo.byId('txtPhone').value.trim().length != 10) {
            dojo.byId('txtPhone').focus();
            ShowSpanErrorMessage("spanServiceErrorMessage", messages.getElementsByTagName("spanErrorMsgValidPhone")[0].childNodes[0].nodeValue);
            return false;
        }
    }
    return true;
}