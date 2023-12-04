
import { Constructor, G2Int4, G2UInt1, G2UInt4, Grib2Struct, Grib2TemplateEnumeration, InternalTypeMapper, unpackerFactory } from "./grib2base";

interface PlateCarreeGridParameters {
    projection: 'PlateCarree';
    lat_first: number;
    lon_first: number;
    lat_last: number;
    lon_last: number;
}

interface RotatedPlateCarreeGridParameters {
    projection: 'RotatedPlateCarree';
    lat_first: number;
    lon_first: number;
    lat_last: number;
    lon_last: number;
    south_pole_lat: number;
    south_pole_lon: number;
    rotation_angle: number;
}

interface LambertConformalGridParameters {
    projection: 'LambertConformal';
    lat_first: number;
    lon_first: number;
    center_lat: number;
    standard_lon: number;
    dx: number;
    dy: number;
    standard_lat_1: number;
    standard_lat_2: number;
}

type GridParameters = PlateCarreeGridParameters | RotatedPlateCarreeGridParameters | LambertConformalGridParameters;

interface GridDefinition {
    getGridParameters: () => GridParameters;
}

class GridDefinitionBase<T> extends Grib2Struct<T> {}

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

interface EarthShape {
    is_sphere: boolean;
    semimajor: number;
    semiminor: number;
}

type ConstructorWithEarthShape = Constructor<Grib2Struct<{earth_shape: number, 
                                                          spherical_earth_radius_scale_factor: number, spherical_earth_radius_value: number,
                                                          oblate_earth_semimajor_axis_scale_factor: number, oblate_earth_semimajor_axis_value: number,
                                                          oblate_earth_semiminor_axis_scale_factor: number, oblate_earth_semiminor_axis_value: number}>>;
function earthShape<T extends ConstructorWithEarthShape>(base: T) {
    return class extends base {
        getEarthShape() : EarthShape {
            switch(this.contents.earth_shape) {
                case 0:
                    // Spherical earth with radius 6,367,470 m
                    return {is_sphere: true, semimajor: 6367470, semiminor: 6367470};
                case 1:
                    // Spherical earth with the radius specified in meters in the file
                    const radius = this.contents.spherical_earth_radius_value * Math.pow(10, this.contents.spherical_earth_radius_scale_factor);
                    return {is_sphere: true, semimajor: radius, semiminor: radius};
                case 2:
                    // Oblate spheroid earth as determined by IAU in 1965
                    return {is_sphere: false, semimajor: 6378160, semiminor: 6356775};
                case 3:
                    {
                        // Oblate spherioid earth with the axes specified in kilometers in the file
                        const semimajor = this.contents.oblate_earth_semimajor_axis_value * Math.pow(10, this.contents.oblate_earth_semimajor_axis_scale_factor + 3);
                        const semiminor = this.contents.oblate_earth_semiminor_axis_value * Math.pow(10, this.contents.oblate_earth_semiminor_axis_scale_factor + 3);
                        return {is_sphere: semimajor == semiminor, semimajor: semimajor, semiminor: semiminor};
                    }
                case 4:
                    // Oblate spheroid earth as defined in the IAG-GRS80 model
                case 5:
                    // Oblate spheroid earth represented by WGS84
                    return {is_sphere: false, semimajor: 6378137, semiminor: 6356752.314};
                case 6:
                    // Spherical earth with radius 6,371,229 m
                    return {is_sphere: true, semimajor: 6371229, semiminor: 6371229};
                case 7:
                    {
                        // Oblate spherioid earth with the axes specified in meters in the file
                        const semimajor = this.contents.oblate_earth_semimajor_axis_value * Math.pow(10, this.contents.oblate_earth_semimajor_axis_scale_factor);
                        const semiminor = this.contents.oblate_earth_semiminor_axis_value * Math.pow(10, this.contents.oblate_earth_semiminor_axis_scale_factor);
                        return {is_sphere: semimajor == semiminor, semimajor: semimajor, semiminor: semiminor};
                    }
                default:
                    throw `Unknown earth shape '${this.contents.earth_shape}'`;
            }
        }
    }
}

const GridWithEarthShape = earthShape(GridDefinitionBase);
function hasEarthShape(obj: any) : obj is InstanceType<typeof GridWithEarthShape> {
    return 'getEarthShape' in obj;
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

class Grib2PlateCarreeGridDefinition extends scanModeFlags(earthShape(ninj(GridDefinitionBase<InternalTypeMapper<typeof g2_plate_carree_types>>))) implements GridDefinition {
    getGridParameters() : PlateCarreeGridParameters {
        const angle_unit = 1e-6;
        return {projection: 'PlateCarree', lat_first: this.contents.lat_first * angle_unit, lon_first: this.contents.lon_first * angle_unit,
                lat_last: this.contents.lat_last * angle_unit, lon_last: this.contents.lon_last * angle_unit};
    }
}

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

class Grib2PlateCarreeRotatedGridDefinition extends scanModeFlags(earthShape(ninj(GridDefinitionBase<InternalTypeMapper<typeof g2_plate_carree_rot_types>>))) implements GridDefinition {
    getGridParameters() : RotatedPlateCarreeGridParameters {
        const angle_unit = 1e-6;
        return {projection: 'RotatedPlateCarree', lat_first: this.contents.lat_first * angle_unit, lon_first: this.contents.lon_first * angle_unit,
                lat_last: this.contents.lat_last * angle_unit, lon_last: this.contents.lon_last * angle_unit, 
                south_pole_lat: this.contents.south_pole_latitude * angle_unit, south_pole_lon: this.contents.south_pole_longitude * angle_unit, 
                rotation_angle: this.contents.projection_rotation_angle * angle_unit};
    }
}
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

class Grib2LambertConformalGridDefinition extends scanModeFlags(earthShape(ninj(GridDefinitionBase<InternalTypeMapper<typeof g2_lambert_conformal_types>>))) implements GridDefinition {
    getGridParameters() : LambertConformalGridParameters {
        const angle_unit = 1e-6;
        const spacing_unit = 1e-3;
        return {projection: 'LambertConformal', lat_first: this.contents.lat_first * angle_unit, lon_first: this.contents.lon_first * angle_unit,
                center_lat: this.contents.center_latitude * angle_unit, standard_lon: this.contents.standard_longitude * angle_unit, 
                dx: this.contents.grid_dx * spacing_unit, dy: this.contents.grid_dy * spacing_unit, 
                standard_lat_1: this.contents.standard_latitude_1 * angle_unit, standard_lat_2: this.contents.standard_latitude_2 * angle_unit};
    }
}
const g2_lambert_conformal_grid_unpacker = unpackerFactory(g2_lambert_conformal_types, Grib2LambertConformalGridDefinition);

const section3_template_unpackers = new Grib2TemplateEnumeration<GridDefinition>('grid definition template', {
    0: g2_plate_carree_grid_unpacker,
    1: g2_plate_carree_rot_grid_unpacker,
    30: g2_lambert_conformal_grid_unpacker,
});

export {section3_template_unpackers, hasScanModeFlags, hasNiNj, hasEarthShape};
export type {GridDefinition, ScanModeFlags, GridParameters, PlateCarreeGridParameters, RotatedPlateCarreeGridParameters, LambertConformalGridParameters};