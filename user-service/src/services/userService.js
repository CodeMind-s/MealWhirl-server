const { USER_CATEGORIES, USER_ACCOUNT_STATUS } = require('../constants/userConstants');
const Customer = require('../models/customerModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');
const NotFoundException = require('../exceptions/NotFoundException');
const ConflictException = require('../exceptions/ConflictException');
const BadRequestException = require('../exceptions/BadRequestException');
const Driver = require('../models/driverModel');
const Restaurant = require('../models/restaurantModel');
const Admin = require('../models/adminModel');
const { getUserRole } = require('../utils/contextUtils');
const ForbiddenException = require('../exceptions/ForbiddenException');

const getUserByIdentifier = async (identifier) => {
    return User.findOne({ identifier });
};

const createUserByCategory = async (userData) => {
    try {
        const { identifier, category } = userData;

        const user = await getUserByIdentifier(identifier);

        if (!user) {
            logger.error('User not found');
            throw new NotFoundException('User not found');
        }

        if (user.accountStatus !== USER_ACCOUNT_STATUS.CREATING) {
            logger.error('User already created');
            throw new ConflictException('User already created');
        }

        if ([USER_CATEGORIES.SUPER_ADMIN, USER_CATEGORIES.ADMIN].includes(category)) {
            const userRole = getUserRole();
            if (userRole !== USER_CATEGORIES.SUPER_ADMIN) {
                logger.error('User not authorized to create admin');
                throw new ForbiddenException('User not authorized to create admin');
            }
        }

        let userObject = null;
        switch (category) {
            case USER_CATEGORIES.CUSTOMER:
                userObject = Customer;
                break;
            case USER_CATEGORIES.DRIVER:
                userObject = Driver;
                break;
            case USER_CATEGORIES.RESTAURANT:
                userObject = Restaurant;
                break;
            case USER_CATEGORIES.ADMIN:
                userObject = Admin;
                break;
            default:
                logger.error('Invalid category');
                throw new BadRequestException(`Invalid category: ${category}`);
        }

        const userModelData = new userObject({
            id: user._id,
            ...userData,
            [user.type]: identifier,
            accountStatus: USER_ACCOUNT_STATUS.ACTIVE,
        })

        logger.info('Creating new customer...');
        const createdUser = await userModelData.save();

        logger.info('Updating user to verified...');
        await User.findOneAndUpdate(
            { identifier }, { verified: true, accountStatus: USER_ACCOUNT_STATUS.ACTIVE, category },
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
        let userObject = null;
        switch (category) {
            case USER_CATEGORIES.CUSTOMER:
                userObject = Customer;
                break;
            case USER_CATEGORIES.DRIVER:
                userObject = Driver;
                break;
            case USER_CATEGORIES.RESTAURANT:
                userObject = Restaurant;
                break;
            case USER_CATEGORIES.ADMIN:
                userObject = Admin;
                break;
            default:
                logger.error('Invalid category');
                throw new BadRequestException(`Invalid category: ${category}`);
        }

        users = await userObject.find({ accountStatus: USER_ACCOUNT_STATUS.ACTIVE });
        return users;
    } catch (error) {
        logger.error('Error fetching users:', error.message);
        throw error;
    }
}

const getUserDataByIdentifier = async (category, identifier) => {
    try {
        const user = await getUserByIdentifier(identifier);
        if (!user) {
            logger.error('User not found');
            throw new NotFoundException('User not found');
        }
        if (user.accountStatus !== USER_ACCOUNT_STATUS.ACTIVE) {
            logger.error('User not active');
            throw new ConflictException('User not active');
        }
        if (user.category !== category) {
            logger.error('User category mismatch');
            throw new ConflictException('User category mismatch');
        }

        let userObject = null;
        switch (category) {
            case USER_CATEGORIES.CUSTOMER:
                userObject = Customer;
                break;
            case USER_CATEGORIES.DRIVER:
                userObject = Driver;
                break;
            case USER_CATEGORIES.RESTAURANT:
                userObject = Restaurant;
                break;
            case USER_CATEGORIES.ADMIN:
                userObject = Admin;
                break;
            default:
                logger.error('Invalid category');
                throw new BadRequestException(`Invalid category: ${category}`);
        }

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

        const user = await getUserByIdentifier(identifier);

        if (!user) {
            logger.error('User not found');
            throw new NotFoundException('User not found');
        }

        if (user.category !== category) {
            logger.error('User category mismatch');
            throw new ConflictException('User category mismatch');
        }

        if (user.accountStatus !== USER_ACCOUNT_STATUS.ACTIVE) {
            logger.error('User not active');
            throw new ConflictException('User not active');
        }

        let userObject = null;
        switch (category) {
            case USER_CATEGORIES.CUSTOMER:
                userObject = Customer;
                break;
            case USER_CATEGORIES.DRIVER:
                userObject = Driver;
                break;
            case USER_CATEGORIES.RESTAURANT:
                userObject = Restaurant;
                break;
            case USER_CATEGORIES.ADMIN:
                userObject = Admin;
                break;
            default:
                logger.error('Invalid category');
                throw new BadRequestException(`Invalid category: ${category}`);
        }
        const updatedUser = await Restaurant.findOneAndUpdate({ identifier }, userData, { new: true });

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

        const user = await getUserByIdentifier(identifier);

        if (!user) {
            logger.error('User not found');
            throw new NotFoundException('User not found');
        }

        if (user.category !== category) {
            logger.error('User not created yet');
            throw new ConflictException('User not created yet');
        }

        if (user.accountStatus === status) {
            logger.error(`User already has status: ${status}`);
            throw new ConflictException(`User already has status: ${status}`);
        }

        let userObject = null;
        switch (category) {
            case USER_CATEGORIES.CUSTOMER:
                userObject = Customer;
                break;
            case USER_CATEGORIES.DRIVER:
                userObject = Driver;
                break;
            case USER_CATEGORIES.RESTAURANT:
                userObject = Restaurant;
                break;
            case USER_CATEGORIES.ADMIN:
                userObject = Admin;
                break;
            default:
                logger.error('Invalid category');
                throw new BadRequestException(`Invalid category: ${category}`);
        }

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

        const user = await getUserByIdentifier(identifier);

        if (!user) {
            logger.error('User not found');
            throw new NotFoundException('User not found');
        }

        if (user.category !== category) {
            logger.error('User category mismatch');
            throw new ConflictException('User category mismatch');
        }

        if (user.accountStatus === USER_ACCOUNT_STATUS.DELETED) {
            logger.error('User already deleted');
            throw new ConflictException('User already deleted');
        }

        let userObject = null;
        switch (category) {
            case USER_CATEGORIES.CUSTOMER:
                userObject = Customer;
                break;
            case USER_CATEGORIES.DRIVER:
                userObject = Driver;
                break;
            case USER_CATEGORIES.RESTAURANT:
                userObject = Restaurant;
                break;
            case USER_CATEGORIES.ADMIN:
                userObject = Admin;
                break;
            default:
                logger.error('Invalid category');
                throw new BadRequestException(`Invalid category: ${category}`);
        }

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