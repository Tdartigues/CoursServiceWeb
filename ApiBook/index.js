const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')

app.use(express.json())

const getBooks = () => require('../Books.json')

const findBook = (id) => getBooks().find(m => m.id == id)

app.listen(port, () => {
  console.log('Example app listening at http://localhost:3000/')
})

app.get('/books', (req, res) => {
    res.status(200).json(books)
})

app.get('/books/:id', (req, res) =>{
   const id = parseInt(req.params.id)
   const book = books.find(book => book.id === id)
   res.status(200).json(book)
})

app.put('/books/:id', (req, res) => {
    const body = req.body
    const bookID = req.params.id
    const books = getBooks()
    const book = findBook(bookID)
    if (book) {
        const newBook = body
        books.splice(book, 1, newBook)
        fs.writeFileSync(__dirname + '\\..\\Books.json', JSON.stringify(books))
        res.send(newBook)
    } else {
        res.status(404).end()
    }
})
