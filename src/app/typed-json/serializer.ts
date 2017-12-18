import { Helpers } from './helpers';
import { JsonMemberMetadata } from './json-member-metadata';
import { JsonObjectMetadata } from './json-object-metadata';
import { ISerializerSettings } from './typed-json';

interface IWriteSettings {
    objectType: { new (): any };
    elements?: JsonMemberMetadata<any>;
    emitDefault?: boolean;
    typeHintPropertyKey: string;
    enableTypeHints?: boolean;
    requireTypeHints?: boolean;
    name?: string;
}

export abstract class Serializer {
    public static writeObject(object: any, settings: ISerializerSettings): string {
        const objectMetadata = JsonObjectMetadata.getFromInstance(object);
        let ObjectType: any;

        if (objectMetadata) {
            ObjectType = objectMetadata.classType;
        } else {
            ObjectType = object.constructor;
        }

        return JSON.stringify(
            this.writeToJsonObject(
                object,
                {
                    enableTypeHints: settings.enableTypeHints,
                    objectType: ObjectType,
                    typeHintPropertyKey: settings.typeHintPropertyKey
                }
            ),
            settings.replacer
        );
    }

    /**
     * Convert a @JsonObject class instance to a JSON object for serialization.
     * @param object The instance to convert.
     * @param settings Settings defining how the instance should be serialized.
     */
    private static writeToJsonObject<T>(object: T, settings: IWriteSettings): any {
        let json: any;
        let objectMetadata: JsonObjectMetadata<T>;

        if (!Helpers.valueIsDefined(object)) {
            // Uninitialized or null object returned "as-is" (or default value if set).
            if (settings.emitDefault) {
                json = Helpers.getDefaultValue(settings.objectType);
            } else {
                json = object;
            }
        } else if (Helpers.isPrimitive(object) || object instanceof Date) {
            // Primitive types and Date stringified "as-is".
            json = object;
        } else if (object instanceof Array) {
            json = [];

            for (let i = 0, n = (
                object as any
            ).length; i < n; i++) {
                json.push(this.writeToJsonObject(object[i], {
                    elements: settings.elements ? settings.elements.elements : null,
                    enableTypeHints: settings.enableTypeHints,
                    objectType: settings.elements ? settings.elements.type : Object,
                    requireTypeHints: settings.requireTypeHints,
                    typeHintPropertyKey: settings.typeHintPropertyKey
                }));
            }
        } else {
            // Object with properties.
            objectMetadata = JsonObjectMetadata.getFromInstance(object);

            if (objectMetadata && typeof objectMetadata.serializer === 'function') {
                json = objectMetadata.serializer(object);
            } else {
                json = {};

                // Add type-hint.
                if (settings.enableTypeHints && (
                        settings.requireTypeHints || object.constructor !== settings.objectType
                    )) {
                    json[settings.typeHintPropertyKey] = JsonObjectMetadata.getKnownTypeNameFromInstance(object);
                }

                if (objectMetadata) {
                    // Serialize @JsonMember() properties.
                    objectMetadata.sortMembers();

                    Object.keys(objectMetadata.dataMembers).forEach((propertyKey) => {
                        const propertyMetadata = objectMetadata.dataMembers[propertyKey];

                        json[propertyMetadata.name] = this.writeToJsonObject(object[propertyKey], {
                            elements: propertyMetadata.elements,
                            emitDefault: propertyMetadata.emitDefaultValue,
                            enableTypeHints: settings.enableTypeHints,
                            name: propertyMetadata.name,
                            objectType: propertyMetadata.type,
                            requireTypeHints: settings.requireTypeHints,
                            typeHintPropertyKey: settings.typeHintPropertyKey
                        });
                    });
                } else {
                    // Serialize all own properties.
                    Object.keys(object).forEach((propertyKey) => {
                        json[propertyKey] = this.writeToJsonObject(object[propertyKey], {
                            enableTypeHints: settings.enableTypeHints,
                            objectType: Object,
                            requireTypeHints: settings.requireTypeHints,
                            typeHintPropertyKey: settings.typeHintPropertyKey
                        });
                    });
                }
            }
        }

        return json;
    }
}
