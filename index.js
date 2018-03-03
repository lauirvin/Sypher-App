#!/usr/bin/node

'use strict';

const cheerio = require('cheerio');
const exec = require('child_process').exec;
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const glob = require('glob');
const lessMiddleware = require('less-middleware');
const path = require('path');
const rimraf = require('rimraf');
const schedule = require('node-schedule');
const uuid = require('uuid/v1');

const app = express();

const steg = 'src/steganography/bin/steganography';

app.use(express.static(path.posix.join(__dirname, 'public')));
app.use(fileUpload());
app.use(lessMiddleware(path.posix.join(__dirname, 'public')));

function removeRouteByRoute(routePath) {
    app._router.stack.map((route, index, routes) => {
        try {
            if (route.route.path == routePath) {
                routes.splice(index, 1);
            }
        } catch (TypeError) {

        }
    });
}

function addRouteById(id, filePath) {
    app.get('/' + id, (req, res) => {
        res.download(filePath);

        rimraf(path.dirname(filePath), (error) => {
            if (error) {
                throw error;
            }
        });

        removeRouteByRoute('/' + id);
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

app.post('/download_encoded.html', (req, res) => {
    const id = uuid();
    const encodeDir = path.posix.join('/tmp/steg-encode-') + id;

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

    exec(`${steg} -i '${path.posix.join(encodeDir, image.name)}' -e '${path.posix.join(encodeDir, file.name)}'`, (error, stdout, stderr) => {
        if (error) {
            if (stderr.trim() === 'Error: Failed to store file in image the image is too small') {
                res.status(500).send(stderr.trim());
            }
        } else {
            if (stdout) {
                console.log(stdout).trim();
            }

            const filePath = path.posix.join(encodeDir, 'steg-' + image.name.substr(0, image.name.lastIndexOf('.'))) + '.png';
            addRouteById(id, filePath);

            const $ = cheerio.load(fs.readFileSync(path.posix.join('pages', 'encode_download.html.noserv')));
            $('#download_url').attr('href', `/${id}`);
            res.send($.html());
        }
    });
});

app.post('/download_decoded.html', (req, res) => {
    const id = uuid();
    const decodeDir = path.posix.join('/tmp/steg-decode-') + id;

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

    exec(`${steg} -i '${path.posix.join(decodeDir, image.name)}' -d`, (error, stdout, stderr) => {
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

            const filePath = path.posix.join(decodeDir, fs.readdirSync(decodeDir)[0]);
            addRouteById(id, filePath);

            const $ = cheerio.load(fs.readFileSync(path.posix.join('pages', 'decode_download.html.noserv')));
            $('#download_url').attr('href', `/${id}`);
            res.send($.html());
        }
    });
});

schedule.scheduleJob('0 * * * *', () => {
    glob(path.posix.join('/tmp', 'steg-*'), (error, files) => {
        if (error) {
            throw error;
        }

        files.map(filePath => {
            fs.stat(filePath, (error, stats) => {
                if (error) {
                    throw error;
                }

                let timeNow = new Date().getTime();
                let fileTime = new Date(stats.ctime).getTime();// + 3600000;

                if (timeNow > fileTime) {
                    rimraf(filePath, (error) => {
                        if (error) {
                            throw error;
                        }
                    });
                }

                let route = filePath.split('-');
                route.shift();
                route.shift();

                removeRouteByRoute('/' + route.join('-'));
            });
        });
    });
});

const port = 8080;

app.listen(port, () => {
    glob('/tmp/steg-*', (error, files) => {
        if (error) {
            throw error;
        }

        files.map(file => {
            rimraf(file, (error) => {
                if (error) {
                    throw error;
                }
            });
        });
    });

    console.log(`app listening on port ${port}`);
});
