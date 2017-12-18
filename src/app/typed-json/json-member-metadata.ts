export class JsonMemberMetadata<T> {
    /** If set, a default value will be emitted for uninitialized members. */
    public emitDefaultValue: boolean;

    /** Member name as it appears in the serialized JSON. */
    public name: string;

    /** Property or field key of the json member. */
    public key: string;

    /** Constuctor (type) reference of the member. */
    public type: { new (): T };

    /** If set, indicates that the member must be present when deserializing. */
    public isRequired: boolean;

    /** If the json member is an array, sets options of array elements. */
    public elements: JsonMemberMetadata<any>;

    /** Serialization/deserialization order. */
    public order: number;

    public forceEnableTypeHinting: boolean;
}
