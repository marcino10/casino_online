export const isValidNick = nick =>
    /^(?!.*@.*\..*)[a-zA-Z0-9_#@=+!-]{3,16}$/.test(nick);

export const isValidEmail = email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = password =>
    password.length >= 5 && /\d/.test(password);

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
    }
};
