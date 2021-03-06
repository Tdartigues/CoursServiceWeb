const fs = require('fs')
const express = require('express')
const cors = require('cors')
const https = require('https')
const app = express()
const port = 3000
const { v4: uuidv4 } = require('uuid')

const key = fs.readFileSync('./selfsigned.key');
const cert = fs.readFileSync('./selfsigned.crt');
var options = {
    key: key,
    cert: cert
};

app.use(express.json())
app.use(cors())

const getBooks = () => {
    purgeCache('../Books.json')
    return require('../Books.json')
}

const findBook = (id) => getBooks().find(b => b.id === id)

app.listen(port, () => {
  console.log('Example app listening at http://localhost:3000/')
})

/*const server = https.createServer(options, app);
server.listen(port, () => {
    console.log("server starting on port : " + port)
});*/

app.get('/books', (req, res) => {
    printLog(req)
    res.status(200).json(getBooks())
})

app.get('/books/:id', (req, res) =>{
    printLog(req)
    const id = req.params.id
    const book = getBooks().find(book => book.id === id)
    if(book){
        res.status(200).json(book)
    }
    else {
        res.status(404).end()
    }
})

app.put('/books/:id', (req, res) => {
    printLog(req)
    const body = req.body
    const bookID = req.params.id
    body.id = bookID
    const books = getBooks()
    const book = findBook(bookID)
    if (book) {
        const bookIdx = books.findIndex(b => b.id === bookID)
        books.splice(bookIdx, 1, body)
        fs.writeFileSync(__dirname + '\\..\\Books.json', JSON.stringify(books))
        res.send(body)
    } else {
        res.status(404).end()
    }
})

app.post('/books', (req, res) => {
    printLog(req)
    const books = getBooks()
    const newBook = req.body
    newBook.id = uuidv4()
    books.push(newBook)
    fs.writeFileSync(__dirname + '\\..\\Books.json', JSON.stringify(books))
    res.status(201).send(newBook)
})

app.delete('/books/:id', (req, res) => {
    printLog(req)
    const books = getBooks()
    const bookID = req.params.id
    if(books.find(b => b.id === bookID)){
        const nBooks = books.filter(b => b.id !== bookID)
        fs.writeFileSync(__dirname + '\\..\\Books.json', JSON.stringify(nBooks))
        res.status(204).end()
    } else {
        res.status(404).end()
    }
})

app.patch('/books/:id', (req, res) => {
    printLog(req)
    const body = req.body
    const bookID = req.params.id
    const books = getBooks()
    const book = findBook(bookID)
    if (book) {
        const newBook = Object.assign({}, book, body)
        const bookIdx = books.findIndex(b => b.id === bookID)
        books.splice(bookIdx, 1, newBook)
        fs.writeFileSync(__dirname + '\\..\\Books.json', JSON.stringify(books))
        res.send(newBook)
    } else {
        res.status(404).end()
    }
})

function printLog(req) {
    console.log("new Requete")
    console.log("  " + req.method + req.originalUrl) //La requete (methode + route)
    console.log("  " + req.headers['x-forwarded-for'] || req.socket.remoteAddress) //l'adresse ip de l'émeteur
    console.log("End Requete ")
}

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
