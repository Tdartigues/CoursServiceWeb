const express = require('express')
const app = express()
const port = 3000

const books = require('../BDD.json')

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log('Example app listening at http://localhost:3000/%27')
})

app.get('/books', (req, res) => {
    res.status(200).json(books)
})

app.get('/books/:id', (req, res) =>{
   const id = parseInt(req.params.id)
   const book = books.find(book => book.id === id)
   res.status(200).json(book)
})

app.put('/books/:id', (req, res) =>{
    const id = parseInt(req.params.id)
    const book = books.find(book => book.id === id)
    book.name = req.name
    res.status(200).json(book)
 })