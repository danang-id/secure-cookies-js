export default class SecureCookies {
    private identifier;
    private secretKey;
    private enablementKey;
    private cryptography;
    private enablementCryptography;
    private options;
    private status;
    constructor(identifier: any, secretKey: any);
    readonly isEnabled: boolean;
    readonly cookies: any;
    enable(): void;
    disable(): void;
    resetOptions(): void;
    setOption(property: any, option: any): void;
    getOption(property: any): any;
    private static execute(secureCookiesObject, callback, args?, enablementKey?);
    private store(object, enablementKey?);
    private all(enablementKey?);
    put(name: any, value: any): any;
    get(name: any): any;
    exists(name: any): any;
    has(name: any): any;
    forget(name: any): any;
    flush(): any;
    regenerate(): any;
}
