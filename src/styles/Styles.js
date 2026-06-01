import { Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');

export const Styles = (theme) => ({
    white_bg: {
        backgroundColor: theme.white,
    },
    appTheme_bg: {
        backgroundColor: theme.appTheme,
    },
    appThemeRed: {
        backgroundColor: theme.themeRed,
    },
    themeRed300: {
        backgroundColor: theme.themeRed300,
    },
    gray300bg: {
        backgroundColor: theme.gray300,
    },
    lightGrey: {
        backgroundColor: theme.lightGrey,
    },
    grayButton: {
        backgroundColor: theme.grayBtn,
    },
    transparent_black_bg: {
        backgroundColor: theme.blackTransparent
    },
    textColorWhite: {
        color: theme.white
    },
    textColorBlack: {
        color: theme.black
    },
    textColorRed: {
        color: theme.themeRed
    },
    textColorLightGray: {
        color: theme.lightGrey
    },
    textColor_lightOrenge: {
        color: theme.lightOrenge
    },
    verifyOTPTextColor: {
        color: theme.verifyOTPText
    },
    full_height: {
        height: height,
    },
    full_width: {
        width: width,
    },

    // Heights from 0 to 200
    ...Array.from({ length: 401 }, (_, i) => ({
        [`height_${i}`]: { height: i }
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    // Widths from 0 to 400
    ...Array.from({ length: 401 }, (_, i) => ({
        [`width_${i}`]: { width: i }
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    // Bottom Space from 0 to 100
    ...Array.from({ length: 101 }, (_, i) => ({
        [`bottom_${i}`]: { width: i }
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    // Top Space from 0 to 100
    ...Array.from({ length: 101 }, (_, i) => ({
        [`top_${i}`]: { width: i }
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    // Left Space from 0 to 100
    ...Array.from({ length: 101 }, (_, i) => ({
        [`left_${i}`]: { width: i }
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    // Right Space from 0 to 100
    ...Array.from({ length: 101 }, (_, i) => ({
        [`right_${i}`]: { width: i }
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    // Margins from 0 to 200
    ...Array.from({ length: 201 }, (_, i) => ({
        [`margin_${i}`]: { margin: i },
        [`marginTop_${i}`]: { marginTop: i },
        [`marginBottom_${i}`]: { marginBottom: i },
        [`marginLeft_${i}`]: { marginLeft: i },
        [`marginRight_${i}`]: { marginRight: i },
        [`marginY_${i}`]: { marginRight: i },
        [`marginX_${i}`]: { marginRight: i },
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    // Paddings from 0 to 200
    ...Array.from({ length: 201 }, (_, i) => ({
        [`padding_${i}`]: { padding: i },
        [`paddingTop_${i}`]: { paddingTop: i },
        [`paddingBottom_${i}`]: { paddingBottom: i },
        [`paddingLeft_${i}`]: { paddingLeft: i },
        [`paddingRight_${i}`]: { paddingRight: i },
        [`paddingX_${i}`]: { paddingRight: i },
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    // Heights from 0% to 100% (in percentages)
    ...Array.from({ length: 101 }, (_, i) => ({
        [`heightPct_${i}`]: { height: `${i}%` }
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    // Widths from 0% to 100% (in percentages)
    ...Array.from({ length: 101 }, (_, i) => ({
        [`widthPct_${i}`]: { width: `${i}%` }
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    // Font Sizes from 0 to 100 (in pixels)
    ...Array.from({ length: 101 }, (_, i) => ({
        [`fontSize_${i}`]: { fontSize: i }
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    fontFamilyWeight: {
        fontWeight: '500'
    },
    textColor_green: {
        color: "green"
    },

    // Spaces from 0 to 100 (in pixels)
    ...Array.from({ length: 10 }, (_, i) => ({
        [`space_${i}`]: { fontSize: i }
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    // Spaces from 0 to 100 (in pixels)
    ...Array.from({ length: 20 }, (_, i) => ({
        [`borderRadius_${i}`]: { fontSize: i }
    })).reduce((acc, cur) => ({ ...acc, ...cur }), {}),

    centerItems: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center'
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    flexRow: {
        flexDirection: 'row',
    },
    flexColumn: {
        flexDirection: 'column',
    },
    alignItemsCenter: {
        alignItems: 'center'
    },
    textAlignCenter: {
        textAlign: 'center'
    },
    justifyContentCenter: {
        justifyContent: 'center',
    },
    justifyContentSpaceBetween: {
        justifyContent: "space-between"
    },
    alignSelfCenter: {
        alignSelf: 'center',
    },
    alignSelfEnd: {
        alignSelf: 'right',
    },
    alignItemsFlexEnd: {
        alignItems: 'flex-end'
    },

    // Shadow (with platform-specific adjustments)
    boxShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, // Shadow for Android (elevation)
    },

    // Flexbox properties
    flexFull: {
        flex: 1,
    },
    flexHalf: {
        flex: 0.5,
    },
    overFlowHidden: {
        overflow: 'hidden'
    },

    lineHeightText: {
        lineHeight: '20'
    },
    leftText: {
        left: '19'
    },
    rightText: {
        right: '5'

    },
    leftImage: {
        left: "5"
    },
    border_radius_image: {
        borderRadius: '10'
    },
    borderRadius_box: {
        borderRadius: 15
    },
    absolutePosition: {
        position: 'absolute'
    },
    relativePosition: {
        position: 'relative'
    }

});
