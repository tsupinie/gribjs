import { G2UInt1, G2UInt2, G2UInt4, Grib2Struct, Grib2TemplateEnumeration, InternalTypeMapper, unpackerFactory } from "./grib2base";
import { Grib2SurfaceTableEntry, lookupGrib2Surface } from "./grib2surfacetables";

interface ProductDefinition {
    parameter_category: number;
    parameter_number: number;
}

interface SurfaceSpec extends Grib2SurfaceTableEntry {
    value: number;
}

interface HorizontalLayer {
    surface1: SurfaceSpec | null;
    surface2: SurfaceSpec | null;
}

function isHorizontalLayer(obj: any) : obj is HorizontalLayer {
    return 'surface1' in obj && 'surface2' in obj;
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
    get surface1() {
        if (this.contents.fixed_surface_1_type == 255) {
            return null;
        }

        const value = Math.pow(10, this.contents.fixed_surface_1_scale_factor) * this.contents.fixed_surface_1_value;
        const coordinate = lookupGrib2Surface(this.contents.fixed_surface_1_type);
        return {value: value, surfaceName: coordinate.surfaceName, surfaceUnits: coordinate.surfaceUnits};
    }

    get surface2() {
        if (this.contents.fixed_surface_2_type == 255) {
            return null;
        }

        const value = Math.pow(10, this.contents.fixed_surface_2_scale_factor) * this.contents.fixed_surface_2_value;
        const coordinate = lookupGrib2Surface(this.contents.fixed_surface_2_type);
        return {value: value, surfaceName: coordinate.surfaceName, surfaceUnits: coordinate.surfaceUnits};
    }
}
const g2_forecast_at_time_unpacker = unpackerFactory(g2_forecast_at_time_types, Grib2ForecastAtTime);

const g2_section4_template_unpackers: Grib2TemplateEnumeration<ProductDefinition> = {
    0: g2_forecast_at_time_unpacker,
}

export {g2_section4_template_unpackers, isHorizontalLayer};
export type {ProductDefinition, SurfaceSpec};