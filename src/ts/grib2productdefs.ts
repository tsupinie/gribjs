import { G2UInt1, G2UInt2, G2UInt4, Grib2Struct, Grib2TemplateEnumeration, InternalTypeMapper, unpackerFactory } from "./grib2base";
import { Grib2SurfaceTableEntry, lookupGrib2Surface } from "./grib2surfacetables";

interface ProductDefinition {
    parameter_category: number;
    parameter_number: number;
}

interface SurfaceSpec extends Omit<Grib2SurfaceTableEntry, 'surfacePrintFormat'> {
    value: number;
    printable: string;
}

interface HorizontalLayer {
    getSurface1: () => SurfaceSpec | null;
    getSurface2: () => SurfaceSpec | null;
}

function isHorizontalLayer(obj: any) : obj is HorizontalLayer {
    return 'getSurface1' in obj && 'getSurface2' in obj;
}

function getLayerSpec(surface_type: number, surface_scale_factor: number, surface_value: number) : SurfaceSpec | null {
    if (surface_type == 255) {
        return null;
    }

    const value = Math.pow(10, surface_scale_factor) * surface_value;
    const coordinate = lookupGrib2Surface(surface_type);
    const printable = coordinate.surfacePrintFormat.replace('{surfaceValue}', value.toString()).replace('{surfaceUnits}', coordinate.surfaceUnits);

    return {value: value, surfaceName: coordinate.surfaceName, surfaceUnits: coordinate.surfaceUnits, printable: printable};
}

const g2_forecast_at_time_types = {
    parameter_category: G2UInt1,
    parameter_number: G2UInt1,
    generating_process_type: G2UInt1,
    generating_process_identifier: G2UInt1,
    generating_process: G2UInt1,
    obs_data_cutoff_hours: G2UInt2,
    obs_data_cutoff_minutes: G2UInt1,
    time_range_unit: G2UInt1,
    forecast_time: G2UInt4,
    fixed_surface_1_type: G2UInt1,
    fixed_surface_1_scale_factor: G2UInt1,
    fixed_surface_1_value: G2UInt4,
    fixed_surface_2_type: G2UInt1,
    fixed_surface_2_scale_factor: G2UInt1,
    fixed_surface_2_value: G2UInt4,
}

class ProductDefintionBase extends Grib2Struct<InternalTypeMapper<typeof g2_forecast_at_time_types>> implements ProductDefinition {
    get parameter_category() {
        return this.contents.parameter_category;
    }

    get parameter_number() {
        return this.contents.parameter_number;
    }
}

class Grib2ForecastAtTime extends ProductDefintionBase implements HorizontalLayer {
    getSurface1() {
        return getLayerSpec(this.contents.fixed_surface_1_type, this.contents.fixed_surface_1_scale_factor, this.contents.fixed_surface_1_value);
    }

    getSurface2() {
        return getLayerSpec(this.contents.fixed_surface_2_type, this.contents.fixed_surface_2_scale_factor, this.contents.fixed_surface_2_value);
    }
}
const g2_forecast_at_time_unpacker = unpackerFactory(g2_forecast_at_time_types, Grib2ForecastAtTime);

const g2_section4_template_unpackers: Grib2TemplateEnumeration<ProductDefinition> = {
    0: g2_forecast_at_time_unpacker,
}

export {g2_section4_template_unpackers, isHorizontalLayer};
export type {ProductDefinition, SurfaceSpec};