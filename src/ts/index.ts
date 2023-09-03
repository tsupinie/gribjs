
import { unpackUTF8String } from './grib2base';
import {g2_section0_unpacker, g2_section1_unpacker, g2_section2_unpacker, g2_section3_unpacker, g2_section4_unpacker,
        g2_section5_unpacker, g2_section6_unpacker, g2_section7_unpacker} from './grib2section';

class Grib2File {

}

class Grib2Message {
    constructor() {

    }

    static async unpack(data: DataView, offset: number) {
        const sec0 = g2_section0_unpacker.unpack(data, offset);
        offset += sec0.section_length;

        const sec1 = g2_section1_unpacker.unpack(data, offset);
        offset += sec1.contents.section_length;

        let sec2 = null;
        try {
            sec2 = g2_section2_unpacker.unpack(data, offset);
            offset += sec2.contents.section_length;
        }
        catch {}

        const sec3 = g2_section3_unpacker.unpack(data, offset);
        offset += sec3.contents.section_length;

        const sec4 = g2_section4_unpacker.unpack(data, offset);
        offset += sec4.contents.section_length;

        const sec5 = g2_section5_unpacker.unpack(data, offset);
        offset += sec5.contents.section_length;

        const sec6 = g2_section6_unpacker.unpack(data, offset);
        offset += sec6.contents.section_length;

        const sec7 = g2_section7_unpacker.unpack(data, offset);
        offset += sec7.contents.section_length;

        const end_marker = unpackUTF8String(data, offset, 4);
        if (end_marker != '7777') {
            throw `Missing end marker`;
        }

        console.log("Indicator section:", sec0);
        console.log("Identification section:", sec1);
        console.log("Local use section:", sec2);
        console.log("Grid definition section:", sec3);
        console.log("Product definition section:", sec4);
        console.log("Data representation section:", sec5);
        console.log("Bitmap section:", sec6);
        console.log("Data section:", sec7);

    }
}

(async () => {
    const resp = await fetch('http://localhost:9090/MRMS_MergedReflectivityQCComposite_00.50_20230829-233640.grib2');
    const data = new DataView(await resp.arrayBuffer());
    await Grib2Message.unpack(data, 0);
})();