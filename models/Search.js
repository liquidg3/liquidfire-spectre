define(['altair/facades/declare',
        'altair/mixins/_DeferredMixin',
        'altair/mixins/_AssertMixin',
        'lodash'],

    function (declare,
              _DeferredMixin,
              _AssertMixin,
              _) {

        "use strict";

        return declare([_DeferredMixin, _AssertMixin], {

            find: function (entityType, options) {

                var _options = options || {},
                    page     = _options.page,
                    sort     = _options.sort,
                    perPage  = _options.perPage;

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

                    return statement.execute();


                }).then(function (cursor) {

                    console.log(cursor);



                });

            }


        });

    });