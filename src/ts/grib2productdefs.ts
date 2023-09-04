import { G2UInt1, G2UInt2, G2UInt4, Grib2Struct, Grib2TemplateEnumeration, InternalTypeMapper, unpackerFactory } from "./grib2base";
import { Grib2SurfaceTableEntry, lookupGrib2Surface } from "./grib2surfacetables";

import {Duration} from 'luxon';

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

interface AnalysisOrForecast {
    getForecastTime(): Duration;
}

function isAnalysisOrForecast(obj: any) : obj is AnalysisOrForecast {
    return 'getForecastTime' in obj;
}

const time_range_unit_iso: Record<number, string> = {
    0: 'PT1M',
    1: 'PT1H',
    2: 'P1D',
    3: 'P1M',
    4: 'P1Y',
    5: 'P10Y',
    6: 'P30Y',
    7: 'P100Y',
    10: 'PT3H',
    11: 'PT6H',
    12: 'PT12H',
    13: 'PT1S',
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

class Grib2ForecastAtTime extends ProductDefintionBase implements HorizontalLayer, AnalysisOrForecast {
    getSurface1() {
        return getLayerSpec(this.contents.fixed_surface_1_type, this.contents.fixed_surface_1_scale_factor, this.contents.fixed_surface_1_value);
    }

    getSurface2() {
        return getLayerSpec(this.contents.fixed_surface_2_type, this.contents.fixed_surface_2_scale_factor, this.contents.fixed_surface_2_value);
    }

    getForecastTime() {
        if (!(this.contents.time_range_unit in time_range_unit_iso)) {
            throw `Time range unit ${this.contents.time_range_unit} is unknown`
        }

        return Duration.fromISO(time_range_unit_iso[this.contents.time_range_unit]).mapUnits(u => u * this.contents.forecast_time);
    }
}
const g2_forecast_at_time_unpacker = unpackerFactory(g2_forecast_at_time_types, Grib2ForecastAtTime);

const g2_section4_template_unpackers: Grib2TemplateEnumeration<ProductDefinition> = {
    0: g2_forecast_at_time_unpacker,
}

export {g2_section4_template_unpackers, isHorizontalLayer, isAnalysisOrForecast};
export type {ProductDefinition, SurfaceSpec};