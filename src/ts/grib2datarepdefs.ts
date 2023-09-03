
import { G2UInt1, G2UInt2, G2UInt4, Grib2Struct, Grib2TemplateEnumeration, unpackerFactory } from "./grib2base"

const g2_simple_packing_types = {
    reference_value: G2UInt4,
    binary_scale_factor: G2UInt2,
    decimal_scale_factor: G2UInt2,
    number_of_bits: G2UInt1,
    original_data_type: G2UInt1,
}

class Grib2SimplePacking extends Grib2Struct<typeof g2_simple_packing_types> {};
const g2_simple_packing_unpacker = unpackerFactory(g2_simple_packing_types, Grib2SimplePacking);

const g2_png_packing_types = {
    reference_value: G2UInt4,
    binary_scale_factor: G2UInt2,
    decimal_scale_factor: G2UInt2,
    bit_depth: G2UInt1,
    original_data_type: G2UInt1,
}

class Grib2PNGPacking extends Grib2Struct<typeof g2_png_packing_types> {};
const g2_png_packing_unpacker = unpackerFactory(g2_png_packing_types, Grib2PNGPacking);

type DataRepresentationDefinition = Grib2SimplePacking | Grib2PNGPacking

const g2_section5_template_unpackers: Grib2TemplateEnumeration<DataRepresentationDefinition> = {
    0: g2_simple_packing_unpacker,
    41: g2_png_packing_unpacker,
}

export {g2_section5_template_unpackers};