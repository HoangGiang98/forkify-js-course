import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import bookmarksView from './views/bookmarksView';
import paginationView from './views/paginationView';
import addRecipeView from './views/addRecipeView';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2
// if (module.hot) {
// 	module.hot.accept();
// }

const controlRecipe = async function () {
	try {
		const id = window.location.hash.slice(1);

		if (!id) return;
		recipeView.renderSpinner();

		// 0) Update results view to mark selected search result
		resultsView.update(model.getSearchResultPage());

		// 1) Updating bookmarks view
		bookmarksView.update(model.state.bookmarks);
		// 2) Loading recipe
		await model.loadRecipe(id);

		// 3) Render recipe
		recipeView.render(model.state.recipe);
	} catch (err) {
		console.log(err);
		recipeView.renderError();
	}
};
const controlSearchResults = async function () {
	try {
		resultsView.renderSpinner();
		// 1) Get search query
		const query = searchView.getQuery();
		if (!query) return;

		// 2) Load search results
		await model.loadSearchResults(query);

		// 3) Render search results
		//resultsView.render(model.state.search.results);
		resultsView.render(model.getSearchResultPage());
		// 4) Render initial pagination buttons
		paginationView.render(model.state.search);
	} catch (err) {
		console.log(err);
	}
};
const controlPagination = function (goToPage) {
	// 1) Render NEW results
	resultsView.render(model.getSearchResultPage(goToPage));
	// 2) Render new pagination buttons
	paginationView.render(model.state.search);
};

const controlServing = function (newServings) {
	// Update the recipe servings (in state)
	model.updateServings(newServings);
	// Update the recipeView
	// recipeView.render(model.state.recipe);
	recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
	// 1) Add/ remove bookmark
	if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
	else model.deleteBookMark(model.state.recipe.id);
	// 2) Update recipe view
	recipeView.update(model.state.recipe);

	// 3) Render bookmarks
	bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
	bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
	try {
		// Show loading spinner
		addRecipeView.renderSpinner();
		// Upload the new recipe data
		await model.uploadRecipe(newRecipe);

		// Render recipe
		recipeView.render(model.state.recipe);
		// Success message
		addRecipeView.renderMessage();
		// Render bookmark view
		bookmarksView.render(model.state.bookmarks);
		// Change ID in URL
		window.history.pushState(null, '', `#${model.state.recipe.id}`);
		// Close form window
		addRecipeView.autoCloseFormWindow(MODAL_CLOSE_SEC);
	} catch (err) {
		console.error('😡', err);
		addRecipeView.renderError(err.message);
	}
};

const init = function () {
	bookmarksView.addHandlerRender(controlBookmarks);
	recipeView.addHandlerRender(controlRecipe);
	recipeView.addHandlerUpdateServing(controlServing);
	recipeView.addHandlerAddBookmark(controlAddBookMark);
	searchView.addHandlerSearch(controlSearchResults);
	paginationView.addHandlerClick(controlPagination);
	addRecipeView.addHanlerUpload(controlAddRecipe);
};
init();
