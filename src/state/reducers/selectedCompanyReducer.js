import { SET_SELECTEDCOMPNAYACTIONS } from "../actions/selectedCompanyActions";

const initialState = {
    selectedCompanyAct: {
    },
};

const selectedCompanyReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_SELECTEDCOMPNAYACTIONS:
            return {
                ...state,
                selectedCompanyAct: action.payload,
            };
        default:
            return state;
    }
};

export default selectedCompanyReducer;
