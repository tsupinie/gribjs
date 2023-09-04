
import { unpackUTF8String } from './grib2base';
import {Grib2BitmapSection, Grib2DataRepresentationSection, Grib2DataSection, Grib2GridDefinitionSection, Grib2IdentificationSection, Grib2IndicatorSection, 
        Grib2LocalUseSection, Grib2ProductDefinitionSection, g2_section0_unpacker, g2_section1_unpacker, g2_section2_unpacker, g2_section3_unpacker, g2_section4_unpacker,
        g2_section5_unpacker, g2_section6_unpacker, g2_section7_unpacker} from './grib2section';

class Grib2File {

}

class Grib2MessageHeaders {
    readonly sec0: Grib2IndicatorSection;
    readonly sec1: Grib2IdentificationSection;
    readonly sec2: Grib2LocalUseSection | null;
    readonly sec3: Grib2GridDefinitionSection;
    readonly sec4: Grib2ProductDefinitionSection;
    readonly sec5: Grib2DataRepresentationSection;
    readonly sec6: Grib2BitmapSection;
    readonly sec7: Grib2DataSection;

    constructor(sec0: Grib2IndicatorSection, sec1: Grib2IdentificationSection, sec2: Grib2LocalUseSection | null, sec3: Grib2GridDefinitionSection,
                sec4: Grib2ProductDefinitionSection, sec5: Grib2DataRepresentationSection, sec6: Grib2BitmapSection, sec7: Grib2DataSection) {
        this.sec0 = sec0;
        this.sec1 = sec1;
        this.sec2 = sec2;
        this.sec3 = sec3;
        this.sec4 = sec4;
        this.sec5 = sec5;
        this.sec6 = sec6;
        this.sec7 = sec7;
    }

    static unpack(buffer: DataView, offset: number) {
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
        offset += sec7.contents.section_length;

        const end_marker = unpackUTF8String(buffer, offset, 4);
        if (end_marker != '7777') {
            throw `Missing end marker`;
        }

        return new Grib2MessageHeaders(sec0, sec1, sec2, sec3, sec4, sec5, sec6, sec7);
    }
}

class Grib2Message {
    readonly headers: Grib2MessageHeaders;
    readonly data: Float32Array;

    constructor(headers: Grib2MessageHeaders, data: Float32Array) {
        this.headers = headers;
        this.data = data;
    }

    static async unpack(buffer: DataView, offset: number) {
        const headers = Grib2MessageHeaders.unpack(buffer, offset);
        const data = await headers.sec7.unpackData(buffer, headers.sec7.offset + 5, headers.sec5);

        return new Grib2Message(headers, data);
    }
}

(async () => {
    const resp = await fetch('http://localhost:9090/MRMS_MergedReflectivityQCComposite_00.50_20230829-233640.grib2');
    const buffer = new DataView(await resp.arrayBuffer());
    const msg = await Grib2Message.unpack(buffer, 0);
    console.log(msg.data);
})();