
CC=emcc
PNG=/usr/local
PNGLIB=$(PNG)/lib
PNGINC=$(PNG)/include

LIBRARY_NAME=grib_compression.js

all:
	$(CC) -c extract_bytes.c -o extract_bytes.c.o -O2
	$(CC) -c bitstream.c -o bitstream.c.o -O2
	$(CC) -c decode_png.c -o decode_png.c.o -I$(PNGINC) -O2
	$(CC) -c unpk_complex.c -o unpk_complex.c.o -O2
	$(CC) extract_bytes.c.o bitstream.c.o decode_png.c.o unpk_complex.c.o -o $(LIBRARY_NAME) -sUSE_LIBPNG -sENVIRONMENT=web -sMODULARIZE=1 -sALLOW_MEMORY_GROWTH \
		-sEXPORTED_FUNCTIONS="['_decode_png', '_unpk_complex', '_unpk_sd_complex', '_malloc', '_free']" -sEXPORTED_RUNTIME_METHODS="['cwrap', 'setValue', 'getValue']"

	mv grib_compression.wasm ../../public/.

clean:
	rm *.c.o $(basename $(LIBRARY_NAME))*