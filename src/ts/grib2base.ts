
type G2UInt1Type = 'ui1';
type G2Int1Type = 'i1';
type G2UInt2Type = 'ui2';
type G2Int2Type = 'i2';
type G2UInt4Type = 'ui4';
type G2Int4Type = 'i4';
type G2UInt8Type = 'ui8';
const G2UInt1 = 'ui1' as G2UInt1Type;
const G2Int1 = 'i1' as G2Int1Type;
const G2UInt2 = 'ui2' as G2UInt2Type;
const G2Int2 = 'i2' as G2Int2Type;
const G2UInt4 = 'ui4' as G2UInt4Type;
const G2Int4 = 'i4' as G2Int4Type;
const G2UInt8 = 'ui8' as G2UInt8Type;

type Grib2InternalType = G2UInt1Type | G2Int1Type | G2UInt2Type | G2Int2Type | G2UInt4Type | G2Int4Type | G2UInt8Type;
type Grib2ContentSpecTemplate<T> = Record<string, Grib2InternalType | Grib2TemplateEnumeration<T>>;
type Grib2Content<T, U> = Record<keyof T, number | U>

function isInternalType<T>(obj: Grib2InternalType | Grib2TemplateEnumeration<T>) : obj is Grib2InternalType {
    return obj === 'ui1' || obj === 'i1' || obj === 'ui2' || obj == 'i2' || obj === 'ui4' || obj === 'i4' || obj === 'ui8';
}

function unpackStruct<T, U>(buf: DataView, struct: Grib2ContentSpecTemplate<U>, offset: number): Grib2Content<T, U> {
    const data_types = {
        'ui1': () => {
            const val = buf.getUint8(offset);
            offset += 1;
            return val;
        },
        'i1': () => {
            const sign_bit_mask = 1 << 7;

            const val = buf.getUint8(offset);
            offset += 1;
            return (val & sign_bit_mask) ? -(val & ~sign_bit_mask) : val; // Grib stores negatives with just a sign bit ...
        },
        'ui2': () => {
            const val = buf.getUint16(offset);
            offset += 2;
            return val;
        },
        'i2': () => {
            const sign_bit_mask = 1 << 15;

            const val = buf.getUint16(offset);
            offset += 2;
            return (val & sign_bit_mask) ? -(val & ~sign_bit_mask) : val; // Grib stores negatives with just a sign bit ...
        },
        'ui4': () => { 
            const val = buf.getUint32(offset);
            offset += 4;
            return val;
        },
        'i4': () => {
            const sign_bit_mask = 1 << 31;

            const val = buf.getUint32(offset);
            offset += 4;
            return (val & sign_bit_mask) ? -(val & ~sign_bit_mask) : val; // Grib stores negatives with just a sign bit ...
        },
        'ui8': () => {
            // split 64-bit number into two 32-bit (4-byte) parts
            const left = buf.getUint32(offset);
            const right = buf.getUint32(offset + 4);

            // combine the two 32-bit values
            const combined = 2 ** 32 * left + right;

            if (!Number.isSafeInteger(combined))
                console.warn(combined, "exceeds MAX_SAFE_INTEGER. Precision may be lost");

            offset += 8;
            return combined;
        },
        'f4': () => {
            const val = buf.getFloat32(offset);
            offset += 4;
            return val;
        }
    }

    let contents: Record<string, number | U> = {};

    for (let name in struct) {
        const dtype = struct[name];
        if (isInternalType(dtype)) {
            contents[name] = data_types[dtype]();
        }
        else {
            const template_number = data_types['ui2']();
            const template = dtype.templates[template_number];

            if (template === undefined) {
                throw `Unknown ${dtype.name}: ${template_number}`;
            }

            const template_data = template.unpack(buf, offset)
            contents[name] = template_data;
        }
    };

    return contents as Record<keyof T, number | U>;
}

function unpackUTF8String(buf: DataView, offset: number, length: number) {
    return String.fromCharCode.apply(null, new Uint8Array(buf.buffer.slice(offset, offset + length)));
}

interface Unpackable<T> {
    unpack(b: DataView, o: number): T;
}

function unpackerFactory<T, U extends new(c: Record<keyof T, number | V>, o: number) => InstanceType<U>, V>
        (internal_types: Record<keyof T, Grib2InternalType | Grib2TemplateEnumeration<V>>, return_type: U, unpacker?: (b: DataView, o: number) => InstanceType<U>) {

    const default_unpacker = (buf: DataView, offset: number) => {
        const contents = unpackStruct<T, V>(buf, internal_types, offset);
        return new return_type(contents, offset);
    }

    const unpacker_ = unpacker === undefined ? default_unpacker : unpacker;

    class Factory implements Unpackable<InstanceType<U>> {
        static internal_types = internal_types;

        unpack = unpacker_;
    }

    return new Factory();
}

class Grib2Struct<T> {
    readonly contents: T;
    readonly offset: number;

    constructor(contents: T, offset: number) {
        this.contents = contents;
        this.offset = offset;
    }
}

class Grib2TemplateEnumeration<T> {
    readonly name: string;
    readonly templates: Record<number, Unpackable<T>>;

    constructor(name: string, templates: Record<number, Unpackable<T>>) {
        this.name = name;
        this.templates = templates;
    }
}

type Constructor<T> = new(...args: any[]) => T;
type InternalTypeMapper<T, U=never, V=never> = {
    [K in keyof T]: K extends U ? V : number;
}

export {Grib2Struct, Grib2TemplateEnumeration, unpackStruct, unpackUTF8String, unpackerFactory, G2UInt1, G2Int1, G2UInt2, G2Int2, G2UInt4, G2Int4, G2UInt8};
export type {Grib2InternalType,  Grib2Content, Grib2ContentSpecTemplate, Unpackable, InternalTypeMapper, Constructor};