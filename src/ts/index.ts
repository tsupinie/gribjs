
import { unpackUTF8String } from './grib2base';
import {Grib2BitmapSection, Grib2DataRepresentationSection, Grib2DataSection, Grib2GridDefinitionSection, Grib2IdentificationSection, Grib2IndicatorSection, 
        Grib2LocalUseSection, Grib2ProductDefinitionSection, g2_section0_unpacker, g2_section1_unpacker, g2_section2_unpacker, g2_section3_unpacker, g2_section4_unpacker,
        g2_section5_unpacker, g2_section6_unpacker, g2_section7_unpacker} from './grib2section';
import { addGrib2ParameterListing } from './grib2producttables';
import { DurationObjectUnits } from 'luxon';

/**
 * Grib2 files contain one or more grib2 messages in sequence, and each message is independent of all the others. This class keeps the headers
 * for all messages in memory and doesn't unpack the actual data until getMessage() is called.
 */
class Grib2File {
    readonly headers: Grib2MessageHeaders[];
    readonly buffer: DataView;

    constructor(headers: Grib2MessageHeaders[], buffer: DataView) {
        this.headers = headers;
        this.buffer = buffer;
    }

    /**
     * Get a grib2 message from the file by index.
     * @param index - The index of the message
     * @returns The message at the index `index`
     */
    async getMessage(index: number) {
        const header = this.headers[index];
        return await header.getMessage(this.buffer);
    }

    /**
     * Scan a data buffer for grib2 messages
     * @param buffer - The buffer to scan
     * @returns A Grib2File with all the messages
     */
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

    /**
     * @returns A string containing the header information for each message in this file
     */
    toString() {
        return this.headers.map((header, ihdr) => header.getInventoryString(ihdr)).join("\n");
    }

    /**
     * Search for messages that match a particular string or regular expression
     * @param matcher - A string or regular expression to search for. This is checked against the string output by the list command, so anything in that string can be matched.
     * @returns A Grib2File containing the messages matching the search string or regular expression
     * @example
     * // Search for 500 mb height
     * g2_file.search(':HGT:500 mb:')
     */
    search(matcher: string | RegExp) {
        const matching_headers = this.headers.filter((hdr, ihdr) => hdr.matches(ihdr, matcher));
        return new Grib2File(matching_headers, this.buffer);
    }
}

class Grib2InventoryEntry {
    readonly byte_range: [number, number | null];
    readonly inv_string: string;

    constructor(byte_range: [number, number | null], inv_string: string) {
        this.byte_range = byte_range;
        this.inv_string = inv_string;
    }

    matches(matcher: string | RegExp) {
        return this.inv_string.match(matcher) !== null;
    }

    static parseByteOffset(inv_string: string) {
        return parseInt(inv_string.split(':')[1]);
    }
}

/**
 * An inventory is a listing of the messages in the file.
 */
class Grib2Inventory {
    readonly entries: Grib2InventoryEntry[];

    constructor(entries: Grib2InventoryEntry[]) {
        this.entries = entries;
    }

    /**
     * Search for messages in the inventory that match a particular string or regular expresssion
     * @param matcher - A string or regular expression to search for. This is checked against the string in the inventory.
     * @returns A Grib2Inventory containing the subset
     * @example
     * // Search for all the 500 mb fields in this dataset
     * let inv_500mb = g2_inv.search(':500 mb:');
     * // inv_500mb contains 500 mb heights, winds, temperatures, etc. Now, just pull out height:
     * let z500_inv = inv_500mb.search(':HGT:');
     * // z500_inv now contains 500 mb height. Do both of the above in one step:
     * inv_500mb = g2_inv.search(':HGT:500 mb:');
     */
    search(matcher: string | RegExp) {
        return new Grib2Inventory(this.entries.filter(entr => entr.matches(matcher)));
    }

    /**
     * Download a grib2 file containing the messages in this inventory. This function only downloads the sections of the full file that are referred to in this inventory object.
     * @param url - The url to download data from
     * @returns A Grib2File containing all the messages
     * @example
     * // Subset the full inventory (500 mb height)
     * const z500_inv = g2_inv.search(':HGT:500 mb:');
     * 
     * // Download only the 500 mb height message from the remote grib file
     * z500_inv.downloadData('https://example.com/path/to/data.grib2');
     */
    async downloadData(url: string) {
        const byte_ranges = this.entries.map(entr => entr.byte_range);
        const byte_ranges_merged: [number, number][] = [];
        let cur_range: [number, number] | null = null;

        // Merge adjacent byte ranges
        for (let i = 0; i < byte_ranges.length; i++) {
            if (cur_range === null) {
                cur_range = [...byte_ranges[i]] as [number, number];
            }
            else {
                if (cur_range[1] == byte_ranges[i][0]) {
                    cur_range[1] = byte_ranges[i][1];
                }
                else {
                    byte_ranges_merged.push(cur_range);
                    cur_range = byte_ranges[i];
                }
            }

            if (i == byte_ranges.length - 1 && cur_range !== null) {
                byte_ranges_merged.push(cur_range);
            }
        }

        // Fetch the data
        const promises = byte_ranges_merged.map(entr => {
            const range_header = `${entr[0]}-${entr[1] === null ? '' : entr[1] - 1}`;
            return fetch(url, {headers: {range: `bytes=${range_header}`}});
        })

        // Unpack and stick it all in a single array buffer
        return Promise.all(promises).then(resps => {
            const promises = resps.map(async resp => await resp.arrayBuffer());
            return Promise.all(promises);
        }).then(buffers => {
            let concat_buf: ArrayBuffer;
            if (buffers.length > 1) {
                const total_length = buffers.map(buf => buf.byteLength).reduce((a, b) => a + b);
                const concat = new Uint8Array(total_length);
                let offset = 0;
                buffers.forEach(buf => {
                    concat.set(new Uint8Array(buf), offset);
                    offset += buf.byteLength;
                });

                concat_buf = concat.buffer;
            }
            else {
                concat_buf = buffers[0];
            }

            const dv = new DataView(concat_buf);
            return Grib2File.scan(dv);
        });
    }

    /**
     * Parse a grib2 inventory from a string. The inventory contains one message per line and has the message index, start byte, reference time, vertical level, and ensemble
     * information separated by colons.
     * @param inv_string - The string to parse
     * @returns A Grib2Inventory
     */
    static parse(inv_string: string) {
        const inv_strings = inv_string.replace(/^\s+|\s+$/g, '').split("\n");
        const inv_byte_offsets = inv_strings.map(Grib2InventoryEntry.parseByteOffset);

        const inv_entries: Grib2InventoryEntry[] = [];
        for (let i = 0; i < inv_strings.length; i++) {
            const byte_lower = inv_byte_offsets[i];
            const byte_upper = i < inv_strings.length - 1 ? inv_byte_offsets[i + 1] : null;

            inv_entries.push(new Grib2InventoryEntry([byte_lower, byte_upper], inv_strings[i]));
        }

        return new Grib2Inventory(inv_entries);
    }

    /**
     * Fetch and parse an inventory from a remote data source.
     * @param url - The url to fetch the inventory from
     * @returns A Grib2Inventory
     */
    static async fromRemote(url: string) {
        const file = await fetch(url);
        return Grib2Inventory.parse(await file.text());
    }

    /**
     * @returns A string containing the header information for each message in the inventory
     */
    toString() {
        return this.entries.map(entr => entr.inv_string).join("\n");
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
        const data = await this.sec7.unpackData(buffer, this.sec7.offset + 5, this.sec3, this.sec5);
        return new Grib2Message(this.offset, this, data);
    }

    getInventoryString(index: number) {
        const offset = this.offset;
        const product = this.sec4.getProduct(this.sec0.contents.grib_discipline).parameterAbbrev;

        const surfaces = this.sec4.getSurface();
        let surfaces_str = "";
        if (surfaces.surface1) {
            surfaces_str += surfaces.surface1.printable;
        }
        if (surfaces.surface2) {
            // TAS: This is dumb
            const surface1_val = surfaces.surface1.surfaceUnits == 'Pa' ? surfaces.surface1.value / 100 : surfaces.surface1.value;
            surfaces_str = `${surface1_val}-${surfaces.surface2.printable}`;
        }

        const ref_time_str = this.getReferenceTime().toFormat('yyyyMMddHH');
        const fcst_agg = this.sec4.getTimeAgg();

        const fcst_time = this.sec4.getForecastTime();
        const fcst_time_obj = fcst_time.toObject();
        const fcst_time_unit = Object.keys(fcst_time_obj)[0] as keyof DurationObjectUnits;

        let fcst_time_str;
        if (fcst_agg) {
            const fcst_intv_start = fcst_time.minus(fcst_agg.agg_dur);
            const fcst_intv_start_obj = fcst_intv_start.shiftTo(fcst_time_unit).toObject();
            fcst_time_str = `${fcst_intv_start_obj[fcst_time_unit]}-${fcst_time_obj[fcst_time_unit]} ${fcst_time_unit.slice(0, -1)} ${fcst_agg.agg_type} fcst`;
        }
        else {
            fcst_time_str = fcst_time.toMillis() == 0 ? 'anl' : `${fcst_time_obj[fcst_time_unit]} ${fcst_time_unit.slice(0, -1)} fcst`;
        }

        const ensemble = this.sec4.getEnsemble();

        let ens_str = "";
        if (ensemble !== null) {
            let pert_str = "";
            if (ensemble.member_type == 'negative pert' || ensemble.member_type == 'positive pert') {
                const type_str = {'negative pert': '-', 'positive pert': '+'}[ensemble.member_type];
                pert_str = `${type_str}${ensemble.perturbation_number}`;
            }
            else {
                pert_str = ensemble.member_type;
            }
            ens_str = `ENS=${pert_str}`;
        }

        return `${index + 1}:${offset}:d=${ref_time_str}:${product}:${surfaces_str}:${fcst_time_str}:${ens_str}`;
    }

    get message_length() {
        return this.sec0.contents.message_length;
    }

    matches(index: number, matcher: string | RegExp) {
        return this.getInventoryString(index).match(matcher) !== null;
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

    /**
     * Get the reference time for the message. This is usually the forecast initialization time or analysis valid time, but depends on how the file was encoded.
     * @returns reference time as a luxon DateTime object
     */
    getReferenceTime() {
        return this.headers.getReferenceTime();
    }
}

export {Grib2Message, Grib2MessageHeaders, Grib2File, Grib2Inventory, addGrib2ParameterListing};