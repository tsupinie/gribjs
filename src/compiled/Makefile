
CC=emcc
PNG=/usr/local
PNGINC=$(PNG)/include

LIBRARY_NAME=grib_compression
CFLAGS=-O2

OBJS=extract_bytes.c.o bitstream.c.o decode_png.c.o unpk_complex.c.o

all: $(OBJS)
	$(CC) $(OBJS) -o $(LIBRARY_NAME).js -sUSE_LIBPNG -sENVIRONMENT=web -sMODULARIZE=1 -sALLOW_MEMORY_GROWTH \
		-sEXPORTED_FUNCTIONS="['_decode_png', '_unpk_complex', '_unpk_sd_complex', '_malloc', '_free']" -sEXPORTED_RUNTIME_METHODS="['cwrap', 'setValue', 'getValue']"

	mv $(LIBRARY_NAME).wasm ../../public/.

extract_bytes.c.o: extract_bytes.c extract_bytes.h
bitstream.c.o: bitstream.c bitstream.h
unpk_complex.c.o: unpk_complex.c
decode_png.c.o: decode_png.c
	$(CC) -c $< -o $@ $(CFLAGS) -I$(PNGINC)

%.c.o: %.c
	$(CC) -c $< -o $@ $(CFLAGS)

clean:
	rm *.c.o $(LIBRARY_NAME).js ../../public/$(LIBRARY_NAME).wasm