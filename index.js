
const fs = require('fs');
const { pngDecoder } = require('./unpack');

const INDICATOR_SECTION = [
    ['header_marker', 's4'],
    [null, 'ui2'],
    ['grib_discipline', 'ui1'],
    ['grib_edition', 'ui1'],
    ['message_length', 'ui8'],
];

const IDENTIFICATION_SECTION = [
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

function unpackStruct(buf, struct, offset) {
    offset = offset === undefined ? 0 : offset;

    const data_types = {
        'ui1': () => {  
            const val = buf.readUInt8(offset);
            offset += 1;
            return val;
        },
        'ui2': () => {
            const val = buf.readUInt16BE(offset);
            offset += 2;
            return val;
        },
        'ui4': () => { 
            const val = buf.readUInt32BE(offset);
            offset += 4;
            return val;
        },
        'ui8': () => {
            const val = buf.readBigUInt64BE(offset);
            offset += 8;
            return val;
        },
        'f4': () => {
            const val = buf.readFloatBE(offset);
            offset += 4;
            return val;
        },
        's': (len) => {
            const val = buf.slice(offset, offset + len).toString();
            offset += len;
            return val;
        }
    }

    return Object.fromEntries(struct.map(([name, dtype]) => {
        let val;
        if (dtype.startsWith('s')) {
            const len = parseInt(dtype.slice(1));
            val = data_types['s'](len);
        }
        else {
            val = data_types[dtype]();
        }

        return [name, val];
    }).filter(([name, val]) => name !== null));
}

class Grib2File {

}

class Grib2Message {
    constructor() {

    }

    static async unpack(data) {
        /*
            Section 0
        */
        let offset = 0;
        const ind_struct = unpackStruct(data, INDICATOR_SECTION, offset);

        if (ind_struct['header_marker'] != 'GRIB')
            throw "'GRIB' header not found";

        if (ind_struct['grib_edition'] != 2)
            throw 'Only grib2 files are supported';

        offset += 16;

        /*
            Section 1
        */
        const id_struct = unpackStruct(data, IDENTIFICATION_SECTION, offset);

        if (id_struct['section_number'] != 1)
            throw "Expected section 1, but didn't find it";

        offset += id_struct['section_length'];

        /*
            Section 2
        */
        const lu_struct = unpackStruct(data, LOCAL_USE_SECTION, offset);

        if (lu_struct['section_number'] == 2) 
            offset += lu_struct['section_length'];

        /*
            Section 3
        */
        const gd_struct = unpackStruct(data, GRID_DEFINITION_SECTION, offset);

        if (gd_struct['section_number'] != 3)
            throw "Expected section 3, but didn't find it";

        if (!(gd_struct['grid_definition_template_number'] in GRID_DEFINITION_TEMPLATES))
            throw `Grid definition template ${gd_struct['grid_definition_template_number']} unknown`;

        const gd_template = unpackStruct(data, GRID_DEFINITION_TEMPLATES[gd_struct['grid_definition_template_number']], offset + 14);

        offset += gd_struct['section_length'];

        /*
            Section 4
        */

        const pd_struct = unpackStruct(data, PRODUCT_DEFINITION_SECTION, offset);

        if (pd_struct['section_number'] != 4)
            throw "Expected section 4, but didn't find it";

        if (!(pd_struct['product_definition_template_number'] in PRODUCT_DEFINITION_TEMPLATES))
            throw `Product definition template ${pd_struct['product_definition_template_number']} unknown`;

        const pd_template = unpackStruct(data, PRODUCT_DEFINITION_TEMPLATES[pd_struct['product_definition_template_number']], offset + 9);

        offset += pd_struct['section_length'];

        /*
            Section 5
        */

        const dr_struct = unpackStruct(data, DATA_REPRESENTATION_SECTION, offset);

        if (dr_struct['section_number'] != 5)
            throw "Expected section 5, but didn't find it";

        if (!(dr_struct['data_representation_template_number'] in DATA_REPRESENTATION_TEMPLATES))
            throw `Data representation template ${dr_struct['data_representation_template_number']} unknown`;

        const dr_template = unpackStruct(data, DATA_REPRESENTATION_TEMPLATES[dr_struct['data_representation_template_number']], offset + 11);
        dr_template['reference_value'] = new Float32Array(new Uint32Array([dr_template['reference_value']]).buffer)[0];

        offset += dr_struct['section_length'];

        /*
            Section 6
        */

        const bm_struct = unpackStruct(data, BITMAP_SECTION, offset);

        if (bm_struct['section_number'] != 6)
            throw "Expected section 6, but didn't find it";

        offset += bm_struct['section_length'];

        /*
            Section 7
        */

        const data_struct = unpackStruct(data, DATA_SECTION, offset);

        if (data_struct['section_number'] != 7)
            throw "Expected section 7, but didn't find it";

        const decimal_scale_factor = Math.pow(10, dr_template['decimal_scale_factor']);
        const binary_scale_factor = Math.pow(2, dr_template['binary_scale_factor']);

        let raw_buf = data.slice(offset, offset + data_struct['section_length']).slice(5);

        const decompressed = await pngDecoder(raw_buf, dr_template['bit_depth'], dr_struct['number_of_data_points']);

        const grid = new Float32Array(dr_struct['number_of_data_points']);
        decompressed.forEach((val, i) => grid[i] = (dr_template['reference_value'] + val * binary_scale_factor) / decimal_scale_factor);

        console.log(grid.reduce((a, b) => Math.max(a, b)));

        offset += data_struct['section_length'];

        const end_marker = data.slice(offset, offset + 4).toString();
        if (end_marker != '7777')
            throw 'Missing GRIB end marker';
    }
}

(async () => {
    const data = fs.readFileSync('/Users/tsupinie/data/mrms/MRMS_MergedReflectivityQCComposite_00.50_20230829-233640.grib2');
    await Grib2Message.unpack(data);
})();