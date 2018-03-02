#!/usr/bin/node

'use strict';

const childProcess = require('child_process');
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const lessMiddleware = require('less-middleware');
const path = require('path');
const rimraf = require('rimraf');
const uuid = require('uuid/v1');

const app = express();

const steg = 'src/steganography/bin/steganography';

app.use(express.static(path.posix.join(__dirname, 'public')));
app.use(fileUpload());
app.use(lessMiddleware(path.posix.join(__dirname, 'public')));

function removeRouteByPath(filePath) {
    app._router.stack.forEach((route, i, routes) => {
        try {
            if (route.route.path == filePath) {
                routes.splice(i, 1);
            }
        } catch (TypeError) {

        }
    });
}

function addRouteByPath(id, filePath) {
    app.get('/' + id, (req, res) => {
        res.download(filePath);

        rimraf(path.dirname(filePath), (error) => {
            if (error) {
                throw error;
            }
        });

        removeRouteByPath('/' + id);
    });
}

fs.readdirSync(path.posix.join(__dirname, 'pages')).map(page => {
    if (page.split('.').pop() === 'html') {
        if (page === 'index.html') {
            app.get('/', (req, res) => {
                res.sendFile(path.posix.join(__dirname, 'pages', page));
            });
        } else {
            app.get(path.posix.join('/', 'pages', page), (req, res) => {
                res.sendFile(path.posix.join(__dirname, 'pages', page));
            });
        }
    }
});

app.post('/encode', (req, res) => {
    const encodeDir = path.posix.join('/tmp/steg-encode-') + uuid();

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

    childProcess.exec(`${steg} -i '${path.posix.join(encodeDir, image.name)}' -e '${path.posix.join(encodeDir, file.name)}'`, (error, stdout, stderr) => {
        if (error) {
            if (stderr.trim() === 'Error: Failed to store file in image the image is too small') {
                res.status(500).send(stderr.trim());
            }
        } else {
            if (stdout) {
                console.log(stdout).trim();
            }

            const id = uuid();
            const filePath = path.posix.join(encodeDir, 'steg-' + image.name.substr(0, image.name.lastIndexOf('.'))) + '.png';
            addRouteByPath(id, filePath);
            res.send('localhost:8080/' + id);
        }
    });
});

app.post('/decode', (req, res) => {
    const decodeDir = path.posix.join('/tmp/steg-decode-') + uuid();

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

    childProcess.exec(`${steg} -i '${path.posix.join(decodeDir, image.name)}' -d`, (error, stdout, stderr) => {
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

            const id = uuid();
            const filePath = path.posix.join(decodeDir, fs.readdirSync(decodeDir)[0]);
            addRouteByPath(id, filePath);
            res.send('localhost:8080/' + id);
        }
    });
});

const port = 8080;

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
