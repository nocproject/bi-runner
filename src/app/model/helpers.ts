// import { TypedJSON } from '@upe/typedjson';

export class SerializationHelper {
    public static map<K, V>(map: Map<K, V>) {
        return Array.from(map.entries()).map((x) => {
            const key = JSON.stringify(x[0]);
            const value = JSON.stringify(x[1]);

            return [key, value];
        });
    }

    public static array<E>(array: Array<E>) {
        return array.map(element => JSON.stringify(element));
    }
}

export class DeserializationHelper {
    public static map<K, V>(json, keyType: { new (): K }, valueType: { new (): V }): Map<K, V> {
        const parsedArray = json.map(entry => {
            const key = JSON.parse(entry[0]);
            const value = JSON.parse(entry[1]);
            return [key, value];
        });
        return new Map<K, V>(parsedArray);
    }

    public static array<E>(json, elementType: { new (): E }): E {
        return json.map(element => {
            return JSON.parse(element);
        });
    }
}
