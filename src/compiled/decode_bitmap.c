
#include <math.h>

typedef unsigned long int size_t;

int apply_bitmap(const char* input_bitmap, const float* input_data, float* output, const size_t output_size) {
    size_t i_input = 0;
    for (size_t i = 0; i < output_size; i++) {
        size_t i_byte = i / 8;
        char bit = i % 8;

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