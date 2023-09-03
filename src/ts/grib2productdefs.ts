import { Grib2InternalType, Grib2Struct, Grib2TemplateEnumeration, unpackerFactory } from "./grib2base";

const g2_forecast_at_time_types = {
    parameter_category: 'ui1' as Grib2InternalType,
    parameter_number: 'ui1' as Grib2InternalType,
    generating_process_type: 'ui1' as Grib2InternalType,
    generating_process_identifier: 'ui1' as Grib2InternalType,
    generating_process: 'ui1' as Grib2InternalType,
    obs_data_cutoff_hours: 'ui2' as Grib2InternalType,
    obs_data_cutoff_minutes: 'ui1' as Grib2InternalType,
    time_range_unit: 'ui1' as Grib2InternalType,
    forecast_time: 'ui4' as Grib2InternalType,
    fixed_surface_1_type: 'ui1' as Grib2InternalType,
    fixed_surface_1_scale_factor: 'ui1' as Grib2InternalType,
    fixed_surface_1_value: 'ui4' as Grib2InternalType,
    fixed_surface_2_type: 'ui1' as Grib2InternalType,
    fixed_surface_2_scale_factor: 'ui1' as Grib2InternalType,
    fixed_surface_2_value: 'ui4' as Grib2InternalType,
}

class Grib2ForecastAtTime extends Grib2Struct<typeof g2_forecast_at_time_types> {}
const g2_forecast_at_time_unpacker = unpackerFactory(g2_forecast_at_time_types, Grib2ForecastAtTime);

type ProductDefinition = Grib2ForecastAtTime;

const g2_section4_template_unpackers: Grib2TemplateEnumeration<ProductDefinition> = {
    0: g2_forecast_at_time_unpacker,
}

export {g2_section4_template_unpackers};
export type {ProductDefinition};