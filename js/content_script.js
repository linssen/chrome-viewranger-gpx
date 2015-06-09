/* global chrome, saveAs */
(function() {
    'use strict';

    var menu = document.querySelector('.dropit-submenu');
    var li = document.createElement('li');
    var link = document.createElement('a');
    var gpx =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<gpx xmlns="http://www.topografix.com/GPX/1/0" version="1.0">\n' +
        '  <rte>\n' +
        '    <name><![CDATA[{{name}}]]></name>\n' +
               '{{waypoints}}\n' +
        '    </rte>\n' +
        '</gpx>\n\n';
    var waypoint =
        '      <rtept lat="{{lat}}" lon="{{lon}}">\n' +
        '        <name>{{name}}</name>\n' +
        '      </rtept>';
    var injected = document.createElement('script');
    var points;
    var route;

    // Inject script to provide our global objec
    injected.src = chrome.extension.getURL('/js/injected.js');
    document.head.appendChild(injected);

    // Listen for the message from the injected script with out route
    window.addEventListener('message', function(event) {
        if (event.data.type !== 'gpxReady') { return; }
        route = event.data.route;
        points = route.routeJson.routes[0].points;
    });

    // String formatting for each waypoint XML node
    function formatWaypoint(point, index) {
        point.name = point.name || 'waypoint-' + index;
        return waypoint
            .replace('{{lat}}', point.lat)
            .replace('{{lon}}', point.lon)
            .replace('{{name}}', point.name);
    }

    // Add the link to our page
    link.setAttribute('href', '#');
    link.text = 'Download GPX';
    menu.appendChild(li);
    li.appendChild(link);

    // Download the file on click
    link.onclick = function(e) {
        var blob;
        e.preventDefault();
        gpx = gpx
            .replace('{{name}}', route.longDescription)
            .replace('{{waypoints}}', points.map(formatWaypoint).join('\n'));
        blob = new Blob([gpx], {type: "text/plain;charset=utf-8"});
        saveAs(blob, route.routeId + '.gpx');
    };

}());
