'use strict';
/**

+ api:
 + getBookmarks(callback: function)
 + createItem

**/

const api = (function() {
	const BASE_URL = 'https://thinkful-list-api.herokuapp.com/steven';

	const getBookmarks = function(callback) {
		$.getJSON(BASE_URL + '/bookmarks', callback);
	};

	const createBookmark = function(bookmark, callback) {
		const newItem = JSON.stringify({
			"id": bookmark.id,
			"title": bookmark.title,
			"url": bookmark.url,
			"desc": bookmark.description,
			"rating": bookmark.rating
	    });

	    $.ajax({
	    	url: BASE_URL + '/bookmarks',
	    	method: 'POST',
	    	contentType: 'application/json',
	    	data: newItem,
	    	success: callback
	    });
	};

	const updateBookmark = function(id, updateData, callback) {
		$.ajax({
	    	url: BASE_URL + '/bookmarks/' + id,
	    	method: 'PATCH',
	    	contentType: 'application/json',
	    	data: JSON.stringify(updateData),
	    	success: callback
    	});
	};

	const deleteBookmark = function(id, callback) {
		$.ajax({
			url: BASE_URL + '/bookmarks/' + id,
			method: 'DELETE',
			contentType: 'application/json',
			data: JSON.stringify({ id }),
			success: callback
    	});
	};

	return {
		getBookmarks,
		createBookmark,
		updateBookmark,
		deleteBookmark
	};

}());