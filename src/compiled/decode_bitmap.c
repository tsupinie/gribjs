
#include <math.h>

typedef unsigned long int size_t;

int apply_bitmap(const char* input_bitmap, const float* input_data, float* output, const size_t output_size) {
    // Missing data are represented as a bitmap in GRIB, with a 0 meaning missing data. This function reconstructs the field with missing values, using NaN as the missing value.
    // input_bitmap is the bitmap
    // input_data is the data values from the decompressor
    // output_size is the expected final grid size from section 3 of the grib2 headers.

    size_t i_input = 0;
    for (size_t i = 0; i < output_size; i++) {
        size_t i_byte = i / __CHAR_BIT__;
        char bit = i % __CHAR_BIT__;

        if ((input_bitmap[i_byte] >> bit) & 1) {
            output[i] = input_data[i_input];
            i_input++;
        }
        else {
            output[i] = NAN;
        }
    }

    return 0;
}