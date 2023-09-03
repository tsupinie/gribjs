
import { G2UInt1, G2UInt4, Grib2Struct, Grib2TemplateEnumeration, unpackerFactory } from "./grib2base";

const g2_plate_carree_types = {
    earth_shape: G2UInt1,
    spherical_earth_radius_scale_factor: G2UInt1,
    spherical_earth_radius_value: G2UInt4,
    oblate_earth_semimajor_axis_scale_factor: G2UInt1,
    oblate_earth_semimajor_axis_value: G2UInt4,
    oblate_earth_semiminor_axis_scale_factor: G2UInt1,
    oblate_earth_semiminor_axis_value: G2UInt4,
    ngrid_i: G2UInt4,
    ngrid_j: G2UInt4,
    basic_angle: G2UInt4,
    subdivisions_to_basic_angle: G2UInt4,
    lat_first: G2UInt4,
    lon_first: G2UInt4,
    resolution_component_flags: G2UInt1,
    lat_last: G2UInt4,
    lon_last: G2UInt4,
    i_direction_increment: G2UInt4,
    j_direction_increment: G2UInt4,
    scanning_mode_flags: G2UInt4,
};

class Grib2PlateCarreeGridDefinition extends Grib2Struct<typeof g2_plate_carree_types> {}
const g2_plate_carree_grid_unpacker = unpackerFactory(g2_plate_carree_types, Grib2PlateCarreeGridDefinition);

const g2_lambert_conformal_types = {
    earth_shape: G2UInt1,
    spherical_earth_radius_scale_factor: G2UInt1,
    spherical_earth_radius_value: G2UInt4,
    oblate_earth_semimajor_axis_scale_factor: G2UInt1,
    oblate_earth_semimajor_axis_value: G2UInt4,
    oblate_earth_semiminor_axis_scale_factor: G2UInt1,
    oblate_earth_semiminor_axis_value: G2UInt4,
    ngrid_i: G2UInt4,
    ngrid_j: G2UInt4,
    lat_first: G2UInt4,
    lon_first: G2UInt4,
    resolution_component_flags: G2UInt1,
    center_latitude: G2UInt4,
    standard_longitude: G2UInt4,
    grid_dx: G2UInt4,
    grid_dy: G2UInt4,
    projection_center_flag: G2UInt1,
    scanning_mode_flag: G2UInt1,
    standard_latitude_1: G2UInt4,
    standard_latitude_2: G2UInt4,
    south_pole_latitude: G2UInt4,
    south_pole_longitude: G2UInt4
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