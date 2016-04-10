define(['altair/facades/declare',
        'altair/facades/mixin',
        'altair/plugins/node!path',
        'lodash',
        'altair/cartridges/extension/extensions/_Base'],
    function (declare,
              mixin,
              pathUtil,
              _,
              _Base) {

        return declare([_Base], {

            name: 'store',
            _handles: ['controller', 'app', 'module', 'service'],
            constructor: function (cartridge) {

                if (!cartridge) {
                    throw new Error('You must pass your extension the Extension cartridge');
                }

                if (!this.name) {
                    throw new Error('You must define a .name for your extension.');
                }

            },

            /**
             * Our "entity" method actually returns a store with find, create, etc.
             * @param Module
             * @returns {*}
             */
            extend: function (Module) {

                Module.extendOnce({
                    entityPath: './entities',
                    store: function (named, options, config) {

                        var base = this.parent ? this.parent.entityPath : this.entityPath,//if we have a parent, assume we want to use it as the base path
                            _p,
                            spectre = this.nexus('liquidfire:Spectre'),
                            d,
                            _options = options || {},
                            _c = mixin({
                                type: 'entity-store'
                            }, config || {}),
                            foundry = spectre.entityFoundry;

                        //if it's a nexus name, pass it off
                        if (named.search(':') > 0) {
                            return this.nexus(named, options, config);
                        }
                        //build the path if it's not a nexus id
                        else {
                            _p = (this.parent || this).resolvePath(pathUtil.join(base, named.toLowerCase(), named));
                        }

                        var key = this.name.split('/')[0] + '/entities/' + named;

                        if (spectre.hasCachedStore(key)) {

                            return spectre.cachedStore(key);

                        } else {

                            _options.entityName = this.name.split('/')[0] + '/entities/' + named;

                            d = foundry.forgeSync(_p, _options, _c);
                            spectre.cacheStore(key, d);

                        }


                        return d;

                    },

                    /**
                     * Same as above, but no waiting
                     *
                     * @param named
                     * @param options
                     * @param config
                     * @returns {*}
                     */
                    entitySync: function (named, options, config) {

                        var entity = this.entity(named, options, config);

                        entity.then(function (e) {
                            entity = e;
                        });

                        return entity;

                    }
                });

                return this.inherited(arguments);
            }




        });


    });