import { Helpers } from './helpers';
import { JsonMemberMetadata } from './json-member-metadata';
import { METADATA_FIELD_KEY } from './typed-json';

export class JsonObjectMetadata<T> {

    /** Gets or sets the constructor function for the JsonObject. */
    public classType: { new (): T };
    public isExplicitlyMarked: boolean;
    public initializer: (json: any) => T;
    public serializer: (object: T) => any;
    private _knownTypeCache: { [key: string]: { new (): any } };

    constructor() {
        this._dataMembers = {};
        this._knownTypes = [];
        this._knownTypeCache = null;
        this.isExplicitlyMarked = false;
    }

    private _knownTypes: Array<{ new (): any }>;

    /** Gets a key-value collection of the currently known types for this JsonObject. */
    public get knownTypes() {
        let knownTypes: { [key: string]: { new (): any } };
        let knownTypeName: string;

        knownTypes = {};

        this._knownTypes.forEach((knownType) => {
            // KnownType names are not inherited from JsonObject settings, as it would render them useless.
            knownTypeName = JsonObjectMetadata.getKnownTypeNameFromType(knownType);
            knownTypes[knownTypeName] = knownType;
        });

        this._knownTypeCache = knownTypes;

        return knownTypes;
    }

    private _dataMembers: { [key: string]: JsonMemberMetadata<any> };

    /** Gets the metadata of all JsonMembers of the JsonObject as key-value pairs. */
    public get dataMembers(): { [key: string]: JsonMemberMetadata<any> } {
        return this._dataMembers;
    }

    private _className: string;

    /** Gets or sets the name of the JsonObject as it appears in the serialized JSON. */
    public get className(): string {
        return typeof this._className === 'string' ?
            this._className :
            Helpers.getClassName(this.classType);
    }

    public set className(value: string) {
        this._className = value;
    }

    /**
     * Gets the name of a class as it appears in a serialized JSON string.
     * @param type The JsonObject class.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     */
    public static getJsonObjectName(type: { new (): any }, inherited: boolean = true): string {
        const metadata = this.getFromType(type, inherited);

        if (metadata !== null) {
            return metadata.className;
        } else {
            return Helpers.getClassName(type);
        }
    }

    /**
     * Gets JsonObject metadata information from a class or its prototype.
     * @param target The target class.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     * @see https://jsfiddle.net/m6ckc89v/ for demos related to the special inheritance case when 'inherited' is set.
     */
    public static getFromType<S>(target: { new (): S }, inherited?: boolean): JsonObjectMetadata<S>;

    /**
     * Gets JsonObject metadata information from a class or its prototype.
     * @param target The target prototype.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     * @see https://jsfiddle.net/m6ckc89v/ for demos related to the special inheritance case when 'inherited' is set.
     */
    public static getFromType(target: any, inherited?: boolean): JsonObjectMetadata<any>;

    public static getFromType<S>(target: { new (): S } | any, inherited: boolean = true): JsonObjectMetadata<S> {
        let targetPrototype: any;
        let metadata: JsonObjectMetadata<S>;

        if (typeof target === 'function') {
            targetPrototype = target.prototype;
        } else {
            targetPrototype = target;
        }

        if (!targetPrototype) {
            return null;
        }

        if (targetPrototype.hasOwnProperty(METADATA_FIELD_KEY)) {
            // The class prototype contains own JsonObject metadata.
            metadata = targetPrototype[METADATA_FIELD_KEY];
        } else if (inherited && targetPrototype[METADATA_FIELD_KEY]) {
            // The class prototype inherits JsonObject metadata.
            metadata = targetPrototype[METADATA_FIELD_KEY];
        }

        if (metadata && metadata.isExplicitlyMarked) {
            // Ignore implicitly added JsonObject.
            return metadata;
        } else {
            return null;
        }
    }

    /**
     * Gets JsonObject metadata information from a class instance.
     * @param target The target instance.
     * @param inherited Whether to use inherited metadata information from base classes (if own metadata does not exist).
     * @see https://jsfiddle.net/m6ckc89v/ for demos related to the special inheritance case when 'inherited' is set.
     */
    public static getFromInstance<S>(target: S, inherited: boolean = true): JsonObjectMetadata<S> {
        return this.getFromType<S>(Object.getPrototypeOf(target), inherited);
    }

    /**
     * Gets the known type name of a JsonObject class for type hint.
     * @param target The target class.
     */
    public static getKnownTypeNameFromType<S>(target: { new (): S }): string {
        const metadata = this.getFromType<S>(target, false);
        return metadata ?
            metadata.className :
            Helpers.getClassName(target);
    }

    /**
     * Gets the known type name of a JsonObject instance for type hint.
     * @param target The target instance.
     */
    public static getKnownTypeNameFromInstance<S>(target: S): string {
        const metadata = this.getFromInstance<S>(target, false);
        return metadata ?
            metadata.className :
            Helpers.getClassName(target.constructor);
    }

    /**
     * Sets a known type.
     * @param type The known type.
     */
    public setKnownType(type: { new (): any }): void {
        if (this._knownTypes.indexOf(type) === -1) {
            this._knownTypes.push(type);
            this._knownTypeCache = null;
        }
    }

    /**
     * Adds a JsonMember to the JsonObject.
     * @param member The JsonMember metadata.
     * @throws Error if a JsonMember with the same name already exists.
     */
    public addMember<U>(member: JsonMemberMetadata<U>) {
        Object.keys(this._dataMembers).forEach((propertyKey) => {
            if (this._dataMembers[propertyKey].name === member.name) {
                throw new Error(`A member with the name '${member.name}' already exists.`);
            }
        });

        this._dataMembers[member.key] = member;
    }

    /**
     * Sorts data members:
     *  1. Ordered members in defined order
     *  2. Unordered members in alphabetical order
     */
    public sortMembers(): void {
        let memberArray: Array<JsonMemberMetadata<any>> = [];

        Object.keys(this._dataMembers).forEach((propertyKey) => {
            memberArray.push(this._dataMembers[propertyKey]);
        });

        memberArray = memberArray.sort(this.sortMembersCompare);

        this._dataMembers = {};

        memberArray.forEach((dataMember) => {
            this._dataMembers[dataMember.key] = dataMember;
        });
    }

    private sortMembersCompare(a: JsonMemberMetadata<any>, b: JsonMemberMetadata<any>) {
        if (typeof a.order !== 'number' && typeof b.order !== 'number') {
            // a and b both both implicitly ordered, alphabetical order
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            }
        } else if (typeof a.order !== 'number') {
            // a is implicitly ordered, comes after b (compare: a is greater)
            return 1;
        } else if (typeof b.order !== 'number') {
            // b is implicitly ordered, comes after a (compare: b is greater)
            return -1;
        } else {
            // a and b are both explicitly ordered
            if (a.order < b.order) {
                return -1;
            } else if (a.order > b.order) {
                return 1;
            } else {
                // ordering is the same, use alphabetical order
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }
            }
        }

        return 0;
    }
}
