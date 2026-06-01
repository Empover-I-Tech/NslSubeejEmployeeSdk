import { SET_MASTERDATA } from "../actions/mastersDataAction";
import { SET_COMPANYSTYLES } from "../actions/companyStyles";

const initialState = {
    companyStyles: {
    },
};

const companyStylesReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_COMPANYSTYLES:
            return {
                ...state,
                companyStyles: action.payload,
            };
        default:
            return state;
    }
};

export default companyStylesReducer;
