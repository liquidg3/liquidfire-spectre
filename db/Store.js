define(['altair/facades/declare',
    'altair/facades/all',
    'altair/mixins/_DeferredMixin',
    'dojo/_base/lang',
    'lodash'],
    function (declare, all, _DeferredMixin, lang, _) {

        var delegateMethods = ['find', 'findOne', 'delete', 'update', 'count'],
            extension = {},
            Store = declare([_DeferredMixin], {


                _tableName:    '',
                _entityName:   '',
                _entitySchema: null,
                _database:     null,
                _entityPath:   '',

                constructor: function (options) {

                    this._database = options.database;
                    this._entitySchema = options.schema;
                    this._tableName = this._entitySchema.option('tableName');
                    this._entityPath = options.entityPath;
                    this._entityName = options.entityName || this._entityPath.split('/').pop(); //default entity name (if no "name" is specified in schema)
                    this.name = this._entityName;

                },

                /**
                 * Schema attached to every entity we create
                 *
                 * @returns {null}
                 */
                schema: function () {
                    return this._entitySchema;
                },

                /**
                 * Save an entity back to the database
                 *
                 * @param entity
                 */
                save: function (entity, options) {

                    return all(entity.getValues({}, { methods: ['toDatabaseValue'] })).then(this.hitch(function (values) {

                            //does this entity have a primary key?
                        if (entity.primaryValue()) {

                            //if so, update
                            return this._database.update(this._tableName).set(values).where(entity.primaryProperty().name, '===', entity.primaryValue()).execute(options);

                        }
                        //otherwise lets create
                        else {

                            //lets not pass a primary key field to the database
                            delete values[entity.primaryProperty().name];

                            //create record
                            return this._database.create(this._tableName).set(values).execute(options);

                        }

                    })).then(function (values) {

                        //the new values should have an Id now
                        entity.mixin(values);

                        //pass pack the updated entity
                        return entity;

                    });


                },

                /**
                 * Create an entity with the values
                 *
                 * @param values
                 * @returns {*|Promise}
                 */
                create: function (values) {

                    var options = {
                        _schema: this._entitySchema,
                        values:  values
                    };

                    return this.forge(this._entityPath, options, { type: 'entity', name: this._entityName }).then(this.hitch(function (entity) {
                        entity.store = this;
                        return entity;
                    }));
                },

                'delete': function (entity, options) {

                    return this.parent.emit('will-delete-entity', {
                        entity: entity,
                        options: options,
                        store: this
                    }).then(function (e) {

                        if (e.active) {
                            return this._database['delete'](this._tableName).where(entity.primaryProperty().name, '===', entity.primaryValue()).execute();
                        } else {
                            return false;
                        }

                    }.bind(this));


                },

                _didFindCallback: function (e) {

                    var cursor = e.get('results');

                    cursor.foundry = this.hitch('create');

                },

                _didFindOneCallback: function (e) {

                    var record = e.get('results');

                    if (record) {

                        return this.create(record).then(function (entity) {
                            e.set('results', entity);
                        });

                    }

                },

                /**
                 * Before any query is executed I'm going to see if the schema can help transform values to get them ready
                 * to hit the database.
                 *
                 * @param e {altair.events.Event}
                 * @private
                 */
                _willExecuteQuery: function (e) {

                    var statement = e.get('statement'),
                        where = statement.clauses().where,
                        schema = this.schema(),
                        transform;


                    transform = function (value, key, all, path) {

                        var tranformed,
                            subKey;

                        if (!path) {
                            path = key;
                        }

                        if (schema.has(key)) {

                            //query can be something like $!== , $<, $>, etc. If that is the case, dive in and loop through that portion
                            if (_.isObject(value) && Object.keys(value)[0][0] === '$') {

                                _.each(Object.keys(value), function (_key) {
                                    transform(value[_key], key, all, path + '.' + _key);
                                }, this);


                            } else {

                                tranformed = schema.applyOnProperty(['toDatabaseQueryValue', 'toDatabaseValue', 'noop'], key, value, {
                                    statement: statement,
                                    store:     this
                                });

                                lang.setObject(path, tranformed, where);

                            }


                        }


                    };

                    if (where) {

                        _.each(where, transform, this);

                    }

                }

            });


        /**
         * Extend the store with all methods on the on the database cartridge we are trying to extend
         */
        _.each(delegateMethods, function (named) {

            extension[named] = function () {

                var args = Array.prototype.slice.call(arguments),
                    willCallbackName = '_will' + _.capitalize(named) + 'Callback',
                    didCallbackName = '_did' + _.capitalize(named) + 'Callback',
                    statement;

                args.unshift(this._tableName);

                statement = this._database[named].apply(this._database, args);

                if (this[willCallbackName]) {
                    statement.on('will-execute').then(this.hitch(willCallbackName));
                }

                //global callback
                statement.on('will-execute').then(this.hitch('_willExecuteQuery'));

                if (this[didCallbackName]) {
                    statement.on('did-execute').then(this.hitch(didCallbackName));
                }


                return statement;

            };

        });

        Store.extendOnce(extension);

        return Store;

    });