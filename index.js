#!/usr/bin/env node

'use strict';

// Load modules

const Fs = require('fs');
const Path = require('path');
const Toc = require('markdown-toc');

// Declare internals

const internals = {
    basePath: process.cwd(),
    defineFile(filename) {

        const path = Path.join(internals.basePath, filename);
        return {
            filename,
            path,
            contents: Fs.readFileSync(path, 'utf8')
        };
    }
};

internals.package = require(Path.join(internals.basePath, 'package.json'));
internals.api = internals.defineFile('API.md');
internals.readme = internals.defineFile('README.md');

internals.generateToc = function () {

    const tocOptions = {
        bullets: '-',
        slugify(text) {

            return text.toLowerCase()
                .replace(/\s/g, '-')
                .replace(/[^\w-]/g, '');
        }
    };

    const api = Toc.insert(internals.api.contents, tocOptions)
        .replace(/<!-- version -->(.|\n)*<!-- versionstop -->/, `<!-- version -->\n# ${internals.package.version} API Reference\n<!-- versionstop -->`);

    Fs.writeFileSync(internals.api.path, api);
};

internals.generateLink = function () {
    // create absolute URL for versioned docs
    const readme = internals.readme.contents
        .replace(/\[API Reference\]\(.*\)/gi, `[API Reference](${internals.package.homepage || ''}/blob/v${internals.package.version}/${internals.api.filename})`);

    Fs.writeFileSync(internals.readme.path, readme);
};

internals.generateToc();
internals.generateLink();
