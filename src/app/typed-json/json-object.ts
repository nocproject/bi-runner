import { Helpers } from './helpers';
import { JsonObjectMetadata } from './json-object-metadata';
import { METADATA_FIELD_KEY } from './typed-json';

export interface IJsonObjectOptions<T> {
    /** Name of the object as it appears in the serialized JSON. */
    name?: string;

    /** An array of known types to recognize when encountering type-hints. */
    knownTypes?: Array<{ new (): any }>;

    /** A custom serializer function transforming an instace to a JSON object. */
    serializer?: (object: T) => any;

    /** A custom deserializer function transforming a JSON object to an instace. */
    initializer?: (json: any) => T;
}

export function JsonObject<T>(options: IJsonObjectOptions<T> = {}): (target: { new (): T }) => void {
    const initializer = options.initializer;

    return (target: { new (): T }): void => {
        let objectMetadata: JsonObjectMetadata<T>;
        let parentMetadata: JsonObjectMetadata<T>;
        let i;

        if (target.prototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            objectMetadata = target.prototype[METADATA_FIELD_KEY];
        } else {
            objectMetadata = new JsonObjectMetadata<T>();

            // If applicable, inherit @JsonMember()s and @KnownTypes from parent @JsonObject.
            parentMetadata = target.prototype[METADATA_FIELD_KEY];
            if (parentMetadata) {
                // @JsonMember()s
                Object.keys(parentMetadata.dataMembers).forEach((memberPropertyKey) => {
                    objectMetadata.dataMembers[memberPropertyKey] = parentMetadata.dataMembers[memberPropertyKey];
                });

                // @KnownTypes
                Object.keys(parentMetadata.knownTypes).forEach((key) => {
                    objectMetadata.setKnownType(parentMetadata.knownTypes[key]);
                });
            }

            Object.defineProperty(target.prototype, METADATA_FIELD_KEY, {
                configurable: false,
                enumerable: false,
                value: objectMetadata,
                writable: false
            });
        }

        objectMetadata.classType = target;
        objectMetadata.isExplicitlyMarked = true;

        if (options.name) {
            objectMetadata.className = options.name;
        }

        if (options.knownTypes) {
            i = 0;

            try {
                options.knownTypes.forEach((knownType) => {
                    if (typeof knownType === 'undefined') {
                        throw new TypeError(`Known type #${i++} is undefined.`);
                    }

                    objectMetadata.setKnownType(knownType);
                });
            } catch (e) {
                // The missing known type might not cause trouble at all, thus the error is printed, but not thrown.
                Helpers.error(new TypeError(`@JsonObject: ${e.message} (on '${Helpers.getClassName(target)}')`));
            }
        }

        if (typeof initializer === 'function') {
            objectMetadata.initializer = initializer;
        }
    };
}
