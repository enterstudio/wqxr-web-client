/*
   Ember doesn't expose a public router service yet, but it will soon,
   and it's really convenient to have in a component-centric
   world. This encapsulates some use of private API to give us the
   benefits now, with an easy upgrade path to the future solution.

   See also https://github.com/emberjs/rfcs/pull/95
*/
import Ember from 'ember';

export default Ember.Service.extend({
  _routing: Ember.inject.service('-routing'),
  transitionTo(routeName, ...models) {
    this.get('_routing').transitionTo(routeName, models);
  },

  recognize(url) {
    let handlers = Array.from(this.get('_routing').router.router.recognizer.recognize(url));
    handlers.shift(); // application handler is always present and not interesting here
    let routeName = handlers.map(h => h.handler).join('.');
    let params = [];
    handlers.forEach(h => {
      // It's possible for routes to have more than one parameter, but
      // we aren't capable of reflecting that in this API, and we
      // aren't using that feature.
      let p = Object.keys(h.params)[0];
      if (p) {
        params.push(h.params[p]);
      }
    });
    return { routeName, params };
  }

});
