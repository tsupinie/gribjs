
int rd_bitstream(unsigned char *p, int offset, int *u, int n_bits, unsigned int n); 
int rd_bitstream_flt(unsigned char *p, int offset, float *u, int n_bits, unsigned int n); 
int add_bitstream(int t, int n_bits);
int add_many_bitstream(int *t, unsigned int n, int n_bits);
void init_bitstream(unsigned char *new_bitstream);
void finish_bitstream(void);