const userConnector = require('../connectors/userConnector');

const getUserByIdentifier = async (identifier, category) => {
    return userConnector.getUserByIdentifier({identifier, category});
};

const updateUserByIdentifier = async (userData) => {
    return userConnector.updateUserByIdentifier(userData);
};

const createUserByCategory = async (userData) => {
    return userConnector.createUserByIdentifier(userData);
};

module.exports = {
    createUserByCategory,
    getUserByIdentifier,
    updateUserByIdentifier
}