// ==UserScript==
// @id             iitc-plugin-polygon-label@randomizax
// @name           IITC plugin: Polygon Labels
// @category       Layer
// @version        0.1.2.20150104.182023
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://rawgit.com/randomizax/polygon-label/latest/polygon-label.meta.js
// @downloadURL    https://rawgit.com/randomizax/polygon-label/latest/polygon-label.user.js
// @description    [randomizax-2015-01-04-182023] Show portal hack details on map.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
//plugin_info.buildName = 'randomizax';
//plugin_info.dateTimeVersion = '20150104.182023';
//plugin_info.pluginId = 'polygon-label';
//END PLUGIN AUTHORS NOTE



// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.polygonLabel = function() {
};

window.plugin.polygonLabel.ICON_SIZE = 12;
window.plugin.polygonLabel.MOBILE_SCALE = 1.5;

window.plugin.polygonLabel.levelLayers = {};
window.plugin.polygonLabel.levelLayerGroup = null;

window.plugin.polygonLabel.setupCSS = function() {
  $("<style>")
    .prop("type", "text/css")
    .html(".plugin-polygon-label {\
            font-size: 12px;\
            color: #802266;\
            font-family: sans-serif;\
            text-align: left;\
            text-shadow: 0 0 0.5em lightyellow, 0 0 0.5em lightyellow, 0 0 0.5em lightyellow,  0 0 0.5em lightyellow;\
            pointer-events: none;\
            -webkit-text-size-adjust:none;\
          }")
  .appendTo("head");
};

window.plugin.polygonLabel.removeLabel = function(guid) {
  var previousLayer = window.plugin.polygonLabel.levelLayers[guid];
  if(previousLayer) {
    window.plugin.polygonLabel.levelLayerGroup.removeLayer(previousLayer);
    delete plugin.polygonLabel.levelLayers[guid];
  }
};

window.plugin.polygonLabel.addLabel = function(layer, p) {
  if (!map.hasLayer(window.plugin.polygonLabel.levelLayerGroup)) {
    return;
  }

  var name;
  if (layer instanceof L.GeodesicCircle || layer instanceof L.Circle) {
    name = "C" + p;
  } else if (layer instanceof L.GeodesicPolygon || layer instanceof L.Polygon) {
    name = "P" + p;
  } else if (layer instanceof L.GeodesicPolyline || layer instanceof L.Polyline) {
    name = "L" + p;
  }
  if (!name) return;

  var poly = layer.getLatLngs();
  var n = poly.length;
  if (n == 0) return;
  var glat = 0.0, glng = 0.0, area = 0.0;
  var p1 = poly[n-1];
  for (var i = 0; i < n; i++) {
    var p2 = poly[i];
    var s = (p2.lat * p1.lng - p1.lat * p2.lng) / 2.0;
    area += s;
    glat += s * (p1.lat + p2.lat) / 3.0;
    glng += s * (p1.lng + p2.lng) / 3.0;
    p1 = p2;
  }
  glat /= (area + 0.0);
  glng /= (area + 0.0);
  var guid = glat + ',' + glng;

  // remove old layer before updating
  window.plugin.polygonLabel.removeLabel(guid);

  // add portal hack details to layers
  var latLng = L.latLng([glat, glng]);
  var level = L.marker(latLng, {
    icon: L.divIcon({
      className: 'plugin-polygon-label',
      iconSize: [window.plugin.polygonLabel.ICON_SIZE * 4, window.plugin.polygonLabel.ICON_SIZE],
      html: name
      }),
    guid: guid
  });
  plugin.polygonLabel.levelLayers[guid] = level;
  level.addTo(plugin.polygonLabel.levelLayerGroup);
};

window.plugin.polygonLabel.updatePolygonLabels = function() {
  // as this is called every time layers are toggled, there's no point in doing it when the layer is off
  if (!map.hasLayer(window.plugin.polygonLabel.levelLayerGroup)) {
    return;
  }
  var p = 0;
  window.plugin.drawTools.drawnItems.eachLayer( function( layer ) {
    window.plugin.polygonLabel.addLabel(layer, ++p);
  });
};

var setup = function() {

  window.plugin.polygonLabel.setupCSS();

  window.plugin.polygonLabel.levelLayerGroup = new L.LayerGroup();
  window.addLayerGroup('Polygon Label', window.plugin.polygonLabel.levelLayerGroup, true);

  window.map.on('overlayadd overlayremove', function() { setTimeout(function(){window.plugin.polygonLabel.updatePolygonLabels();},1); });
};

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);


