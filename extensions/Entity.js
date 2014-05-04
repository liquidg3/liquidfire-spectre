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

            name: 'entity',
            _foundry: null,
            constructor: function (cartridge, altair, foundry) {

                if(!cartridge) {
                    throw new Error('You must pass your extension the Extension cartridge');
                }

                this.cartridge  = cartridge;
                this.altair     = altair || cartridge.altair;
                this._foundry   = foundry;

                if(!this.name) {
                    throw new Error('You must define a .name for your extension.');
                }
            },

            extend: function (Module) {

                var foundry = this._foundry;

                Module.extendOnce({
                    entityPath: './entities',
                    entity: function (named, options, config) {

                        var base = this.parent ? this.parent.entityPath : this.entityPath,//if we have a parent, assume we want to use it as the base path
                            _p = this.resolvePath(pathUtil.resolve(base, named.toLowerCase(), named)),
                            spectre = this.nexus('liquidfire:Spectre'),
                            d,
                            _c = mixin({
                                type: 'entity-store'
                            }, config || {});

                        if(spectre.hasCachedStore(named)) {

                            d = new this.Deferred();
                            d.resolve(spectre.cachedStore(named));

                        } else {
                            d = foundry.forge(_p, options, _c).then(function (store) {
                                spectre.cacheStore(named, store);
                                return store;
                            });
                        }

                        return d;

                    }
                });

                return this.inherited(arguments);
            }

        });


    });