const crypto = require('crypto');

function GenerateID() {
    return crypto.randomBytes(10).toString('hex');
}

let Utils = {
    GenerateID: GenerateID
};

module.exports = Utils; // eslint-disable-line