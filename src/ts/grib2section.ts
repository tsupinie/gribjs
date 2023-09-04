
import { Duration } from "luxon";
import { Grib2Struct, unpackStruct, unpackUTF8String, unpackerFactory, G2UInt1, G2UInt2, G2UInt4, G2UInt8, InternalTypeMapper } from "./grib2base";
import { DataRepresentationDefinition, g2_section5_template_unpackers } from "./grib2datarepdefs";
import { GridDefinition, section3_template_unpackers } from "./grib2griddefs";
import { ProductDefinition, SurfaceSpec, g2_section4_template_unpackers, isAnalysisOrForecast, isHorizontalLayer } from "./grib2productdefs";
import { lookupGrib2Parameter } from "./grib2producttables";
import { Grib2SurfaceTableEntry } from "./grib2surfacetables";

/**
 * Grib2 Section 0 (Indicator Section)
 */
const g2_section0_types = {
    grib_discipline: G2UInt1,
    grib_edition: G2UInt1,
    message_length: G2UInt8,
};

type Grib2Section0Content = InternalTypeMapper<typeof g2_section0_types>;
class Grib2IndicatorSection extends Grib2Struct<Grib2Section0Content> {
    readonly section_length: 16;

    constructor(contents: Grib2Section0Content, offset: number) {
        super(contents, offset);

        this.section_length = 16;
    }
}

const g2_section0_unpacker = unpackerFactory(g2_section0_types, Grib2IndicatorSection, (buf: DataView, offset: number) => {
    const marker = unpackUTF8String(buf, offset, 4);
    if (marker != 'GRIB') {
        throw `Missing GRIB header marker`;
    }

    const contents = unpackStruct<typeof g2_section0_types, number>(buf, g2_section0_types, offset + 6);
    return new Grib2IndicatorSection(contents, offset);
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

type Grib2Section1Content = InternalTypeMapper<typeof g2_section1_types>;
class Grib2IdentificationSection extends Grib2Struct<Grib2Section1Content> {
    constructor(contents: Grib2Section1Content, offset: number) {
        if (contents.section_number != 1) {
            throw `Expected section 1, got ${contents.section_number}`
        }

        super(contents, offset);
    }
}
const g2_section1_unpacker = unpackerFactory(g2_section1_types, Grib2IdentificationSection);

/**
 * Grib2 Section 2 (Local Use Section)
 */
const g2_section2_types = {
    section_length: G2UInt4,
    section_number: G2UInt1,
}

type Grib2Section2Content = InternalTypeMapper<typeof g2_section2_types>;
class Grib2LocalUseSection extends Grib2Struct<Grib2Section2Content> {
    constructor(contents: Grib2Section2Content, offset: number) {
        if (contents.section_number != 2) {
            throw `Expected section 2, got ${contents.section_number}`
        }

        super(contents, offset);
    }
}
const g2_section2_unpacker = unpackerFactory(g2_section2_types, Grib2LocalUseSection);

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

type Grib2Section3Content = InternalTypeMapper<typeof g2_section3_types, 'grid_definition_template', GridDefinition>;
class Grib2GridDefinitionSection extends Grib2Struct<Grib2Section3Content> {
    constructor(contents: Grib2Section3Content, offset: number) {
        if (contents.section_number != 3) {
            throw `Expected section 3, got ${contents.section_number}`
        }

        super(contents, offset);
    }
}
const g2_section3_unpacker = unpackerFactory(g2_section3_types, Grib2GridDefinitionSection);

/**
 * Grib2 Section 4 (Product Definition Section)
 */
const g2_section4_types = {
    section_length: G2UInt4,
    section_number: G2UInt1,
    optional_number_of_coordinates: G2UInt2,
    product_definition_template: g2_section4_template_unpackers,
}

type Grib2Section4Content = InternalTypeMapper<typeof g2_section4_types, 'product_definition_template', ProductDefinition>;
class Grib2ProductDefinitionSection extends Grib2Struct<Grib2Section4Content> {
    constructor(contents: Grib2Section4Content, offset: number) {
        if (contents.section_number != 4) {
            throw `Expected section 4, got ${contents.section_number}`
        }

        super(contents, offset);
    }

    getProduct(discipline: number) {
        return lookupGrib2Parameter(discipline, this.contents.product_definition_template.parameter_category, this.contents.product_definition_template.parameter_number);
    }

    getSurface(): {surface1?: SurfaceSpec, surface2?: SurfaceSpec} {
        if (!isHorizontalLayer(this.contents.product_definition_template)) {
            return {};
        }

        const surface1 = this.contents.product_definition_template.getSurface1();
        const surface2 = this.contents.product_definition_template.getSurface2();
        return surface2 === null ? {surface1: surface1} : {surface1: surface1, surface2: surface2};
    }

    getForecastTime() {
        if (!isAnalysisOrForecast(this.contents.product_definition_template)) {
            return Duration.invalid('No forecast time in this template');
        }

        return this.contents.product_definition_template.getForecastTime();
    }
}

const g2_section4_unpacker = unpackerFactory(g2_section4_types, Grib2ProductDefinitionSection);

/**
 * Grib2 Section 5 (Data Representation Section)
 */
const g2_section5_types = {
    section_length: G2UInt4,
    section_number: G2UInt1,
    number_of_data_points: G2UInt4,
    data_representation_template: g2_section5_template_unpackers,
}

type Grib2Section5Content = InternalTypeMapper<typeof g2_section5_types, 'data_representation_template', DataRepresentationDefinition>;
class Grib2DataRepresentationSection extends Grib2Struct<Grib2Section5Content> {
    constructor(contents: Grib2Section5Content, offset: number) {
        if (contents.section_number != 5) {
            throw `Expected section 5, got ${contents.section_number}`
        }

        super(contents, offset);
    }
}

const g2_section5_unpacker = unpackerFactory(g2_section5_types, Grib2DataRepresentationSection);

/**
 * Grib2 Section 6 (Bitmap Section)
 */
const g2_section6_types = {
    section_length: G2UInt4,
    section_number: G2UInt1,
    bitmap_indicator: G2UInt1,
}

type Grib2Section6Content = InternalTypeMapper<typeof g2_section6_types>;
class Grib2BitmapSection extends Grib2Struct<Grib2Section6Content> {
    constructor(contents: Grib2Section6Content, offset: number) {
        if (contents.section_number != 6) {
            throw `Expected section 6, got ${contents.section_number}`
        }

        super(contents, offset);
    }
}

const g2_section6_unpacker = unpackerFactory(g2_section6_types, Grib2BitmapSection);

/**
 * Grib2 Section 7 (Data Section)
 */
const g2_section7_types = {
    section_length: G2UInt4,
    section_number: G2UInt1,
}

type Grib2Section7Content = InternalTypeMapper<typeof g2_section7_types>;
class Grib2DataSection extends Grib2Struct<Grib2Section7Content> {
    constructor(contents: Grib2Section7Content, offset: number) {
        if (contents.section_number != 7) {
            throw `Expected section 7, got ${contents.section_number}`
        }

        super(contents, offset);
    }

    unpackData(buffer: DataView, offset: number, sec5: Grib2DataRepresentationSection) {
        return sec5.contents.data_representation_template.unpackData(buffer, offset, this.contents.section_length - 5, sec5.contents.number_of_data_points);
    }
}

const g2_section7_unpacker = unpackerFactory(g2_section7_types, Grib2DataSection);

export {g2_section0_unpacker, g2_section1_unpacker, g2_section2_unpacker, g2_section3_unpacker, g2_section4_unpacker, g2_section5_unpacker, g2_section6_unpacker, g2_section7_unpacker};
export type {Grib2IndicatorSection, Grib2IdentificationSection, Grib2LocalUseSection, Grib2GridDefinitionSection, Grib2ProductDefinitionSection,
             Grib2DataRepresentationSection, Grib2BitmapSection, Grib2DataSection}