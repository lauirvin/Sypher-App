#!/usr/bin/node

'use strict';

const exec = require('child_process').exec;

const express = require('express');
const app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/encode', (req, res) => {
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

    exec(`../steganography/bin/steganography -i ${image.name} -e ${file.name}`, (error, stdout, stderr) => {
        if (error) {
            console.log(stderr.trim());
        }

        if (stdout) {
            console.log(stdout).trim();
        }

        res.download('steg-' + image.name.substr(0, image.name.lastIndexOf('.')) + '.png', (error) => {
            if (error) {
                console.log(error);
            }
        });
    });
});

const port = 8080;

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
