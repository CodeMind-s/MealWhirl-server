const jwt = require("jsonwebtoken");
const { USER_CATEGORY_TO_ID_MAP } = require("../constants/userConstants");
const { TOKEN_SECRET, TOKEN_EXPIRATION, ISSUER, TENANT, ALGORITHM } = require("../constants/configConstants");

const generateToken = (user) => {
  return jwt.sign(
    {
      user: {
        role: user.category,
        id: user.identifier,
        roleId: USER_CATEGORY_TO_ID_MAP[user.category],
      },
      tenant: TENANT,
    },
    TOKEN_SECRET,
    { algorithm: ALGORITHM, expiresIn: TOKEN_EXPIRATION, issuer: ISSUER }
  );
};

const getOwner = async (inputParameters) => {
    const { id } = inputParameters;
    return id;
}


module.exports = {
    getOwner,
    generateToken,
}