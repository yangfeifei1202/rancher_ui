import { alias } from '@ember/object/computed';
import { get, set, observer } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { regions, sizes } from 'ui/utils/oci-choices';

const DRIVER = 'oci';
const CONFIG = 'ociConfig';

export default Component.extend(NodeDriver, {
  layout,
  driverName:         DRIVER,

  model:              null,
  openPorts:          null,
  config:             alias(`model.${ CONFIG }`),
  regionChoices:      regions.sortBy('name:desc'),
  shapeChoices:       sizes.sortBy('name'),

  init() {
    this._super(...arguments);

    scheduleOnce('afterRender', () => {
      set(this, 'openPorts', this.initOpenPorts(get(this, 'config.openPort')));
    });
  },

  openPort: observer('openPorts', function() {
    let str = (get(this, 'openPorts') || '').trim();
    let ary = [];

    if (str.length) {
      ary = str.split(/\s*,\s*/);
    }

    set(this, 'config.openPort', ary);
  }),

  bootstrap() {
    let config = get(this, 'globalStore').createRecord({
      type:           CONFIG,
      openPort:       ['6443/tcp', '2379/tcp', '2380/tcp', '8472/udp', '4789/udp', '10256/tcp', '10250/tcp', '10251/tcp', '10252/tcp'],
    });

    set(this, `model.${ CONFIG }`, config);
  },

  initOpenPorts(ports) {
    return ports ? ports.join(',') : '';
  },

  validate() {
    this._super();
    let errors = get(this, 'errors') || [];

    if (!get(this, 'model.name')) {
      errors.push('Name is required');
    }

    if (errors.length) {
      set(this, 'errors', errors.uniq());

      return false;
    }

    return true;
  },

});
