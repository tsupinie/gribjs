# gribjs
Read Grib2 files using Javascript

## Usage
### Read a file that has an inventory
```javascript
// Download the inventory
const inv = grib.Grib2Inventory.fromRemote('https://example.com/path/to/data.grib2.idx');

// Pull 500 mb height out of the inventory and download the data. This will only download
//   the part of the remote grib file containing the 500mb height data.
const g2_file = await inv.search(':HGT:500 mb:')
                         .downloadData('https://example.com/path/to/data.grib2');

// Now pull the first message out of the file. If the file only has one message, this is
//  the 500 mb height message.
const msg_z500 = await g2_file.getMessage(0);

// To get the data
msg_z500.data
```

### Read a file that doesn't have a remote inventory
```javascript
// Download the file
const resp = await fetch('https://example.com/path/to/data.grib2');
const data = new Uint8Array(await (await resp.blob()).arrayBuffer());
// If you need to decompress the grib file you downloaded, you can do that here using pako or
//  some similar library.
const g2_file = grib.Grib2File.scan(new DataView(data));

// The search function works the same as on the inventory, to pull out 500 mb height,
//  you can do
const msg_z500 = await inv.search(':HGT:500 mb').getMessage(0);
```

### CORS
A lot of sites that serve grib files haven't added headers that remove the CORS restrictions when requesting data in a browser. I guess this is probably because they're not added by default, and it's not common to request grib2 data directly to a browser. Hopefully, sites will add those headers at some point, but in the meantime, you'll probably need to set up a proxy and download grib files through that proxy.

## Dev Installation
Development installation is a slightly laborious process that I might get around to automating at some point.

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
