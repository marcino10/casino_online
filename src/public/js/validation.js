export const isValidNick = nick =>
    /^(?!.*@.*\..*)[a-zA-Z0-9_#@=+!-]{3,16}$/.test(nick);

export const isValidEmail = email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = password =>
    password.length >= 5 && /\d/.test(password);

export const isSamePassword = (password, confirmPassword) =>
    password === confirmPassword;

export const isValidGameName = name =>
    name.length >= 1;

export const isValidBuyIn = value =>
    parseInt(value) >= 50;

export const isValidPlayerCount = count =>
    parseInt(count) >= 2 && parseInt(count) <= 10;


export const rules = {
    login: {
        validate: isValidNick,
        message: "Username must be 3–16 characters with letters/numbers/_#@=+!- only."
    },
    email: {
        validate: isValidEmail,
        message: "Enter a valid email address."
    },
    password: {
        validate: isValidPassword,
        message: "Password must be 5+ characters and contain a number."
    },
    IsSamePassword: {
        validate: isSamePassword,
        message: "This password is different from the previous one"
    }
};

export const pokerRules = {
    tableName: {
        validate: isValidGameName,
        message: "Game name cannot be empty"
    },
    buyIn: {
        validate: isValidBuyIn,
        message: "Minimum buy-in value is $50"
    },
    maxNumOfPlayers: {
        validate: isValidPlayerCount,
        message: "Number of players must be between 2 and 10"
    }
};