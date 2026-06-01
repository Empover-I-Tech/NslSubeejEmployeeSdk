import { SET_MASTERDATA } from "../actions/mastersDataAction";

const initialState = {
    masterData: {
        seasonsList: [],
        districtsList: [],
        rolesList: [],
        hybridsList: [],
        stateList: [],
        cropsList: [],
        languageList: [],
        landtypesList: [],
        cropGroupsList: [],
        issueTypeList: [],
    },
};

const masterDataReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_MASTERDATA:
            return {
                ...state,
                masterData: action.payload,
            };
        default:
            return state;
    }
};

export default masterDataReducer;
