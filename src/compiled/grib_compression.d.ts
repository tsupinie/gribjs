/// <referece types="emscripten" />

export interface Grib2CompressionModule extends EmscriptenModule {
    cwrap: typeof cwrap;
    ccall: typeof ccall;
    getValue: typeof getValue;
    setValue: typeof setValue;
}

declare const Module: EmscriptenModuleFactory<Grib2CompressionModule>;
export default Module;