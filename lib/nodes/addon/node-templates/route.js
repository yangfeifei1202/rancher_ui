import { hash } from 'rsvp';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),

  model() {
    let aa = get(this, 'globalStore').findAll('nodeTemplate');

    return hash({ nodeTemplates: get(this, 'globalStore').findAll('nodeTemplate') });
  },
});
