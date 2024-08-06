require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

morgan.token('body', (req) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      return JSON.stringify(req.body)
    }
    return '-'
})

const format = ':method :url :status :response-time ms :body'

app.use(morgan(format))

app.get('/info', (request, response) => {
    Person.find({})
        .then(people => {
            const peopleCount = people.length
            const date = new Date()
            response.send(
            `<p>Phonebook has info for ${peopleCount} people</p>
            <p>${date}</p>`)
        })
        .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    
    if (!body.name) {
        return response.status(400).json({ 
          error: 'name missing' 
        })
    } else if (!body.number) {
        return response.status(400).json({ 
          error: 'number missing' 
        })
    }

    // We don't need to care about double names per 3.14 instructions
    // const existingPerson = persons.find(person => person.name === body.name)
    // if (existingPerson) {
    //   return response.status(400).json({ 
    //     error: 'name must be unique' 
    //   })
    // }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(result => {
            console.log(`added ${result.name} number ${result.number} to phonebook`)
            response.json(person)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(
        request.params.id,
        { name, number },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response, next) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message }) 
    } else {
        console.log(error.name)
    }
    next(error)
}
// tämä tulee kaikkien muiden middlewarejen ja routejen rekisteröinnin jälkeen!
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})