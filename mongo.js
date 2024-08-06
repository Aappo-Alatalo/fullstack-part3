const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
} else if (process.argv.length === 3) {
  // User provided only the password
  const password = process.argv[2]

  const url =
    `mongodb+srv://Aappo:${password}@cluster0.e9chu5y.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`

  mongoose.set('strictQuery', false)
  mongoose.connect(url)

  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

  const Person = mongoose.model('Person', personSchema)

  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(person.name + ' ' + person.number)
    })
    mongoose.connection.close()
  })

} else if (process.argv.length === 5) {
  // User provided password, name, and number
  const password = process.argv[2]
  const name = process.argv[3]
  const number = process.argv[4]

  const url =
    `mongodb+srv://Aappo:${password}@cluster0.e9chu5y.mongodb.net/phoneBook?retryWrites=true&w=majority&appName=Cluster0`

  mongoose.set('strictQuery', false)
  mongoose.connect(url)

  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

  const Person = mongoose.model('Person', personSchema)

  const person = new Person({
    name: name,
    number: number,
  })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })

} else {
  console.log('Invalid number of arguments')
  console.log('Usage: node mongo.js <password> [name] [number]')
  process.exit(1)
}
