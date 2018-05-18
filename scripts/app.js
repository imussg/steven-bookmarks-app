'use strict';

/* global bookmarks, store, api */

$(document).ready(function() {
	api.getBookmarks((tempBookmarks) => {
		console.log(tempBookmarks);
		tempBookmarks.forEach((bookmark) => {
			// adding the property so when interated throgh the UI knows whether or not to expand the element
			bookmark.expanded = false;
			// add the bookmarks to the store
			store.addBookmark(bookmark);
		});
		bookmarks.render();
	});
	bookmarks.bindEventListeners();
	bookmarks.render();
});