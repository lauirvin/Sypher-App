#!/usr/bin/node

'use strict';

const express = require('express');
const app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/upload', (req, res) => {
    let image = req.files.image;
    let file = req.files.file;

    if (image == null || file == null) {
        return res.status(400).send('Files not uploaded correctly');
    }

    image.mv(image.name, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
    });

    file.mv(file.name, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
    });

    return res.status(201).send('Created');
});

const port = 8080;

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
