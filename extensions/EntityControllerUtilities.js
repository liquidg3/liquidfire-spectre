define(['altair/facades/declare',
        'altair/cartridges/extension/extensions/_Base'],

    function (declare,
              _Base) {

        return declare([_Base], {

            name:   'entity-delete',
            _handles: ['controller'],
            extend: function (Module) {

                Module.extendOnce({
                    store: null,

                    /**
                     * Create an entity
                     *
                     * @param type
                     * @param values
                     * @param options
                     * @returns {*}
                     */
                    createEntity: function (type, values, options) {

                        return this.entity(type).then(function (store) {

                            var entity  = store.create(values, options);

                            return entity.validate();

                        }).then(function (entity) {

                            return entity.save();

                        }.bind(this));

                    },

                    /**
                     * Basic entity search
                     *
                     * @param type
                     * @param options
                     * @returns {*}
                     */
                    searchEntities: function (type, options) {

                        var search = this.model('liquidfire:Spectre/models/Search', null, { parent: this });

                        return search.find(type, options);

                    },


                    /**
                     * Generic update entity
                     *
                     * @param type
                     * @param id
                     * @param values
                     * @param cb
                     */
                    updateEntity: function (type, id, values, options) {

                        var _options = options || {};

                        return this.entity(type).then(function (store) {

                            return store.findOne().where('_id', '===', id).execute();

                        }.bind(this)).then(function (entity) {

                            if (!entity) {
                                throw new Error('Could not find ' + type + ' by id ' + id);
                            }

                            entity.mixin(values);

                            return entity.validate();

                        }).then(function (entity) {

                            return entity.save();

                        }.bind(this)).otherwise(function (err) {

                            cb(_.isArray(err) ? err[0] : err.message || err);

                        });

                    },

                    'delete': function (options) {
                        return this.store.delete(this, options);
                    }
                });

                return this.inherited(arguments);
            }

        });


    });