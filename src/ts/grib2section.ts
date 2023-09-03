
import { Grib2InternalType, Grib2Struct, unpackStruct, unpackUTF8String, unpackerFactory } from "./grib2base";
import { section3_template_unpackers } from "./grib2griddefs";

/**
 * Grib2 Section 0 (Indicator Section)
 */
const g2_section0_types = {
    grib_discipline: 'ui1' as Grib2InternalType,
    grib_edition: 'ui1' as Grib2InternalType,
    message_length: 'ui8' as Grib2InternalType,
};

class Grib2Section0 extends Grib2Struct<typeof g2_section0_types> {
    readonly section_length: 16;

    constructor(contents: Map<keyof typeof g2_section0_types, number>) {
        super(contents);

        this.section_length = 16;
    }
}

const g2_section0_unpacker = unpackerFactory(g2_section0_types, Grib2Section0, (buf: DataView, offset: number) => {
    const marker = unpackUTF8String(buf, offset, 4);
    if (marker != 'GRIB') {
        throw `Missing GRIB header marker`;
    }

    const contents = unpackStruct<typeof g2_section0_types, number>(buf, g2_section0_types, offset + 6);
    return new Grib2Section0(contents);
});

/**
 * Grib2 Section 1 (Identification Section)
 */
const g2_section1_types = {
    section_length: 'ui4' as Grib2InternalType,
    section_number: 'ui1' as Grib2InternalType,
    originating_center_id: 'ui2' as Grib2InternalType,
    originating_subcenter_id: 'ui2' as Grib2InternalType,
    grib_master_table_version: 'ui1' as Grib2InternalType,
    grib_local_table_version: 'ui1' as Grib2InternalType,
    reference_time_singificance: 'ui1' as Grib2InternalType,
    reference_year: 'ui2' as Grib2InternalType,
    reference_month: 'ui1' as Grib2InternalType,
    reference_day: 'ui1' as Grib2InternalType,
    reference_hour: 'ui1' as Grib2InternalType,
    reference_minute: 'ui1' as Grib2InternalType,
    reference_second: 'ui1' as Grib2InternalType,
    production_status: 'ui1' as Grib2InternalType,
    processed_data_type: 'ui1' as Grib2InternalType,
};

class Grib2Section1 extends Grib2Struct<typeof g2_section1_types> {
    constructor(contents: Map<keyof typeof g2_section1_types, number>) {
        if (contents.get('section_number') != 1) {
            throw `Expected section 1, got ${contents.get('section_number')}`
        }

        super(contents);
    }
}
const g2_section1_unpacker = unpackerFactory(g2_section1_types, Grib2Section1);

const g2_section2_types = {
    section_length: 'ui4' as Grib2InternalType,
    section_number: 'ui1' as Grib2InternalType,
}

/**
 * Grib2 Section 2 (Local Use section)
 */
class Grib2Section2 extends Grib2Struct<typeof g2_section2_types> {
    constructor(contents: Map<keyof typeof g2_section2_types, number>) {
        if (contents.get('section_number') != 2) {
            throw `Expected section 2, got ${contents.get('section_number')}`
        }

        super(contents);
    }
}
const g2_section2_unpacker = unpackerFactory(g2_section2_types, Grib2Section2);

const g2_section3_types = {
    section_length: 'ui4' as Grib2InternalType,
    section_number: 'ui1' as Grib2InternalType,
    grid_definition_source: 'ui1' as Grib2InternalType,
    grid_size: 'ui4' as Grib2InternalType,
    optional_point_list_length: 'ui1' as Grib2InternalType,
    optional_point_list_interpretation: 'ui1' as Grib2InternalType,
    grid_definition_template: section3_template_unpackers,
};

class Grib2Section3 extends Grib2Struct<typeof g2_section3_types> {
    constructor(contents: Map<keyof typeof g2_section3_types, number>) {
        if (contents.get('section_number') != 3) {
            throw `Expected section 3, got ${contents.get('section_number')}`
        }

        super(contents);
    }
}
const g2_section3_unpacker = unpackerFactory(g2_section3_types, Grib2Section3);

/*

const PRODUCT_DEFINITION_SECTION = [
    ['section_length', 'ui4'],
    ['section_number', 'ui1'],
    ['optional_number_of_coordinates', 'ui2'],
    ['product_definition_template_number', 'ui2'],
]

const PRODUCT_DEFINITION_TEMPLATES = {
    0: [
        ['parameter_category', 'ui1'],
        ['parameter_number', 'ui1'],
        ['generating_process_type', 'ui1'],
        ['generating_process_identifier', 'ui1'],
        ['generating_process', 'ui1'],
        ['obs_data_cutoff_hours', 'ui2'],
        ['obs_data_cutoff_minutes', 'ui1'],
        ['time_range_unit', 'ui1'],
        ['forecast_time', 'ui4'],
        ['fixed_surface_1_type', 'ui1'],
        ['fixed_surface_1_scale_factor', 'ui1'],
        ['fixed_surface_1_value', 'ui4'],
        ['fixed_surface_2_type', 'ui1'],
        ['fixed_surface_2_scale_factor', 'ui1'],
        ['fixed_surface_2_value', 'ui4'],
    ]
}

const DATA_REPRESENTATION_SECTION = [
    ['section_length', 'ui4'],
    ['section_number', 'ui1'],
    ['number_of_data_points', 'ui4'],
    ['data_representation_template_number', 'ui2']
]

const DATA_REPRESENTATION_TEMPLATES = {
    0: [
        ['reference_value', 'ui4'],
        ['binary_scale_factor', 'ui2'],
        ['decimal_scale_factor', 'ui2'],
        ['number_of_bits', 'ui1'],
        ['original_data_type', 'ui1'],
    ],
    41: [
        ['reference_value', 'ui4'],
        ['binary_scale_factor', 'ui2'],
        ['decimal_scale_factor', 'ui2'],
        ['bit_depth', 'ui1'],
        ['original_data_type', 'ui1'],
    ]
}

const BITMAP_SECTION = [
    ['section_length', 'ui4'],
    ['section_number', 'ui1'],
    ['bitmap_indicator', 'ui1'],
];

const DATA_SECTION = [
    ['section_length', 'ui4'],
    ['section_number', 'ui1'],
];

*/

export {g2_section0_unpacker, g2_section1_unpacker, g2_section2_unpacker, g2_section3_unpacker};