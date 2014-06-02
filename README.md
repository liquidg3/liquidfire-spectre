# liquidfire:Spectre
Where else would you go to find entities? What is an entity? It's easy;

_an entity is an object that represents a record/document in a database._

## Isn't that a model?
I think you mean "isn't that a data model?" Most modern frameworks use the term "model" to define what is truly an "entity."
A model is where you house your "business logic." It is what makes your app go. Many times a model will work with or on
an entity, but not always.

## What do entities do?
Let me show you an entity (and entity store) in action.

```js
this.entity('User').then(function (store) {

    //the User store is where you'll find all your users. A store as database agnostic
    return store.find().where('email', '==', 'test@test.com');

}).then(function (user) {

    if(!user) {
        throw new Error('user not found!');
    } else {

        //since entities use apollo/_HasSchemaMixin, the familiar get/set/setValues/getValues/etc. are available.
        return user.set('firstName', 'tay')
                   .save(); //every entity is extended with save(), it returns a Promise.


    }

}).then(function (user) {

    //the first name is now updated
    console.log(user.get('firstName'), 'updated');

});

```

##Creating your first entity
An entity is a generic AMD module that mixes in apollo/_HasSchemaMixin.

```js

define(['altair/facades/declare',
        'apollo/_HasSchemaMixin'
], function (declare, _HasSchemaMixin) {

    return declare([_HasSchemaMixin], {





    });

});


```