// REST API for the opinions collection
const express = require('express');
const router = express.Router();

  // Connect to the collection
  let db = null;
  const mongodb = require('mongodb');
  mongodb.MongoClient.connect('mongodb://localhost:27017', function(error, client) {
    if (error) throw error;
    db = client.db('pub56');
    db.students = db.collection('students');
    db.items = db.collection('items');
  });

  // Get all the students
  router.get('/', function(request, response, next) {
    db.students.find().toArray(function(error, students) {
      if (error) return next(error);
      response.json(students);
    });
  });

  // get current student
  router.get('/:id', function(request, response, next){
    const student = {
      _id : request.params.id
    };

    db.students.findOne(student, function(error, student){
      if (error) return next(error);
      if (!student) return next(new Error("Not Found"));
      response.json(student);
    })

  });

  // add an order to the shopping cart
  router.patch('/:id/order', function(request, response, next){
    if (!request.user) return next(new Error('Forbidden'));
    const student = {
      _id : request.params.id
    };
    const reterivedItem = {
      'item_id': request.query.item_id
    }

    db.items.findOne(reterivedItem, function(error, item){
      if (error) return next(error);

      let insertedItem = {
        $push : {
          order : item
        }
      }
      db.students.updateOne(student, insertedItem, function(error, report){
        if (error) return next(error);
      });
    });
  });

  // Route to addfunds
  router.patch('/:id/addfunds', function(request, response, next){
    if (!request.user) return next(new Error('Forbidden'));
      const student = {
        _id : request.params.id
      };
      const updatedBalance = {
            $inc: {
              balance: parseInt(request.query.funds),
              }
            }


      db.students.updateOne(student, updatedBalance, function(error, report){
        if (error) return next(error);
        db.students.findOne(student, function(error, student){
          if (error) return next(error);
          if (!student) return next(new Error("Not Found"));
          response.json(student);
        })
      })

  });

  // Route to remove funds
  router.patch('/:id/removefunds', function(request, response, next){
    if (!request.user) return next(new Error('Forbidden'));
      const student = {
        _id : request.params.id,

      };
      const updatedBalance = {
            $inc: {
              balance: parseInt(request.query.funds),
              }
            }

      db.students.updateOne(student, updatedBalance, function(error, report){
        if (error) return next(error);
        db.students.findOne(student, function(error, student){
          if (error) return next(error);
          if (!student) return next(new Error("Not Found"));
          response.json(student);
        })
      })

  });

  router.delete('/emptycart', function(request, response, next) {
    const student = {
      _id: request.user.id,
    }
    const tempemptycart = {
      $set: {
        order: [],
      }
    }
    db.students.findOne(student, function(error, student){
      if (error) return next(error);
      db.students.updateOne(student, tempemptycart, function(error,student){
        if (error) return next(error);
      })
      response.json(student);
    })

  })

  // Delete an item from shopping cart
  router.delete('/:id/order', function(request, response, next) {

    const student = {
      _id : request.params.id
    };

    const order = {
      $pull: {
        order: {
          'item_id': request.query.item_id
        }
      }
    };

    db.students.updateOne(student, order, function(error, report){
      if (error) return next(error);
      db.students.findOne(student, function(error, student){
        if (error) return next(error);
        response.json(student);
      })
      })
    });

module.exports = router;
