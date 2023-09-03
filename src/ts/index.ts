
import { unpackUTF8String } from './grib2base';
import {g2_section0_unpacker, g2_section1_unpacker, g2_section2_unpacker, g2_section3_unpacker, g2_section4_unpacker,
        g2_section5_unpacker, g2_section6_unpacker, g2_section7_unpacker} from './grib2section';

class Grib2File {

}

class Grib2Message {
    constructor() {

    }

    static async unpack(buffer: DataView, offset: number) {
        const sec0 = g2_section0_unpacker.unpack(buffer, offset);
        offset += sec0.section_length;

        const sec1 = g2_section1_unpacker.unpack(buffer, offset);
        offset += sec1.contents.section_length;

        let sec2 = null;
        try {
            sec2 = g2_section2_unpacker.unpack(buffer, offset);
            offset += sec2.contents.section_length;
        }
        catch {}

        const sec3 = g2_section3_unpacker.unpack(buffer, offset);
        offset += sec3.contents.section_length;

        const sec4 = g2_section4_unpacker.unpack(buffer, offset);
        offset += sec4.contents.section_length;

        const sec5 = g2_section5_unpacker.unpack(buffer, offset);
        offset += sec5.contents.section_length;

        const sec6 = g2_section6_unpacker.unpack(buffer, offset);
        offset += sec6.contents.section_length;

        const sec7 = g2_section7_unpacker.unpack(buffer, offset);
        const data = await sec7.unpackData(buffer, offset + 5, sec5);

        offset += sec7.contents.section_length;

        const end_marker = unpackUTF8String(buffer, offset, 4);
        if (end_marker != '7777') {
            throw `Missing end marker`;
        }

        console.log("Decoded Grib2 File");
        console.log("Headers:");
        console.log(sec0);
        console.log(sec1);
        console.log(sec2);
        console.log(sec3);
        console.log(sec4);
        console.log(sec5);
        console.log(sec6);
        console.log(sec7);
        console.log("Data Min/max:", data.reduce((a, b) => Math.min(a, b)), data.reduce((a, b) => Math.max(a, b)));
    }
}

(async () => {
    const resp = await fetch('http://localhost:9090/MRMS_MergedReflectivityQCComposite_00.50_20230829-233640.grib2');
    const buffer = new DataView(await resp.arrayBuffer());
    await Grib2Message.unpack(buffer, 0);
})();