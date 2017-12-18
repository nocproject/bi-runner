import { Helpers } from './helpers';
import { JsonMemberMetadata } from './json-member-metadata';
import { JsonObjectMetadata } from './json-object-metadata';
import { ISerializerSettings } from './typed-json';

interface IReadSettings<T> {
    objectType: { new (): T };
    isRequired?: boolean;
    elements?: JsonMemberMetadata<any>;
    typeHintPropertyKey: string;
    enableTypeHints?: boolean;
    knownTypes?: { [name: string]: { new (): any } };
    requireTypeHints?: boolean;
    strictTypeHintMode?: boolean;
}

export abstract class Deserializer {
    /**
     * Deserialize a JSON string into the provided type.
     * @param json The JSON string to deserialize.
     * @param type The type to deserialize into.
     * @param settings Serializer settings.
     * @throws Error if 'settings' specifies 'maxObjects', and the JSON string exceeds that limit.
     */
    public static readObject<T>(json: string | Object, type: { new (): T }, settings: ISerializerSettings): T {
        let value: any;
        let instance: T;
        const metadata = JsonObjectMetadata.getFromType(type);

        if (typeof json === 'object') {
            value = json;
        } else {
            value = JSON.parse(json, settings.reviver); // Parse text into basic object, which is then processed recursively.
        }

        if (typeof settings.maxObjects === 'number') {
            if (this.countObjects(value) > settings.maxObjects) {
                throw new Error(`JSON exceeds object count limit (${settings.maxObjects}).`);
            }
        }

        instance = this.readJsonToInstance(value, {
            enableTypeHints: settings.enableTypeHints,
            knownTypes: metadata ? metadata.knownTypes : {},
            objectType: type,
            strictTypeHintMode: true,
            typeHintPropertyKey: settings.typeHintPropertyKey
        });

        return instance;
    }

    private static countObjects(value: any): number {
        switch (typeof value) {
            case 'object':
                if (value === null) {
                    return 0;
                } else if (Helpers.isArray(value)) {
                    // Count array elements.
                    let count = 0;

                    value.forEach((item) => {
                        count += this.countObjects(item);
                    });

                    return count;
                } else {
                    // Count object properties.
                    let count = 0;

                    Object.keys(value).forEach((propertyKey) => {
                        count += this.countObjects(value[propertyKey]);
                    });

                    return count;
                }

            case 'undefined':
                return 0;

            default: // Primitives.
                return 1;
        }
    }

    private static readJsonToInstance<T>(json: any,
                                         settings: IReadSettings<T>): T {
        let object: any;
        let objectMetadata: JsonObjectMetadata<any>;
        let ObjectType: { new (): T };
        let typeHint: string;
        let temp: any;
        // FIXME: don't remove is required later
        // tslint:disable:prefer-const
        //noinspection JSUnusedLocalSymbols
        let knownTypes: { [name: string]: { new (): any } };

        if (!Helpers.valueIsDefined(json)) {
            if (settings.isRequired) {
                throw new Error(`Missing required member.`);
            }
            // Uninitialized or null json returned "as-is".
            object = json;
        } else if (Helpers.isPrimitive(settings.objectType)) {
            // number, string, boolean: assign directly.
            if (json.constructor !== settings.objectType) {
                const expectedTypeName = Helpers.getClassName(settings.objectType).toLowerCase();
                const foundTypeName = Helpers.getClassName(json.constructor).toLowerCase();

                throw new TypeError(`Expected value to be of type '${expectedTypeName}', got '${foundTypeName}'.`);
            }

            object = json;
        } else if (settings.objectType as any === Array) {
            // 'json' is expected to be an Array.
            if (!Helpers.isArray(json)) {
                throw new TypeError(`Expected value to be of type 'Array', got '${Helpers.getClassName(json.constructor)}'.`);
            }

            object = [];

            // Read array elements recursively.
            json.forEach((element) => {
                object.push(this.readJsonToInstance(element, {
                    elements: settings.elements ? settings.elements.elements : null,
                    enableTypeHints: settings.enableTypeHints,
                    knownTypes: settings.knownTypes,
                    objectType: settings.elements ? settings.elements.type : element.constructor,
                    requireTypeHints: settings.requireTypeHints,
                    strictTypeHintMode: settings.strictTypeHintMode,
                    typeHintPropertyKey: settings.typeHintPropertyKey
                }));
            });
        } else if (settings.objectType as any === Date) {
            // Built-in support for Date with ISO 8601 format.
            // ISO 8601 spec.: https://www.w3.org/TR/NOTE-datetime
            if (typeof json === 'string') {
                object = new Date(json);
            } else if (json instanceof Date) {
                object = json;
            } else {
                throw new TypeError('Expected value to be of type \'string\', got \'' + typeof json + '\'.');
            }
        } else {
            // 'json' can only be an object.
            // Check if a type-hint is present.
            typeHint = json[settings.typeHintPropertyKey];

            if (typeHint && settings.enableTypeHints) {
                if (typeof typeHint !== 'string') {
                    throw new TypeError(`Type-hint (${settings.typeHintPropertyKey}) must be a string.`);
                }

                // Check if type-hint refers to a known type.
                if (!settings.knownTypes[typeHint]) {
                    throw new Error(`'${typeHint}' is not a known type.`);
                }

                // In strict mode, check if type-hint is a subtype of the expected type.
                if (settings.strictTypeHintMode && !Helpers.isSubtypeOf(settings.knownTypes[typeHint], settings.objectType)) {
                    throw new Error(`'${typeHint}' is not a subtype of '${Helpers.getClassName(settings.objectType)}'.`);
                }

                // Type-hinting was enabled and a valid type-hint has been found.
                ObjectType = settings.knownTypes[typeHint];

                // Also replace object metadata with that of what was referenced in the type-hint.
                objectMetadata = JsonObjectMetadata.getFromType(ObjectType);
            } else {
                if (settings.enableTypeHints && settings.requireTypeHints) {
                    throw new Error('Missing required type-hint.');
                }

                // FIXME: don't remove is required later
                //noinspection JSUnusedAssignment
                ObjectType = settings.objectType;
                objectMetadata = JsonObjectMetadata.getFromType(settings.objectType);
            }

            if (objectMetadata) {
                if (typeof objectMetadata.initializer === 'function') {
                    // Let the initializer function handle it.
                    object = objectMetadata.initializer(json) || null;
                } else {
                    // Deserialize @JsonMember()s.
                    objectMetadata.sortMembers();

                    object = new ObjectType();

                    Object.keys(objectMetadata.dataMembers).forEach((propertyKey) => {
                        const propertyMetadata = objectMetadata.dataMembers[propertyKey];

                        temp = this.readJsonToInstance(json[propertyMetadata.name], {
                            elements: propertyMetadata.elements,
                            enableTypeHints: settings.enableTypeHints,
                            isRequired: propertyMetadata.isRequired,
                            knownTypes: Helpers.merge(settings.knownTypes, objectMetadata.knownTypes || {}),
                            objectType: propertyMetadata.type,
                            requireTypeHints: settings.requireTypeHints,
                            strictTypeHintMode: settings.strictTypeHintMode,
                            typeHintPropertyKey: settings.typeHintPropertyKey
                        });

                        // Do not make undefined/null property assignments.
                        if (Helpers.valueIsDefined(temp)) {
                            object[propertyKey] = temp;
                        }
                    });
                }
            } else {
                // Deserialize each property of (from) 'json'.
                object = {};

                Object.keys(json).forEach((propertyKey) => {
                    // Skip type-hint when copying properties.
                    if (json[propertyKey] && propertyKey !== settings.typeHintPropertyKey) {
                        let objectType;
                        if (Helpers.valueIsDefined(json[propertyKey])) {
                            objectType = json[propertyKey].constructor;
                        }
                        object[propertyKey] = this.readJsonToInstance(json[propertyKey], {
                            enableTypeHints: settings.enableTypeHints,
                            knownTypes: settings.knownTypes,
                            objectType,
                            requireTypeHints: settings.requireTypeHints,
                            typeHintPropertyKey: settings.typeHintPropertyKey
                        });
                    }
                });
            }
        }

        return object;
    }
}
