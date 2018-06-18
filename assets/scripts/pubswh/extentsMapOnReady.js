import { createResultsMap } from './resultsMap';


$(document).ready(function() {
    var TOGGLE_BTN_SHOW_TEXT = 'Show results on a map';
    var TOGGLE_BTN_HIDE_TEXT = 'Hide results on a map';

    var $extentsMapContainer = $('#extents-map-section');
    var $toggleResultsBtn = $('.toggle-results-map-btn');
    var map = createResultsMap({
        mapDivId: 'extents-map',
        publications: CONFIG.publications,
        enablePopup: true
    });

    $extentsMapContainer.hide();
    $toggleResultsBtn.html(TOGGLE_BTN_SHOW_TEXT);

    $toggleResultsBtn.click(function() {
        if ($(this).html() === TOGGLE_BTN_SHOW_TEXT) {
            $extentsMapContainer.show();
            map.invalidateSize();
            $(this).html(TOGGLE_BTN_HIDE_TEXT);
        } else {
            $extentsMapContainer.hide();
            $(this).html(TOGGLE_BTN_SHOW_TEXT);
        }
    });
});
