const express = require('express')
const app = express()
const port = 3001

const magazines = require('../Magazine.json')

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

//NON utilisé
/*app.put('/magazine/:id', (req, res) =>{
    const id = parseInt(req.params.id)
    const magazine = magazine.find(magazine => magazine.id === id)
    magazine.name = req.name
    res.status(200).json(magazine)
 })*/