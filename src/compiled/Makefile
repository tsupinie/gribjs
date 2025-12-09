
CC=emcc
PNG=/usr/local
PNGINC=$(PNG)/include
JPEG2000=/Users/tsupinie/software/wasm
JPEG2000LIB=$(JPEG2000)/lib
JPEG2000INC=$(JPEG2000)/include

LIBRARY_NAME=grib_compression
CFLAGS=-O2

OBJS=extract_bytes.c.o bitstream.c.o decode_png.c.o decode_openjpeg.c.o unpk_complex.c.o decode_bitmap.c.o

all: $(OBJS)
	$(CC) $(OBJS) -o $(LIBRARY_NAME).js -L$(JPEG2000LIB) -lopenjp2 -sUSE_LIBPNG -sENVIRONMENT=web -sMODULARIZE=1 -sALLOW_MEMORY_GROWTH \
		-sEXPORTED_FUNCTIONS="['_decode_png', '_decode_jpeg2000', '_unpk_complex', '_unpk_sd_complex', '_apply_bitmap', '_malloc', '_free']" \
		-sEXPORTED_RUNTIME_METHODS="['cwrap', 'setValue', 'getValue']"

	mv $(LIBRARY_NAME).wasm ../../public/.

extract_bytes.c.o: extract_bytes.c extract_bytes.h
bitstream.c.o: bitstream.c bitstream.h
unpk_complex.c.o: unpk_complex.c
decode_png.c.o: decode_png.c
	$(CC) -c $< -o $@ $(CFLAGS) -I$(PNGINC)
decode_openjpeg.c.o: decode_openjpeg.c
	$(CC) -c $< -o $@ $(CFLAGS) -I$(JPEG2000INC)
decode_bitmap.c.o: decode_bitmap.c

%.c.o: %.c
	$(CC) -c $< -o $@ $(CFLAGS)

clean:
	rm *.c.o $(LIBRARY_NAME).js ../../public/$(LIBRARY_NAME).wasm