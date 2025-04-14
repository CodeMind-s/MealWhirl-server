const USER_IDENTIFIER_TYPES = {
    EMAIL: "email",
    PHONE: "phone"
};

const USER_CATEGORIES = {
    ADMIN: "admins",
    SUPER_ADMIN: "super_admins",
    DRIVER: "drivers",
    CUSTOMER: "customers",
    RESTAURANT: "restaurants"
};

const USER_ACCOUNT_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    SUSPENDED: "suspended",
    DELETED: "deleted",
    CREATING: "creating",
};

const DEFAULT_USER_ACCOUNT_STATUS = USER_ACCOUNT_STATUS.CREATING;

module.exports = {
    USER_IDENTIFIER_TYPES,
    USER_CATEGORIES,
    USER_ACCOUNT_STATUS,
    DEFAULT_USER_ACCOUNT_STATUS
};