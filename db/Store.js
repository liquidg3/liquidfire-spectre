define(['altair/facades/declare',
        'lodash',
        'altair/Lifecycle'
], function (declare,
            _,
            Lifecycle) {

    var delegateMethods = ['find', 'findOne', 'delete', 'update'],
        extension       = {},
        Store = declare(null, {


            _tableName: '',
            _entityName: '',
            _database: null,
            _entityPath: '',

            constructor: function (options) {

                this._database      = options.database;
                this._tableName     = options.tableName;
                this._entityPath    = options.entityPath;
                this._entityName    = this._entityPath.split('/').pop();

            },

            create: function (values) {
                return this.parent.forge(this._entityPath, values, {
                    foundry: this.hitch(this, 'forgeEntity')
                });
            },

            forgeEntity: function (record) {

                var entity = config.defaultFoundry(Class, options, config);


                return entity;

            },

            _findCallback: function (cursor) {

                //wont to set the foundry on the cursor before its returned
                cursor.foundry(this.hitch('forgeEntity'));

                return cursor;

            }

    });


    /**
     * Extend the store for all the delegate methods
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