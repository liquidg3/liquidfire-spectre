define(['altair/facades/declare',
        'lodash'
], function (declare,
            _) {

    var delegateMethods = ['find', 'findOne', 'delete', 'update', 'count'],
        extension       = {},
        Store = declare(null, {


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
                this._entityName    = this._entitySchema.option('name') || this._entityPath.split('/').pop(); //default entity name (if no "name" is specified in schema)

            },

            entityName: function () {
                return this._entityName;
            },

            entitySchema: function () {
                return this._entitySchema;
            },

            create: function (values) {
                return this.parent.forge(this._entityPath, values, {
                    foundry: this.hitch(this, 'forgeEntity')
                });
            },

            forgeEntity: function (record) {

                var entity = null;


                return entity;

            },

            _findCallback: function (e) {

                var cursor = e.get('results');

                //wont to set the foundry on the cursor before its returned
                cursor.foundry = this.hitch('forgeEntity');


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