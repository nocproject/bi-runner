import { METADATA_FIELD_KEY } from './typed-json';

export namespace Helpers {
    /**
     * Polyfill for Object.assign.
     * @param target The target object.
     * @param sources The source object(s).
     */
    export function assign<T extends Object>(target: T, ...sources: any[]): T {
        let output: T;
        let source: any;

        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        output = Object(target);

        for (let i = 1; i < arguments.length; i++) {
            source = arguments[i];

            if (source !== undefined && source !== null) {
                for (const nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }

        return output;
    }

    export function error(message?: any, ...optionalParams: any[]) {
        if (typeof console === 'object' && typeof console.error === 'function') {
            console.error.apply(console, [message].concat(optionalParams));
        } else if (typeof console === 'object' && typeof console.log === 'function') {
            console.log.apply(console, ['ERROR: ' + message].concat(optionalParams));
        }
    }

    /**
     * Gets the string representation of a class.
     * @param target The class (constructor function) reference.
     */
    export function getClassName(target: { new (): any } | Function): string;
    /**
     * Gets a string representation of a class from its prototype.
     * @param target The class prototype.
     */
    export function getClassName(target: { new (): any } | Object): string {
        let targetType: { new (): any };

        if (typeof target === 'function') {
            // target is constructor function.
            targetType = target as { new (): any };
        } else if (typeof target === 'object') {
            // target is class prototype.
            targetType = target.constructor as { new (): any };
        }

        if (!targetType) {
            return 'undefined';
        }

        if ('name' in targetType && typeof (
                targetType as any
            ).name === 'string') {
            // ES6 constructor.name // Awesome!
            return (
                targetType as any
            ).name;
        } else {
            // Extract class name from string representation of constructor function. // Meh...
            return targetType.toString().match(/function (\w*)/)[1];
        }
    }

    export function getDefaultValue<T>(type: { new (): T }): T {
        switch (type as any) {
            case Number:
                return 0 as any;

            case String:
                return '' as any;

            case Boolean:
                return false as any;

            case Array:
                return [] as any;

            default:
                return null;
        }
    }

    export function getPropertyDisplayName(target: { new (): any }, propertyKey: string | symbol) {
        return `${getClassName(target)}.${propertyKey.toString()}`;
    }

    export function isArray(object: any) {
        return typeof Array.isArray === 'function' ?
            Array.isArray(object) :
            (
                object instanceof Array
            );
    }

    export function isPrimitive(obj: any) {
        switch (typeof obj) {
            case 'string':
            case 'number':
            case 'boolean':
                return true;
        }

        return obj instanceof String || obj === String ||
            obj instanceof Number || obj === Number ||
            obj instanceof Boolean || obj === Boolean;

    }

    export function isReservedMemberName(name: string) {
        return name === METADATA_FIELD_KEY;
    }

    export function isSubtypeOf(A: { new (): any }, B: { new (): any }) {
        return A === B || A.prototype instanceof B;
    }

    export function log(message?: any, ...optionalParams: any[]) {
        if (typeof console === 'object' && typeof console.log === 'function') {
            console.log.apply(console, [message].concat(optionalParams));
        }
    }

    /**
     * Copy the values of all enumerable own properties from one or more source objects to a shallow copy of the target
     * object.
     * It will return the new object.
     * @param target The target object.
     * @param sources The source object(s).
     */
    export function merge<T extends Object>(target: T, ...sources: any[]): T {
        let output: T;
        let source: any;

        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        output = {} as T;

        Object.keys(target).forEach((nextKey) => {
            output[nextKey] = target[nextKey];
        });

        for (let i = 1; i < arguments.length; i++) {
            source = arguments[i];

            if (source !== undefined && source !== null) {
                for (const nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }

        return output;
    }

    export function valueIsDefined(value: any): boolean {
        return !(
            typeof value === 'undefined' ||
            value === null
        );
    }

    export function warn(message?: any, ...optionalParams: any[]) {
        if (typeof console === 'object' && typeof console.warn === 'function') {
            console.warn.apply(console, [message].concat(optionalParams));
        } else if (typeof console === 'object' && typeof console.log === 'function') {
            console.log.apply(console, ['WARNING: ' + message].concat(optionalParams));
        }
    }
}
