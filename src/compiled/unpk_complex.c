#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

#include "bitstream.h"
#include "extract_bytes.h"

#ifdef USE_OPENMP
#include <omp.h>
#else
#define omp_get_num_threads()           1
#define omp_get_thread_num()		0
#endif

// 2009 public domain wesley ebisuzaki
//
// note: assumption that the grib file will use 25 bits or less for storing data
//       (limit of bitstream unpacking routines)
// note: assumption that all data can be stored as integers and have a value < INT_MAX

int unpk_complex(unsigned int npnts, unsigned char nbits, unsigned int ngroups,
    unsigned char group_split_method, unsigned char missing_val_method, unsigned char ref_group_width, unsigned char nbit_group_width,
    unsigned int ref_group_length, unsigned char group_length_factor, unsigned char len_last,
    unsigned char nbits_group_len, unsigned int sec7_size, unsigned char *data_in, int *data_out) {

    unsigned int i, ii, j, n_bytes, n_bits;
    int k;
    int offset;
    unsigned int clocation;
    int *group_refs, *group_widths, *group_lengths, *group_offset;
    unsigned int *group_clocation, *group_location;
    unsigned char *data_ptr;

    int m1, m2;
    int bitmap_flag;
    int nthreads, thread_id;
    unsigned int di;
    int bitstream_stat;

    data_ptr = data_in;
    nbits = nbits;

    // allocate group widths and group lengths
    group_refs = (int *) malloc(sizeof (unsigned int) * (size_t) ngroups);
    group_widths = (int *) malloc(sizeof (unsigned int) * (size_t) ngroups);
    group_lengths = (int *) malloc(sizeof (unsigned int) * (size_t) ngroups);
    group_location = (unsigned int *) malloc(sizeof (unsigned int) * (size_t) ngroups);
    group_clocation = (unsigned int *) malloc(sizeof (unsigned int) * (size_t) ngroups);
    group_offset = (int *) malloc(sizeof (unsigned int) * (size_t) ngroups);

    if (group_refs == NULL || group_widths == NULL || group_lengths == NULL || 
	    group_location == NULL || group_clocation == NULL || group_offset == NULL) { 
            printf("unpk_complex: memory allocation");
            return -1;
    }

    // do a check for number of grid points and size
    clocation = offset = n_bytes = n_bits = j = 0;

#pragma omp parallel private (i, ii, k, di, thread_id, nthreads)
    {
        nthreads = omp_get_num_threads();
        thread_id = omp_get_thread_num();

        // want to split work into nthreads, 
        // want di * nthreads >= ngroups
        // want dt % 8 == 0  so that the offset doesn't change
        //    having offset == 0 is fastest

        di = (ngroups + nthreads - 1) / nthreads;
        di = ((di + 7) | 7) ^ 7;

        i = thread_id * di;
        if (i < ngroups) {
            k  = ngroups - i;
            if (k > di) k = di;

            // read the group reference values
            bitstream_stat = rd_bitstream(data_ptr + (i/8)*nbits, 0, group_refs+i, nbits, k);
            if (bitstream_stat != 0) return -2;

            // read the group widths
            bitstream_stat = rd_bitstream(data_ptr+(nbits*ngroups+7)/8+(i/8)*nbit_group_width, 0,
                                          group_widths+i,nbit_group_width,k);
            if (bitstream_stat != 0) return -2;

            for (ii = 0; ii < k; ii++) group_widths[i+ii] += ref_group_width;
        }

#pragma omp barrier

        if (group_split_method == 1) {

            // for(i = 0; i < ngroups-1; i++) 

            // di * nthreads > (ngroups-1)
            di = (ngroups - 1 + nthreads - 1) / nthreads;
            // di * nthreads is now a multiple of 8
            di = ((di + 7) | 7) ^ 7;
            i = thread_id * di;
            if (i < ngroups - 1) {
                k  = ngroups - 1 - i;
                if (k > di) k = di;
                bitstream_stat = rd_bitstream(data_ptr+(nbits*ngroups+7)/8+(ngroups*nbit_group_width+7)/8 + 
                                              (i/8)*nbits_group_len, 0,group_lengths + i, nbits_group_len, k);
                if (bitstream_stat != 0) return -2;

                for (ii = 0; ii < k; ii++) group_lengths[i+ii] = 
                    group_lengths[i+ii] * group_length_factor + ref_group_length;
            }

#pragma omp single
            group_lengths[ngroups-1] = len_last;
        }

#pragma omp single
        {
            data_ptr += (nbits*ngroups + 7)/8 +
                (ngroups * nbit_group_width + 7) / 8 +
                (ngroups * nbits_group_len + 7) / 8;
        }

#pragma omp sections
        {

#pragma omp section
            {
            unsigned int i;
                for (i = 0; i < ngroups; i++) {
                    group_location[i] = j;
                    j += group_lengths[i];
                }
            }

#pragma omp section
            {
            unsigned int i;
                for (i = 0; i < ngroups; i++) {
                    n_bytes += (group_lengths[i] / 8) * (group_widths[i]);
                    n_bits += (group_lengths[i] % 8) * (group_widths[i]);
                    n_bytes += n_bits / 8;
                    n_bits = n_bits % 8;
                }
            }

#pragma omp section
            {
                unsigned int i;
                for (i = 0; i < ngroups; i++) {
                    group_clocation[i] = clocation;
                    clocation += group_lengths[i]*(group_widths[i]/8) +
                        (group_lengths[i]/8)*(group_widths[i] % 8);
                }
            }

#pragma omp section
            {
                unsigned int i;
                for (i = 0; i < ngroups; i++) {
                    group_offset[i] = offset;
                    offset += (group_lengths[i] % 8)*(group_widths[i] % 8);
                }
            }
        }
    }

    if (j != npnts) {
        printf("bad complex packing: n points %u\n", j);
        return -2;
    }
    n_bytes += (n_bits+7)/8;

    if (data_ptr + n_bytes - data_in != sec7_size) {
        printf("complex unpacking size mismatch old test\n");
        return -3;
    }

    if (data_ptr + clocation + (offset + 7)/8 - data_in != sec7_size) {
        printf("complex unpacking size mismatch\n");
        return -4;
    }

#pragma omp parallel for private(i) schedule(static)
    for (i = 0; i < ngroups; i++) {
        group_clocation[i] += (group_offset[i] / 8);
        group_offset[i] = (group_offset[i] % 8);

        bitstream_stat = rd_bitstream(data_ptr + group_clocation[i], group_offset[i], data_out+group_location[i], 
                                      group_widths[i], group_lengths[i]);
        if (bitstream_stat != 0) return -2;
    }

    // handle substitute, missing values and reference value
    if (missing_val_method == 0) {
#pragma omp parallel for private(i,k,j)
        for (i = 0; i < ngroups; i++) {
            j = group_location[i];
            for (k = 0; k < group_lengths[i]; k++) {
                data_out[j++] += group_refs[i];
            }
        }
    }
    else if (missing_val_method == 1) {

#pragma omp parallel for private(i,m1,k,j)
        for (i = 0; i < ngroups; i++) {
            j = group_location[i];
            if (group_widths[i] == 0) {
                m1 = (1 << nbits) - 1;
                if (m1 == group_refs[i]) {
                    for (k = 0; k < group_lengths[i]; k++) data_out[j++] = INT_MAX;
                }
                else {
                    for (k = 0; k < group_lengths[i]; k++) data_out[j++] += group_refs[i];
                }
            }
            else {
                m1 = (1 << group_widths[i]) - 1;
                for (k = 0; k < group_lengths[i]; k++) {
                    if (data_out[j] == m1) data_out[j] = INT_MAX;
                    else data_out[j] += group_refs[i];
                    j++;
                }
            }
        }
    }
    else if (missing_val_method == 2) {
#pragma omp parallel for private(i,j,k,m1,m2)
        for (i = 0; i < ngroups; i++) {
            j = group_location[i];
            if (group_widths[i] == 0) {
                m1 = (1 << nbits) - 1;
                m2 = m1 - 1;
                if (m1 == group_refs[i] || m2 == group_refs[i]) {
                    for (k = 0; k < group_lengths[i]; k++) data_out[j++] = INT_MAX;
                }
                else {
                    for (k = 0; k < group_lengths[i]; k++) data_out[j++] += group_refs[i];
                }
            }
            else {
                m1 = (1 << group_widths[i]) - 1;
                m2 = m1 - 1;
                for (k = 0; k < group_lengths[i]; k++) {
                    if (data_out[j] == m1 || data_out[j] == m2) data_out[j] = INT_MAX;
                    else data_out[j] += group_refs[i];
                    j++;
                }
            }
        }
    }

	free(group_refs);
	free(group_widths);
	free(group_lengths);
	free(group_location);
	free(group_clocation);
	free(group_offset);

    return 0;
}

int unpk_sd_complex(unsigned int npnts, unsigned char nbits, unsigned int n_groups,
    unsigned char group_split_method, unsigned char missing_val_method, unsigned char ref_group_width, unsigned char nbit_group_width,
    unsigned int ref_group_length, unsigned char group_length_factor, unsigned char len_last,
    unsigned char nbits_group_len, unsigned int sec7_size, unsigned char sd_order, unsigned char extra_octets, unsigned char *data_in, int *data_out) {

    unsigned int i;
    int last, penultimate, min_val, extra_vals[2];
    int unpk_complex_ret;
    unsigned char *data_ptr;

    data_ptr = data_in;
    extra_vals[0] = extra_vals[1] = 0;

    min_val = 0;
    if (extra_octets) {
        extra_vals[0] = uint_n(data_ptr, extra_octets);
        data_ptr += extra_octets;
        if (sd_order == 2) {
            extra_vals[1] = uint_n(data_ptr, extra_octets);
            data_ptr += extra_octets;
        }
        min_val = int_n(data_ptr, extra_octets);
        data_ptr += extra_octets;
    }

    unpk_complex_ret = unpk_complex(npnts, nbits, n_groups, group_split_method, missing_val_method, ref_group_width, nbit_group_width,
        ref_group_length, group_length_factor, len_last, nbits_group_len, sec7_size - (data_ptr - data_in), data_ptr, data_out);

    if (unpk_complex_ret != 0) {
        return unpk_complex_ret;
    }

    if (sd_order == 1) {
        last = extra_vals[0];
        i = 0;
        while (i < npnts) {
            if (data_out[i] == INT_MAX) i++;
            else {
                data_out[i++] = extra_vals[0];
                break;
            }
        }
        for (; i < npnts; i++) {
            if (data_out[i] != INT_MAX) {
                data_out[i] += last + min_val;
                last = data_out[i];
            }
        }
    }
    else if (sd_order == 2) {
        penultimate = extra_vals[0];
        last = extra_vals[1];

        i = 0;
        while (i < npnts) {
            if (data_out[i] == INT_MAX) i++;
            else {
                data_out[i++] = extra_vals[0];
                break;
            }
        }
        while (i < npnts) {
            if (data_out[i] == INT_MAX) i++;
            else {
                data_out[i++] = extra_vals[1];
                break;
            }
        }
        for (; i < npnts; i++) {
            if (data_out[i] != INT_MAX) {
                data_out[i] =  data_out[i] + min_val + last + last - penultimate;
                penultimate = last;
                last = data_out[i];
            }
        }
    }
    else {
        printf("Unsupported spatial differencing order: %d\n", sd_order);
        return -1;
    }

    return 0;
}