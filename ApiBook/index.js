const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')

app.use(express.json())

const getBooks = () => {
    purgeCache('../Books.json')
    return require('../Books.json')
}

const findBook = (id) => getBooks().find(m => m.id == id)

app.listen(port, () => {
  console.log('Example app listening at http://localhost:3000/%27')
})

app.get('/books', (req, res) => {
    res.status(200).json(getBooks())
})

app.get('/books/:id', (req, res) =>{
   const id = parseInt(req.params.id)
   const book = getBooks().find(book => book.id === id)
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

app.post('/books', (req, res) => {
    let books = getBooks()
    let newBook = req.body
    if(books.find(b => b.id == newBook.id)){
        res.status(400).end()
    } else {
        books.push(newBook)
        fs.writeFileSync(__dirname + '\\..\\Books.json', JSON.stringify(books))
        res.status(201).send(newBook)
    }
})

app.delete('/books/:id', (req, res) => {
    let books = getBooks()
    let bookID = req.params.id
    if(books.find(b => b.id == bookID)){
        const nBooks = books.filter(b => b.id != bookID)
        fs.writeFileSync(__dirname + '\\..\\Books.json', JSON.stringify(nBooks))
        res.status(204).end()
    } else {
        res.status(404).end()
    }
})

/**
 * Removes a module from the cache
 */
function purgeCache(moduleName) {
    // Traverse the cache looking for the files
    // loaded by the specified module name
    searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName)>0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
};

/**
 * Traverses the cache to search for all the cached
 * files of the specified module name
 */
function searchCache(moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function traverse(mod) {
            // Go over each of the module's children and
            // traverse them
            mod.children.forEach(function (child) {
                traverse(child);
            });

            // Call the specified callback providing the
            // found cached module
            callback(mod);
        }(mod));
    }
};
