const { USER_CATEGORIES, USER_ACCOUNT_STATUS } = require('../constants/userConstants');
const User = require('../models/userModel');
const logger = require('../utils/logger');
const NotFoundException = require('../exceptions/NotFoundException');
const ConflictException = require('../exceptions/ConflictException');
const BadRequestException = require('../exceptions/BadRequestException');
const { getUserRole } = require('../utils/contextUtils');
const ForbiddenException = require('../exceptions/ForbiddenException');
const { getModelByCategory } = require('../utils/userUtils');

const getUserByIdentifier = async (identifier, category) => {

    return User.findOne({ identifier, ...(category ? { category } : {}) });
};

const createUserByCategory = async (userData) => {
    try {
        const { identifier, category } = userData;

        const user = await getUserByIdentifier(identifier, USER_CATEGORIES.REGISTERD);

        if (!user) {
            logger.error('User not found');
            throw new NotFoundException('User not found');
        }

        if (user.accountStatus !== USER_ACCOUNT_STATUS.CREATING) {
            logger.error('User already created');
            throw new ConflictException('User already created');
        }

        const isAdmin = category === USER_CATEGORIES.ADMIN;

        if (isAdmin) {
            const userRole = getUserRole();
            if (userRole !== USER_CATEGORIES.SUPER_ADMIN) {
                logger.error('User not authorized to create admin');
                throw new ForbiddenException('User not authorized to create admin');
            }
        }

        const userObject = getModelByCategory(category);

        const categoryToUse = isAdmin ? userData.role : category;

        const userModelData = new userObject({
            id: user._id,
            ...userData,
            [user.type]: identifier,
            category: categoryToUse,
            accountStatus: USER_ACCOUNT_STATUS.ACTIVE,
        })

        logger.info('Creating new customer...');
        const createdUser = await userModelData.save();

        logger.info('Updating user to verified...');
        await User.findOneAndUpdate(
            { identifier }, { verified: true, accountStatus: USER_ACCOUNT_STATUS.ACTIVE, category: categoryToUse },
        );

        return { ...createdUser._doc, verified: true, type: user.type, accountStatus: USER_ACCOUNT_STATUS.ACTIVE };
    } catch (error) {
        logger.error('Error creating user:', error.message);
        throw error;
    }
};

const getAllUsersByCategory = async (category) => {
    try {
        let users = null;
        const userObject = getModelByCategory(category);

        users = await userObject.find({ accountStatus: USER_ACCOUNT_STATUS.ACTIVE });
        return users;
    } catch (error) {
        logger.error('Error fetching users:', error.message);
        throw error;
    }
}

const getUserDataByIdentifier = async (category, identifier) => {
    try {
        const filterCategory = category === USER_CATEGORIES.ADMIN ? null : category;

        const user = await getUserByIdentifier(identifier, filterCategory);

        if (!user) {
            logger.error('User not found');
            throw new NotFoundException('User not found');
        }
        if (user.accountStatus !== USER_ACCOUNT_STATUS.ACTIVE) {
            logger.error('User not active');
            throw new ConflictException('User not active');
        }

        const userObject = getModelByCategory(category);

        const userData = await userObject.findOne({ identifier });
        return { ...userData._doc, verified: user.verified, type: user.type, accountStatus: user.accountStatus };
    } catch (error) {
        logger.error('Error fetching user:', error.message);
        throw error;
    }
}

const updateUserByCategory = async (userData) => {
    try {
        const { identifier, category } = userData;

        const filterCategory = category === USER_CATEGORIES.ADMIN ? null : category;

        const user = await getUserByIdentifier(identifier, filterCategory);

        if (!user) {
            logger.error('User not found');
            throw new NotFoundException('User not found');
        }

        if (user.accountStatus !== USER_ACCOUNT_STATUS.ACTIVE) {
            logger.error('User not active');
            throw new ConflictException('User not active');
        }

        const tokenUser = getUserRole();
        if (tokenUser !== USER_CATEGORIES.SUPER_ADMIN && user.category === USER_CATEGORIES.SUPER_ADMIN) {
            logger.error('Super admin cannot be updated');
            throw new ForbiddenException('Super admin cannot be updated');
        }

        const userObject = getModelByCategory(category);

        const updatedUser = await userObject.findOneAndUpdate({ identifier }, userData, { new: true });

        return { ...updatedUser._doc, verified: user.verified, type: user.type, accountStatus: user.accountStatus };
    } catch (error) {
        logger.error('Error updating user:', error.message);
        throw error;
    }
}

const updateUserAccountStatusByIdentifier = async (userData, status) => {
    try {
        if (!status) {
            logger.error('Status is required');
            throw new BadRequestException('Status is required');
        };
        const { identifier, category } = userData;

        const filterCategory = category === USER_CATEGORIES.ADMIN ? null : category;

        const user = await getUserByIdentifier(identifier, filterCategory);

        if (!user) {
            logger.error('User not found');
            throw new NotFoundException('User not found');
        }

        if (user.accountStatus === status) {
            logger.error(`User already has status: ${status}`);
            throw new ConflictException(`User already has status: ${status}`);
        }

        const tokenUser = getUserRole();
        if (tokenUser !== USER_CATEGORIES.SUPER_ADMIN && user.category === USER_CATEGORIES.SUPER_ADMIN) {
            logger.error('Super admin cannot be updated');
            throw new ForbiddenException('Super admin cannot be updated');
        }

        if (status === USER_ACCOUNT_STATUS.DELETED && user.category === USER_CATEGORIES.SUPER_ADMIN) {
            logger.error('Super admin cannot be deleted');
            throw new ForbiddenException('Super admin cannot be deleted');
        }

        const userObject = getModelByCategory(category);

        await userObject.findOneAndUpdate({ identifier }, { accountStatus: status });

        await User.findOneAndUpdate(
            { identifier }, { accountStatus: status },

        );

        return {};
    } catch (error) {
        logger.error('Error deleting user:', error.message);
        throw error;
    }
};

const deleteAccountByIdentifier = async (userData, status) => {
    try {
        const { identifier, category } = userData;

        const filterCategory = category === USER_CATEGORIES.ADMIN ? null : category;

        const user = await getUserByIdentifier(identifier, filterCategory);

        if (!user) {
            logger.error('User not found');
            throw new NotFoundException('User not found');
        }

        if (user.accountStatus === USER_ACCOUNT_STATUS.DELETED) {
            logger.error('User already deleted');
            throw new ConflictException('User already deleted');
        }

        if (user.category === USER_CATEGORIES.SUPER_ADMIN) {
            logger.error('Super admin cannot be deleted');
            throw new ForbiddenException('Super admin cannot be deleted');
        }

        const userObject = getModelByCategory(category);

        await userObject.findOneAndDelete({ identifier });

        await User.findOneAndDelete({ identifier });

        return {};
    } catch (error) {
        logger.error('Error deleting user:', error.message);
        throw error;
    }
};

module.exports = {
    createUserByCategory,
    getUserByIdentifier,
    getAllUsersByCategory,
    getUserDataByIdentifier,
    updateUserByCategory,
    updateUserAccountStatusByIdentifier,
    deleteAccountByIdentifier
}