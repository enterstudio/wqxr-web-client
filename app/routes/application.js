import Ember from 'ember';
import ENV from 'overhaul/config/environment';
import {installBridge} from '../lib/okra-bridge';

export default Ember.Route.extend({
  asyncWriter: Ember.inject.service(),
  legacyLoader: Ember.inject.service(),
  leaderboard: Ember.inject.service(),

  beforeModel() {
    this.get('asyncWriter').install();
    if (ENV.renderGoogleAds) {
      this.get('leaderboard').install();
    }

    window.WNYC_LEGACY_LOADER = this.get('legacyLoader');
    window.WNYC_LEGACY_LOADER.define('installBridge', installBridge);

    //window.SM2_DEFER = true;
    window.SM2_OPTIONS = {
      bgColor: '#384043', 
      url: '/media/swf/soundmanager2_v297a-20140901'
    };
  }
});
