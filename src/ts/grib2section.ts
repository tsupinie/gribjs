
import { Grib2Struct, unpackStruct, unpackUTF8String, unpackerFactory, G2UInt1, G2UInt2, G2UInt4, G2UInt8 } from "./grib2base";
import { g2_section5_template_unpackers } from "./grib2datarepdefs";
import { section3_template_unpackers } from "./grib2griddefs";
import { g2_section4_template_unpackers } from "./grib2productdefs";

/**
 * Grib2 Section 0 (Indicator Section)
 */
const g2_section0_types = {
    grib_discipline: G2UInt1,
    grib_edition: G2UInt1,
    message_length: G2UInt8,
};

class Grib2Section0 extends Grib2Struct<typeof g2_section0_types> {
    readonly section_length: 16;

    constructor(contents: Record<keyof typeof g2_section0_types, number>) {
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
    section_length: G2UInt4,
    section_number: G2UInt1,
    originating_center_id: G2UInt2,
    originating_subcenter_id: G2UInt2,
    grib_master_table_version: G2UInt1,
    grib_local_table_version: G2UInt1,
    reference_time_singificance: G2UInt1,
    reference_year: G2UInt2,
    reference_month: G2UInt1,
    reference_day: G2UInt1,
    reference_hour: G2UInt1,
    reference_minute: G2UInt1,
    reference_second: G2UInt1,
    production_status: G2UInt1,
    processed_data_type: G2UInt1,
};

class Grib2Section1 extends Grib2Struct<typeof g2_section1_types> {
    constructor(contents: Record<keyof typeof g2_section1_types, number>) {
        if (contents.section_number != 1) {
            throw `Expected section 1, got ${contents.section_number}`
        }

        super(contents);
    }
}
const g2_section1_unpacker = unpackerFactory(g2_section1_types, Grib2Section1);

/**
 * Grib2 Section 2 (Local Use Section)
 */
const g2_section2_types = {
    section_length: G2UInt4,
    section_number: G2UInt1,
}

class Grib2Section2 extends Grib2Struct<typeof g2_section2_types> {
    constructor(contents: Record<keyof typeof g2_section2_types, number>) {
        if (contents.section_number != 2) {
            throw `Expected section 2, got ${contents.section_number}`
        }

        super(contents);
    }
}
const g2_section2_unpacker = unpackerFactory(g2_section2_types, Grib2Section2);

/**
 * Grib2 Section 3 (Grid Definition Section)
 */
const g2_section3_types = {
    section_length: G2UInt4,
    section_number: G2UInt1,
    grid_definition_source: G2UInt1,
    grid_size: G2UInt4,
    optional_point_list_length: G2UInt1,
    optional_point_list_interpretation: G2UInt1,
    grid_definition_template: section3_template_unpackers,
};

class Grib2Section3 extends Grib2Struct<typeof g2_section3_types> {
    constructor(contents: Record<keyof typeof g2_section3_types, number>) {
        if (contents.section_number != 3) {
            throw `Expected section 3, got ${contents.section_number}`
        }

        super(contents);
    }
}
const g2_section3_unpacker = unpackerFactory(g2_section3_types, Grib2Section3);

/**
 * Grib2 Section 4 (Product Definition Section)
 */
const g2_section4_types = {
    section_length: G2UInt4,
    section_number: G2UInt1,
    optional_number_of_coordinates: G2UInt2,
    product_definition_template: g2_section4_template_unpackers,
}

class Grib2Section4 extends Grib2Struct<typeof g2_section4_types> {
    constructor(contents: Record<keyof typeof g2_section4_types, number>) {
        if (contents.section_number != 4) {
            throw `Expected section 4, got ${contents.section_number}`
        }

        super(contents);
    }
}

const g2_section4_unpacker = unpackerFactory(g2_section4_types, Grib2Section4);

/**
 * Grib2 Section 5 (Data Representation Section)
 */
const g2_section5_types = {
    section_length: G2UInt4,
    section_number: G2UInt1,
    number_of_data_points: G2UInt4,
    data_representation_template: g2_section5_template_unpackers,
}

class Grib2Section5 extends Grib2Struct<typeof g2_section5_types> {
    constructor(contents: Record<keyof typeof g2_section5_types, number>) {
        if (contents.section_number != 5) {
            throw `Expected section 5, got ${contents.section_number}`
        }

        super(contents);
    }
}

const g2_section5_unpacker = unpackerFactory(g2_section5_types, Grib2Section5);

const g2_section6_types = {
    section_length: G2UInt4,
    section_number: G2UInt1,
    bitmap_indicator: G2UInt1,
}

/**
 * Grib2 Section 6 (Bitmap Section)
 */
class Grib2Section6 extends Grib2Struct<typeof g2_section6_types> {
    constructor(contents: Record<keyof typeof g2_section6_types, number>) {
        if (contents.section_number != 6) {
            throw `Expected section 6, got ${contents.section_number}`
        }

        super(contents);
    }
}

const g2_section6_unpacker = unpackerFactory(g2_section6_types, Grib2Section6);

/**
 * Grib2 Section 7 (Data Section)
 */
const g2_section7_types = {
    section_length: G2UInt4,
    section_number: G2UInt1,
}

class Grib2Section7 extends Grib2Struct<typeof g2_section7_types> {
    constructor(contents: Record<keyof typeof g2_section7_types, number>) {
        if (contents.section_number != 7) {
            throw `Expected section 7, got ${contents.section_number}`
        }

        super(contents);
    }
}

const g2_section7_unpacker = unpackerFactory(g2_section7_types, Grib2Section7);

export {g2_section0_unpacker, g2_section1_unpacker, g2_section2_unpacker, g2_section3_unpacker, g2_section4_unpacker, g2_section5_unpacker, g2_section6_unpacker, g2_section7_unpacker};