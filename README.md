# gribjs
Read Grib2 files using Javascript

## Dev Installation
Development installation is a slightly more laborious process that I might get around to automating at some point.

1) Install [emscripten](https://github.com/emscripten-core/emscripten). Don't forget to run `source /path/to/emscripten/emsdk_env.sh` afterward to set up the environment.
2) Install [openjpeg](https://github.com/uclouvain/openjpeg), but configure and compile it with emscripten. The commands that worked for me are

```bash
cd /path/to/openjpeg
mkdir build
cd build
emcmake cmake .. -DEMSCRIPTEN_GENERATE_BITCODE_STATIC_LIBRARIES=0 \
                 -DCMAKE_MAKE_PROGRAM=make \
                 -DCMAKE_INSTALL_PREFIX=~/software/wasm \
                 -DCMAKE_C_FLAGS='-O3'
make
```

Feel free to change `CMAKE_INSTALL_PREFIX` to something that makes sense for you (though you'll need to modify the makefile in gribjs to point to that location).

3) Build the web assembly binary.

```bash
cd $PROJECT_ROOT/src/compiled
make
```

This should make a `grib_compression.wasm` file in `$PROJECT_ROOT/public`
