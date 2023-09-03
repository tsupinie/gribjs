
//const { pngDecoder } = require('./unpack');
import {g2_section0_unpacker, g2_section1_unpacker, g2_section2_unpacker, g2_section3_unpacker} from './grib2section';

class Grib2File {

}

class Grib2Message {
    constructor() {

    }

    static async unpack(data: DataView, offset: number) {
        const sec0 = g2_section0_unpacker.unpack(data, offset);
        offset += sec0.section_length;

        const sec1 = g2_section1_unpacker.unpack(data, offset);
        offset += sec1.contents.get('section_length');

        let sec2 = null;
        try {
            sec2 = g2_section2_unpacker.unpack(data, offset);
            offset += sec2.contents.get('section_length');
        }
        catch {}

        const sec3 = g2_section3_unpacker.unpack(data, offset);
        offset += sec3.contents.get('section_length');

        console.log(sec0, sec1, sec2, sec3);

        /*
        
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