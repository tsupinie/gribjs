
import { Constructor, G2Int4, G2UInt1, G2UInt4, Grib2Struct, Grib2TemplateEnumeration, InternalTypeMapper, unpackerFactory } from "./grib2base";

interface GridDefinition {}

class GridDefinitionBase<T> extends Grib2Struct<T> implements GridDefinition {}

interface ScanModeFlags {
    first_row_scan_direction: '+i' | '-i';
    first_col_scan_direction: '+j' | '-j';
    is_column_major: boolean;
    do_adjacent_rows_alternate: boolean;
}

/**
 * Scan mode flags mixin
 */
type ConstructorWithScanModeFlags = Constructor<Grib2Struct<{scanning_mode_flags: number}>>;
function scanModeFlags<T extends ConstructorWithScanModeFlags>(base: T) {
    return class extends base {
        getScanModeFlags() {
            const first_row_scans_positive = (this.contents.scanning_mode_flags & (1 << 7)) == 0;
            const first_col_scans_positive = (this.contents.scanning_mode_flags & (1 << 6)) == 0;
            const is_column_major = (this.contents.scanning_mode_flags & (1 << 5)) > 0;
            const do_adjacent_rows_alternate = (this.contents.scanning_mode_flags & (1 << 4)) > 0;

            return {first_row_scan_direction: first_row_scans_positive ? '+i' : '-i',
                    first_col_scan_direction: first_col_scans_positive ? '+j' : '-j',
                    is_column_major: is_column_major,
                    do_adjacent_rows_alternate: do_adjacent_rows_alternate} as ScanModeFlags;
        }
    }
}

const GridWithScanModeFlags = scanModeFlags(GridDefinitionBase);
function hasScanModeFlags(obj: any) : obj is InstanceType<typeof GridWithScanModeFlags> {
    return 'getScanModeFlags' in obj;
}

type ConstructorWithNiNj = Constructor<Grib2Struct<{ngrid_i: number, ngrid_j: number}>>;
function ninj<T extends ConstructorWithNiNj>(base: T) {
    return class extends base {
        get ngrid_i() {
            return this.contents.ngrid_i;
        }

        get ngrid_j() {
            return this.contents.ngrid_j;
        }
    }
}

const GridWithNiNj = ninj(GridDefinitionBase);
function hasNiNj(obj: any) : obj is InstanceType<typeof GridWithNiNj> {
    return 'ngrid_i' in obj && 'ngrid_j' in obj;
}

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
    lat_first: G2Int4,
    lon_first: G2UInt4,
    resolution_component_flags: G2UInt1,
    lat_last: G2Int4,
    lon_last: G2UInt4,
    i_direction_increment: G2UInt4,
    j_direction_increment: G2UInt4,
    scanning_mode_flags: G2UInt1,
};

class Grib2PlateCarreeGridDefinition extends scanModeFlags(ninj(GridDefinitionBase<InternalTypeMapper<typeof g2_plate_carree_types>>)) {}
const g2_plate_carree_grid_unpacker = unpackerFactory(g2_plate_carree_types, Grib2PlateCarreeGridDefinition);

const g2_plate_carree_rot_types = {
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
    lat_first: G2Int4,
    lon_first: G2UInt4,
    resolution_component_flags: G2UInt1,
    lat_last: G2Int4,
    lon_last: G2UInt4,
    i_direction_increment: G2UInt4,
    j_direction_increment: G2UInt4,
    scanning_mode_flags: G2UInt1,
    south_pole_latitude: G2Int4,
    south_pole_longitude: G2Int4,
    projection_rotation_angle: G2Int4
};

class Grib2PlateCarreeRotatedGridDefinition extends scanModeFlags(ninj(GridDefinitionBase<InternalTypeMapper<typeof g2_plate_carree_rot_types>>)) {}
const g2_plate_carree_rot_grid_unpacker = unpackerFactory(g2_plate_carree_rot_types, Grib2PlateCarreeRotatedGridDefinition);

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
    lat_first: G2Int4,
    lon_first: G2Int4,
    resolution_component_flags: G2UInt1,
    center_latitude: G2Int4,
    standard_longitude: G2Int4,
    grid_dx: G2Int4,
    grid_dy: G2Int4,
    projection_center_flag: G2UInt1,
    scanning_mode_flags: G2UInt1,
    standard_latitude_1: G2Int4,
    standard_latitude_2: G2Int4,
    south_pole_latitude: G2Int4,
    south_pole_longitude: G2Int4
}

class Grib2LambertConformalGridDefinition extends scanModeFlags(ninj(GridDefinitionBase<InternalTypeMapper<typeof g2_lambert_conformal_types>>)) {}
const g2_lambert_conformal_grid_unpacker = unpackerFactory(g2_lambert_conformal_types, Grib2LambertConformalGridDefinition);

const section3_template_unpackers = new Grib2TemplateEnumeration<GridDefinition>('grid definition template', {
    0: g2_plate_carree_grid_unpacker,
    1: g2_plate_carree_rot_grid_unpacker,
    30: g2_lambert_conformal_grid_unpacker,
});

export {section3_template_unpackers, hasScanModeFlags, hasNiNj};
export type {GridDefinition, ScanModeFlags};