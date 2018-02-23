#!/usr/bin/node

'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const rimraf = require('rimraf');

const express = require('express');
const app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

function genRandom (low, high, length) {
    let string = '';
    for (let i = 0; i < length; i++) {
        string += Math.floor(Math.random() * (high - low) + low);
    }
    return string;
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/encode', (req, res) => {
    const enocdeDir = `/tmp/steg-encode-${genRandom(0, 9, 8)}/`;

    fs.mkdir(enocdeDir, (error) => {
        if (error) {
            throw error;
        }
    });

    const image = req.files.image;
    const file = req.files.file;

    if (image == null || file == null) {
        return res.status(500).send('Failed to retrieve files');
    }

    image.mv(enocdeDir + image.name, (error) => {
        if (error) {
            return res.status(500).send(error);
        }
    });

    file.mv(enocdeDir + file.name, (error) => {
        if (error) {
            return res.status(500).send(error);
        }
    });

    exec(`../steganography/bin/steganography -i ${enocdeDir}${image.name} -e ${enocdeDir}${file.name}`, (error, stdout, stderr) => {
        if (error) {
            if (stderr.trim() === 'Error: Failed to store file in image the image is too small') {
                res.status(500).send(stderr.trim());
            }
        } else {
            if (stdout) {
                console.log(stdout).trim();
            }

            res.download(enocdeDir + 'steg-' + image.name.substr(0, image.name.lastIndexOf('.')) + '.png', (error) => {
                if (error) {
                    console.log(error);
                }
            });
        }

        rimraf(enocdeDir, (error) => {
            if (error) {
                throw error;
            }
        });
    });
});

app.post('/decode', (req, res) => {
    const decodeDir = `/tmp/steg-decode-${genRandom(0, 9, 8)}/`;

    fs.mkdir(decodeDir, (error) => {
        if (error) {
            throw error;
        }
    });

    const image = req.files.image;

    if (image == null) {
        return res.status(500).send('Failed to retrieve files');
    }

    image.mv(decodeDir + image.name, (error) => {
        if (error) {
            return res.status(500).send(error);
        }
    });

    exec(`../steganography/bin/steganography -i ${decodeDir}${image.name} -d`, (error, stdout, stderr) => {
        if (error) {
            if (stderr.trim() === 'Error: This image does not appear to contain a hidden file') {
                res.status(500).send(stderr.trim());
            }
        } else {
            if (stdout) {
                console.log(stdout).trim();
            }

            fs.unlinkSync(decodeDir + image.name);

            res.download(decodeDir + fs.readdirSync(decodeDir)[0], (error) => {
                if (error) {
                    console.log(error);
                }
            });
        }

        rimraf(decodeDir, (error) => {
            if (error) {
                throw error;
            }
        });
    });
});

const port = 8080;

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
