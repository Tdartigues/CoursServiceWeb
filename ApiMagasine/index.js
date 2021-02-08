const fs = require('fs')
const express = require('express')
const app = express()
const port = 3001

app.use(express.json())

const getMagazines = () => require('../Magazine.json')

const findMagazines = (id) => getMagazines().find(m => m.id == id)

//NON utilisé
/*app.get('/', (req, res) => {
  res.send('Hello World!')
})*/

app.listen(port, () => {
    console.log('Example app listening at http://localhost:3001/')
})

app.get('/magazines', (req, res) => {
    res.status(200).json(magazines)
})

app.get('/magazines/:id', (req, res) =>{
    const id = parseInt(req.params.id)
    const magazine = magazines.find(magazine => magazine.id === id)
    res.status(200).json(magazine)
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

