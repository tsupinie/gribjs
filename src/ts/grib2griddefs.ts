
import { Grib2InternalType, Grib2Struct, Grib2TemplateEnumeration, unpackerFactory } from "./grib2base";

const g2_plate_carree_types = {
    earth_shape: 'ui1' as Grib2InternalType,
    spherical_earth_radius_scale_factor: 'ui1' as Grib2InternalType,
    spherical_earth_radius_value: 'ui4' as Grib2InternalType,
    oblate_earth_semimajor_axis_scale_factor: 'ui1' as Grib2InternalType,
    oblate_earth_semimajor_axis_value: 'ui4' as Grib2InternalType,
    oblate_earth_semiminor_axis_scale_factor: 'ui1' as Grib2InternalType,
    oblate_earth_semiminor_axis_value: 'ui4' as Grib2InternalType,
    ngrid_i: 'ui4' as Grib2InternalType,
    ngrid_j: 'ui4' as Grib2InternalType,
    basic_angle: 'ui4' as Grib2InternalType,
    subdivisions_to_basic_angle: 'ui4' as Grib2InternalType,
    lat_first: 'ui4' as Grib2InternalType,
    lon_first: 'ui4' as Grib2InternalType,
    resolution_component_flags: 'ui1' as Grib2InternalType,
    lat_last: 'ui4' as Grib2InternalType,
    lon_last: 'ui4' as Grib2InternalType,
    i_direction_increment: 'ui4' as Grib2InternalType,
    j_direction_increment: 'ui4' as Grib2InternalType,
    scanning_mode_flags: 'ui4' as Grib2InternalType,
};

class Grib2PlateCarreeGridDefinition extends Grib2Struct<typeof g2_plate_carree_types> {}
const g2_plate_carree_grid_unpacker = unpackerFactory(g2_plate_carree_types, Grib2PlateCarreeGridDefinition);

const g2_lambert_conformal_types = {
    earth_shape: 'ui1' as Grib2InternalType,
    spherical_earth_radius_scale_factor: 'ui1' as Grib2InternalType,
    spherical_earth_radius_value: 'ui4' as Grib2InternalType,
    oblate_earth_semimajor_axis_scale_factor: 'ui1' as Grib2InternalType,
    oblate_earth_semimajor_axis_value: 'ui4' as Grib2InternalType,
    oblate_earth_semiminor_axis_scale_factor: 'ui1' as Grib2InternalType,
    oblate_earth_semiminor_axis_value: 'ui4' as Grib2InternalType,
    ngrid_i: 'ui4' as Grib2InternalType,
    lat_first: 'ui4' as Grib2InternalType,
    lon_first: 'ui4' as Grib2InternalType,
    resolution_component_flags: 'ui1' as Grib2InternalType,
    center_latitude: 'ui4' as Grib2InternalType,
}

class Grib2LambertConformalGridDefinition extends Grib2Struct<typeof g2_lambert_conformal_types> {}
const g2_lambert_conformal_grid_unpacker = unpackerFactory(g2_lambert_conformal_types, Grib2LambertConformalGridDefinition);

type GridDefinition = Grib2PlateCarreeGridDefinition | Grib2LambertConformalGridDefinition;

const section3_template_unpackers: Grib2TemplateEnumeration<GridDefinition> = {
    0: g2_plate_carree_grid_unpacker,
    30: g2_lambert_conformal_grid_unpacker,
};

export {section3_template_unpackers};
export type {GridDefinition};