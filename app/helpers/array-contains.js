import Ember from 'ember';

export function arrayContains(params/*, hash*/) {
  let a = Ember.makeArray(params[0]);
  return a.includes(params[1]);
}

export default Ember.Helper.helper(arrayContains);
