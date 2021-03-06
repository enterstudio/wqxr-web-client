import Route from 'ember-route';
import service from 'ember-service/inject';
import Ember from 'ember';
const {
  Inflector,
  get,
  set
} = Ember;
const { hash: waitFor } = Ember.RSVP;
const inflector = new Inflector(Inflector.defaultRules);
import { retryFromServer, beforeTeardown } from 'nypr-django-for-ember/utils/compat-hooks';
import PlayParamMixin from 'wqxr-web-client/mixins/play-param';
import config from 'wqxr-web-client/config/environment';

export default Route.extend(PlayParamMixin, {
  session:      service(),
  googleAds:    service(),

  model(params) {
    const channelPathName = inflector.pluralize(this.routeName.split('-')[0]);
    const listingSlug = `${channelPathName}/${params.slug}`;
    set(this, 'listingSlug', listingSlug);

    let listenLive = this.store.findRecord('chunk', `shows-${params.slug}-listenlive`)
      .catch(() => '');

    return this.store.find('django-page', listingSlug.replace(/\/*$/, '/')).then(page => {
      return waitFor({
        page,
        channel: page.get('wnycChannel'),
        user: this.get('session.data.authenticated'),
        listenLive
      });
    })
    .catch(e => retryFromServer(e, listingSlug.replace(/\/*$/, '/')));
  },

  afterModel({ channel }, transition) {
    if (channel) {
      let canonicalUrl = get(channel, 'url');
      let canonicalHostMatch = canonicalUrl && canonicalUrl.match(/\/\/([\w.]+)\//);
      if  (canonicalHostMatch && canonicalHostMatch.pop() !== document.location.host) {
        transition.abort();
        window.location.href = canonicalUrl;
        return;
      }
    }
    get(this, 'googleAds').doTargeting({show: channel.get('slug')});
    if (channel.get('headerDonateChunk')) {
      transition.send('updateDonateChunk', channel.get('headerDonateChunk'));
    }
    if (channel.get('altLayout')) {
      transition.send('setMiniChrome', true);
    }
  },

  setupController(controller, model) {
    let { page_params = '' } = this.paramsFor(`${this.routeName}.page`);
    let [navSlug] = page_params.split('/');
    controller.setProperties({
      channelType: this.routeName,
      defaultSlug: navSlug,
      model,
      session: get(this, 'session'),
      adminURL: `${config.adminRoot}/admin`
    });
  },

  actions: {
    willTransition(transition) {
      let isExiting = !transition.targetName.match(this.routeName);
      this._super(...arguments);
      beforeTeardown();
      if (get(this, 'currentModel.channel.altLayout') && isExiting) {
        transition.send('setMiniChrome', false);
      }
      if (isExiting) {
        get(this, 'googleAds').clearTarget('show');
      }
      return true;
    }
  }
});
