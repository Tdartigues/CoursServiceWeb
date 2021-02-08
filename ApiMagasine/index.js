const fs = require('fs')
const express = require('express')
const app = express()
const port = 3001

app.use(express.json())

const getMagazines = () => {
    purgeCache('../Magazine.json')
    return require('../Magazine.json')
}

const findMagazines = (id) => getMagazines().find(m => m.id == id)

app.listen(port, () => {
    console.log('Example app listening at http://localhost:3001/')
})

app.get('/magazines', (req, res) =>
    res.status(200).json(getMagazines())
)

app.get('/magazines/:id', (req, res) =>{
    const id = parseInt(req.params.id)
    const magazine = getMagazines().find(magazine => magazine.id == id)
    if(magazine) {
        res.status(200).json(magazine)
    }
    else {
        res.status(404).end()
    }

})

app.put('/magazines/:id', (req, res) => {
    const body = req.body
    const magazineID = req.params.id
    const magazines = getMagazines()
    const magazine = findMagazines(magazineID)
    if (magazine) {
        const newMagazine = body
        magazines.splice(magazine, 1, newMagazine)
        fs.writeFileSync(__dirname + '\\..\\Magazine.json', JSON.stringify(magazines))
        res.send(newMagazine)
    } else {
        res.status(404).end()
    }
})

app.post('/magazines', (req, res) => {
    let magazines = getMagazines()
    let newMagazine = req.body
    if(magazines.find(m => m.id == newMagazine.id)){
        res.status(400).end()
    } else {
        magazines.push(newMagazine)
        fs.writeFileSync(__dirname + '\\..\\Magazine.json', JSON.stringify(magazines))
        res.status(201).send(newMagazine)
    }
})

app.delete('/magazines/:id', (req, res) => {
    let magazines = getMagazines()
    let magazineID = req.params.id
    if(magazines.find(m => m.id == magazineID)){
        const nMagazines = magazines.filter(m => m.id != magazineID)
        fs.writeFileSync(__dirname + '\\..\\Magazine.json', JSON.stringify(nMagazines))
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