
type Grib2InternalType = 'ui1' | 'ui2' | 'ui4' | 'ui8';
type Grib2TemplateEnumeration<T> = Record<number, Unpackable<T>>;
type Grib2ContentSpecTemplate<T> = Record<string, Grib2InternalType | Grib2TemplateEnumeration<T>>;
type Grib2Content<T, U> = Map<keyof T, number | U>

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

    let contents = new Map<keyof T, number | U>();

    for (let name in struct) {
        const dtype = struct[name];
        if (isInternalType(dtype)) {
            contents.set(name as keyof T, data_types[dtype]());
        }
        else {
            const template_number = data_types['ui2']();
            const template = dtype[template_number];
            const template_data = template.unpack(buf, offset)
            contents.set(name as keyof T, template_data);
        }
    };

    return contents;
}

function unpackUTF8String(buf: DataView, offset: number, length: number) {
    return String.fromCharCode.apply(null, new Uint8Array(buf.buffer.slice(offset, offset + length)));
}

class Grib2Struct<T> {
    contents: Map<keyof T, number>;

    constructor(contents: Map<keyof T, number>) {
        this.contents = contents;
    }
}

interface Unpackable<T> {
    unpack(b: DataView, o: number): T;
}

function unpackerFactory<T, U extends new(c: Map<keyof T, number | V>) => InstanceType<U>, V>
        (internal_types: Record<keyof T, Grib2InternalType | Grib2TemplateEnumeration<V>>, return_type: U, unpacker?: (b: DataView, o: number) => InstanceType<U>) {

    const default_unpacker = (buf: DataView, offset: number) => {
        const contents = unpackStruct<T, V>(buf, internal_types, offset);
        return new return_type(contents);
    }

    const unpacker_ = unpacker === undefined ? default_unpacker : unpacker;

    class Factory implements Unpackable<InstanceType<U>> {
        static internal_types = internal_types;

        unpack = unpacker_;
    }

    return new Factory();
}

export {Grib2Struct, unpackStruct, unpackUTF8String, unpackerFactory};
export type {Grib2InternalType, Grib2TemplateEnumeration, Grib2Content, Grib2ContentSpecTemplate, Unpackable}