import ENV from 'wqxr-web-client/config/environment';
import Route from 'ember-route';
import get from 'ember-metal/get';
import service from 'ember-service/inject';
import { retryFromServer, beforeTeardown } from 'nypr-django-for-ember/utils/compat-hooks';
import PlayParamMixin from 'wqxr-web-client/mixins/play-param';

export default Route.extend(PlayParamMixin, {
  queryParams: {
    q: {
      refreshModel: true
    }
  },

  metrics: service(),
  googleAds: service(),

  titleToken(model) {
    return get(model, 'title');
  },
  title(tokens) {
    if (tokens && tokens.length > 0) {
      return tokens[0];
    } else {
      return 'WQXR | New York\'s Classical Music Radio Station';
    }
  },

  model({ upstream_url }, { queryParams }) {
    // This adds trailing slashes, because the server's redirect
    // doesn't otherwise work correctly due to the proxying I'm using
    // in development (which is neeeded due to CORs).
    upstream_url = upstream_url.replace(/\/*$/, '/');

    let qp = Object.keys(queryParams)
      .filter(q => queryParams[q] && ENV.QP_WHITELIST.includes(q)).map(p => `${p}=${queryParams[p].replace(/\s/g, '%20')}`);
    if (qp.length) {
      upstream_url += `?${qp.join('&')}`;
    }
    return this.store.find('django-page', upstream_url)
      .catch(e => retryFromServer(e, upstream_url));
  },

  afterModel(page) {
    let metrics = get(this, 'metrics');
    let path = document.location.pathname; // e.g. '/shows/bl/'
    let title = (get(page, 'title') || '').trim();
    metrics.trackPage('NprAnalytics', {
      page: path,
      title
    });
    get(this, 'googleAds').doTargeting();
  },

  setupController(controller, model) {
    this._super(...arguments);
    let doc = model.get('document');
    let classNamesForRoute = [];
    if (!doc.querySelector('.graphic-responsive')) {
      classNamesForRoute.push('l-constrained');
    }
    if (model.get('id') === 'search/') {
      classNamesForRoute.push('search');
    }
    controller.set('classNamesForRoute', classNamesForRoute);
  },

  actions: {
    willTransition() {
      this._super(...arguments);
      beforeTeardown();
      return true;
    }
  }
});
