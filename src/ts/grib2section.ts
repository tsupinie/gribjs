
import { DateTime, Duration } from "luxon";
import { Grib2Struct, unpackStruct, unpackUTF8String, unpackerFactory, G2UInt1, G2UInt2, G2UInt4, G2UInt8, InternalTypeMapper, Constructor } from "./grib2base";
import { DataRepresentationDefinition, g2_section5_template_unpackers } from "./grib2datarepdefs";
import { GridDefinition, ScanModeFlags, hasNiNj, hasScanModeFlags, section3_template_unpackers } from "./grib2griddefs";
import { EnsembleSpec, ProductDefinition, SurfaceSpec, TimeAggSpec, g2_section4_template_unpackers, isAnalysisOrForecastProduct, isEnsembleProduct, isHorizontalLayerProduct, isTimeAggProduct } from "./grib2productdefs";
import { lookupGrib2Parameter } from "./grib2producttables";

type ConstructorWithSectionNumber = Constructor<Grib2Struct<{section_number: number}>>;

function sectionNumberCheck<T extends ConstructorWithSectionNumber>(base: T, expected_section_number: number) {
    return class extends base {
        checkSectionNumber() {
            if (this.contents.section_number != expected_section_number) {
                throw `Expected section ${expected_section_number}, got ${this.contents.section_number}`;
            }
        }
    }
}

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
class Grib2IdentificationSection extends sectionNumberCheck(Grib2Struct<Grib2Section1Content>, 1) {
    constructor(contents: Grib2Section1Content, offset: number) {
        super(contents, offset);
        this.checkSectionNumber();
    }

    getReferenceTime() {
        return DateTime.utc(this.contents.reference_year, this.contents.reference_month, this.contents.reference_day, 
                            this.contents.reference_hour, this.contents.reference_minute, this.contents.reference_second);
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
class Grib2LocalUseSection extends sectionNumberCheck(Grib2Struct<Grib2Section2Content>, 2) {
    constructor(contents: Grib2Section2Content, offset: number) {
        super(contents, offset);
        this.checkSectionNumber();
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
class Grib2GridDefinitionSection extends sectionNumberCheck(Grib2Struct<Grib2Section3Content>, 3) {
    constructor(contents: Grib2Section3Content, offset: number) {
        super(contents, offset);
        this.checkSectionNumber();
    }

    getGridDims() {
        if (hasNiNj(this.contents.grid_definition_template)) {
            return {ngrid_i: this.contents.grid_definition_template.ngrid_i, ngrid_j: this.contents.grid_definition_template.ngrid_j};
        }

        throw `Grid definition template doesn't appear to have the grid dimensions implemented`;
    }

    getGridParameters() {
        return this.contents.grid_definition_template.getGridParameters();
    }

    applyScanModeFlags(data: Float32Array) {
        if (!hasScanModeFlags(this.contents.grid_definition_template)) {
            return;
        }

        const {ngrid_i, ngrid_j} = this.getGridDims();

        const scan_mode_flags = this.contents.grid_definition_template.getScanModeFlags();
        if (scan_mode_flags.do_adjacent_rows_alternate) {
            // Undo the adjacent rows alternating direction

            const row_halfway = Math.floor(ngrid_i / 2);

            for (let j = 1; j < ngrid_j; j += 2) {
                const row_start = j * ngrid_i;
                const row_end = (j + 1) * ngrid_i - 1;

                for (let i = 0; i < row_halfway; i++) {
                    const tmp = data[row_start + i];
                    data[row_start + i] = data[row_end - i];
                    data[row_end - i] = tmp;
                }
            }
        }
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
class Grib2ProductDefinitionSection extends sectionNumberCheck(Grib2Struct<Grib2Section4Content>, 4) {
    constructor(contents: Grib2Section4Content, offset: number) {
        super(contents, offset);
        this.checkSectionNumber();
    }

    getProduct(discipline: number) {
        return lookupGrib2Parameter(discipline, this.contents.product_definition_template.parameter_category, this.contents.product_definition_template.parameter_number);
    }

    getSurface(): {surface1?: SurfaceSpec, surface2?: SurfaceSpec} {
        if (!isHorizontalLayerProduct(this.contents.product_definition_template)) {
            return {};
        }

        const surface1 = this.contents.product_definition_template.getSurface1();
        const surface2 = this.contents.product_definition_template.getSurface2();
        return surface2 === null ? {surface1: surface1} : {surface1: surface1, surface2: surface2};
    }

    getForecastTime() {
        if (!isAnalysisOrForecastProduct(this.contents.product_definition_template)) {
            return Duration.invalid('No forecast time in this template');
        }

        return this.contents.product_definition_template.getForecastTime();
    }

    getTimeAgg() : TimeAggSpec | null {
        if (!isTimeAggProduct(this.contents.product_definition_template)) {
            return null;
        }

        return this.contents.product_definition_template.getTimeAgg();
    }

    getEnsemble(): EnsembleSpec | null {
        if (!isEnsembleProduct(this.contents.product_definition_template)) {
            return null;
        }

        return this.contents.product_definition_template.getEnsemble();
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
class Grib2DataRepresentationSection extends sectionNumberCheck(Grib2Struct<Grib2Section5Content>, 5) {
    constructor(contents: Grib2Section5Content, offset: number) {
        super(contents, offset);
        this.checkSectionNumber();
    }

    get unpackData() {
        return (buffer: DataView, offset: number, packed_len: number, sec3: Grib2GridDefinitionSection) => {
            return this.contents.data_representation_template.unpackData(buffer, offset, packed_len, this.contents.number_of_data_points).then(data => {
                sec3.applyScanModeFlags(data);
                return data;
            });
        }
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
class Grib2BitmapSection extends sectionNumberCheck(Grib2Struct<Grib2Section6Content>, 6) {
    constructor(contents: Grib2Section6Content, offset: number) {
        super(contents, offset);
        this.checkSectionNumber();
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
class Grib2DataSection extends sectionNumberCheck(Grib2Struct<Grib2Section7Content>, 7) {
    constructor(contents: Grib2Section7Content, offset: number) {
        super(contents, offset);
        this.checkSectionNumber();
    }

    unpackData(buffer: DataView, sec3: Grib2GridDefinitionSection, sec5: Grib2DataRepresentationSection) {
        const header_length = 5;
        return sec5.unpackData(buffer, this.offset + header_length, this.contents.section_length - header_length, sec3);
    }
}

const g2_section7_unpacker = unpackerFactory(g2_section7_types, Grib2DataSection);

export {g2_section0_unpacker, g2_section1_unpacker, g2_section2_unpacker, g2_section3_unpacker, g2_section4_unpacker, g2_section5_unpacker, g2_section6_unpacker, g2_section7_unpacker};
export type {Grib2IndicatorSection, Grib2IdentificationSection, Grib2LocalUseSection, Grib2GridDefinitionSection, Grib2ProductDefinitionSection,
             Grib2DataRepresentationSection, Grib2BitmapSection, Grib2DataSection}