import { Constructor, G2UInt1, G2UInt2, G2UInt4, Grib2Struct, Grib2TemplateEnumeration, InternalTypeMapper, unpackerFactory } from "./grib2base";
import { Grib2SurfaceTableEntry, lookupGrib2Surface } from "./grib2surfacetables";

import {Duration} from 'luxon';

interface SurfaceSpec extends Omit<Grib2SurfaceTableEntry, 'surfacePrintFormat'> {
    value: number;
    printable: string;
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

/**
 * Base class
 */
interface ProductDefinition {
    parameter_category: number;
    parameter_number: number;
}

class ProductDefinitionBase<T extends {parameter_category: number, parameter_number: number}> extends Grib2Struct<T> implements ProductDefinition {
    get parameter_category() {
        return this.contents.parameter_category;
    }

    get parameter_number() {
        return this.contents.parameter_number;
    }
}

/**
 * Horizontal layer mixin
 */
type ConstructorWithSurfaces = Constructor<Grib2Struct<{fixed_surface_1_type: number, fixed_surface_1_scale_factor: number, fixed_surface_1_value: number, 
                                                        fixed_surface_2_type: number, fixed_surface_2_scale_factor: number, fixed_surface_2_value: number}>>;
function horizontalLayerProduct<T extends ConstructorWithSurfaces>(base: T) {
    return class extends base {
        getSurface1() {
            return getLayerSpec(this.contents.fixed_surface_1_type, this.contents.fixed_surface_1_scale_factor, this.contents.fixed_surface_1_value);
        }

        getSurface2() {
            return getLayerSpec(this.contents.fixed_surface_2_type, this.contents.fixed_surface_2_scale_factor, this.contents.fixed_surface_2_value);
        }
    }
}

const HorizontalLayerProduct = horizontalLayerProduct(ProductDefinitionBase);
function isHorizontalLayerProduct(obj: any) : obj is InstanceType<typeof HorizontalLayerProduct> {
    return 'getSurface1' in obj && 'getSurface2' in obj;
}

/**
 * Forecast time mixin
 */
type ConstructorWithForecastTime = Constructor<Grib2Struct<{time_range_unit: number, forecast_time: number}>>;
function analysisOrForecastProduct<T extends ConstructorWithForecastTime>(base: T) {
    return class extends base {
        getForecastTime() {
            if (!(this.contents.time_range_unit in time_range_unit_iso)) {
                throw `Time range unit ${this.contents.time_range_unit} is unknown`
            }
    
            return Duration.fromISO(time_range_unit_iso[this.contents.time_range_unit]).mapUnits(u => u * this.contents.forecast_time);
        }
    }
}

const AnalysisOrForecastProduct = analysisOrForecastProduct(ProductDefinitionBase);
function isAnalysisOrForecastProduct(obj: any) : obj is InstanceType<typeof AnalysisOrForecastProduct> {
    return 'getForecastTime' in obj;
}

/**
 * Template definitions
 */
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

class Grib2ForecastAtTime extends analysisOrForecastProduct(horizontalLayerProduct(ProductDefinitionBase<InternalTypeMapper<typeof g2_forecast_at_time_types>>)) {}
const g2_forecast_at_time_unpacker = unpackerFactory(g2_forecast_at_time_types, Grib2ForecastAtTime);


const g2_ens_forecast_at_time_types = {
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
    ensemble_type: G2UInt1,
    ensemble_perturbation_number: G2UInt1,
    ensemble_size: G2UInt1,
}

class Grib2EnsForecastAtTime extends analysisOrForecastProduct(horizontalLayerProduct(ProductDefinitionBase<InternalTypeMapper<typeof g2_ens_forecast_at_time_types>>)) {}
const g2_ens_forecast_at_time_unpacker = unpackerFactory(g2_ens_forecast_at_time_types, Grib2EnsForecastAtTime);


const g2_derived_ens_forecast_at_time_types = {
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
    derived_forecast_type: G2UInt1,
    ensemble_size: G2UInt1,
}

class Grib2DerivedEnsForecastAtTime extends analysisOrForecastProduct(horizontalLayerProduct(ProductDefinitionBase<InternalTypeMapper<typeof g2_derived_ens_forecast_at_time_types>>)) {}
const g2_derived_ens_forecast_at_time_unpacker = unpackerFactory(g2_derived_ens_forecast_at_time_types, Grib2DerivedEnsForecastAtTime);


const g2_forecast_agg_over_time_types = {
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
    interval_end_year: G2UInt2,
    interval_end_month: G2UInt1,
    interval_end_day: G2UInt1,
    interval_end_hour: G2UInt1,
    interval_end_minute: G2UInt1,
    interval_end_second: G2UInt1,
    number_of_agg_intervals: G2UInt1,
    number_of_missing_values: G2UInt4,
    agg_process_type: G2UInt1,
    agg_sample_increment_type: G2UInt1,
    agg_interval_time_range_unit: G2UInt1,
    agg_interval_length: G2UInt4,
    agg_sample_time_range_unit: G2UInt1,
    agg_sample_interval_length: G2UInt4,
}

class Grib2ForecastAggOverTime extends analysisOrForecastProduct(horizontalLayerProduct(ProductDefinitionBase<InternalTypeMapper<typeof g2_forecast_agg_over_time_types>>)) {}
const g2_forecast_agg_over_time_unpacker = unpackerFactory(g2_forecast_agg_over_time_types, Grib2ForecastAggOverTime);


const g2_ens_forecast_agg_over_time_types = {
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
    ensemble_type: G2UInt1,
    ensemble_perturbation_number: G2UInt1,
    ensemble_size: G2UInt1,
    interval_end_year: G2UInt2,
    interval_end_month: G2UInt1,
    interval_end_day: G2UInt1,
    interval_end_hour: G2UInt1,
    interval_end_minute: G2UInt1,
    interval_end_second: G2UInt1,
    number_of_agg_intervals: G2UInt1,
    number_of_missing_values: G2UInt4,
    agg_process_type: G2UInt1,
    agg_sample_increment_type: G2UInt1,
    agg_interval_time_range_unit: G2UInt1,
    agg_interval_length: G2UInt4,
    agg_sample_time_range_unit: G2UInt1,
    agg_sample_interval_length: G2UInt4,
}

class Grib2EnsForecastAggOverTime extends analysisOrForecastProduct(horizontalLayerProduct(ProductDefinitionBase<InternalTypeMapper<typeof g2_ens_forecast_agg_over_time_types>>)) {}
const g2_ens_forecast_agg_over_time_unpacker = unpackerFactory(g2_ens_forecast_agg_over_time_types, Grib2EnsForecastAggOverTime);

const g2_section4_template_unpackers = new Grib2TemplateEnumeration<ProductDefinition>('product definition template', {
    0: g2_forecast_at_time_unpacker,
    1: g2_ens_forecast_at_time_unpacker,
    2: g2_derived_ens_forecast_at_time_unpacker,
    8: g2_forecast_agg_over_time_unpacker,
    11: g2_ens_forecast_agg_over_time_unpacker,
});

export {g2_section4_template_unpackers, isHorizontalLayerProduct, isAnalysisOrForecastProduct};
export type {ProductDefinition, SurfaceSpec};