#!/usr/bin/node

'use strict';

const exec = require('child_process').exec;
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const lessMiddleware = require('less-middleware')

const app = express();

app.use(lessMiddleware(path.join(__dirname, "public/css")))
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

function genRandom (low, high, length) {
    let string = '';
    for (let i = 0; i < length; i++) {
        string += Math.floor(Math.random() * (high - low) + low);
    }
    return string;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/index.html'));
});

app.get('/pages/encode_main.html', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/encode_main.html'));
});

app.post('/encode', (req, res) => {
    const encodeDir = path.join('/tmp/steg-encode-') + genRandom(0, 9, 8);

    fs.mkdir(encodeDir, (error) => {
        if (error) {
            throw error;
        }
    });

    const image = req.files.image;
    const file = req.files.file;

    if (image == null || file == null) {
        return res.status(500).send('Failed to retrieve files');
    }

    image.mv(path.join(encodeDir, image.name), (error) => {
        if (error) {
            return res.status(500).send(error);
        }
    });

    file.mv(path.join(encodeDir, file.name), (error) => {
        if (error) {
            return res.status(500).send(error);
        }
    });

    exec(`../steganography/bin/steganography -i ${path.join(encodeDir, image.name)} -e ${path.join(encodeDir, file.name)}`, (error, stdout, stderr) => {
        if (error) {
            if (stderr.trim() === 'Error: Failed to store file in image the image is too small') {
                res.status(500).send(stderr.trim());
            }
        } else {
            if (stdout) {
                console.log(stdout).trim();
            }

            res.download(path.join(encodeDir, 'steg-' + image.name.substr(0, image.name.lastIndexOf('.'))) + '.png', (error) => {
                if (error) {
                    console.log(error);
                }
            });
        }

        rimraf(encodeDir, (error) => {
            if (error) {
                throw error;
            }
        });
    });
});

app.post('/decode', (req, res) => {
    const decodeDir = path.join('/tmp/steg-decode-') + genRandom(0, 9, 8);

    fs.mkdir(decodeDir, (error) => {
        if (error) {
            throw error;
        }
    });

    const image = req.files.image;

    if (image == null) {
        return res.status(500).send('Failed to retrieve files');
    }

    image.mv(path.join(decodeDir, image.name), (error) => {
        if (error) {
            return res.status(500).send(error);
        }
    });

    exec(`../steganography/bin/steganography -i ${path.join(decodeDir, image.name)} -d`, (error, stdout, stderr) => {
        if (error) {
            if (stderr.trim() === 'Error: This image does not appear to contain a hidden file') {
                res.status(500).send(stderr.trim());
            }
        } else {
            if (stdout) {
                console.log(stdout).trim();
            }

            if (fs.readdirSync(decodeDir).length !== 1) {
                fs.unlinkSync(path.join(decodeDir, image.name));
            }

            res.download(path.join(decodeDir, fs.readdirSync(decodeDir)[0]), (error) => {
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
