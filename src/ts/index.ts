
//const { pngDecoder } = require('./unpack');

const LOCAL_USE_SECTION = [
    ['section_length', 'ui4'],
    ['section_number', 'ui1'],
];

const GRID_DEFINITION_SECTION = [
    ['section_length', 'ui4'],
    ['section_number', 'ui1'],
    ['grid_definition_source', 'ui1'],
    ['grid_size', 'ui4'],
    ['optional_point_list_length', 'ui1'],
    ['optional_point_list_interpretation', 'ui1'],
    ['grid_definition_template_number', 'ui2'],
];

const GRID_DEFINITION_TEMPLATES = {
    0: [
        ['earth_shape', 'ui1'],
        ['spherical_earth_radius_scale_factor', 'ui1'],
        ['spherical_earth_radius_value', 'ui4'],
        ['oblate_earth_semimajor_axis_scale_factor', 'ui1'],
        ['oblate_earth_semimajor_axis_value', 'ui4'],
        ['oblate_earth_semiminor_axis_scale_factor', 'ui1'],
        ['oblate_earth_semiminor_axis_value', 'ui4'],
        ['ngrid_i', 'ui4'],
        ['ngrid_j', 'ui4'],
        ['basic_angle', 'ui4'],
        ['subdivisions_to_basic_angle', 'ui4'],
        ['lat_first', 'ui4'],
        ['lon_first', 'ui4'],
        ['resolution_component_flags', 'ui1'],
        ['lat_last', 'ui4'],
        ['lon_last', 'ui4'],
        ['i_direction_increment', 'ui4'],
        ['j_direction_increment', 'ui4'],
        ['scanning_mode_flags', 'ui4'],
    ]
}

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

type Grib2InternalType = 'ui1' | 'ui2' | 'ui4' | 'ui8';
type Grib2ContentSpec<T> = [keyof T, Grib2InternalType][];
type Grib2Content<T> = Record<keyof T, number>;

function unpackStruct<T>(buf: DataView, struct: Grib2ContentSpec<T>, offset: number): Grib2Content<T> {
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

    return Object.fromEntries(struct.map(([name, dtype]) => {
        let val = data_types[dtype]();

        return [name, val];
    })) as Grib2Content<T>;
}

function unpackUTF8String(buf: DataView, offset: number, length: number) {
    return String.fromCharCode.apply(null, new Uint8Array(buf.buffer.slice(offset, offset + length)));
}

class Grib2Section {
    section_length: number;
    section_number: number;

    constructor(contents: Grib2Content<Grib2Section>, expected_section_number: number) {
        if (contents.section_number != expected_section_number) {
            throw `Expected section ${expected_section_number}, but got ${contents.section_number} instead`;
        }

        this.section_length = contents.section_length;
        this.section_number = contents.section_number;
    }
}

class Grib2Section0 extends Grib2Section {
    grib_discipline: number;
    grib_edition: number;
    message_length: number;

    static content_spec: Grib2ContentSpec<Grib2Section0> = [
        ['grib_discipline', 'ui1'],
        ['grib_edition', 'ui1'],
        ['message_length', 'ui8'],
    ];

    constructor(contents: Grib2Content<Grib2Section0>) {
        super({section_length: 16, section_number: 0}, 0);

        if (contents.grib_edition != 2) {
            throw 'Only grib2 files are supported';
        }

        Grib2Section0.content_spec.slice(2).forEach(([key, dtype]) => {
            this[key] = contents[key];
        });
    }

    static unpack(buffer: DataView, offset: number) {
        const marker = unpackUTF8String(buffer, offset, 4);

        if (marker != 'GRIB') {
            throw `Missing header marker`;
        }

        return new Grib2Section0(unpackStruct(buffer, Grib2Section0.content_spec, offset + 6));
    }
}

class Grib2Section1 extends Grib2Section {
    originating_center_id: number;
    originating_subcenter_id: number;
    grib_master_table_version: number;
    grib_local_table_version: number;
    reference_time_singificance: number;
    reference_year: number;
    reference_month: number;
    reference_day: number;
    reference_hour: number;
    reference_minute: number;
    reference_second: number;
    production_status: number;
    processed_data_type: number;

    static content_spec: Grib2ContentSpec<Grib2Section1> = [
        ['section_length', 'ui4'],
        ['section_number', 'ui1'],
        ['originating_center_id', 'ui2'],
        ['originating_subcenter_id', 'ui2'],
        ['grib_master_table_version', 'ui1'],
        ['grib_local_table_version', 'ui1'],
        ['reference_time_singificance', 'ui1'],
        ['reference_year', 'ui2'],
        ['reference_month', 'ui1'],
        ['reference_day', 'ui1'],
        ['reference_hour', 'ui1'],
        ['reference_minute', 'ui1'],
        ['reference_second', 'ui1'],
        ['production_status', 'ui1'],
        ['processed_data_type', 'ui1'],
    ];

    constructor(contents: Grib2Content<Grib2Section1>) {
        super(contents, 1);

        Grib2Section1.content_spec.slice(2).forEach(([key, dtype]) => {
            this[key] = contents[key];
        });
    }

    static unpack(buffer: DataView, offset: number) {
        return new Grib2Section1(unpackStruct(buffer, Grib2Section1.content_spec, offset));
    }
}

class Grib2File {

}

class Grib2Message {
    constructor() {

    }

    static async unpack(data: DataView, offset: number) {

        const sec0 = Grib2Section0.unpack(data, offset);
        offset += sec0.section_length;

        const sec1 = Grib2Section1.unpack(data, offset);
        offset += sec1.section_length;

        console.log(sec0, sec1);

        /*
        // Section 2
        
        const lu_struct = unpackStruct(data, LOCAL_USE_SECTION, offset);

        if (lu_struct['section_number'] == 2) 
            offset += lu_struct['section_length'];


        // Section 3

        const gd_struct = unpackStruct(data, GRID_DEFINITION_SECTION, offset);

        if (gd_struct['section_number'] != 3)
            throw "Expected section 3, but didn't find it";

        if (!(gd_struct['grid_definition_template_number'] in GRID_DEFINITION_TEMPLATES))
            throw `Grid definition template ${gd_struct['grid_definition_template_number']} unknown`;

        const gd_template = unpackStruct(data, GRID_DEFINITION_TEMPLATES[gd_struct['grid_definition_template_number']], offset + 14);

        offset += gd_struct['section_length'];

        
        // Section 4

        const pd_struct = unpackStruct(data, PRODUCT_DEFINITION_SECTION, offset);

        if (pd_struct['section_number'] != 4)
            throw "Expected section 4, but didn't find it";

        if (!(pd_struct['product_definition_template_number'] in PRODUCT_DEFINITION_TEMPLATES))
            throw `Product definition template ${pd_struct['product_definition_template_number']} unknown`;

        const pd_template = unpackStruct(data, PRODUCT_DEFINITION_TEMPLATES[pd_struct['product_definition_template_number']], offset + 9);

        offset += pd_struct['section_length'];

        // Section 5

        const dr_struct = unpackStruct(data, DATA_REPRESENTATION_SECTION, offset);

        if (dr_struct['section_number'] != 5)
            throw "Expected section 5, but didn't find it";

        if (!(dr_struct['data_representation_template_number'] in DATA_REPRESENTATION_TEMPLATES))
            throw `Data representation template ${dr_struct['data_representation_template_number']} unknown`;

        const dr_template = unpackStruct(data, DATA_REPRESENTATION_TEMPLATES[dr_struct['data_representation_template_number']], offset + 11);
        dr_template['reference_value'] = new Float32Array(new Uint32Array([dr_template['reference_value']]).buffer)[0];

        offset += dr_struct['section_length'];

        // Section 6

        const bm_struct = unpackStruct(data, BITMAP_SECTION, offset);

        if (bm_struct['section_number'] != 6)
            throw "Expected section 6, but didn't find it";

        offset += bm_struct['section_length'];

        // Section 7

        const data_struct = unpackStruct(data, DATA_SECTION, offset);

        if (data_struct['section_number'] != 7)
            throw "Expected section 7, but didn't find it";

        const decimal_scale_factor = Math.pow(10, dr_template['decimal_scale_factor']);
        const binary_scale_factor = Math.pow(2, dr_template['binary_scale_factor']);

        let raw_buf = data.slice(offset, offset + data_struct['section_length']).slice(5);

        const decompressed = await pngDecoder(raw_buf, dr_template['bit_depth'], dr_struct['number_of_data_points']);

        const grid = new Float32Array(dr_struct['number_of_data_points']);
        decompressed.forEach((val, i) => grid[i] = (dr_template['reference_value'] + val * binary_scale_factor) / decimal_scale_factor);

        offset += data_struct['section_length'];

        const end_marker = data.slice(offset, offset + 4).toString();
        if (end_marker != '7777')
            throw 'Missing GRIB end marker';
        */
    }
}

(async () => {
    const resp = await fetch('http://localhost:9090/MRMS_MergedReflectivityQCComposite_00.50_20230829-233640.grib2');
    const data = new DataView(await resp.arrayBuffer());
    await Grib2Message.unpack(data, 0);
})();