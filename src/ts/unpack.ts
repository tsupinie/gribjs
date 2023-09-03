
import compression_module from "../compiled/grib_compression";
import {Grib2CompressionModule} from "../compiled/grib_compression";
let compression: Grib2CompressionModule | null = null;

const return_types = {
    8: Uint8Array,
    16: Uint16Array,
    32: Uint32Array
}

async function pngDecoder(compressed: Uint8Array, bit_depth: 8, expected_size: number) : Promise<Uint8Array>;
async function pngDecoder(compressed: Uint8Array, bit_depth: 16, expected_size: number) : Promise<Uint16Array>;
async function pngDecoder(compressed: Uint8Array, bit_depth: 32, expected_size: number) : Promise<Uint32Array>;
async function pngDecoder(compressed: Uint8Array, bit_depth: 8 | 16 | 32, expected_size: number) : Promise<Uint8Array | Uint16Array | Uint32Array> {
    if (compression === null) {
        compression = await compression_module();
    }

    if (!(bit_depth in return_types)) {
        throw `bit_depth ${bit_depth} is not supported`;
    }

    const png_decoder = compression.cwrap('decode_png', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);

    const width_ = compression._malloc(4);
    const height_ = compression._malloc(4);
    const bit_depth_ = compression._malloc(4);
    const compressed_ = compression._malloc(compressed.length);
    const decompressed_ = compression._malloc(expected_size * bit_depth / 8);

    compression.setValue(bit_depth_, bit_depth, 'i32');
    compressed.forEach((v, i) => compression.setValue(compressed_ + i, v, 'i8'));

    const png_status = png_decoder(compressed_, width_, height_, decompressed_, bit_depth_, expected_size);

    let decompressed;

    if (png_status == 0) {
        decompressed = new return_types[bit_depth](expected_size);

        for (let i = 0; i < expected_size; i++) {
            let raw_grid_val = compression.getValue(decompressed_ + i * bit_depth / 8, `i${bit_depth}`);

            // Swap byte order. Maybe have the C code do this.
            if (bit_depth == 16)
                raw_grid_val = ((raw_grid_val & 0xff) << 8) | ((raw_grid_val >> 8) & 0xff); 
            else if (bit_depth == 32)
                raw_grid_val = ((raw_grid_val & 0xff) << 24) | ((raw_grid_val & 0xff00) << 8) | ((raw_grid_val >> 8) & 0xff00) | ((raw_grid_val >> 24) & 0xff);
            
            decompressed[i] = raw_grid_val;
        }
    }

    compression._free(compressed_);
    compression._free(decompressed_);
    compression._free(width_);
    compression._free(height_);
    compression._free(bit_depth_);

    if (png_status != 0) {
        throw `png decoder encountered an error: ${png_status}`;
    }

    return decompressed;
}

export {pngDecoder};