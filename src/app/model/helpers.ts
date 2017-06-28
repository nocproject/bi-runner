import { TypedJSON } from 'typedjson-npm/src/typed-json';

export class SerializationHelper {
    public static map<K, V>(map: Map<K, V>) {
        return Array.from(map.entries()).map((x) => {
            const key = TypedJSON.stringify(x[0]);
            const value = TypedJSON.stringify(x[1]);

            return [key, value];
        });
    }

    public static array<E>(array: Array<E>) {
        return array.map(element => TypedJSON.stringify(element));
    }
}

export class DeserializationHelper {
    public static map<K, V>(json, keyType: { new (): K }, valueType: { new (): V }): Map<K, V> {
        const parsedArray = json.map(entry => {
            const key = TypedJSON.parse<K>(entry[0], keyType);
            const value = TypedJSON.parse<V>(entry[1], valueType);
            return [key, value];
        });
        return new Map<K, V>(parsedArray);
    }

    public static array<E>(json, elementType: { new (): E }): E {
        return json.map(element => {
            return TypedJSON.parse<E>(element, elementType);
        });
    }
}
