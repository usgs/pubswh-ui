function getElementValue(elementId) {
	var elementValue = $(elementId).val();
	return elementValue;
};

function createSearchString(searchUrl, searchBoxId) {
	var searchBoxContent = getElementValue(searchBoxId);
	var query_string = '?q=' + searchBoxContent;
	var fullSearchUrl = searchUrl + query_string;
	return fullSearchUrl;
};


$(document).ready(function() {
	navBarId = '#mysearch2';
	$(navBarId).bind("enterKey", function(e) {
		var fullSearchUrl = createSearchString(BASE_SEARCH_PAGE_URL, navBarId);
		//console.log(fullSearchUrl);
		window.open(fullSearchUrl, '_self');
	});
	$(navBarId).keyup(function(e) {
		if(e.which == 13) {
			$(this).trigger("enterKey");
		}
	});
});