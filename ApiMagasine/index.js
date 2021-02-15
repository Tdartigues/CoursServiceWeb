const fs = require('fs')
const express = require('express')
const cors = require('cors')
const https = require('https')
const app = express()
const port = 3001
const { v4: uuidv4 } = require('uuid')

const key = fs.readFileSync('./selfsigned.key');
const cert = fs.readFileSync('./selfsigned.crt');
var options = {
    key: key,
    cert: cert
};

app.use(express.json())
app.use(cors())

const getMagazines = () => {
    purgeCache('../Magazine.json')
    return require('../Magazine.json')
}

const findMagazines = (id) => getMagazines().find(m => m.id === id)

app.listen(port, () => {
    console.log('Example app listening at http://localhost:3001/')
})

/*const server = https.createServer(options, app);
server.listen(port, () => {
    console.log("server starting on port : " + port)
});*/

app.get('/magazines', (req, res) => {
    printLog(req)
    res.status(200).json(getMagazines())
})

app.get('/magazines/:id', (req, res) =>{
    printLog(req)
    const id = req.params.id
    const magazine = getMagazines().find(magazine => magazine.id === id)
    if(magazine) {
        res.status(200).json(magazine)
    }
    else {
        res.status(404).end()
    }
})

app.put('/magazines/:id', (req, res) => {
    printLog(req)
    const body = req.body
    const magazineID = req.params.id
    body.id = magazineID
    const magazines = getMagazines()
    const magazine = findMagazines(magazineID)
    if (magazine) {
        const magazineIdx = magazines.findIndex(m => m.id === magazineID)
        magazines.splice(magazineIdx, 1, body)
        fs.writeFileSync(__dirname + '\\..\\Magazine.json', JSON.stringify(magazines))
        res.send(body)
    } else {
        res.status(404).end()
    }
})

app.post('/magazines', (req, res) => {
    printLog(req)
    const magazines = getMagazines()
    const newMagazine = req.body
    newMagazine.id = uuidv4()
    magazines.push(newMagazine)
    fs.writeFileSync(__dirname + '\\..\\Magazine.json', JSON.stringify(magazines))
    res.status(201).send(newMagazine)
})

app.delete('/magazines/:id', (req, res) => {
    printLog(req)
    const magazines = getMagazines()
    const magazineID = req.params.id
    if(magazines.find(m => m.id === magazineID)){
        const nMagazines = magazines.filter(m => m.id !== magazineID)
        fs.writeFileSync(__dirname + '\\..\\Magazine.json', JSON.stringify(nMagazines))
        res.status(204).end()
    } else {
        res.status(404).end()
    }
})

app.patch('/magazines/:id', (req, res) => {
    printLog(req)
    const body = req.body
    const magazineID = req.params.id
    const magazines = getMagazines()
    const magazine = findMagazines(magazineID)
    if (magazine) {
        const newMagazine = Object.assign({}, magazine, body)
        const magazineIdx = magazines.findIndex(m => m.id === magazineID)
        magazines.splice(magazineIdx, 1, newMagazine)
        fs.writeFileSync(__dirname + '\\..\\Books.json', JSON.stringify(magazines))
        res.send(newMagazine)
    } else {
        res.status(404).end()
    }
})

function printLog(req) {
    console.log("New Requete")
    console.log("  " + req.method + req.originalUrl) //La requete (methode + route)
    console.log("  " + req.headers['x-forwarded-for'] || req.socket.remoteAddress) //l'adresse ip de l'émeteur
    console.log("End Requete")
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