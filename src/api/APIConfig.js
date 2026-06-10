
export const FIREBASE_LOG = true;
// export const APP_ENV_PROD = true;
export let APP_ENV_PROD = false;
export const LOCAL_SERVER = '';


// Informational responses (1xx)
export const HTTP_CONTINUE = 100;
export const HTTP_SWITCHING_PROTOCOLS = 101;
export const HTTP_PROCESSING = 102;

// Successful responses (2xx)
export const HTTP_OK = 200;
export const HTTP_CREATED = 201;
export const HTTP_ACCEPTED = 202;
export const HTTP_NON_AUTHORITATIVE_INFORMATION = 203;
export const HTTP_NO_CONTENT = 204;
export const HTTP_RESET_CONTENT = 205;
export const HTTP_PARTIAL_CONTENT = 206;

// Redirection messages (3xx)
export const HTTP_MULTIPLE_CHOICES = 300;
export const HTTP_MOVED_PERMANENTLY = 301;
export const HTTP_FOUND = 302;
export const HTTP_SEE_OTHER = 303;
export const HTTP_NOT_MODIFIED = 304;
export const HTTP_USE_PROXY = 305;
export const HTTP_UNUSED = 306;
export const HTTP_TEMPORARY_REDIRECT = 307;
export const HTTP_PERMANENT_REDIRECT = 308;

// Client error responses (4xx)
export const HTTP_BAD_REQUEST = 400;
export const HTTP_UNAUTHORIZED = 401;
export const HTTP_PAYMENT_REQUIRED = 402;
export const HTTP_FORBIDDEN = 403;
export const HTTP_NOT_FOUND = 404;
export const HTTP_METHOD_NOT_ALLOWED = 405;
export const HTTP_NOT_ACCEPTABLE = 406;
export const HTTP_PROXY_AUTHENTICATION_REQUIRED = 407;
export const HTTP_REQUEST_TIMEOUT = 408;
export const HTTP_CONFLICT = 409;
export const HTTP_GONE = 410;
export const HTTP_LENGTH_REQUIRED = 411;
export const HTTP_PRECONDITION_FAILED = 412;
export const HTTP_PAYLOAD_TOO_LARGE = 413;
export const HTTP_URI_TOO_LONG = 414;
export const HTTP_UNSUPPORTED_MEDIA_TYPE = 415;
export const HTTP_RANGE_NOT_SATISFIABLE = 416;
export const HTTP_EXPECTATION_FAILED = 417;
export const HTTP_I_AM_A_TEAPOT = 418;
export const HTTP_MISDIRECTED_REQUEST = 421;
export const HTTP_UNPROCESSABLE_ENTITY = 422;
export const HTTP_LOCKED = 423;
export const HTTP_FAILED_DEPENDENCY = 424;
export const HTTP_UPGRADE_REQUIRED = 426;
export const HTTP_PRECONDITION_REQUIRED = 428;
export const HTTP_TOO_MANY_REQUESTS = 429;
export const HTTP_REQUEST_HEADER_FIELDS_TOO_LARGE = 431;
export const HTTP_UNAVAILABLE_FOR_LEGAL_REASONS = 451;

// Server error responses (5xx)
export const HTTP_INTERNAL_SERVER_ERROR = 500;
export const HTTP_NOT_IMPLEMENTED = 501;
export const HTTP_BAD_GATEWAY = 502;
export const HTTP_SERVICE_UNAVAILABLE = 503;
export const HTTP_GATEWAY_TIMEOUT = 504;
export const HTTP_HTTP_VERSION_NOT_SUPPORTED = 505;
export const HTTP_VARIANT_ALSO_NEGOTIATES = 506;
export const HTTP_INSUFFICIENT_STORAGE = 507;
export const HTTP_LOOP_DETECTED = 508;
export const HTTP_NOT_EXTENDED = 510;
export const HTTP_NETWORK_AUTHENTICATION_REQUIRED = 511;

export const SECOND_LOGIN = 103;
export const HTTP_601 = 601;

export const FIREBASE_VERSION_COLLECTION_NAME = "getAppVersion"
export const FIREBASE_VERSION_DOC_ID = "E1N0prNbFYMriEhZMuvI"
export const MAP_MY_INDIA_KEY = "5zf2txekry89tciw19sgmjpo7w133ioj";
export const MAP_MY_INDIA_URL = `https://apis.mapmyindia.com/advancedmaps/v1/${MAP_MY_INDIA_KEY}/rev_geocode`

//This is for SDK Purpose
export const setEnvironment = (buildType) => {
    APP_ENV_PROD = buildType === 'PROD';
    console.log('APP_ENV_PROD:', APP_ENV_PROD);
}

export default configs = {

     get BASE_URL_NVM() {
        return APP_ENV_PROD
            ? 'https://nvmretailpro.com:8443/rest/nsl/'
            : 'http://3.110.159.82:8080/vyapar_mitra/rest/nsl/';
    },

    get BASE_URL() {
        return APP_ENV_PROD
            ? 'https://subeejkisan.com:8443/rest/'
            : 'http://3.110.159.82:8080/subeejkisan/rest/';
    },

    ACCOUNT_CLOSE_URL: ({ mobileNumber, languageId, buttonColor }) => {
        const baseUrl = APP_ENV_PROD
            ? 'https://subeejkisan.com/'
            : 'http://subeejkisan.empover.com/';

        return `${baseUrl}accountClosure?mobileNumber=${mobileNumber}&languageId=${languageId}&buttonColor=${encodeURIComponent(buttonColor)}`;
    },

    // BASE_URL: APP_ENV_PROD ? 'https://subeejkisan.com:8443/rest/' : 'http://3.110.159.82:8080/subeejkisan/rest/',
    // BASE_URL_NVM: APP_ENV_PROD ? 'https://nvmretailpro.com:8443/rest/nsl/' : 'http://3.110.159.82:8080/vyapar_mitra/rest/nsl/',
    MANDI_PRICE_GET_MANDI_PRICE_AReport_V1: "mandiPrices/getMandiPricesAnalysisReport_V1",
    // ACCOUNT_CLOSE_URL: ({ mobileNumber, languageId, buttonColor }) => {
    //     const baseUrl = APP_ENV_PROD ? 'https://subeejkisan.com/' : 'http://subeejkisan.empover.com/';
    //     const url = `${baseUrl}accountClosure?mobileNumber=${mobileNumber}&languageId=${languageId}&buttonColor=${encodeURIComponent(buttonColor)}`;
    //     return url;
    // },



    AUTH: {
        GETONBOARDING: 'referral/getSplashScreens',
        GETLANGUAGES: 'referral/getAllLanguages',
        GETOTP: 'sendOTP_v2',
        // SIGNUPFORM: 'http://123.176.45.62:8080/FluxsensForms/api/forms/46fe2dd1-1831-47d7-afe2-bc560150ef90',
        SIGNUPFORM: 'http://3.110.159.82:8080/subeejkisan/rest/fluxForms/getFluxForms?formType=Registration',
        VALIDATEOTP: 'validateOTP_v2',
        validateSDKLogin: 'validateSubeejSDKAuthentication',
        SIGNUP: 'registerFarmer',
        UPDATEPROFILE: 'profileUpdateForFarmer_V1',
        CHART: "mandiPrices/getMandiPricesAnalysisReport",
        CHART_V1: "mandiPrices/getMandiPricesAnalysisReport_V1",
        REWARDS: "scan/getScanHistory",
        REFERRAL: "referral/getReferralLink",
        LOGOUT: "forceLogout",
        QRCODEGENUINITY: "scan/genuinityCheck",
        QRCODE: "geoTagging/scanSampleQRCodeDetailes",
        GETDETAILS: "mandiPrices/bookMarkDetailsForMandiCrop",
        BOOKMARKSAVE: "mandiPrices/bookMarkDetailsForMandiMarket"
    },
    MASTERS: {
        GETLANGUAGES: 'masters/getAllLanguagesForMobile',
        GETMANDIPRICES: 'mandiPrices/getMandiPrices',
        GETDASHBOARDDETAILS: 'users/getDashboardDetails',
        GETSTATEDISTRICTDETAILS: 'getMastersForSubeejKisan',
        RAISETICKET: 'addIssueDetails'
    },
    YIELDCALCULATION: {
        GETYIELDCALCULATIONFORMULAE: 'getCropCalculatorMasterData',
        SUBMITYC: 'syncCropCalculatorTransactionData'
    },
    KNOWLEDEGECENTER: {
        GETFABDETAILS: 'fab/getFABDetailsBasedOnCropandHybridAndSeason'
    },

    CALCULATOR: {
        // GETYIELDCALCULATOR: 'getYieldCalculator',
        // GETYIELDANDSEEDRATES: 'getYieldAndSeedRates',
        // GETTOTALSEEDREQUIREDKGPERPKT: 'getTotalSeedRequiredKgPerPkt',
        // GETEXPECTEDYIELDQTL: 'getExpectedYieldQtl',
        // geSeedAndPopulationCaculator: 'geSeedAndPopulationCaculator',
        // getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData: 'getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData',
        // getIdealPlantPopulationSeedRate: 'getIdealPlantPopulationSeedRate',


        // GETFERTILIZERCALCULATOR: 'getDropdownValuesForFertilizerCalculator',
        // getFertilizerDropdownValuesBySelectedData: 'getFertilizerDropdownValuesBySelectedData',
        GET_FERTILIZER_CALCULATOR_MASTER: "getFertilizerCalculatorMaster",
        GETYIELDCALCULATOR: 'getYieldCalculator',
        GETFERTILIZERCALCULATOR: 'getDropdownValuesForFertilizerCalculator',
        GETYIELDANDSEEDRATES: 'getYieldAndSeedRates',
        getFertilizerDropdownValuesBySelectedData: 'getFertilizerDropdownValuesBySelectedData',
        GETTOTALSEEDREQUIREDKGPERPKT: 'getTotalSeedRequiredKgPerPkt',
        GETEXPECTEDYIELDQTL: 'getExpectedYieldQtl',
        geSeedAndPopulationCaculator: 'geSeedAndPopulationCaculator',
        getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData: 'getIdealPlantpopulationAndSeedRateKgPerAcreBySelectedData',
        getIdealPlantPopulationSeedRate: 'getIdealPlantPopulationSeedRate',
        saveYieldCalculator: 'saveYieldCalculator',
        saveSeedAndPopulationCaculator: 'saveSeedAndPopulationCaculator',
    },
    CROPDIAGNOSTIC: {
        CROPDISEASEIDENTIFICATION: 'processCropDiseaseIdentification',
        CROPDIAGNOSTICHISTORY: 'CropDiseaseIdentificationHistory'
    },

    MANDRIPRICES: {
        GETSTATEDISTRICTDETAILS: 'getMastersForMandiPrices',
        GETMANDIPRICES: 'mandiPrices/getMandiPrices',
    },

    GETALLCOMPANIES: "nsl/masters/getAllCompanies_V1",
    // GETACTIVECROPS: "masters/getActiveCrops",
    GETACTIVECROPS: "masters/getActiveCrops_v1",
    GETPRODUCTCROPSGoldClud: "masters/getActiveProducts_V1",
    GETMASTERALLSTATES: "masters/getAllStates",
    GETMASTERALLDISTRICTS: "masters/getDistricts",
    GETRAISEDCOMPLAINTS: "getRaisedComplaints",
    ADDSEEDBOOKING: "addSeedBooking",
    getRaisedComplaints_v1: "getRaisedComplaints_v2",
    GETSEEDBOOKINGHISTORY: "getSeedBookingHistory?farmerId=",
    FORMDATAHEADER: "application/x-www-form-urlencoded",
    MASTERSGETALLMEETINGS: "masters/getAllMeetings",
    MASTERSSAVEMEETINGDETAILS: "masters/saveMeetingDetails",
    MULTIPARTFORMDATA: "multipart/form-data",
    GEOTAGGINGGETALLFARMERREWARDS: "geoTagging/getAllFarmerRewards",
    GETALLREWARDS: "getAllRewards",
    GETMASTERFORCUSTOMERSUPPORT: "getMastersForCustomerSupport",
    // RAISECOMPLAINTS: "raiseComplaints",
    RAISECOMPLAINTS: "raiseComplaints_v1",
    GETREGISTEREDDETAILS: "getRegisteredDetails",
    getAllSurveys: "dipstick/getAllSurveys",
    geoTagging_getScanHistory: "geoTagging/getScanHistory",
    // geoTagging_submitSampleGeoTaggingDetails: "geoTagging/submitSampleGeoTaggingDetails",
    // geoTagging_submitSampleGeoTaggingDetails: "geoTagging/submitSampleGeoTaggingDetails_v1",     // added by kiran t
    geoTagging_submitSampleGeoTaggingDetails_V2: "geoTagging/submitSampleGeoTaggingDetails_v2",     // added by kiran t offline
    masters_getAllFeedback: "masters/getAllFeedback",
    GENUINTYNEWURL: "https://qrid.nvmretailpro.com/rest/productAuthentication/getProductStatus",
    NEWGENUNITYURL: "scan/genuinityCheckForProductAuthentication",
    NEARBYRTAILERS: "nearBy/getNearByRetailersDataByLatAndLongForWeb?",
    saveInviteFarmerMeeting: "saveInviteFarmerMeeting",
    referralsaveReferDetails: "referral/saveReferDetails",
    mastersgetHybridsDropdownList: "masters/getHybridsDropdownList",
    getAllRewards_v1: "getAllRewards_v1",
    addSeedBooking_v1: "addSeedBooking_v1",
    saveMeetingDetails_v1: "masters/saveMeetingDetails_v1",
    nslgetCompanyDetailsByCompanyCode: "nsl/masters/getCompanyDetailsByCompanyCode",
    nslgetWeatherDetailsV1: "getWeatherDetailsV1",
    getWeatherDetails: "getWeatherDetailsV2",
    getAgronomyInfo: "getAgronomyInfo_v1",
    getCropsAndSeasonsForAgronomy: "getCropsAndSeasonsForAgronomy",
    // dashboardDetails_v1: "users/dashboardDetails_v1",
    dashboardDetails_v2: "users/dashboardDetails_v2",

    nsl_dipstick_getAllSurveys_v1: "dipstick/getAllSurveys_v1",
    users_getDashboardDetailsForSubeejSaral_v1: "users/getDashboardDetailsForSubeejSaral_v1",
    masters_getAllLanguagesForMobile_V1: "masters/getAllLanguagesForMobile_V1",
    getSplashScreensv2: "referral/getSplashScreensv2",
    getStateDistrictsDropDown: "masters/getStateDistrictsDropDown",
    // FAQ: "getFAQDetails",
    FAQ: "getFAQDetails_v1",
    getPestInformation: "getPestInformation",
    masters_getAllCropMasterWithCompany: "masters/getAllCropMasterWithCompany",
    masters_getAllActiveProductsForSubeejKisan: "masters/getAllActiveProductsForSubeejKisan",
    // getAdvancedKnowledgeCenterDataByCompany: "getAdvancedKnowledgeCenterDataByCompany_v1",
    getAdvancedKnowledgeCenterDataByCompany: "getCropsListForAdvancedKnowledgeCenter",
    getAdvancedKnowledgeCenterDataByCompany_DOC: "getAdvancedKnowledgeCenterDataByCompany_v2",
    getPestForecastCrops: "getPestForecastCrops",
    getRemedies: "processCropDiseaseRemedy",
    mandiPrices_saveCropViewedHistory: "mandiPrices/saveCropViewedHistory",
    users_checkIconsStatus: "users/checkIconsStatus",
    users_UserMenuAccessDetails: "users/UserMenuAccessDetails",
    FIELDACTIVITYQRURL: "nsl/scanMdoQrCodeDetailes",

    GENUINITYCHECKFORPRODUCTIONAUTHENTICATIONANDCASHBACK: "nsl/cb/genuinityCheckForProductAuthenticationAndCashback",
    CASHBACKHISTORY: "nsl/cb/cashbackHistory",
    CBINSTANTPAYMENTMODEREQUEST: "nsl/cb/CBInstantPaymentModeRequest",
    CBGETALLTRANSACTIONSWITHREFERRENCEID: "nsl/cb/getAllTransactionsWithReferrenceId",

    //EMPLOYEE DASHBOARD API
    USERGETEMPLOYEEDASHBOARDDETAILS: "users/getEmployeeDashBoardDetailes",
    USERSGETMINDATEFROMUSERINFO: "users/getMinDateFromUserInfo",

}
