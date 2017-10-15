import SimpleCrypto from 'simple-crypto-js';

export default class SecureCookies {

	private identifier : string;
	private secretKey : string;
	private enablementKey : string;
	private cryptography : SimpleCrypto;
	private enablementCryptography : SimpleCrypto;
	private options : object;
	private status : boolean;

	constructor(identifier, secretKey) {
		this.identifier = ((identifier === void 0) ? 'application' : identifier.replace(/\s/g, '')) + '_secure_cookies';
		this.secretKey = (secretKey === void 0) ? SimpleCrypto.generateRandom() : secretKey;
		this.cryptography = new SimpleCrypto(this.secretKey);
		this.options = {};
		this.resetOptions();
		this.status = true;
		this.enablementKey = SimpleCrypto.generateRandom();
		this.enablementCryptography = new SimpleCrypto(this.enablementKey);
	}

	get isEnabled() {
		return this.status;
	}

	get cookies() {
		return (this.isEnabled) ? this.all() : {};
	}

	enable() {
		if (this.isEnabled) {
			// do nothing
		} else {
			this.status = true;
			let cookies = this.all(this.enablementKey);
			this.store(cookies);
		}
	}

	disable() {
		if(this.isEnabled) {
			let cookies = this.all();
			this.store(cookies, this.enablementKey);
			this.status = false;
		} else {
			// do nothing
		}
	}

	resetOptions() {
		this.options = {
			path: '/',
			domain: window.location.hostname,
			expires: null,
			secure: false
		};
	}

	setOption(property, option) {
		if (property === void 0) return;
		if (property === void 0) return;
		switch(property) {
			case 'path':
			case 'domain':
				if (option instanceof String) this.options[property] = option;
				break;
			case 'expires':
				if (option instanceof String) this.options[property] = option;
				if (option instanceof Date) this.options[property] = option.toUTCString;
				break;
			case 'secure':
				if (option instanceof String) {
					switch(option) {
						case 'true': this.options[property] = true; break;
						case 'false': this.options[property] = false; break;
						default: break;
					}
				} else if (option instanceof Number) {
					switch(option) {
						case 1: this.options[property] = true; break;
						case 0: this.options[property] = false; break;
						default: break;
					}
				} else if ('boolean' === typeof option) this.options[property] = option;
				break;
			default: return;
		}
	}

	getOption(property) {
		if (property === void 0) return null;
		if (this.options.hasOwnProperty(property))
			return this.options[property];
	}

	static execute(secureCookiesObject, callback, args = [], enablementKey = null) {
		if (secureCookiesObject === void 0) return;
		if (callback === void 0) return;
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
	}

	store(object, enablementKey = null) {
		let cryptography = (enablementKey === null) ? this.cryptography : this.enablementCryptography;
		if (object === void 0) return;
		return SecureCookies.execute(this,
		(object) => {
			let encrypted = cryptography.encryptObject(object);
			let cookie = `${this.identifier}=${encrypted};`;
			for (let property in this.options) {
				if (this.options.hasOwnProperty(property)) {
					if (null !== this.options[property])
						cookie.concat(`${property}=${this.options[property]};`);
				}
			}
			document.cookie = cookie;
			return;
		}, [object], enablementKey);
	}

	all(enablementKey = null) {
		let cryptography = (enablementKey === null) ? this.cryptography : this.enablementCryptography;
		return SecureCookies.execute(this, 
		() => {
			let object = document.cookie.match(new RegExp(this.identifier + '=([^;]+)'));
			if (null === object) return {};
			let decrypted = {};
			try {
				decrypted = cryptography.decryptObject(object[1]);
			} catch(error) {
				console.error(`Cookies with identifier ${this.identifier} is locked by a ${this.constructor.name} instance (that instance might be disabled, so the data get locked).\n\nSee the exception in ${this.constructor.name}.cookies.exception or ${this.constructor.name}.get('exception').`);
				decrypted = { 'exception' : error };
			}
    		return (null === decrypted) ? {} : decrypted;
		}, [], enablementKey);
	}

	put(name, value) {
		if (name === void 0) return;
		if (value === void 0) return;
		return SecureCookies.execute(this, 
		(name, value) => {
			let cookies = this.all();
			if (null !== cookies) {
				cookies[name] = value;
				this.store(cookies);
			}
        }, [name, value]);
	}

	get(name) {
		if (name === void 0) return null;
		return SecureCookies.execute(this, 
		(name) => {
			let cookies = this.all();
			if (null !== cookies) {
				if (cookies.hasOwnProperty(name)) return cookies[name];
				else return null;
			} else return null;
        }, [name]);
	}

	exists(name) {
		if (name === void 0) return false;
		return SecureCookies.execute(this, 
		(name) => {
			if (name === void 0) return false;
			let cookies = this.all();
			if (null !== cookies) {
				if (cookies.hasOwnProperty(name)) return true;
			}
			return false;
        }, [name]);
	}

	has(name) {
		if (name === void 0) return false;
		return SecureCookies.execute(this, 
		(name) => {
			let cookies = this.all();
			if (null !== cookies) {
				if (cookies.hasOwnProperty(name)) {
					return null !== cookies[name];
				} else return false;
			}
			return false;
        }, [name]);
	}

	forget(name) {
		if (name === void 0) return;
		return SecureCookies.execute(this, 
		(name) => {
			let cookies = this.all();
			if (null !== cookies) {
				delete cookies[name];
				this.store(cookies);
			}
        }, [name]);
	}

	flush() {
		return SecureCookies.execute(this, 
		() => {
			this.setOption('expires', 'Thu, 01-Jan-1970 00:00:01 GMT');
			this.store({});
			this.resetOptions();
        });
	}

}