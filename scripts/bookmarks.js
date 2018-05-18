'use strict';

/* global store, api */

const bookmarks = (function() {

	function generateBookmarksHtml(links) {
		const pages = links.map((link) => link.expanded ? generateBookmarkExpand(link) : generateBookmarkCollapsed(link));
		return pages.join('');
	}

	function generateBookmarkCollapsed(bookmark) {
		const bookmarkTitle = `<p class="bookmark-item-title">Title: ${bookmark.title}</p>`;
		const bookmarkRating = `<p class="bookmark-item-title">${bookmark.rating} Stars</p>`;
		
		return `
		<li class="js-bookmark-item">
			<div class="bookmark-container">
				${bookmarkTitle}
				${bookmarkRating}
			</div>
		</li>`;
	}

	function generateBookmarkExpand(bookmark) {
		// title, delete "x", description, "Visit Site" button, "Edit" button, rating
		const bookmarkTitle = `<label class="bookmark-item-title" for="title-expanded">Title</label><input name="title-expanded" class="bookmark-item-title" value="${bookmark.title}">`;
		const bookmarkRating = `<p class="bookmark-item-title">${bookmark.rating} Stars</p>`;
		const bookmarkDesc = `<textarea id="expanded-bookmark-desc">${bookmark.desc}</textarea>`;

		return `
		<li class="js-bookmark-item-expanded">
			<div class="bookmark-container">
				<form id="expanded-bookmark-form">
					<div class="row">
						<div class="col-6" id="expanded-title">
							${bookmarkTitle}
							<button type="button" id="expanded-delete"> X </button>
						</div>
					</div>
					<div class="row">
						${bookmarkDesc}
					</div>
					<div class="row">
						<button type="button" id="${bookmark.url}" class="visit-site">Visit Site</button>
					</div>
					<div class="row">
						${bookmarkRating}
					</div>
				</form>
			</div>
		</li>
		`;
	}

	function generateButtonsHeader() {
		return `
	<p class="button-group">
		<button type="button" id="add-bookmark-button"> ADD BOOKMARK </button>
		<select name="ratings" class="dropdown-stars">
      		<option value="0">Minimum Rating</option>
      		<option value="5">Five Stars</option>
      		<option value="4">Four Stars</option>
      		<option value="3">Three Stars</option>
      		<option value="2">Two Stars</option>
      		<option value="1">One Star</option>
	    </select>
    </p>`;
	}

	function generateAddBookmarkForm() {
		return `
			<span class="text-boxes">
				<input type="text" id="new-title" placeholder="title">
				<input type="text" id="new-url" placeholder="URL">
				<div class="radio-and-submit">
					<input type="radio" class="radios" id="rating5" name="ratings" value="5">
					<label for="rating5">5 Stars</label>
					<input type="radio" class="radios" id="rating4" name="ratings" value="4">
					<label for="rating5">4 Stars</label>
					<input type="radio" class="radios" id="rating3" name="ratings" value="3">
					<label for="rating5">3 Stars</label>
					<input type="radio" class="radios" id="rating2" name="ratings" value="2">
					<label for="rating5">2 Stars</label>
					<input type="radio" class="radios" id="rating1" name="ratings" value="1">
					<label for="rating5">1 Stars</label>
				</div>
			</span>
			<p>
				<textarea rows=5 columns=200 placeholder="Short description of bookmarked page here" id="new-description"></textarea>
			</p>
			<div class="row">
				<div class="col-12">
					<button type="submit" id="add-button">ADD</button>
					<button type="button" id="cancel">CANCEL</button>
				</div>
			</div>`;
	}

	function render() {
		if(!store.adding) {
			// add buttons header
			$('form#js-form-actions').html(generateButtonsHeader());
		} else {
			$('form#js-form-actions').html(generateAddBookmarkForm());
		}
		// const htmlBookmarks = store.bookmarks.map((bookmark) => {
		// 	generateBookmarkCollapsed(bookmark);
		// });
		$('ul#bookmark-list').html(generateBookmarksHtml(store.bookmarks));
	}

	function handleNewBookmarkClicked() {

		$('form#js-form-actions').on('click', 'button#add-bookmark-button', function(event) {
			store.adding = !store.adding;
			render();
		});
	}

	function handleCancelClicked() {
		$('form#js-form-actions').on('click', 'button#cancel', function(event) {
			store.adding = !store.adding;
			render();
		});
	}

	function handleVisitSite() {
		$('ul').on('click', 'button.visit-site', function(event) {
			event.stopPropagation();
			const thisElement = this;
			document.location = $(thisElement).attr('id');
		});
	}

	function clearValues() {
		$('#new-title').val('');
		$('#new-url').val('');
		$('input[name="ratings"]:checked').prop('checked', false);
		$('textarea#new-description').val('');
	}

	function handleFilterSelected() {
		$('form#js-form-actions').on('change', '.dropdown-stars', function(event) {
			const filterValue = $('.dropdown-stars').val();
			$('li').each(function(index) {
				$(this).removeClass("hidden");
				if(store.bookmarks[index].rating < filterValue) {
					$(this).attr('class', `${$(this).attr('class')} hidden`);
				}
			})
		});
	}

	function handleNewBookmarkSubmit() {
		// change the store.adding value
		$('form#js-form-actions').submit(function (event) {
			try {	
				event.preventDefault();
				const newBookmarkTitle = $('#new-title').val();
				const newBookmarkUrl = $('#new-url').val();
				const newBookmarkRating = $('input[name="ratings"]:checked').val();
				const newBookmarkDescription = $('textarea#new-description').val();
				if(newBookmarkTitle !== "" && newBookmarkUrl !== "" && newBookmarkRating !== undefined) {
					const newBookmark = {
						id: cuid(), 
						title: newBookmarkTitle, 
						url: newBookmarkUrl, 
						rating: newBookmarkRating, 
						description: newBookmarkDescription
					};
					console.log(newBookmark);
					api.createBookmark(newBookmark, (createdBookmark) => {
						createdBookmark.expanded = false;
						store.addBookmark(createdBookmark);
						console.log(createdBookmark);
						render();
					});
				} else {
					throw new Error("Data input incorrectly.  Please enter all relevant fields.");
				}
			}
			catch(err) {
				alert(err.message);
			}
		});
		// re-render the page
	}

	function handleBookmarkClicked() {
		// toggles between detailed and simplified view for a given bookmark item
		$('ul').on('click', 'li.js-bookmark-item', function(event) {
			const thisElement = this;
			$('li').each(function(index){
				if(this === thisElement) {
					store.bookmarks[index].expanded = !store.bookmarks[index].expanded;
					render();
				}
			});
		});
	}

	function handleBookmarkUnclicked() {
		$('ul').on('focusout', 'li.js-bookmark-item-expanded', function(event) {
			// shrink when focusout
			const thisElement = this;
			console.log("in focusout li element event");
			$('li').each(function(index) {
				if(this === thisElement) {
					store.bookmarks[index].expanded = !store.bookmarks[index].expanded;
					render();
				}
			})
		});
	}

	function handleChangeTitle() {
		$('ul').on('focusout', 'input.bookmark-item-title', function(event) {
			// grabs the 'li' element
			const thisElement = $(this).parent().parent().parent().parent().parent();
			const newTitle = $(this).val();
			$('li').each(function(index) {
				if($(this)[0] === thisElement[0]) {
					store.findAndUpdate(store.bookmarks[index].id, {title: newTitle});
					console.log(store.bookmarks[index]);
				}
			});
		});
	}

	function handleChangeDesc() {
		$('ul').on('focusout', 'textarea', function(event) {
			// get a handle on the li element
			const thisElement = $(this).parent().parent().parent().parent();
			const newDesc = $(this).val();
			$('li').each(function(index) {
				if($(this)[0] === thisElement[0]) {
					store.findAndUpdate(store.bookmarks[index].id, {desc: newDesc});
					console.log(store.bookmarks[index]);
				}
			});
			// const index = findElementIndex(thisElement);
			// console.log(index);
		});
	}

	function handleDeleteBookmark() {
		$('ul').on('click', 'button#expanded-delete', function(event) {
			const thisElement = $(this).parent().parent().parent().parent().parent();
			console.log(thisElement);
			$('li').each(function(index) {
				if($(this)[0] === thisElement[0]) {
					store.findAndDelete(store.bookmarks[index].id);
				}
			});
		});
	}

	function bindEventListeners() {
		handleNewBookmarkClicked();
		handleFilterSelected();
		handleNewBookmarkSubmit();
		handleBookmarkClicked();
		handleBookmarkUnclicked();
		handleCancelClicked();
		handleVisitSite();
		handleChangeTitle();
		handleChangeDesc();
		handleDeleteBookmark();
	}

	return {
		render: render,
		bindEventListeners: bindEventListeners,
	};
}());