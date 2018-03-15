#!/usr/bin/node

'use strict';

const es6Renderer = require('express-es6-template-engine');
const exec = require('child_process').exec;
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const glob = require('glob');
const lessMiddleware = require('less-middleware');
const mime = require('mime');
const path = require('path').posix;
const rimraf = require('rimraf');
const schedule = require('node-schedule');
const uuid = require('uuid/v1');

const app = express();

const steg = 'src/steganography/bin/steganography';

app.engine('html', es6Renderer);
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(lessMiddleware(path.join(__dirname, 'public')));

app.set('view engine', 'html');

function removeRouteByRoute(routePath) {
    app._router.stack.map((route, index) => {
        if (route.path == routePath) {
            app._router.stack.splice(index, 1);
        }

        try {
            if (route.route.path == routePath) {
                app._router.stack.splice(index, 1);
            }
        } catch (Typeerr) {

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

fs.readdirSync(path.join(__dirname, 'pages', 'static')).map(page => {
    if (page.split('.').pop() === 'html') {
        if (page === 'index.html') {
            app.get('/', (req, res) => {
                res.sendFile(path.join(__dirname, 'pages', 'static',page));
            });
        } else {
            app.get(path.join('/', 'pages', page), (req, res) => {
                res.sendFile(path.join(__dirname, 'pages', 'static', page));
            });
        }
    }
});

app.post('/download_encoded.html', (req, res) => {
    const id = uuid();
    const encodeDir = path.join('/tmp/steg-encode-') + id;

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
            throw error;
        }
    });

    file.mv(path.join(encodeDir, file.name), (error) => {
        if (error) {
            throw error;
        }
    });

    exec(`${steg} -i '${path.join(encodeDir, image.name)}' -e '${path.join(encodeDir, file.name)}'`, (error, stdout, stderr) => {
        if (error) {
            if (stderr.trim() === 'Error: Failed to store file in image the image is too small') {
                res.status(500).send(stderr.trim());
            }
        } else {
            if (stdout) {
                console.log(stdout.trim());
            }

            const filePath = path.join(encodeDir, 'steg-' + image.name.substr(0, image.name.lastIndexOf('.'))) + '.png';
            addRouteById(id, filePath);

            const encodedImage = fs.readFileSync(filePath);
            const encodedImageMimeType = mime.getType(filePath);

            res.render(path.join(__dirname, 'pages', 'dynamic', 'encode_download.html'), {
                locals: {
                    imagePreview: `data:${encodedImageMimeType};base64,${new Buffer(encodedImage).toString('base64')}`,
                    downloadUrl: `/${id}`
                }
            });
        }
    });
});

app.post('/download_decoded.html', (req, res) => {
    const id = uuid();
    const decodeDir = path.join('/tmp/steg-decode-') + id;

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
            throw error;
        }
    });

    exec(`${steg} -i '${path.join(decodeDir, image.name)}' -d`, (error, stdout, stderr) => {
        if (error) {
            if (stderr.trim() === 'Error: This image does not appear to contain a hidden file') {
                res.status(500).send(stderr.trim());
            }
        } else {
            if (stdout) {
                console.log(stdout.trim());
            }

            if (fs.readdirSync(decodeDir).length !== 1) {
                fs.unlinkSync(path.join(decodeDir, image.name));
            }

            const filePath = path.join(decodeDir, fs.readdirSync(decodeDir)[0]);
            addRouteById(id, filePath);

            const encodedImage = fs.readFileSync(filePath);
            const encodedImageMimeType = mime.getType(filePath);

            res.render(path.join(__dirname, 'pages', 'dynamic', 'decode_download.html'), {
                locals: {
                    imagePreview: `data:${encodedImageMimeType};base64,${new Buffer(encodedImage).toString('base64')}`,
                    downloadUrl: `/${id}`
                }
            });
        }
    });
});

schedule.scheduleJob('0 * * * *', () => {
    glob(path.join('/tmp', 'steg-*'), (error, files) => {
        if (error) {
            throw error;
        }

        files.map(filePath => {
            fs.stat(filePath, (error, stats) => {
                if (error) {
                    throw error;
                }

                let timeNow = new Date().getTime();
                let fileTime = new Date(stats.ctime).getTime() + 3600000;

                if (timeNow > fileTime) {
                    rimraf(filePath, (error) => {
                        if (error) {
                            throw error;
                        }
                    });

                    let route = filePath.split('-');

                    route.shift();
                    route.shift();

                    removeRouteByRoute('/' + route.join('-'));
                }
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
