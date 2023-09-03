
import { Grib2InternalType, Grib2Struct, Grib2TemplateEnumeration, unpackerFactory } from "./grib2base"

const g2_simple_packing_types = {
    reference_value: 'ui4' as Grib2InternalType,
    binary_scale_factor: 'ui2' as Grib2InternalType,
    decimal_scale_factor: 'ui2' as Grib2InternalType,
    number_of_bits: 'ui1' as Grib2InternalType,
    original_data_type: 'ui1' as Grib2InternalType,
}

class Grib2SimplePacking extends Grib2Struct<typeof g2_simple_packing_types> {};
const g2_simple_packing_unpacker = unpackerFactory(g2_simple_packing_types, Grib2SimplePacking);

const g2_png_packing_types = {
    reference_value: 'ui4' as Grib2InternalType,
    binary_scale_factor: 'ui2' as Grib2InternalType,
    decimal_scale_factor: 'ui2' as Grib2InternalType,
    bit_depth: 'ui1' as Grib2InternalType,
    original_data_type: 'ui1' as Grib2InternalType,
}

class Grib2PNGPacking extends Grib2Struct<typeof g2_png_packing_types> {};
const g2_png_packing_unpacker = unpackerFactory(g2_png_packing_types, Grib2PNGPacking);

type DataRepresentationDefinition = Grib2SimplePacking | Grib2PNGPacking

const g2_section5_template_unpackers: Grib2TemplateEnumeration<DataRepresentationDefinition> = {
    0: g2_simple_packing_unpacker,
    41: g2_png_packing_unpacker,
}

export {g2_section5_template_unpackers};