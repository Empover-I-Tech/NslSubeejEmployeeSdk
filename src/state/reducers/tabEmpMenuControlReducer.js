import { SET_TABEMPMENUCONTROL } from "../actions/tabempmenuControl";

const initialState = {
    tabempmenuControl: {
        tabempmenuControl: {},
    },
};

const tabEmpMenuControlReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_TABEMPMENUCONTROL:
            return {
                tabempmenuControl: action.payload,
            };
        default:
            return state;
    }
};

export default tabEmpMenuControlReducer;
