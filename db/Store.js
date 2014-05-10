define(['altair/facades/declare',
        'altair/facades/all',
        'altair/mixins/_DeferredMixin',
        'lodash'
], function (declare,
             all,
             _DeferredMixin,
            _) {

    var delegateMethods = ['find', 'findOne', 'delete', 'update', 'count'],
        extension       = {},
        Store = declare([_DeferredMixin], {


            _tableName:     '',
            _entityName:    '',
            _entitySchema:  null,
            _database:      null,
            _entityPath:    '',

            constructor: function (options) {

                this._database      = options.database;
                this._entitySchema  = options.schema;
                this._tableName     = this._entitySchema.option('tableName');
                this._entityPath    = options.entityPath;
                this._entityName    = options.entityName || this._entityPath.split('/').pop(); //default entity name (if no "name" is specified in schema)

            },

            name: function () {
                return this._entityName;
            },

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
                    if(entity.primaryValue()) {

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

            create: function (values) {

                var options = {
                    _schema: this._entitySchema,
                    values: values
                };

                return this.forge(this._entityPath, options, { type: 'entity', name: this._entityName }).then(this.hitch(function (entity) {
                    entity.store = this;
                    return entity;
                }));
            },

            _findCallback: function (e) {

                var cursor = e.get('results');

                cursor.foundry = this.hitch('create');

            },

            _findOneCallback: function (e) {

                var record = e.get('results');

                return this.create(record).then(function (entity) {
                    e.set('results', entity);
                });

            }

    });


    /**
     * Extend the store with all methods on the on the database cartridge we are trying to extend
     */
    _.each(delegateMethods, function (named) {

        extension[named] = function () {

            var args            = Array.prototype.slice.call(arguments),
                callbackName    = '_' + named + 'Callback',
                statement;

            args.unshift(this._tableName);

            statement = this._database[named].apply(this._database, args);

            if(this[callbackName]) {
                statement.on('did-execute').then(this.hitch(callbackName));
            }

            return statement;

        };

    });

    Store.extendOnce(extension);

    return Store;

});