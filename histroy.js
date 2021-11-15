import forEach from 'lodash-es/forEach';
import take  from 'lodash-es/take';
import lastIndexOf from 'lodash-es/lastIndexOf';

/**
 * ## Overview
 *  - Basic router that calls a callback whenever the location is updated.
 *  - Provide basic methods to manage router.
 */
 export class Router {
  constructor(locationUpdatedCallback, fallbackCallback, isInternalURL, transformURL) {
    if(!locationUpdatedCallback || typeof locationUpdatedCallback !== "function") {
      throw new Error('Location update callback handler in not a function');
    }

    this.locationUpdatedCallback = locationUpdatedCallback;
    this.fallbackCallback = fallbackCallback;

    this.isInternalURL = this.__isInternalURL;
    if(isInternalURL && typeof isInternalURL === "function") {
      this.isInternalURL = isInternalURL;
    }

    this.transformURL = this.__transformURL;
    if(transformURL && typeof transformURL === "function") {
      this.transformURL = transformURL;
    }

    //Initially called location update callback handler.
    this.locationUpdatedCallback(window.location, null /* event */);

    //Listen on location change.
    window.addEventListener('popstate', e => this.locationUpdatedCallback(window.location, e));

    //Manage application internal link click.
    this._manageInternalLink = this._manageInternalLink.bind(this);
    document.body.addEventListener('click', this._manageInternalLink);
  }

  /**
   * To move back one page use this method.
   * Browser history `back` api called.
   * Algorithem: 
   *  - If current page is last page of application then called fallback handler.
   *  - Otherwise called history api `back` method.
   * @public
   */
  back() {
    let currentPageIndex = this.getCurrentPageIndex();
    if(!currentPageIndex && this.fallbackCallback) {
       this.fallbackCallback();
      return;
    }
    window.history.back();
  }

  /**
   * To move forward one page use this method.
   * Browser history `forward` api called.
   * @public
   */
  forward() {
    window.history.forward();
  }

  /**
   * @param {Number} count you can move forward 2 pages by passing 2 and move backward 2 pages by passing -2.
   * Browser history `go` api called.
   * Moving to a specific point in history.
   * Algorithem:
   *  - If `count` is `not a number` or `count` is `positive number` then called history `go` api called with count.
   *  - If `count` is  `negative` number then
   *    - If current page is appliction last page then called fallback callback.
   *    - If user backward is not possible then user backward to first page and called fallback callback.
   *  - Otherwise called history `go` api with count.
   * @public
   */
  go(count) {
    //If number is not valid OR positive number.
    if(!count || window.isNaN(count) || 0 < count) {
      window.history.go(count);
      return;
    }
    
    let currentPageIndex = this.getCurrentPageIndex();
    //If current page is last page of app.
    if(!currentPageIndex && this.fallbackCallback) {
      this.fallbackCallback();
      return
    }
    
    //If history back is not possible
    if (currentPageIndex < Math.abs(count)) {
      window.addEventListener('popstate', this.fallbackCallback, { once: true });
      window.history.go(-currentPageIndex);
      return;
    }
    window.history.go(count);
  }

  /**
   * @param {Object} state state for this `url`.
   * @param {String} title title of opened page
   * @param {String} url New push url.
   * Browser history `pushState` api called.
   * @public
   */
  pushState(state = {}, title = '', url, autoBack) {
    if(autoBack) {
      const count = this.__getAutoBackCount(url);
      if(count) {
        this.go(-count);
        return;
      }
    }
    let currentPageIndex = this.getCurrentPageIndex();
    let newPageIndex = (!!currentPageIndex) ? currentPageIndex + 1: 1;
    let historyList = this.getHistoryList();
    historyList.push(this.getRelativeUrl(url));
    window.history.pushState({...state, index: newPageIndex, list: historyList}, title, url);
    this.locationUpdatedCallback();
  }

  /**
   * @param {Object} state state for this `url`.
   * @param {String} title title of opened page
   * @param {String} url New replace url.
   * Browser history `replaceState` api called.
   * @public
   */
  replaceState(state = {}, title = '', url, autoBack) {
    if(autoBack) {
      const count = this.__getAutoBackCount(url);
      if(count) {
        this.go(-count);
        return;
      }
    }
    let historyList = this.getHistoryList();
    historyList.splice(historyList.length - 1, 1, this.getRelativeUrl(url));
    window.history.replaceState({...state, index: this.getCurrentPageIndex(), list: historyList }, title, url);
    this.locationUpdatedCallback();
  }

  /**
   * @returns {Number} Current page index from history current `state`.
   * @public
   */
  getCurrentPageIndex() {
    let currentState = window.history.state || {};
    return currentState.index || 0;
  }

  /**
   * @returns {Array} History lists.
   * @public
   */
  getHistoryList() {
    const historyState = window.history.state || {};
    return historyState.list && historyState.list.length !== 0 ? historyState.list: [this.getRelativeUrl(window.location.href)];
  }

  __getAutoBackCount(url) {
    if(!url) {
      return 0;
    }

    const historyList = this.getHistoryList();
    if(!historyList || historyList.length < 2) {
      return 0;
    }
    const urlIndex = lastIndexOf(historyList, this.getRelativeUrl(url));
    return urlIndex !== undefined ? historyList.length - urlIndex: 0;
  }

  getRelativeUrl(url) {
    return url.replace(/^.*\/\/[^\/]+/, '');
  }

  /**
   * Manage Internal link.
   * Invoked when user click on document.
   * When clickable el is link and link is internal link then called location update callback handler called.
   * @protected
   */
  _manageInternalLink(e) {
    if (e.defaultPrevented || e.button !== 0 ||
      e.metaKey || e.ctrlKey || e.shiftKey)
      return;
    const anchor = e.composedPath().filter(n => n.tagName === 'A')[0];
    if (!anchor || anchor.target ||
      anchor.hasAttribute('download') ||
      anchor.getAttribute('rel') === 'external')
      return;
    const href = anchor.href;
    if (!href || href.indexOf('mailto:') !== -1)
      return;
    const location = window.location;
    if(this.isInternalURL(href)) {
      e.preventDefault && e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      let transformURL = this.transformURL(href);
      if(transformURL !== location.href) {
        this.pushState({}, '', transformURL);
        this.locationUpdatedCallback(location, e);
      }
    }
  }

  /**
   * Default method of the router for check interanl URL or Not.
   * @param {String} URL to check given URL is internal URL or not.
   * @returns {Boolean} `true` when URL is internal URL, `false` otherwise.
   * @private
   */
  __isInternalURL(URL) {
    let location = window.location;
    let origin = location.origin || location.protocol + '//' + location.host;
    return URL.indexOf(origin) === 0;
  }

  /**
   * Default method of the router to transform URL.
   * @param {String} URL tranform URL to given URL.
   * @private
   */
  __transformURL(URL) {
    return URL;
  }
}
