const mongoose = require("mongoose")

const {sequenceModel} = require('./model')

const urlSequence = new sequenceModel({
    id : "urlCounter",
    counter : 0
})

urlSequence.save().then(data => console.log(data)).catch(err => console.error(error))
