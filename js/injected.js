setTimeout(function() {
    window.postMessage({
        type: 'gpxReady',
        route: window.ROUTE_DETAILS
    }, '*');
}, 2000);
