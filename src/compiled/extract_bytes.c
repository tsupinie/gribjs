
unsigned int uint2(unsigned char const *p) {
    return (p[0] << 8) + p[1];
}

unsigned int uint4(unsigned const char *p) {
    return ((p[0] << 24) + (p[1] << 16) + (p[2] << 8) + p[3]);
}

int int2(unsigned const char *p) {
    int i;
    if (p[0] & 0x80) {
        i = -(((p[0] & 0x7f) << 8) + p[1]);
    }
    else {
        i = (p[0] << 8) + p[1];
    }
    return i;
}

int int_n(unsigned const char *p, int n) {
    int i, sign;

    if (n == 0) return 0;
    sign = *p;
    i = *p++ & 127;
    while (n-- > 1) {
        i = i * 256 + (int) *p++;
    }
    if (sign & 0x80) i = -i;
    return i;
}

unsigned int uint_n(unsigned const char *p, int n) {
    unsigned int i;
    i = 0;
    while (n-- > 0) {
        i = (i << 8) + *p++;
    }
    return i;
}

float ieee2flt(unsigned char *ieee) {
    // Assumes little-endian
    unsigned int val = ieee[0] + (ieee[1] << 8) + (ieee[2] << 16) + (ieee[3] << 24);
    return (float)val;
}