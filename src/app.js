require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const MOVIES = require('./movies-data.json')

const app = express()

const morganOption = (NODE_ENV === 'production')
? 'tiny'
: 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')
  const apiToken = process.env.API_TOKEN
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({error: 'Unauthorized request'})
  }
  next()
})

app.use(function errorHandler(error, req, res, next) {
       let response
       if (NODE_ENV === 'production') {
         response = { error: { message: 'server error' } }
       } else {
         console.error(error)
         response = { message: error.message, error }
       }
       res.status(500).json(response)
     })

     function handleGetMovies(req, res) {
       let response = MOVIES
       if (req.query.genre) {
        response = response.filter(movie =>
          movie.genre.toLowerCase().includes(req.query.genre.toLowerCase()))
       }

       if (req.query.country) {
        response = response.filter(movie =>
          movie.country.toLowerCase().includes(req.query.country.toLowerCase()))
       }

       if (req.query.vote) {
        response = response.filter(movie => 
          movie.avg_vote >= req.query.vote)

       }
      res.send(response)

     }

app.get('/movie', handleGetMovies)



module.exports = app