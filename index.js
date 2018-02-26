#!/usr/bin/node

'use strict';

const exec = require('child_process').exec;
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const lessMiddleware = require('less-middleware');
const path = require('path');
const rimraf = require('rimraf');

const app = express();

app.use(express.static(path.posix.join(__dirname, 'public')));
app.use(fileUpload());
app.use(lessMiddleware(path.posix.join(__dirname, 'public')));

function genRandom (low, high, length) {
    let string = '';
    for (let i = 0; i < length; i++) {
        string += Math.floor(Math.random() * (high - low) + low);
    }
    return string;
}

fs.readdirSync(path.posix.join(__dirname, 'pages')).map(page => {
    if (page.split('.').pop() === 'html') {
        if (page === 'index.html') {
            app.get('/', (req, res) => {
                res.sendFile(path.posix.join(__dirname, 'pages', page));
            });
        } else {
            app.get('/' + path.posix.join('pages', page), (req, res) => {
                res.sendFile(path.posix.join(__dirname, 'pages', page));
            });
        }
    }
});

app.post('/encode', (req, res) => {
    const encodeDir = path.posix.join('/tmp/steg-encode-') + genRandom(0, 9, 8);

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

    image.mv(path.posix.join(encodeDir, image.name), (error) => {
        if (error) {
            throw error;
        }
    });

    file.mv(path.posix.join(encodeDir, file.name), (error) => {
        if (error) {
            throw error;
        }
    });

    exec(`src/steganography/bin/steganography -i '${path.posix.join(encodeDir, image.name)}' -e '${path.posix.join(encodeDir, file.name)}'`, (error, stdout, stderr) => {
        if (error) {
            if (stderr.trim() === 'Error: Failed to store file in image the image is too small') {
                res.status(500).send(stderr.trim());
            }
        } else {
            if (stdout) {
                console.log(stdout).trim();
            }

            res.download(path.posix.join(encodeDir, 'steg-' + image.name.substr(0, image.name.lastIndexOf('.'))) + '.png', (error) => {
                if (error) {
                    throw error;
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
    const decodeDir = path.posix.join('/tmp/steg-decode-') + genRandom(0, 9, 8);

    fs.mkdir(decodeDir, (error) => {
        if (error) {
            throw error;
        }
    });

    const image = req.files.image;

    if (image == null) {
        return res.status(500).send('Failed to retrieve files');
    }

    image.mv(path.posix.join(decodeDir, image.name), (error) => {
        if (error) {
            throw error;
        }
    });

    exec(`src/steganography/bin/steganography -i '${path.posix.join(decodeDir, image.name)}' -d`, (error, stdout, stderr) => {
        if (error) {
            if (stderr.trim() === 'Error: This image does not appear to contain a hidden file') {
                res.status(500).send(stderr.trim());
            }
        } else {
            if (stdout) {
                console.log(stdout).trim();
            }

            if (fs.readdirSync(decodeDir).length !== 1) {
                fs.unlinkSync(path.posix.join(decodeDir, image.name));
            }

            res.download(path.posix.join(decodeDir, fs.readdirSync(decodeDir)[0]), (error) => {
                if (error) {
                    throw error;
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
