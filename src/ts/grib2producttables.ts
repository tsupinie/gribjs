
interface Grib2ProductTableEntry {
    parameterName: string;
    parameterAbbrev: string;
    parameterUnits: string;
}

type Grib2CodeTable = Record<number, Grib2ProductTableEntry>;
type Grib2DisciplineCodeTable = Record<number, Grib2CodeTable>;

const temperature_parameters: Grib2CodeTable = {
    0: {parameterName: 'Temperature', parameterAbbrev: 'TMP', parameterUnits: 'K'},
    1: {parameterName: 'Virtual Temperature', parameterAbbrev: 'VTMP', parameterUnits: 'K'},
    2: {parameterName: 'Potential Temperature', parameterAbbrev: 'POT', parameterUnits: 'K'},
    3: {parameterName: 'Pseudo-Adiabatic Potential Temperature (or Equivalent Potential Temperature)', parameterAbbrev: 'EPOT', parameterUnits: 'K'},
    4: {parameterName: 'Maximum Temperature*', parameterAbbrev: 'TMAX', parameterUnits: 'K'},
    5: {parameterName: 'Minimum Temperature*', parameterAbbrev: 'TMIN', parameterUnits: 'K'},
    6: {parameterName: 'Dew Point Temperature', parameterAbbrev: 'DPT', parameterUnits: 'K'},
    7: {parameterName: 'Dew Point Depression (or Deficit)', parameterAbbrev: 'DEPR', parameterUnits: 'K'},
    8: {parameterName: 'Lapse Rate', parameterAbbrev: 'LAPR', parameterUnits: 'K m-1'},
    9: {parameterName: 'Temperature Anomaly', parameterAbbrev: 'TMPA', parameterUnits: 'K'},
    10: {parameterName: 'Latent Heat Net Flux', parameterAbbrev: 'LHTFL', parameterUnits: 'W m-2'},
    11: {parameterName: 'Sensible Heat Net Flux', parameterAbbrev: 'SHTFL', parameterUnits: 'W m-2'},
    12: {parameterName: 'Heat Index', parameterAbbrev: 'HEATX', parameterUnits: 'K'},
    13: {parameterName: 'Wind Chill Factor', parameterAbbrev: 'WCF', parameterUnits: 'K'},
    14: {parameterName: 'Minimum Dew Point Depression', parameterAbbrev: 'MINDPD', parameterUnits: 'K'},
    15: {parameterName: 'Virtual Potential Temperature', parameterAbbrev: 'VPTMP', parameterUnits: 'K'},
    16: {parameterName: 'Snow Phase Change Heat Flux', parameterAbbrev: 'SNOHF', parameterUnits: 'W m-2'},
    17: {parameterName: 'Skin Temperature', parameterAbbrev: 'SKINT', parameterUnits: 'K'},
    18: {parameterName: 'Snow Temperature (top of snow)', parameterAbbrev: 'SNOT', parameterUnits: 'K'},
    19: {parameterName: 'Turbulent Transfer Coefficient for Heat', parameterAbbrev: 'TTCHT', parameterUnits: ''},
    20: {parameterName: 'Turbulent Diffusion Coefficient for Heat', parameterAbbrev: 'TDCHT', parameterUnits: 'm2s-1'},
    21: {parameterName: 'Apparent Temperature', parameterAbbrev: 'APTMP', parameterUnits: 'K'},
    22: {parameterName: 'Temperature Tendency due to Short-Wave Radiation', parameterAbbrev: 'TTSWR', parameterUnits: 'K s-1'},
    23: {parameterName: 'Temperature Tendency due to Long-Wave Radiation', parameterAbbrev: 'TTLWR', parameterUnits: 'K s-1'},
    24: {parameterName: 'Temperature Tendency due to Short-Wave Radiation, Clear Sky', parameterAbbrev: 'TTSWRCS', parameterUnits: 'K s-1'},
    25: {parameterName: 'Temperature Tendency due to Long-Wave Radiation, Clear Sky', parameterAbbrev: 'TTLWRCS', parameterUnits: 'K s-1'},
    26: {parameterName: 'Temperature Tendency due to parameterizations', parameterAbbrev: 'TTPARM', parameterUnits: 'K s-1'},
    27: {parameterName: 'Wet Bulb Temperature', parameterAbbrev: 'WETBT', parameterUnits: 'K'},
    28: {parameterName: 'Unbalanced Component of Temperature', parameterAbbrev: 'UCTMP', parameterUnits: 'K'},
    29: {parameterName: 'Temperature Advection', parameterAbbrev: 'TMPADV', parameterUnits: 'K s-1'},
    30: {parameterName: 'Latent Heat Net Flux Due to Evaporation', parameterAbbrev: 'LHFLXE', parameterUnits: 'W m-2'},
    31: {parameterName: 'Latent Heat Net Flux Due to Sublimation', parameterAbbrev: 'LHFLXS', parameterUnits: 'W m-2'},
    32: {parameterName: 'Wet-Bulb Potential Temperature', parameterAbbrev: 'WETBPT', parameterUnits: 'K'},
    192: {parameterName: 'Snow Phase Change Heat Flux', parameterAbbrev: 'SNOHF', parameterUnits: 'W m-2'},
    193: {parameterName: 'Temperature Tendency by All Radiation', parameterAbbrev: 'TTRAD', parameterUnits: 'K s-1'},
    194: {parameterName: 'Relative Error Variance', parameterAbbrev: 'REV', parameterUnits: ''},
    195: {parameterName: 'Large Scale Condensate Heating Rate', parameterAbbrev: 'LRGHR', parameterUnits: 'K s-1'},
    196: {parameterName: 'Deep Convective Heating Rate', parameterAbbrev: 'CNVHR', parameterUnits: 'K s-1'},
    197: {parameterName: 'Total Downward Heat Flux at Surface', parameterAbbrev: 'THFLX', parameterUnits: 'W m-2'},
    198: {parameterName: 'Temperature Tendency by All Physics', parameterAbbrev: 'TTDIA', parameterUnits: 'K s-1'},
    199: {parameterName: 'Temperature Tendency by Non-radiation Physics', parameterAbbrev: 'TTPHY', parameterUnits: 'K s-1'},
    200: {parameterName: 'Standard Dev. of IR Temp. over 1x1 deg. area', parameterAbbrev: 'TSD1D', parameterUnits: 'K'},
    201: {parameterName: 'Shallow Convective Heating Rate', parameterAbbrev: 'SHAHR', parameterUnits: 'K s-1'},
    202: {parameterName: 'Vertical Diffusion Heating rate', parameterAbbrev: 'VDFHR', parameterUnits: 'K s-1'},
    203: {parameterName: 'Potential Temperature at Top of Viscous Sublayer', parameterAbbrev: 'THZ0', parameterUnits: 'K'},
    204: {parameterName: 'Tropical Cyclone Heat Potential', parameterAbbrev: 'TCHP', parameterUnits: 'Jm-2K'},
    205: {parameterName: 'Effective Layer (EL) Temperature', parameterAbbrev: 'ELMELT', parameterUnits: 'C'},
    206: {parameterName: 'Wet Bulb Globe Temperature', parameterAbbrev: 'WETGLBT', parameterUnits: 'K'},
}

const moisture_parameters: Grib2CodeTable = {
    0: {parameterName: 'Specific Humidity', parameterAbbrev: 'SPFH', parameterUnits: 'kg kg-1'},
    1: {parameterName: 'Relative Humidity', parameterAbbrev: 'RH', parameterUnits: '%'},
    2: {parameterName: 'Humidity Mixing Ratio', parameterAbbrev: 'MIXR', parameterUnits: 'kg kg-1'},
    3: {parameterName: 'Precipitable Water', parameterAbbrev: 'PWAT', parameterUnits: 'kg m-2'},
    4: {parameterName: 'Vapour Pressure', parameterAbbrev: 'VAPP', parameterUnits: 'Pa'},
    5: {parameterName: 'Saturation Deficit', parameterAbbrev: 'SATD', parameterUnits: 'Pa'},
    6: {parameterName: 'Evaporation', parameterAbbrev: 'EVP', parameterUnits: 'kg m-2'},
    7: {parameterName: 'Precipitation Rate *', parameterAbbrev: 'PRATE', parameterUnits: 'kg m-2 s-1'},
    8: {parameterName: 'Total Precipitation ***', parameterAbbrev: 'APCP', parameterUnits: 'kg m-2'},
    9: {parameterName: 'Large-Scale Precipitation (non-convective) ***', parameterAbbrev: 'NCPCP', parameterUnits: 'kg m-2'},
    10: {parameterName: 'Convective Precipitation ***', parameterAbbrev: 'ACPCP', parameterUnits: 'kg m-2'},
    11: {parameterName: 'Snow Depth', parameterAbbrev: 'SNOD', parameterUnits: 'm'},
    12: {parameterName: 'Snowfall Rate Water Equivalent *', parameterAbbrev: 'SRWEQ', parameterUnits: 'kg m-2 s-1'},
    13: {parameterName: 'Water Equivalent of Accumulated Snow Depth ***', parameterAbbrev: 'WEASD', parameterUnits: 'kg m-2'},
    14: {parameterName: 'Convective Snow ***', parameterAbbrev: 'SNOC', parameterUnits: 'kg m-2'},
    15: {parameterName: 'Large-Scale Snow ***', parameterAbbrev: 'SNOL', parameterUnits: 'kg m-2'},
    16: {parameterName: 'Snow Melt', parameterAbbrev: 'SNOM', parameterUnits: 'kg m-2'},
    17: {parameterName: 'Snow Age', parameterAbbrev: 'SNOAG', parameterUnits: 'day'},
    18: {parameterName: 'Absolute Humidity', parameterAbbrev: 'ABSH', parameterUnits: 'kg m-3'},
    19: {parameterName: 'Precipitation Type', parameterAbbrev: 'PTYPE', parameterUnits: 'See Table 4.201'},
    20: {parameterName: 'Integrated Liquid Water', parameterAbbrev: 'ILIQW', parameterUnits: 'kg m-2'},
    21: {parameterName: 'Condensate', parameterAbbrev: 'TCOND', parameterUnits: 'kg kg-1'},
    22: {parameterName: 'Cloud Mixing Ratio', parameterAbbrev: 'CLMR', parameterUnits: 'kg kg-1'},
    23: {parameterName: 'Ice Water Mixing Ratio', parameterAbbrev: 'ICMR', parameterUnits: 'kg kg-1'},
    24: {parameterName: 'Rain Mixing Ratio', parameterAbbrev: 'RWMR', parameterUnits: 'kg kg-1'},
    25: {parameterName: 'Snow Mixing Ratio', parameterAbbrev: 'SNMR', parameterUnits: 'kg kg-1'},
    26: {parameterName: 'Horizontal Moisture Convergence', parameterAbbrev: 'MCONV', parameterUnits: 'kg kg-1 s-1'},
    27: {parameterName: 'Maximum Relative Humidity *', parameterAbbrev: 'MAXRH', parameterUnits: '%'},
    28: {parameterName: 'Maximum Absolute Humidity *', parameterAbbrev: 'MAXAH', parameterUnits: 'kg m-3'},
    29: {parameterName: 'Total Snowfall ***', parameterAbbrev: 'ASNOW', parameterUnits: 'm'},
    30: {parameterName: 'Precipitable Water Category', parameterAbbrev: 'PWCAT', parameterUnits: 'See Table 4.202'},
    31: {parameterName: 'Hail', parameterAbbrev: 'HAIL', parameterUnits: 'm'},
    32: {parameterName: 'Graupel', parameterAbbrev: 'GRLE', parameterUnits: 'kg kg-1'},
    33: {parameterName: 'Categorical Rain', parameterAbbrev: 'CRAIN', parameterUnits: 'Code table 4.222'},
    34: {parameterName: 'Categorical Freezing Rain', parameterAbbrev: 'CFRZR', parameterUnits: 'Code table 4.222'},
    35: {parameterName: 'Categorical Ice Pellets', parameterAbbrev: 'CICEP', parameterUnits: 'Code table 4.222'},
    36: {parameterName: 'Categorical Snow', parameterAbbrev: 'CSNOW', parameterUnits: 'Code table 4.222'},
    37: {parameterName: 'Convective Precipitation Rate', parameterAbbrev: 'CPRAT', parameterUnits: 'kg m-2 s-1'},
    38: {parameterName: 'Horizontal Moisture Divergence', parameterAbbrev: 'MDIVER', parameterUnits: 'kg kg-1 s-1'},
    39: {parameterName: 'Percent frozen precipitation', parameterAbbrev: 'CPOFP', parameterUnits: '%'},
    40: {parameterName: 'Potential Evaporation', parameterAbbrev: 'PEVAP', parameterUnits: 'kg m-2'},
    41: {parameterName: 'Potential Evaporation Rate', parameterAbbrev: 'PEVPR', parameterUnits: 'W m-2'},
    42: {parameterName: 'Snow Cover', parameterAbbrev: 'SNOWC', parameterUnits: '%'},
    43: {parameterName: 'Rain Fraction of Total Cloud Water', parameterAbbrev: 'FRAIN', parameterUnits: 'Proportion'},
    44: {parameterName: 'Rime Factor', parameterAbbrev: 'RIME', parameterUnits: 'Unitless'},
    45: {parameterName: 'Total Column Integrated Rain', parameterAbbrev: 'TCOLR', parameterUnits: 'kg m-2'},
    46: {parameterName: 'Total Column Integrated Snow', parameterAbbrev: 'TCOLS', parameterUnits: 'kg m-2'},
    47: {parameterName: 'Large Scale Water Precipitation (Non-Convective) ***', parameterAbbrev: 'LSWP', parameterUnits: 'kg m-2'},
    48: {parameterName: 'Convective Water Precipitation ***', parameterAbbrev: 'CWP', parameterUnits: 'kg m-2'},
    49: {parameterName: 'Total Water Precipitation ***', parameterAbbrev: 'TWATP', parameterUnits: 'kg m-2'},
    50: {parameterName: 'Total Snow Precipitation ***', parameterAbbrev: 'TSNOWP', parameterUnits: 'kg m-2'},
    51: {parameterName: 'Total Column Water (Vertically integrated total water (vapour+cloud water/ice)', parameterAbbrev: 'TCWAT', parameterUnits: 'kg m-2'},
    52: {parameterName: 'Total Precipitation Rate **', parameterAbbrev: 'TPRATE', parameterUnits: 'kg m-2 s-1'},
    53: {parameterName: 'Total Snowfall Rate Water Equivalent **', parameterAbbrev: 'TSRWE', parameterUnits: 'kg m-2 s-1'},
    54: {parameterName: 'Large Scale Precipitation Rate', parameterAbbrev: 'LSPRATE', parameterUnits: 'kg m-2 s-1'},
    55: {parameterName: 'Convective Snowfall Rate Water Equivalent', parameterAbbrev: 'CSRWE', parameterUnits: 'kg m-2 s-1'},
    56: {parameterName: 'Large Scale Snowfall Rate Water Equivalent', parameterAbbrev: 'LSSRWE', parameterUnits: 'kg m-2 s-1'},
    57: {parameterName: 'Total Snowfall Rate', parameterAbbrev: 'TSRATE', parameterUnits: 'm s-1'},
    58: {parameterName: 'Convective Snowfall Rate', parameterAbbrev: 'CSRATE', parameterUnits: 'm s-1'},
    59: {parameterName: 'Large Scale Snowfall Rate', parameterAbbrev: 'LSSRATE', parameterUnits: 'm s-1'},
    60: {parameterName: 'Snow Depth Water Equivalent', parameterAbbrev: 'SDWE', parameterUnits: 'kg m-2'},
    61: {parameterName: 'Snow Density', parameterAbbrev: 'SDEN', parameterUnits: 'kg m-3'},
    62: {parameterName: 'Snow Evaporation', parameterAbbrev: 'SEVAP', parameterUnits: 'kg m-2'},
    64: {parameterName: 'Total Column Integrated Water Vapour', parameterAbbrev: 'TCIWV', parameterUnits: 'kg m-2'},
    65: {parameterName: 'Rain Precipitation Rate', parameterAbbrev: 'RPRATE', parameterUnits: 'kg m-2 s-1'},
    66: {parameterName: 'Snow Precipitation Rate', parameterAbbrev: 'SPRATE', parameterUnits: 'kg m-2 s-1'},
    67: {parameterName: 'Freezing Rain Precipitation Rate', parameterAbbrev: 'FPRATE', parameterUnits: 'kg m-2 s-1'},
    68: {parameterName: 'Ice Pellets Precipitation Rate', parameterAbbrev: 'IPRATE', parameterUnits: 'kg m-2 s-1'},
    69: {parameterName: 'Total Column Integrate Cloud Water', parameterAbbrev: 'TCOLW', parameterUnits: 'kg m-2'},
    70: {parameterName: 'Total Column Integrate Cloud Ice', parameterAbbrev: 'TCOLI', parameterUnits: 'kg m-2'},
    71: {parameterName: 'Hail Mixing Ratio', parameterAbbrev: 'HAILMXR', parameterUnits: 'kg kg-1'},
    72: {parameterName: 'Total Column Integrate Hail', parameterAbbrev: 'TCOLH', parameterUnits: 'kg m-2'},
    73: {parameterName: 'Hail Prepitation Rate', parameterAbbrev: 'HAILPR', parameterUnits: 'kg m-2 s-1'},
    74: {parameterName: 'Total Column Integrate Graupel', parameterAbbrev: 'TCOLG', parameterUnits: 'kg m-2'},
    75: {parameterName: 'Graupel (Snow Pellets) Prepitation Rate', parameterAbbrev: 'GPRATE', parameterUnits: 'kg m-2 s-1'},
    76: {parameterName: 'Convective Rain Rate', parameterAbbrev: 'CRRATE', parameterUnits: 'kg m-2 s-1'},
    77: {parameterName: 'Large Scale Rain Rate', parameterAbbrev: 'LSRRATE', parameterUnits: 'kg m-2 s-1'},
    78: {parameterName: 'Total Column Integrate Water (All components including precipitation)', parameterAbbrev: 'TCOLWA', parameterUnits: 'kg m-2'},
    79: {parameterName: 'Evaporation Rate', parameterAbbrev: 'EVARATE', parameterUnits: 'kg m-2 s-1'},
    80: {parameterName: 'Total Condensate', parameterAbbrev: 'TOTCON', parameterUnits: 'kg kg-1'},
    81: {parameterName: 'Total Column-Integrate Condensate', parameterAbbrev: 'TCICON', parameterUnits: 'kg m-2'},
    82: {parameterName: 'Cloud Ice Mixing Ratio', parameterAbbrev: 'CIMIXR', parameterUnits: 'kg kg-1'},
    83: {parameterName: 'Specific Cloud Liquid Water Content', parameterAbbrev: 'SCLLWC', parameterUnits: 'kg kg-1'},
    84: {parameterName: 'Specific Cloud Ice Water Content', parameterAbbrev: 'SCLIWC', parameterUnits: 'kg kg-1'},
    85: {parameterName: 'Specific Rain Water Content', parameterAbbrev: 'SRAINW', parameterUnits: 'kg kg-1'},
    86: {parameterName: 'Specific Snow Water Content', parameterAbbrev: 'SSNOWW', parameterUnits: 'kg kg-1'},
    87: {parameterName: 'Stratiform Precipitation Rate', parameterAbbrev: 'STRPRATE', parameterUnits: 'kg m-2 s-1'},
    88: {parameterName: 'Categorical Convective Precipitation', parameterAbbrev: 'CATCP', parameterUnits: 'Code table 4.222'},
    90: {parameterName: 'Total Kinematic Moisture Flux', parameterAbbrev: 'TKMFLX', parameterUnits: 'kg kg-1 m s-1'},
    91: {parameterName: 'U-component (zonal) Kinematic Moisture Flux', parameterAbbrev: 'UKMFLX', parameterUnits: 'kg kg-1 m s-1'},
    92: {parameterName: 'V-component (meridional) Kinematic Moisture Flux', parameterAbbrev: 'VKMFLX', parameterUnits: 'kg kg-1 m s-1'},
    93: {parameterName: 'Relative Humidity With Respect to Water', parameterAbbrev: 'RHWATER', parameterUnits: '%'},
    94: {parameterName: 'Relative Humidity With Respect to Ice', parameterAbbrev: 'RHICE', parameterUnits: '%'},
    95: {parameterName: 'Freezing or Frozen Precipitation Rate', parameterAbbrev: 'FZPRATE', parameterUnits: 'kg m-2 s-1'},
    96: {parameterName: 'Mass Density of Rain', parameterAbbrev: 'MASSDR', parameterUnits: 'kg m-3'},
    97: {parameterName: 'Mass Density of Snow', parameterAbbrev: 'MASSDS', parameterUnits: 'kg m-3'},
    98: {parameterName: 'Mass Density of Graupel', parameterAbbrev: 'MASSDG', parameterUnits: 'kg m-3'},
    99: {parameterName: 'Mass Density of Hail', parameterAbbrev: 'MASSDH', parameterUnits: 'kg m-3'},
    100: {parameterName: 'Specific Number Concentration of Rain', parameterAbbrev: 'SPNCR', parameterUnits: 'kg-1'},
    101: {parameterName: 'Specific Number Concentration of Snow', parameterAbbrev: 'SPNCS', parameterUnits: 'kg-1'},
    102: {parameterName: 'Specific Number Concentration of Graupel', parameterAbbrev: 'SPNCG', parameterUnits: 'kg-1'},
    103: {parameterName: 'Specific Number Concentration of Hail', parameterAbbrev: 'SPNCH', parameterUnits: 'kg-1'},
    104: {parameterName: 'Number Density of Rain', parameterAbbrev: 'NUMDR', parameterUnits: 'm-3'},
    105: {parameterName: 'Number Density of Snow', parameterAbbrev: 'NUMDS', parameterUnits: 'm-3'},
    106: {parameterName: 'Number Density of Graupel', parameterAbbrev: 'NUMDG', parameterUnits: 'm-3'},
    107: {parameterName: 'Number Density of Hail', parameterAbbrev: 'NUMDH', parameterUnits: 'm-3'},
    108: {parameterName: 'Specific Humidity Tendency due to Parameterizations', parameterAbbrev: 'SHTPRM', parameterUnits: 'kg kg-1 s-1'},
    109: {parameterName: 'Mass Density of Liquid Water Coating on Hail Expressed as Mass of Liquid Water per Unit Volume of Air', parameterAbbrev: 'MDLWHVA', parameterUnits: 'kg m-3'},
    110: {parameterName: 'Specific Mass of Liquid Water Coating on Hail Expressed as Mass of Liquid Water per Unit Mass of Moist Air', parameterAbbrev: 'SMLWHMA', parameterUnits: 'kg kg-1'},
    111: {parameterName: 'Mass Mixing Ratio of Liquid Water Coating on Hail Expressed as Mass of Liquid Water per Unit Mass of Dry Air', parameterAbbrev: 'MMLWHDA', parameterUnits: 'kg kg-1'},
    112: {parameterName: 'Mass Density of Liquid Water Coating on Graupel Expressed as Mass of Liquid Water per Unit Volume of Air', parameterAbbrev: 'MDLWGVA', parameterUnits: 'kg m-3'},
    113: {parameterName: 'Specific Mass of Liquid Water Coating on Graupel Expressed as Mass of Liquid Water per Unit Mass of Moist Air', parameterAbbrev: 'SMLWGMA', parameterUnits: 'kg kg-1'},
    114: {parameterName: 'Mass Mixing Ratio of Liquid Water Coating on Graupel Expressed as Mass of Liquid Water per Unit Mass of Dry Air', parameterAbbrev: 'MMLWGDA', parameterUnits: 'kg kg-1'},
    115: {parameterName: 'Mass Density of Liquid Water Coating on Snow Expressed as Mass of Liquid Water per Unit Volume of Air', parameterAbbrev: 'MDLWSVA', parameterUnits: 'kg m-3'},
    116: {parameterName: 'Specific Mass of Liquid Water Coating on Snow Expressed as Mass of Liquid Water per Unit Mass of Moist Air', parameterAbbrev: 'SMLWSMA', parameterUnits: 'kg kg-1'},
    117: {parameterName: 'Mass Mixing Ratio of Liquid Water Coating on Snow Expressed as Mass of Liquid Water per Unit Mass of Dry Air', parameterAbbrev: 'MMLWSDA', parameterUnits: 'kg kg-1'},
    118: {parameterName: 'Unbalanced Component of Specific Humidity', parameterAbbrev: 'UNCSH', parameterUnits: 'kg kg-1'},
    119: {parameterName: 'Unbalanced Component of Specific Cloud Liquid Water content', parameterAbbrev: 'UCSCLW', parameterUnits: 'kg kg-1'},
    120: {parameterName: 'Unbalanced Component of Specific Cloud Ice Water content', parameterAbbrev: 'UCSCIW', parameterUnits: 'kg kg-1'},
    121: {parameterName: 'Fraction of Snow Cover', parameterAbbrev: 'FSNOWC', parameterUnits: 'Proportion'},
    122: {parameterName: 'Precipitation intensity index', parameterAbbrev: 'PIIDX', parameterUnits: 'See Table 4.247'},
    123: {parameterName: 'Dominant precipitation type', parameterAbbrev: 'DPTYPE', parameterUnits: 'See Table 4.201'},
    124: {parameterName: 'Presence of showers', parameterAbbrev: 'PSHOW', parameterUnits: 'See Table 4.222'},
    125: {parameterName: 'Presence of blowing snow', parameterAbbrev: 'PBSNOW', parameterUnits: 'See Table 4.222'},
    126: {parameterName: 'Presence of blizzard', parameterAbbrev: 'PBLIZZ', parameterUnits: 'See Table 4.222'},
    127: {parameterName: 'Ice pellets (non-water equivalent) precipitation rate', parameterAbbrev: 'ICEP', parameterUnits: 'm s-1'},
    128: {parameterName: 'Total solid precipitation rate', parameterAbbrev: 'TSPRATE', parameterUnits: 'kg m-2 s-1'},
    129: {parameterName: 'Effective radius of cloud water', parameterAbbrev: 'ERADCW', parameterUnits: 'm'},
    130: {parameterName: 'Effective radius of rain', parameterAbbrev: 'ERADRAIN', parameterUnits: 'm'},
    131: {parameterName: 'Effective radius of cloud ice', parameterAbbrev: 'ERADCICE', parameterUnits: 'm'},
    132: {parameterName: 'Effective radius of snow', parameterAbbrev: 'ERADSNOW', parameterUnits: 'm'},
    133: {parameterName: 'Effective radius of graupel', parameterAbbrev: 'ERADGRL', parameterUnits: 'm'},
    134: {parameterName: 'Effective radius of hail', parameterAbbrev: 'ERADHAIL', parameterUnits: 'm'},
    135: {parameterName: 'Effective radius of subgrid liquid clouds', parameterAbbrev: 'ERADSLC', parameterUnits: 'm'},
    136: {parameterName: 'Effective radius of subgrid ice clouds', parameterAbbrev: 'ERADSIC', parameterUnits: 'm'},
    137: {parameterName: 'Effective aspect ratio of rain', parameterAbbrev: 'ERATIOR', parameterUnits: 'unitless'},
    138: {parameterName: 'Effective aspect ratio of cloud ice', parameterAbbrev: 'ERATIOCI', parameterUnits: 'unitless'},
    139: {parameterName: 'Effective aspect ratio of snow', parameterAbbrev: 'ERATIOS', parameterUnits: 'unitless'},
    140: {parameterName: 'Effective aspect ratio of graupel', parameterAbbrev: 'ERATIOG', parameterUnits: 'unitless'},
    141: {parameterName: 'Effective aspect ratio of hail', parameterAbbrev: 'ERATIOH', parameterUnits: 'unitless'},
    142: {parameterName: 'Effective ratio of subgrid ice clouds', parameterAbbrev: 'ERATOSIC', parameterUnits: 'unitless'},
    143: {parameterName: 'Potential evaporation rate', parameterAbbrev: 'PERATE', parameterUnits: 'kg m-2 s-1'},
    144: {parameterName: 'Specific rain water content (convective)', parameterAbbrev: 'SRWATERC', parameterUnits: 'kg kg-1'},
    145: {parameterName: 'Specific snow water content (convective)', parameterAbbrev: 'SSNOWWC', parameterUnits: 'kg kg-1'},
    146: {parameterName: 'Cloud ice precipitation rate', parameterAbbrev: 'CICEPR', parameterUnits: 'kg m-2 s-1'},
    147: {parameterName: 'Character of precipitation', parameterAbbrev: 'PERATE', parameterUnits: 'See Table 4.249'},
    148: {parameterName: 'Snow evaporation rate (see Note 9)', parameterAbbrev: 'SNOWERAT', parameterUnits: 'kg m-2 s-1'},
    149: {parameterName: 'Cloud water mixing ratio', parameterAbbrev: 'CWATERMR', parameterUnits: 'kg kg-1'},
    192: {parameterName: 'Categorical Rain', parameterAbbrev: 'CRAIN', parameterUnits: 'Code table 4.222'},
    193: {parameterName: 'Categorical Freezing Rain', parameterAbbrev: 'CFRZR', parameterUnits: 'Code table 4.222'},
    194: {parameterName: 'Categorical Ice Pellets', parameterAbbrev: 'CICEP', parameterUnits: 'Code table 4.222'},
    195: {parameterName: 'Categorical Snow', parameterAbbrev: 'CSNOW', parameterUnits: 'Code table 4.222'},
    196: {parameterName: 'Convective Precipitation Rate', parameterAbbrev: 'CPRAT', parameterUnits: 'kg m-2 s-1'},
    197: {parameterName: 'Horizontal Moisture Divergence', parameterAbbrev: 'MDIV', parameterUnits: 'kg kg-1 s-1'},
    198: {parameterName: 'Minimum Relative Humidity', parameterAbbrev: 'MINRH', parameterUnits: '%'},
    199: {parameterName: 'Potential Evaporation', parameterAbbrev: 'PEVAP', parameterUnits: 'kg m-2'},
    200: {parameterName: 'Potential Evaporation Rate', parameterAbbrev: 'PEVPR', parameterUnits: 'W m-2'},
    201: {parameterName: 'Snow Cover', parameterAbbrev: 'SNOWC', parameterUnits: '%'},
    202: {parameterName: 'Rain Fraction of Total Liquid Water', parameterAbbrev: 'FRAIN', parameterUnits: 'non-dim'},
    203: {parameterName: 'Rime Factor', parameterAbbrev: 'RIME', parameterUnits: 'non-dim'},
    204: {parameterName: 'Total Column Integrated Rain', parameterAbbrev: 'TCOLR', parameterUnits: 'kg m-2'},
    205: {parameterName: 'Total Column Integrated Snow', parameterAbbrev: 'TCOLS', parameterUnits: 'kg m-2'},
    206: {parameterName: 'Total Icing Potential Diagnostic', parameterAbbrev: 'TIPD', parameterUnits: 'non-dim'},
    207: {parameterName: 'Number concentration for ice particles', parameterAbbrev: 'NCIP', parameterUnits: 'non-dim'},
    208: {parameterName: 'Snow temperature', parameterAbbrev: 'SNOT', parameterUnits: 'K'},
    209: {parameterName: 'Total column-integrated supercooled liquid water', parameterAbbrev: 'TCLSW', parameterUnits: 'kg m-2'},
    210: {parameterName: 'Total column-integrated melting ice', parameterAbbrev: 'TCOLM', parameterUnits: 'kg m-2'},
    211: {parameterName: 'Evaporation - Precipitation', parameterAbbrev: 'EMNP', parameterUnits: 'cm/day'},
    212: {parameterName: 'Sublimation (evaporation from snow)', parameterAbbrev: 'SBSNO', parameterUnits: 'W m-2'},
    213: {parameterName: 'Deep Convective Moistening Rate', parameterAbbrev: 'CNVMR', parameterUnits: 'kg kg-1 s-1'},
    214: {parameterName: 'Shallow Convective Moistening Rate', parameterAbbrev: 'SHAMR', parameterUnits: 'kg kg-1 s-1'},
    215: {parameterName: 'Vertical Diffusion Moistening Rate', parameterAbbrev: 'VDFMR', parameterUnits: 'kg kg-1 s-1'},
    216: {parameterName: 'Condensation Pressure of Parcel Lifted From Indicate Surface', parameterAbbrev: 'CONDP', parameterUnits: 'Pa'},
    217: {parameterName: 'Large scale moistening rate', parameterAbbrev: 'LRGMR', parameterUnits: 'kg kg-1 s-1'},
    218: {parameterName: 'Specific humidity at top of viscous sublayer', parameterAbbrev: 'QZ0', parameterUnits: 'kg kg-1'},
    219: {parameterName: 'Maximum specific humidity at 2m', parameterAbbrev: 'QMAX', parameterUnits: 'kg kg-1'},
    220: {parameterName: 'Minimum specific humidity at 2m', parameterAbbrev: 'QMIN', parameterUnits: 'kg kg-1'},
    221: {parameterName: 'Liquid precipitation (Rainfall)', parameterAbbrev: 'ARAIN', parameterUnits: 'kg m-2'},
    222: {parameterName: 'Snow temperature, depth-avg', parameterAbbrev: 'SNOWT', parameterUnits: 'K'},
    223: {parameterName: 'Total precipitation (nearest grid point)', parameterAbbrev: 'APCPN', parameterUnits: 'kg m-2'},
    224: {parameterName: 'Convective precipitation (nearest grid point)', parameterAbbrev: 'ACPCPN', parameterUnits: 'kg m-2'},
    225: {parameterName: 'Freezing Rain', parameterAbbrev: 'FRZR', parameterUnits: 'kg m-2'},
    226: {parameterName: 'Predominant Weather (see Note 1)', parameterAbbrev: 'PWTHER', parameterUnits: 'Numeric'},
    227: {parameterName: 'Frozen Rain', parameterAbbrev: 'FROZR', parameterUnits: 'kg m-2'},
    228: {parameterName: 'Flat Ice Accumulation (FRAM)', parameterAbbrev: 'FICEAC', parameterUnits: 'kg m-2'},
    229: {parameterName: 'Line Ice Accumulation (FRAM)', parameterAbbrev: 'LICEAC', parameterUnits: 'kg m-2'},
    230: {parameterName: 'Sleet Accumulation', parameterAbbrev: 'SLACC', parameterUnits: 'kg m-2'},
    231: {parameterName: 'Precipitation Potential Index', parameterAbbrev: 'PPINDX', parameterUnits: '%'},
    232: {parameterName: 'Probability Cloud Ice Present', parameterAbbrev: 'PROBCIP', parameterUnits: '%'},
    233: {parameterName: 'Snow Liquid ratio', parameterAbbrev: 'SNOWLR', parameterUnits: 'kg kg-1'},
    234: {parameterName: 'Precipitation Duration', parameterAbbrev: 'PCPDUR', parameterUnits: 'hour'},
    235: {parameterName: 'Cloud Liquid Mixing Ratio', parameterAbbrev: 'CLLMR', parameterUnits: 'kg kg-1'},
    241: {parameterName: 'Total Snow', parameterAbbrev: 'TSNOW', parameterUnits: 'kg m-2'},
    242: {parameterName: 'Relative Humidity with Respect to Precipitable Water', parameterAbbrev: 'RHPW', parameterUnits: '%'},
    245: {parameterName: 'Hourly Maximum of Column Vertical Integrated Graupel on Entire Atmosphere', parameterAbbrev: 'MAXVIG', parameterUnits: 'kg m-2'},
}

const meteorological_parameters: Grib2DisciplineCodeTable = {
    0: temperature_parameters,
    1: moisture_parameters,
}

const grib_parameter_lookup: Record<number, Grib2DisciplineCodeTable> = {
    0: meteorological_parameters
}

function lookupGrib2Parameter(discipline: number, parameter_category: number, parameter_number: number) {
    const unknown_parameter = {parameterName: 'unknown', parameterAbbrev: 'unknown', parameterUnits: 'unknown'} as Grib2ProductTableEntry;

    const discipline_table = grib_parameter_lookup[discipline];
    if (discipline_table === undefined) {
        return unknown_parameter;
    }

    const category_table = discipline_table[parameter_category];
    if (category_table === undefined) {
        return unknown_parameter;
    }

    const parameter = category_table[parameter_number];
    if (parameter === undefined) {
        return unknown_parameter;
    }

    return parameter;
}

export {lookupGrib2Parameter};