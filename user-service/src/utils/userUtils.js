const getOwner = async (inputParameters) => {
    const { id } = inputParameters;
    return id;
}

module.exports = {
    getOwner
}