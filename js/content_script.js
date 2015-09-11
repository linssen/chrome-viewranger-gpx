/* global window, document, chrome, Blob, saveAs */
(function() {
    'use strict';

    var injected = document.createElement('script');

    /**
     * Finds, formats and allows you download routes from ViewRanger as a GPX
     * file.
     *
     * @param {Object} route - The route we've passed through from the injected script
     */
    function GPXBuilder(route) {
        this.route = route;
        this.points = route.routeJson.routes[0].points;
        this.gpxTemplate =
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">\n' +
            '  <trk>\n' +
            '    <name><![CDATA[{{name}}]]></name>\n' +
            '    <trkseg>\n' +
                   '{{waypoints}}\n' +
            '    </trkseg>\n' +
            '  </trk>\n' +
            '</gpx>\n';
        this.waypointTemplate = '      <trkpt lat="{{lat}}" lon="{{lon}}"/>';

        this.buildLink();
    }

    /**
     * Standard issue slugify
     *
     * @param {String} str - The string to slugify
     * @return {String}
     */
    GPXBuilder.prototype.slugify = function(str) {
        var from = 'àáäãâèéëêìíïîòóöôõùúüûñç·/_,:;';
        var to = 'aaaaaeeeeiiiiooooouuuunc------';
        var i = 0;
        var len = from.length;

        str = str.toLowerCase();

        for( ; i < len; i++ ){
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        return str.replace(/^\s+|\s+$/g, '')
            .replace(/[^-a-zA-Z0-9\s]+/ig, '')
            .replace(/\s/gi, "-");
    };

    /**
     * Create the link in the menu and bind it's click to our download
     */
    GPXBuilder.prototype.buildLink = function() {
        var menu = document.querySelector('.dropit-submenu');
        var li = document.createElement('li');
        var link = document.createElement('a');

        // Add the link to our page
        link.setAttribute('href', '#');
        link.text = 'Download GPX';
        menu.appendChild(li);
        li.appendChild(link);

        link.onclick = this.download.bind(this);
    };

    /**
     * Parse an indavidual waypoint and format it as per the template. To be
     * run on each map iteration of points.
     *
     * @param {Object} point - Lat / Lng of the point
     * @param {Number} index - Index position inside the map
     * @return {String} - The formatted template
     */
    GPXBuilder.prototype.formatWaypoint = function(point, index) {
        point.name = point.name || 'waypoint-' + index;
        return this.waypointTemplate
            .replace('{{lat}}', point.lat)
            .replace('{{lon}}', point.lon)
            .replace('{{name}}', point.name);
    };

    /**
     * Build the entire GPX on demand, then serve the blob back as a download
     *
     * @param {Event} e - The click event received from our link
     */
    GPXBuilder.prototype.download = function(e) {
        var blob;
        var filename;
        var gpx;

        e.preventDefault();

        filename = this.slugify(this.route.shortDescription) + '.gpx';
        gpx = this.gpxTemplate
            .replace('{{name}}', this.route.shortDescription)
            .replace('{{waypoints}}', this.points.map(
                this.formatWaypoint.bind(this)
            ).join('\n'));
        blob = new Blob([gpx], {type: 'text/plain;charset=utf-8'});
        saveAs(blob, filename);
    };

    // Inject script to provide our global objec
    injected.src = chrome.extension.getURL('/js/injected.js');
    document.head.appendChild(injected);

    // Listen for the message from the injected script with out route
    window.addEventListener('message', function(event) {
        if (event.data.type !== 'gpxReady' || !event.data.route) { return; }
        new GPXBuilder(event.data.route);
    });

}());
