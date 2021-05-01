require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
//const mongoose = require("mongoose")
const validURL = require('valid-url')
const formidable = require('express-formidable')
const {getNextId,saveURL, findURL} = require('./model') 

// Basic Configuration
const port = process.env.PORT || 80;


app.use(formidable())
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:shorturl', async (req,res) => {
  const shorturl = req.params['shorturl']
  try {
    const urlDoc =  await findURL(shorturl)
    res.redirect(urlDoc.original_url)
  }
  catch(err) {
    console.log(err)
    res.status(404).json({error : "Not Found"})
  }
})

app.post('/api/shorturl', async (req,res) => {
  const url = req.fields['url']
  let validURL = validateURL(url)

  if(validURL) {

    try {
      const nextID = await getNextId("urlCounter")
      if(nextID) {
        let returnedDoc = await saveURL(url,nextID)
        //console.log({returnedDoc})
        res.json({original_url : returnedDoc.original_url , short_url : returnedDoc.short_url})
      }
      else {
        res.sendStatus(404) 
      }
      //res.sendStatus(200)
    } catch(err) {
      console.error(err)
      res.sendStatus(404)
    }
  }
  else
    res.json({error: 'invalid url'})
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function validateURL(url) {
  return validURL.isWebUri(url) !== undefined
}