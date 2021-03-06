const crypto = require('crypto'),
    fs = require('fs');

function GenerateID() {
    return crypto.randomBytes(25).toString('hex');
}

function RenameFile(baseUri, id, currentFileName, fileEnding) {
    fs.rename(
        `${baseUri}${currentFileName}`,
        `${baseUri}${id}${fileEnding}`,
        err => {
            if (err) console.log(`Failed changing filename:\n${err}`);
        }
    );
}

let Utils = {
    GenerateID: GenerateID,
    RenameFile: RenameFile
};

module.exports = Utils; // eslint-disable-line