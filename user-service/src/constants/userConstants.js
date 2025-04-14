const USER_IDENTIFIER_TYPES = {
    EMAIL: "email",
    PHONE: "phone"
};

const USER_CATEGORIES = {
    REGISTERD: "registered",
    ADMIN: "admins",
    SUPER_ADMIN: "super_admins",
    DRIVER: "drivers",
    CUSTOMER: "customers",
    RESTAURANT: "restaurants"
};

const USER_CATEGORY_TO_ID_MAP = {
    [USER_CATEGORIES.REGISTERD]: 0,
    [USER_CATEGORIES.ADMIN]: 1,
    [USER_CATEGORIES.SUPER_ADMIN]: 2,
    [USER_CATEGORIES.DRIVER]: 3,
    [USER_CATEGORIES.CUSTOMER]: 4,
    [USER_CATEGORIES.RESTAURANT]: 5
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
    DEFAULT_USER_ACCOUNT_STATUS,
    USER_CATEGORY_TO_ID_MAP,
};