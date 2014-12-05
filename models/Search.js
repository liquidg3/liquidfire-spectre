define(['altair/facades/declare',
        'altair/mixins/_DeferredMixin',
        'altair/mixins/_AssertMixin',
        'altair/facades/mixin',
        'lodash'],

    function (declare,
              _DeferredMixin,
              _AssertMixin,
              mixin,
              _) {

        "use strict";

        return declare([_DeferredMixin, _AssertMixin], {

            find: function (entityType, options) {

                var _options = options || {},
                    page     = parseInt(_options.page, 10),
                    sort     = _options.sort,
                    event    = _options.event,
                    searchField = _options.searchField,
                    searchValue = _options.searchValue,
                    transform = _options.transform || function (entity) {
                        return entity.getValues();
                    },
                    perPage  = parseInt(_options.perPage, 10);

                this.assertNumeric(page, 'You must pass a "page" option to search.');
                this.assertNumeric(perPage, 'You must pass a "perPage" option to search.');

                //max per page
                perPage = Math.min(perPage, 50);

                return this.parent.entity(entityType).then(function (store) {

                    //create statement, starting with skip & limit
                    var statement = store.find().skip(page * perPage).limit(perPage);

                    //if a sort was passed, sort by each
                    if (sort) {

                        _.each(sort, function (direction, field) {
                            statement.sortBy(field, direction);
                        });

                    }

                    //are we searching?
                    if (searchField) {
                        statement.where(searchField, '===', searchValue);
                    }

                    return statement.execute();


                }).then(function (cursor) {

                    var results = [],
                        total    = cursor.total(),
                        stepping = cursor.each().step(function (entity) {

                        results.push(transform(entity));

                    }).then(function () {
                        return results;
                    });

                    return this.all({
                        total: total,
                        results: stepping
                    });

                }.bind(this));

            },

            findFromEvent: function (entityType, e, options) {

                var request = e.get('request'),
                    _options = {
                        perPage:    request.get('perPage'),
                        page:       request.get('page'),
                        searchField: request.get('searchField'),
                        searchValue: request.get('searchValue'),
                        transform:  function (entity) {
                            return entity.getHttpResponseValues(e);
                        }
                    };

                if (request.get('sortField')) {
                    _options.sort = {};
                    _options.sort[request.get('sortField')] = request.get('sortDirection', 'ASC');
                }

                return this.find(entityType, mixin(_options, options || {}))


            }


        });

    });