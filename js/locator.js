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
//Get candidate results for searched address/request id
function LocateAddress() {
    var thisSearchTime = lastSearchTime = (new Date()).getTime();
    dojo.byId("imgSearchLoader").style.display = "block";
    if (dojo.byId("tdSearchAddress").className.trim() == "tdSearchByAddress") {
        RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
        if (dojo.byId("txtAddress").value.trim() == '') {
            RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
            dojo.byId("imgSearchLoader").style.display = "none";
            RemoveChildren(dojo.byId('tblAddressResults'));
            CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
            if (dojo.byId("txtAddress").value != "") {
                alert(messages.getElementsByTagName("addressToLocate")[0].childNodes[0].nodeValue);
            }
            return;
        }
        var address = [];
        address[locatorSettings.Locators[0].LocatorParamaters[0]] = dojo.byId('txtAddress').value;

        var locator = new esri.tasks.Locator(locatorSettings.Locators[0].LocatorURL);
        locator.outSpatialReference = map.spatialReference;
        locator.addressToLocations(address, [locatorSettings.Locators[0].LocatorFieldName], function (candidates) {
            // Discard searches made obsolete by new typing from user
            if (thisSearchTime < lastSearchTime) {
                return;
            }
            ShowLocatedAddress(candidates);
        }, function (err) {
            dojo.byId("imgSearchLoader").style.display = "none";
        });
    } else {
        if (dojo.byId("txtAddress").value.trim() == '') {
            dojo.byId("imgSearchLoader").style.display = "none";
            RemoveChildren(dojo.byId('tblAddressResults'));
            CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
            if (dojo.byId("txtAddress").value != "") {
                alert(messages.getElementsByTagName("serviceToLocate")[0].childNodes[0].nodeValue);
            }
            return;
        } else {
            var query = new esri.tasks.Query();
            query.where = dojo.string.substitute(locatorSettings.Locators[1].QueryString, [dojo.byId("txtAddress").value.trim()]);
            map.getLayer(serviceRequestLayerInfo.Key).queryFeatures(query, function (featureSet) {
                if (thisSearchTime < lastSearchTime) {
                    return;
                }
                if (featureSet.features.length > 0) {
                    LocateServiceRequest(featureSet.features);
                } else {
                    RemoveChildren(dojo.byId('tblAddressResults'));
                    LoctorErrBack("invalidSearch");
                    dojo.byId("imgSearchLoader").style.display = "none";
                }
            }, function (err) {
                RemoveChildren(dojo.byId('tblAddressResults'));
                LoctorErrBack("invalidSearch");
                dojo.byId("imgSearchLoader").style.display = "none";
            });
        }
    }
}

//Populate candidate address list in address container
function ShowLocatedAddress(candidates) {
    RemoveChildren(dojo.byId('tblAddressResults'));
    CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
    if (dojo.byId("txtAddress").value.trim() == '') {
        dojo.byId('txtAddress').focus();
        RemoveChildren(dojo.byId('tblAddressResults'));
        RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
        dojo.byId("imgSearchLoader").style.display = "none";
        return;
    }

    if (candidates.length > 0) {
        var table = dojo.byId("tblAddressResults");
        var tBody = document.createElement("tbody");
        table.appendChild(tBody);
        table.cellSpacing = 0;
        table.cellPadding = 0;
        var candidatesLength = 0;

        for (var i = 0; i < candidates.length; i++) {
            var candidate = candidates[i];
            for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
                if (map.getLayer(baseMapLayers[bMap].Key).visible) {
                    var bmap = baseMapLayers[bMap].Key;
                }
            }
            if ((!map.getLayer(bmap).fullExtent.contains(candidates[i].location)) || (candidate.score < locatorSettings.Locators[0].AddressMatchScore)) {
                candidatesLength++;
            } else {
                for (j in locatorSettings.Locators[0].LocatorFieldValues) {
                    if (candidate.attributes[locatorSettings.Locators[0].LocatorFieldName] == locatorSettings.Locators[0].LocatorFieldValues[j]) {
                        var tr = document.createElement("tr");
                        tBody.appendChild(tr);
                        var td1 = document.createElement("td");
                        td1.innerHTML = candidate.address;
                        td1.align = "left";
                        td1.className = 'bottomborder';
                        td1.style.cursor = "pointer";
                        td1.height = 20;
                        td1.setAttribute("x", candidate.location.x);
                        td1.setAttribute("y", candidate.location.y);
                        td1.setAttribute("address", candidate.address);
                        td1.onclick = function () {
                            map.infoWindow.hide();
                            featureID = null;
                            objectId = null;
                            alertLayerID = null;
                            passedId = null;
                            mapPoint = new esri.geometry.Point(this.getAttribute("x"), this.getAttribute("y"), map.spatialReference);
                            dojo.byId("txtAddress").value = this.innerHTML;
                            dojo.byId('txtAddress').setAttribute("defaultAddress", this.innerHTML);
                            lastSearchString = dojo.byId("txtAddress").value.trim();
                            LocateAddressOnMap(mapPoint);
                        }
                        tr.appendChild(td1);
                        candidatesLength++;
                    }
                }
            }
        }
        if (candidatesLength == 0 || candidatesLength == candidates.length) {
            var tr = document.createElement("tr");
            tBody.appendChild(tr);
            var td1 = document.createElement("td");
            td1.innerHTML = messages.getElementsByTagName("invalidSearch")[0].childNodes[0].nodeValue;
            tr.appendChild(td1);
            dojo.byId("imgSearchLoader").style.display = "none";
            return;
        }
        dojo.byId("imgSearchLoader").style.display = "none";
        SetAddressResultsHeight();
    } else {
        dojo.byId("imgSearchLoader").style.display = "none";
        LoctorErrBack("invalidSearch");
    }
}

//Populate candidate request id list in address container
function LocateServiceRequest(features) {
    RemoveChildren(dojo.byId('tblAddressResults'));
    if (features.length == 1) {
        dojo.byId("txtAddress").blur();
        dojo.byId('txtAddress').setAttribute("defaultRequestId", dojo.string.substitute(locatorSettings.Locators[1].DisplayField, features[0].attributes));
        dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultRequestId");
        selectedRequest = features[0].geometry;
        LocateServiceRequestOnMap(features[0].attributes);
    } else {
        var table = dojo.byId("tblAddressResults");
        var tBody = document.createElement("tbody");
        table.appendChild(tBody);
        table.cellSpacing = 0;
        table.cellPadding = 0;
        var featureSet = [];
        for (var i = 0; i < features.length; i++) {
            featureSet.push({
                name: dojo.string.substitute(locatorSettings.Locators[1].DisplayField, features[i].attributes),
                geometry: features[i].geometry,
                attributes: features[i].attributes
            });
        }

        featureSet.sort(function (a, b) {
            var x = a.name;
            var y = b.name;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });

        for (var i = 0; i < featureSet.length; i++) {
            var tr = document.createElement("tr");
            tBody.appendChild(tr);
            var td1 = document.createElement("td");
            td1.innerHTML = dojo.string.substitute(locatorSettings.Locators[1].DisplayField, featureSet[i].attributes);
            td1.align = "left";
            td1.className = 'bottomborder';
            td1.style.cursor = "pointer";
            td1.height = 20;
            td1.setAttribute("x", featureSet[i].geometry.x);
            td1.setAttribute("y", featureSet[i].geometry.y);
            td1.setAttribute("index", i);
            td1.onclick = function () {
                dojo.byId('txtAddress').setAttribute("defaultRequestId", this.innerHTML);
                dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultRequestId");
                lastSearchString = dojo.byId("txtAddress").value.trim();
                selectedRequest = new esri.geometry.Point(Number(this.getAttribute("x")), Number(this.getAttribute("y")), map.spatialReference);
                LocateServiceRequestOnMap(featureSet[this.getAttribute("index")].attributes);
            }
            tr.appendChild(td1);
        }
        SetAddressResultsHeight();
        dojo.byId("imgSearchLoader").style.display = "none";
    }
}

//Locate searched request id on map and open up infowindow
function LocateServiceRequestOnMap(attributes) {
    ShowProgressIndicator();
    map.infoWindow.hide();
    map.getLayer(tempGraphicsLayerId).clear();
    ActivateTab('divServiceTabContainer', 1, true);
    setTimeout(function () {
        ShowServiceRequestDetails(selectedRequest, attributes);
    }, 500);
    HideProgressIndicator();
    HideAddressContainer();
}

//Locate searched address on map with pushpin graphic
function LocateAddressOnMap(mapPoint) {
    selectedGraphic = null;
    map.infoWindow.hide();
    ClearGraphics();
    for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
        if (map.getLayer(baseMapLayers[bMap].Key).visible) {
            var bmap = baseMapLayers[bMap].Key;
        }
    }
    if (!map.getLayer(bmap).fullExtent.contains(mapPoint)) {
        map.infoWindow.hide();
        selectedGraphic = null;
        mapPoint = null;
        map.getLayer(tempGraphicsLayerId).clear();
        HideProgressIndicator();
        HideAddressContainer();
        alert(messages.getElementsByTagName("noDataAvlbl")[0].childNodes[0].nodeValue);
        return;
    }
    if (mapPoint) {
        var ext = GetExtent(mapPoint);
        map.setExtent(ext.getExtent().expand(2));
        var symbol = new esri.symbol.PictureMarkerSymbol(locatorSettings.DefaultLocatorSymbol, locatorSettings.MarkupSymbolSize.width, locatorSettings.MarkupSymbolSize.height);
        var graphic = new esri.Graphic(mapPoint, symbol, {
            "Locator": true
        }, null);
        map.getLayer(tempGraphicsLayerId).add(graphic);

    }
    HideAddressContainer();
}

//Display address container upon selecting 'Address' tab in search panel
function SearchByAddress() {
    if (dojo.byId("imgSearchLoader").style.display == "block") {
        return;
    }
    dojo.byId("txtAddress").style.color = "gray";

    dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultAddress");
    lastSearchString = dojo.byId("txtAddress").value.trim();
    RemoveChildren(dojo.byId('tblAddressResults'));
    RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
    dojo.byId("tdSearchAddress").className = "tdSearchByAddress";
    dojo.byId("tdSearchServiceId").className = "tdSearchByUnSelectedServiceId";
}

//Display service request id container upon selecting 'Request ID' tab in search panel
function SearchByRequestId() {
    if (dojo.byId("imgSearchLoader").style.display == "block") {
        return;
    }
    dojo.byId("txtAddress").style.color = "gray";
    dojo.byId("txtAddress").value = dojo.byId("txtAddress").getAttribute("defaultRequestId");
    lastSearchString = dojo.byId("txtAddress").value.trim();
    RemoveChildren(dojo.byId('tblAddressResults'));
    RemoveScrollBar(dojo.byId('divAddressScrollContainer'));
    dojo.byId("tdSearchAddress").className = "tdSearchByUnSelectedAddress";
    dojo.byId("tdSearchServiceId").className = "tdSearchByServiceId";
}

//Get the extent based on the mappoint 
function GetExtent(point) {
    var xmin = point.x;
    var ymin = (point.y) - 30;
    var xmax = point.x;
    var ymax = point.y;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}

//This function is called when locator service fails or does not return any data
function LoctorErrBack(val) {
    var table = dojo.byId("tblAddressResults");
    var tBody = document.createElement("tbody");
    table.appendChild(tBody);
    table.cellSpacing = 0;
    table.cellPadding = 0;

    var tr = document.createElement("tr");
    tBody.appendChild(tr);
    var td1 = document.createElement("td");
    td1.height = 20;
    td1.innerHTML = messages.getElementsByTagName(val)[0].childNodes[0].nodeValue;
    tr.appendChild(td1);
}

//Query the features while sharing
function ExecuteQueryTask(featureID) {
    ShowProgressIndicator();
    var queryTask = new esri.tasks.QueryTask(serviceRequestLayerInfo.LayerURL);
    var query = new esri.tasks.Query;
    query.outSpatialReference = map.spatialReference;
    query.where = map.getLayer(serviceRequestLayerInfo.Key).objectIdField + "=" + featureID;
    query.outFields = ["*"];
    query.returnGeometry = true;
    queryTask.execute(query, function (fset) {
        if (fset.features.length > 0) {
            ShowServiceRequestDetails(fset.features[0].geometry, fset.features[0].attributes);
        }
        HideProgressIndicator();
    }, function (err) {
        alert(err.Message);
    });
}