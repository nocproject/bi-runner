import { Deserializer } from './deserializer';
import { Helpers } from './helpers';
import { JsonObjectMetadata } from './json-object-metadata';
import { Serializer } from './serializer';

export const METADATA_FIELD_KEY = '__typedJsonJsonObjectMetadataInformation__';

export interface ISerializerSettings {
    /** Property key to recognize as type-hints. Default is "__type". */
    typeHintPropertyKey?: string;

    /** When set, enable emitting and recognizing type-hints. Default is true */
    enableTypeHints?: boolean;

    /** Maximum number of objects allowed when deserializing from JSON. Default is no limit. */
    maxObjects?: number;

    /** A function that transforms the JSON after serializing. Called recursively for every object. */
    replacer?: (key: string, value: any) => any;

    /** A function that transforms the JSON before deserializing. Called recursively for every object. */
    reviver?: (key: any, value: any) => any;
}

export class TypedJSON {

    private static configSettings: ISerializerSettings = {
        enableTypeHints: true,
        typeHintPropertyKey: '__type'
    };

    constructor() {
        throw new TypeError('The class TypedJSON is static!');
    }

    public static config(settings: ISerializerSettings) {
        TypedJSON.configSettings = Helpers.merge(TypedJSON.configSettings, settings);
    }

    public static parse(json: string | object, type?: any, settings?: ISerializerSettings): any {
        if (typeof json !== 'string') {
            json = JSON.stringify(json);
        }
        return JsonObjectMetadata.getFromType(type) ?
            Deserializer.readObject(json, type, Helpers.merge(TypedJSON.configSettings, settings || {})) :
            JSON.parse.apply(JSON, [arguments[0], settings && settings.reviver]);
    }

    public static stringify(value: any, settings?: ISerializerSettings): string {
        return Serializer.writeObject(value, Helpers.merge(TypedJSON.configSettings, settings || {}));
    }

}
