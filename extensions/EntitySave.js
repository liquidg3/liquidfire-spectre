define(['altair/facades/declare',
    'altair/facades/mixin',
    'altair/facades/hitch',
    'altair/plugins/node!path',
    'altair/cartridges/extension/extensions/_Base'],

    function (declare,
              mixin,
              hitch,
              pathUtil,
              _Base) {

        return declare([_Base], {

            name:   'entity-save',
            _handles: ['entity'],
            extend: function (Module) {

                Module.extendOnce({
                    store: null,
                    save: function (options) {
                        return this.store.save(this, options);
                    }
                });

                return this.inherited(arguments);
            }

        });


    });