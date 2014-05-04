define(['altair/facades/declare',
        'altair/Lifecycle',
        './extensions/Entity',
        'lodash'
], function (declare,
             Lifecycle,
             EntityExtension,
             _) {

    return declare([Lifecycle], {

        _cachedStores: null,
        startup: function (options) {


            var _options            = options || this.options || { installExtension: true },
                cartridge           = _options.extensionCartridge || this.nexus('cartridges/Extension');

            //did someone pass strategies?
            if(_options.strategies) {
                this._strategies = _options.strategies;
            }

            //reset cached stores
            this._cachedStores = [];

            //should we install the extension?
            if(_options.installExtension !== false) {

                this.deferred = this.forge('./foundries/Store').then(function (foundry) {

                    var entity = _options.entityExtension || new EntityExtension(cartridge, cartridge.altair, foundry);
                    return cartridge.addExtensions([entity]);

                }).then(this.hitch(function () {
                    return this;
                }));

            }

            return this.inherited(arguments);

        },

        hasCachedStore: function (named) {
            return _.has(this._cachedStores, named);
        },

        cachedStore: function (named) {
            return this._cachedStores[named];
        },

        cacheStore: function (named, store) {
            this._cachedStores[named] = store;
        }

    });

});