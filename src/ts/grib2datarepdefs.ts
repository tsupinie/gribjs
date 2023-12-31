
import { G2Int2, G2UInt1, G2UInt2, G2UInt4, Grib2Struct, Grib2TemplateEnumeration, InternalTypeMapper, unpackerFactory } from "./grib2base"
import { complexSDPackingDecoder, jpegDecoder, pngDecoder } from "./unpack";

interface DataRepresentationDefinition {
    unpackData(buffer: DataView, offset: number, packed_length: number, expected_size: number): Promise<Float32Array>;
}

type TypedArray = Uint8Array | Uint16Array | Uint32Array;

function unpackScaling<T extends TypedArray>(packed: T, reference_value: number, binary_scale_factor: number, decimal_scale_factor: number, original_data_type: number) {
    if (original_data_type == 1) {
        console.warn("The original data type is integers, but I'm just blindly making floats");
    }

    const binary_exp = Math.pow(2, binary_scale_factor);
    const decimal_exp = Math.pow(10, -decimal_scale_factor);

    const output = new Float32Array(packed.length);
    packed.forEach((val, i) => output[i] = (reference_value + val * binary_exp) * decimal_exp);
    return output;
}

function maybeRecastReferenceValue(raw_reference_value: number, data_type: number) {
    if (data_type == 0) {
        // Recast reference value to a float32
        return new Float32Array(new Uint32Array([raw_reference_value]).buffer)[0];
    }
    return raw_reference_value;
}

const g2_simple_packing_types = {
    reference_value: G2UInt4,
    binary_scale_factor: G2Int2,
    decimal_scale_factor: G2Int2,
    number_of_bits: G2UInt1,
    original_data_type: G2UInt1,
}

type Grib2SimplePackingContents = InternalTypeMapper<typeof g2_simple_packing_types>;
class Grib2SimplePacking extends Grib2Struct<Grib2SimplePackingContents> implements DataRepresentationDefinition {
    constructor(contents: Grib2SimplePackingContents, offset: number) {
        contents.reference_value = maybeRecastReferenceValue(contents.reference_value, contents.original_data_type);
        super(contents, offset);
    }

    async unpackData(buffer: DataView, offset: number, packed_length: number, expected_size: number) : Promise<Float32Array> {
        throw "Simple (un)packing not implemented yet";
    }
}

const g2_simple_packing_unpacker = unpackerFactory(g2_simple_packing_types, Grib2SimplePacking);


const g2_complex_packing_types = {
    reference_value: G2UInt4,
    binary_scale_factor: G2Int2,
    decimal_scale_factor: G2Int2,
    number_of_bits: G2UInt1,
    original_data_type: G2UInt1,
    group_splitting_method: G2UInt1,
    missing_value_method: G2UInt1,
    primary_missing_value: G2UInt4,
    secondary_missing_value: G2UInt4,
    number_of_groups: G2UInt4,
    group_width_reference: G2UInt1,
    group_width_bits: G2UInt1,
    group_length_reference: G2UInt4,
    group_length_increment: G2UInt1,
    last_group_length: G2UInt4,
    group_length_bits: G2UInt1,
}

type Grib2ComplexPackingContents = InternalTypeMapper<typeof g2_complex_packing_types>;
class Grib2ComplexPacking extends Grib2Struct<Grib2ComplexPackingContents> implements DataRepresentationDefinition {
    constructor(contents: Grib2ComplexPackingContents, offset: number) {
        contents.reference_value = maybeRecastReferenceValue(contents.reference_value, contents.original_data_type);
        super(contents, offset);
    }

    async unpackData(buffer: DataView, offset: number, packed_length: number, expected_size: number) : Promise<Float32Array> {
        throw "Complex (un)packing not implemented yet";
    }
}

const g2_complex_packing_unpacker = unpackerFactory(g2_complex_packing_types, Grib2ComplexPacking);


const g2_complex_packing_differencing_types = {
    reference_value: G2UInt4,
    binary_scale_factor: G2Int2,
    decimal_scale_factor: G2Int2,
    number_of_bits: G2UInt1,
    original_data_type: G2UInt1,
    group_splitting_method: G2UInt1,
    missing_value_method: G2UInt1,
    primary_missing_value: G2UInt4,
    secondary_missing_value: G2UInt4,
    number_of_groups: G2UInt4,
    group_width_reference: G2UInt1,
    group_width_bits: G2UInt1,
    group_length_reference: G2UInt4,
    group_length_increment: G2UInt1,
    last_group_length: G2UInt4,
    group_length_bits: G2UInt1,
    spatial_difference_order: G2UInt1,
    descriptor_bytes: G2UInt1,
}

type Grib2ComplexPackingDifferencingContents = InternalTypeMapper<typeof g2_complex_packing_differencing_types>;
class Grib2ComplexPackingDifferencing extends Grib2Struct<Grib2ComplexPackingDifferencingContents> implements DataRepresentationDefinition {
    constructor(contents: Grib2ComplexPackingDifferencingContents, offset: number) {
        contents.reference_value = maybeRecastReferenceValue(contents.reference_value, contents.original_data_type);
        super(contents, offset);
    }

    async unpackData(buffer: DataView, offset: number, packed_length: number, expected_size: number) : Promise<Float32Array> {
        const data = new Uint8Array(buffer.buffer.slice(offset, offset + packed_length))
        const output = await complexSDPackingDecoder(data, 
            expected_size,
            this.contents.number_of_bits,
            this.contents.number_of_groups,
            this.contents.group_splitting_method,
            this.contents.missing_value_method,
            this.contents.group_width_reference,
            this.contents.group_width_bits,
            this.contents.group_length_reference,
            this.contents.group_length_increment,
            this.contents.last_group_length,
            this.contents.group_length_bits,
            packed_length,
            this.contents.spatial_difference_order,
            this.contents.descriptor_bytes
        );
        
        return unpackScaling(output, this.contents.reference_value, this.contents.binary_scale_factor, this.contents.decimal_scale_factor, this.contents.original_data_type);
    }
}

const g2_complex_packing_differencing_unpacker = unpackerFactory(g2_complex_packing_differencing_types, Grib2ComplexPackingDifferencing);


const g2_png_packing_types = {
    reference_value: G2UInt4,
    binary_scale_factor: G2Int2,
    decimal_scale_factor: G2Int2,
    bit_depth: G2UInt1,
    original_data_type: G2UInt1,
}

type Grib2PNGPackingContents = InternalTypeMapper<typeof g2_png_packing_types>
class Grib2PNGPacking extends Grib2Struct<Grib2PNGPackingContents> implements DataRepresentationDefinition {
    constructor(contents: Grib2PNGPackingContents, offset: number) {
        contents.reference_value = maybeRecastReferenceValue(contents.reference_value, contents.original_data_type);
        super(contents, offset);
    }

    async unpackData(buffer: DataView, offset: number, packed_length: number, expected_size: number) {
        const data = new Uint8Array(buffer.buffer.slice(offset, offset + packed_length));
        
        let output: TypedArray;

        // This is dumb. Surely there's a better way to do this.
        if (this.contents.bit_depth === 8) {
            output = await pngDecoder(data, this.contents.bit_depth, expected_size);
        }
        else if (this.contents.bit_depth === 16) {
            output = await pngDecoder(data, this.contents.bit_depth, expected_size);
        }
        else if (this.contents.bit_depth === 32) {
            output = await pngDecoder(data, this.contents.bit_depth, expected_size);
        }
        else {
            throw `PNG packing bit depth ${this.contents.bit_depth} is not supported`;
        }

        return unpackScaling(output, this.contents.reference_value, this.contents.binary_scale_factor, this.contents.decimal_scale_factor, this.contents.original_data_type);
    }
};

const g2_png_packing_unpacker = unpackerFactory(g2_png_packing_types, Grib2PNGPacking);

const g2_jpeg_packing_types = {
    reference_value: G2UInt4,
    binary_scale_factor: G2Int2,
    decimal_scale_factor: G2Int2,
    bit_depth: G2UInt1,
    original_data_type: G2UInt1,
    compression_type: G2UInt1,
    target_compression_ratio: G2UInt1,
}

type Grib2JPEGPackingContents = InternalTypeMapper<typeof g2_jpeg_packing_types>;
class Grib2JPEGPacking extends Grib2Struct<Grib2JPEGPackingContents> implements DataRepresentationDefinition {
    constructor(contents: Grib2JPEGPackingContents, offset: number) {
        contents.reference_value = maybeRecastReferenceValue(contents.reference_value, contents.original_data_type);
        super(contents, offset);
    }

    async unpackData(buffer: DataView, offset: number, packed_length: number, expected_size: number) : Promise<Float32Array> {
        const data = new Uint8Array(buffer.buffer.slice(offset, offset + packed_length));
        const output = await jpegDecoder(data, expected_size);
        return unpackScaling(output, this.contents.reference_value, this.contents.binary_scale_factor, this.contents.decimal_scale_factor, this.contents.original_data_type);
    }
};

const g2_jpeg_packing_unpacker = unpackerFactory(g2_jpeg_packing_types, Grib2JPEGPacking);

const g2_section5_template_unpackers = new Grib2TemplateEnumeration<DataRepresentationDefinition>('data representation template', {
    0: g2_simple_packing_unpacker,
    2: g2_complex_packing_unpacker,
    3: g2_complex_packing_differencing_unpacker,
    40: g2_jpeg_packing_unpacker,
    41: g2_png_packing_unpacker,
});

export {g2_section5_template_unpackers};
export type {DataRepresentationDefinition};