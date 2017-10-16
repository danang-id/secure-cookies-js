"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var simple_crypto_js_1 = require("simple-crypto-js");
var SecureCookies = /** @class */ (function () {
    function SecureCookies(identifier, secretKey) {
        this.identifier = ((identifier === void 0) ? 'application' : identifier.replace(/\s/g, '')) + '_secure_cookies';
        this.secretKey = (secretKey === void 0) ? simple_crypto_js_1.default.generateRandom() : secretKey;
        this.cryptography = new simple_crypto_js_1.default(this.secretKey);
        this.options = {};
        this.resetOptions();
        this.status = true;
        this.enablementKey = simple_crypto_js_1.default.generateRandom();
        this.enablementCryptography = new simple_crypto_js_1.default(this.enablementKey);
    }
    Object.defineProperty(SecureCookies.prototype, "isEnabled", {
        get: function () {
            return this.status;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SecureCookies.prototype, "cookies", {
        get: function () {
            return (this.isEnabled) ? this.all() : {};
        },
        enumerable: true,
        configurable: true
    });
    SecureCookies.prototype.enable = function () {
        if (this.isEnabled) {
            // do nothing
        }
        else {
            this.status = true;
            var cookies = this.all(this.enablementKey);
            this.store(cookies);
        }
    };
    SecureCookies.prototype.disable = function () {
        if (this.isEnabled) {
            var cookies = this.all();
            this.store(cookies, this.enablementKey);
            this.status = false;
        }
        else {
            // do nothing
        }
    };
    SecureCookies.prototype.resetOptions = function () {
        this.options = {
            path: '/',
            domain: window.location.hostname,
            expires: null,
            secure: false
        };
    };
    SecureCookies.prototype.setOption = function (property, option) {
        if (property === void 0)
            return;
        if (property === void 0)
            return;
        switch (property) {
            case 'path':
            case 'domain':
                if (option instanceof String)
                    this.options[property] = option;
                break;
            case 'expires':
                if (option instanceof String)
                    this.options[property] = option;
                if (option instanceof Date)
                    this.options[property] = option.toUTCString;
                break;
            case 'secure':
                if (option instanceof String) {
                    switch (option) {
                        case 'true':
                            this.options[property] = true;
                            break;
                        case 'false':
                            this.options[property] = false;
                            break;
                        default: break;
                    }
                }
                else if (option instanceof Number) {
                    switch (option) {
                        case 1:
                            this.options[property] = true;
                            break;
                        case 0:
                            this.options[property] = false;
                            break;
                        default: break;
                    }
                }
                else if ('boolean' === typeof option)
                    this.options[property] = option;
                break;
            default: return;
        }
    };
    SecureCookies.prototype.getOption = function (property) {
        if (property === void 0)
            return null;
        if (this.options.hasOwnProperty(property))
            return this.options[property];
    };
    SecureCookies.execute = function (secureCookiesObject, callback, args, enablementKey) {
        if (args === void 0) { args = []; }
        if (enablementKey === void 0) { enablementKey = null; }
        if (secureCookiesObject === void 0)
            return;
        if (callback === void 0)
            return;
        if (null !== enablementKey) {
            if (secureCookiesObject instanceof SecureCookies && enablementKey === secureCookiesObject.enablementKey) {
                if ('function' === typeof callback) {
                    return callback.apply(null, args);
                }
            }
        }
        if (secureCookiesObject instanceof SecureCookies && secureCookiesObject.isEnabled) {
            if ('function' === typeof callback) {
                return callback.apply(null, args);
            }
        }
    };
    SecureCookies.prototype.store = function (object, enablementKey) {
        var _this = this;
        if (enablementKey === void 0) { enablementKey = null; }
        var cryptography = (enablementKey === null) ? this.cryptography : this.enablementCryptography;
        if (object === void 0)
            return;
        return SecureCookies.execute(this, function (object) {
            var encrypted = cryptography.encryptObject(object);
            var cookie = _this.identifier + "=" + encrypted + ";";
            for (var property in _this.options) {
                if (_this.options.hasOwnProperty(property)) {
                    if (null !== _this.options[property])
                        cookie.concat(property + "=" + _this.options[property] + ";");
                }
            }
            document.cookie = cookie;
            return;
        }, [object], enablementKey);
    };
    SecureCookies.prototype.all = function (enablementKey) {
        var _this = this;
        if (enablementKey === void 0) { enablementKey = null; }
        var cryptography = (enablementKey === null) ? this.cryptography : this.enablementCryptography;
        return SecureCookies.execute(this, function () {
            var object = document.cookie.match(new RegExp(_this.identifier + '=([^;]+)'));
            if (null === object)
                return {};
            var decrypted = {};
            try {
                decrypted = cryptography.decryptObject(object[1]);
            }
            catch (error) {
                console.error("Cookies with identifier " + _this.identifier + " is locked by a " + _this.constructor.name + " instance (that instance might be disabled, so the data get locked).\n\nSee the exception in " + _this.constructor.name + ".cookies.exception or " + _this.constructor.name + ".get('exception').");
                decrypted = { 'exception': error };
            }
            return (null === decrypted) ? {} : decrypted;
        }, [], enablementKey);
    };
    SecureCookies.prototype.put = function (name, value) {
        var _this = this;
        if (name === void 0)
            return;
        if (value === void 0)
            return;
        return SecureCookies.execute(this, function (name, value) {
            var cookies = _this.all();
            if (null !== cookies) {
                cookies[name] = value;
                _this.store(cookies);
            }
        }, [name, value]);
    };
    SecureCookies.prototype.get = function (name) {
        var _this = this;
        if (name === void 0)
            return null;
        return SecureCookies.execute(this, function (name) {
            var cookies = _this.all();
            if (null !== cookies) {
                if (cookies.hasOwnProperty(name))
                    return cookies[name];
                else
                    return null;
            }
            else
                return null;
        }, [name]);
    };
    SecureCookies.prototype.exists = function (name) {
        var _this = this;
        if (name === void 0)
            return false;
        return SecureCookies.execute(this, function (name) {
            if (name === void 0)
                return false;
            var cookies = _this.all();
            if (null !== cookies) {
                if (cookies.hasOwnProperty(name))
                    return true;
            }
            return false;
        }, [name]);
    };
    SecureCookies.prototype.has = function (name) {
        var _this = this;
        if (name === void 0)
            return false;
        return SecureCookies.execute(this, function (name) {
            var cookies = _this.all();
            if (null !== cookies) {
                if (cookies.hasOwnProperty(name)) {
                    return null !== cookies[name];
                }
                else
                    return false;
            }
            return false;
        }, [name]);
    };
    SecureCookies.prototype.forget = function (name) {
        var _this = this;
        if (name === void 0)
            return;
        return SecureCookies.execute(this, function (name) {
            var cookies = _this.all();
            if (null !== cookies) {
                delete cookies[name];
                _this.store(cookies);
            }
        }, [name]);
    };
    SecureCookies.prototype.flush = function () {
        var _this = this;
        return SecureCookies.execute(this, function () {
            _this.store({});
        });
    };
    SecureCookies.prototype.regenerate = function () {
        var _this = this;
        return SecureCookies.execute(this, function () {
            _this.setOption('expires', 'Thu, 01-Jan-1970 00:00:01 GMT');
            _this.flush();
            _this.resetOptions();
        });
    };
    return SecureCookies;
}());
exports.default = SecureCookies;
