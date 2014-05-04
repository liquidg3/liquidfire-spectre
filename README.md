# Spectre
Where else would you go to find entities? What is an entity? It's easy;

_an entity is an object that represents a record/document in a database._

## Isn't that a model?
I think you mean "isn't that a data model?" Most modern frameworks use the term "model" to define what is truly an "entity."
A model is where you house your "business logic." It is what makes your app go. Many times a model will work with or on
an entity, but not always.

## What do entities do?
Let me show you:

```js
this.entity('User').then(function (store) {

    return store.find().where('email', '==', 'test@test.com');

}).then(function (user) {

    if(!user) {
        throw new Error('user not found!');
    } else {

        return user.set('firstName', 'tay')
                   .save();


    }

}).then(function (user) {

    console.log(user.firstName, 'updated');

});

```

