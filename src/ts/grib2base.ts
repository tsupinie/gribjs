
type G2UInt1Type = 'ui1';
type G2UInt2Type = 'ui2';
type G2UInt4Type = 'ui4';
type G2UInt8Type = 'ui8';
const G2UInt1 = 'ui1' as G2UInt1Type;
const G2UInt2 = 'ui2' as G2UInt2Type;
const G2UInt4 = 'ui4' as G2UInt4Type;
const G2UInt8 = 'ui8' as G2UInt8Type;

type Grib2InternalType = G2UInt1Type | G2UInt2Type | G2UInt4Type | G2UInt8Type;
type Grib2TemplateEnumeration<T> = Record<number, Unpackable<T>>;
type Grib2ContentSpecTemplate<T> = Record<string, Grib2InternalType | Grib2TemplateEnumeration<T>>;
type Grib2Content<T, U> = Record<keyof T, number | U>

function isInternalType<T>(obj: Grib2InternalType | Grib2TemplateEnumeration<T>) : obj is Grib2InternalType {
    return obj === 'ui1' || obj === 'ui2' || obj === 'ui4' || obj === 'ui8';
}

function unpackStruct<T, U>(buf: DataView, struct: Grib2ContentSpecTemplate<U>, offset: number): Grib2Content<T, U> {
    const data_types = {
        'ui1': () => {  
            const val = buf.getUint8(offset);
            offset += 1;
            return val;
        },
        'ui2': () => {
            const val = buf.getUint16(offset);
            offset += 2;
            return val;
        },
        'ui4': () => { 
            const val = buf.getUint32(offset);
            offset += 4;
            return val;
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
            const template = dtype[template_number];
            const template_data = template.unpack(buf, offset)
            contents[name] = template_data;
        }
    };

    return contents as Record<keyof T, number | U>;
}

function unpackUTF8String(buf: DataView, offset: number, length: number) {
    return String.fromCharCode.apply(null, new Uint8Array(buf.buffer.slice(offset, offset + length)));
}

class Grib2Struct<T> {
    readonly contents: T;
    readonly offset: number;

    constructor(contents: T, offset: number) {
        this.contents = contents;
        this.offset = offset;
    }
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

type InternalTypeMapper<T, U=never, V=never> = {
    [K in keyof T]: K extends U ? V : number;
}

export {Grib2Struct, unpackStruct, unpackUTF8String, unpackerFactory, G2UInt1, G2UInt2, G2UInt4, G2UInt8};
export type {Grib2InternalType, Grib2TemplateEnumeration, Grib2Content, Grib2ContentSpecTemplate, Unpackable, InternalTypeMapper};