require('dotenv').config()

const mongoose = require("mongoose")

let mongooseConnect = false

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection
db.on('error',() => {
  mongooseConnect = false
  console.error("Failed to connect to MongoDB")
})

db.once('open',() => {
  mongooseConnect = true
  console.info("Succesfully connected to MongoDB")
})

const URLSchema = new mongoose.Schema({
    original_url : {
      type : String,
      required : true
    },
    short_url : {
      type : Number,
      required: true
    }
  })
  
  const URLModel = mongoose.model('url',URLSchema)

  const sequenceSchema = new mongoose.Schema({
      id : {
          type : String,
          required : true
      },
      counter : {
          type : Number,
          required : true
      }
  })

  const sequenceModel = mongoose.model('sequence',sequenceSchema)

async function getNextId(idName) {
    //console.log({idName})
    let seq = null  
    try {
        seq = await getNextCounter({id : idName}, {"$inc" : {counter : 1}},{"new" : true, useFindAndModify : false})
      } catch(err) {
          console.error(err)
      }
      let counter = seq ? seq.counter : null
      return counter;
  }

  /**
   * 
   * @param {mongoose.Connection} dbref 
   * @param {*} query 
   * @param {*} update 
   * @param {*} options 
   * @returns 
   */
function getNextCounter(query,update,options) {
      return new Promise((resolve,reject) => {
        sequenceModel.findOneAndUpdate(query,update,options,(err,data) => {
            if(err)
                reject(err)
            if(data)
                //console.log({data})
            resolve(data)
        })
      })
  }

  function saveURL(original_url, short_url) {
    const urlDoc = new URLModel({
      original_url : original_url,
      short_url : short_url
    })
    return urlDoc.save()
  }

  function findURL(short_url) {
    return new Promise((resolve,reject) => {
      URLModel.findOne({short_url : short_url},(err,data) => {
        if(err)
          reject(err)
        else
          resolve(data)
      })
    })
  }

  module.exports.getNextId = getNextId
  module.exports.saveURL = saveURL
  module.exports.findURL = findURL
  module.exports.URLModel = URLModel
  module.exports.sequenceModel = sequenceModel


