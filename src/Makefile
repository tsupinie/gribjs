
CC=emcc
PNG=/usr/local
PNGLIB=$(PNG)/lib
PNGINC=$(PNG)/include

LIBRARY_NAME=grib_compression.js

all:
	$(CC) -c decode_png.c -o decode_png.c.o -I$(PNGINC) -O2
	$(CC) decode_png.c.o -o $(LIBRARY_NAME) -sUSE_LIBPNG -sENVIRONMENT=node -sMODULARIZE=1 -sALLOW_MEMORY_GROWTH \
		-sEXPORTED_FUNCTIONS="['_decode_png', '_malloc', '_free']" -sEXPORTED_RUNTIME_METHODS="['cwrap', 'setValue', 'getValue']"

clean:
	rm *.c.o $(basename $(LIBRARY_NAME))*