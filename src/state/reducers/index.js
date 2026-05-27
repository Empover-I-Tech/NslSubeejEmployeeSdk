import { combineReducers } from 'redux';
import authReducer from './authReducer';
import themeReducer from './themeReducer';
import networkReducer from './networkReducer';
import masterDataReducer from './masterReducer';
import companyStylesReducer from './companyStylesReducer';
import selectedCompanyReducer from './selectedCompanyReducer';
import locationReducer from './locationReducer';
import offlineCountReducer from './offlineCountReducer';
import weatherTitleReducer from './weatherHeadersReducer';
import marketpriceReducer from './marketpriceReducer';
import tabmenucontrolReducer from './tabmenucontrolReducer';
import cashBackModalReducer from './cashBackModalReducer';
import cashBackSuccessModalReducer from './cashBackSuccessModalReducer';
import cashBackSuccessGenuineModalReducer from './cashBackSuccessGenuineModalReducer';
import nearByReducer from './nearByReducer';
import tabEmpMenuControlReducer from './tabEmpMenuControlReducer';
import employeeReducer from './employeeReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    theme: themeReducer,
    network: networkReducer,
    masters: masterDataReducer,
    companyStyles: companyStylesReducer,
    selectedCompnayAct: selectedCompanyReducer,
    selectLocationReducer: locationReducer,
    offlineCountReducer:offlineCountReducer,
    weatherTitleReducer:weatherTitleReducer,
    marketpriceData : marketpriceReducer,
    tabmenuControl : tabmenucontrolReducer,
    cashBackModalReducer:cashBackModalReducer,
    cashBackSuccessModalReducer:cashBackSuccessModalReducer,
    cashBackSuccessGenuineModalReducer:cashBackSuccessGenuineModalReducer,
    nearByReducer:nearByReducer,
    tabEmpMenuControl:tabEmpMenuControlReducer,
    employeeRole: employeeReducer,
});

export default rootReducer;
