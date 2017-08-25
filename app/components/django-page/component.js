import Ember from 'ember';
import Component from 'nypr-django-for-ember/components/django-page';
import BetaActionsMixin from 'wqxr-web-client/mixins/beta-actions';
import service from 'ember-service/inject';
const { get } = Ember;

export default Component.extend(BetaActionsMixin, {
  session: service(),
  legacyAnalytics: service(),
  click(event) {
    let legacyAnalytics = get(this, 'legacyAnalytics');
    legacyAnalytics.dispatch(event);

    if (this.isLegacyEvent(event)) {
      return this.fireLegacyEvent(event.target);
    }
  }
});
