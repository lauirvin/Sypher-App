#!/usr/bin/node

'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const rimraf = require('rimraf');

const express = require('express');
const app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/encode', (req, res) => {
    fs.mkdir('/tmp/steg-encode/', (error) => {
        if (error) {
            throw error;
        }
    });

    const image = req.files.image;
    const file = req.files.file;

    if (image == null || file == null) {
        return res.status(400).send('Files not uploaded correctly');
    }

    image.mv('/tmp/steg-encode/' + image.name, (error) => {
        if (error) {
            return res.status(500).send(error);
        }
    });

    file.mv('/tmp/steg-encode/' + file.name, (error) => {
        if (error) {
            return res.status(500).send(error);
        }
    });

    exec(`../steganography/bin/steganography -i /tmp/steg-encode/${image.name} -e /tmp/steg-encode/${file.name}`, (error, stdout, stderr) => {
        if (error) {
            console.log(stderr.trim());
        }

        if (stdout) {
            console.log(stdout).trim();
        }

        res.download('/tmp/steg-encode/steg-' + image.name.substr(0, image.name.lastIndexOf('.')) + '.png', (error) => {
            if (error) {
                console.log(error);
            }

            rimraf('/tmp/steg-encode/', (error) => {
                if (error) {
                    throw error;
                }
            });
        });
    });
});

app.post('/decode', (req, res) => {
    fs.mkdir('/tmp/steg-decode/', (error) => {
        if (error) {
            throw error;
        }
    });

    const image = req.files.image;

    if (image == null) {
        return res.status(400).send('Files not uploaded correctly');
    }

    image.mv('/tmp/steg-decode/' + image.name, (error) => {
        if (error) {
            return res.status(500).send(error);
        }
    });

    exec(`../steganography/bin/steganography -i /tmp/steg-decode/${image.name} -d`, (error, stdout, stderr) => {
        if (error) {
            console.log(stderr.trim());
        }

        if (stdout) {
            console.log(stdout).trim();
        }

        fs.unlinkSync(`/tmp/steg-decode/${image.name}`);

        res.download('/tmp/steg-decode/' + fs.readdirSync('/tmp/steg-decode/')[0], (error) => {
            if (error) {
                console.log(error);
            }

            rimraf('/tmp/steg-decode/', (error) => {
                if (error) {
                    throw error;
                }
            });
        });
    });
});

const port = 8080;

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
