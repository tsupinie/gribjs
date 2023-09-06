
import { unpackUTF8String } from './grib2base';
import {Grib2BitmapSection, Grib2DataRepresentationSection, Grib2DataSection, Grib2GridDefinitionSection, Grib2IdentificationSection, Grib2IndicatorSection, 
        Grib2LocalUseSection, Grib2ProductDefinitionSection, g2_section0_unpacker, g2_section1_unpacker, g2_section2_unpacker, g2_section3_unpacker, g2_section4_unpacker,
        g2_section5_unpacker, g2_section6_unpacker, g2_section7_unpacker} from './grib2section';
import { addGrib2ParameterListing } from './grib2producttables';
import { DurationObjectUnits } from 'luxon';

class Grib2File {
    readonly headers: Grib2MessageHeaders[];
    readonly buffer: DataView;

    constructor(headers: Grib2MessageHeaders[], buffer: DataView) {
        this.headers = headers;
        this.buffer = buffer;
    }

    async getMessage(index: number) {
        const header = this.headers[index];
        return await header.getMessage(this.buffer);
    }

    static scan(buffer: DataView) {
        let offset = 0;
        const message_headers: Grib2MessageHeaders[] = [];

        while (offset < buffer.byteLength) {
            const header = Grib2MessageHeaders.unpack(buffer, offset);
            message_headers.push(header);
            offset += header.message_length;
        }

        return new Grib2File(message_headers, buffer);
    }

    list() {
        this.headers.forEach((header, ihdr) => {
            console.log(header.getString(ihdr));
        });
    }
}

class Grib2MessageHeaders {
    readonly offset: number;

    readonly sec0: Grib2IndicatorSection;
    readonly sec1: Grib2IdentificationSection;
    readonly sec2: Grib2LocalUseSection | null;
    readonly sec3: Grib2GridDefinitionSection;
    readonly sec4: Grib2ProductDefinitionSection;
    readonly sec5: Grib2DataRepresentationSection;
    readonly sec6: Grib2BitmapSection;
    readonly sec7: Grib2DataSection;

    constructor(offset: number, sec0: Grib2IndicatorSection, sec1: Grib2IdentificationSection, sec2: Grib2LocalUseSection | null, sec3: Grib2GridDefinitionSection,
                sec4: Grib2ProductDefinitionSection, sec5: Grib2DataRepresentationSection, sec6: Grib2BitmapSection, sec7: Grib2DataSection) {
        this.offset = offset;

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
        const message_offset = offset;

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

        return new Grib2MessageHeaders(message_offset, sec0, sec1, sec2, sec3, sec4, sec5, sec6, sec7);
    }

    async getMessage(buffer: DataView) {
        const data = await this.sec7.unpackData(buffer, this.sec7.offset + 5, this.sec5);
        return new Grib2Message(this.offset, this, data);
    }

    getString(index: number) {
        const offset = this.offset;
        const product = this.sec4.getProduct(this.sec0.contents.grib_discipline).parameterAbbrev;

        const surfaces = this.sec4.getSurface();
        let surfaces_str = "";
        if (surfaces.surface1) {
            surfaces_str += surfaces.surface1.printable;
        }
        if (surfaces.surface2) {
            surfaces_str += `-${surfaces.surface1.printable}`;
        }

        const fcst_time = this.sec4.getForecastTime();
        const fcst_time_obj = fcst_time.toObject();
        const fcst_time_unit = Object.keys(fcst_time_obj)[0] as keyof DurationObjectUnits;
        const fcst_time_str = fcst_time.toMillis() == 0 ? 'anl' : `${fcst_time_obj[fcst_time_unit]} ${fcst_time_unit.slice(0, -1)} fcst`;

        return `${index + 1}:${offset}:${product}:${surfaces_str}:${fcst_time_str}:`;
    }

    get message_length() {
        return this.sec0.contents.message_length;
    }

    getReferenceTime() {
        return this.sec1.getReferenceTime();
    }
}

class Grib2Message {
    readonly offset: number;
    readonly headers: Grib2MessageHeaders;
    readonly data: Float32Array;

    constructor(offset: number, headers: Grib2MessageHeaders, data: Float32Array) {
        this.offset = offset;
        this.headers = headers;
        this.data = data;
    }

    getReferenceTime() {
        return this.headers.getReferenceTime();
    }
}

export {Grib2Message, Grib2MessageHeaders, Grib2File, addGrib2ParameterListing};