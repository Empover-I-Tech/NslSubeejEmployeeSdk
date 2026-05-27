import { SET_TABMENUCONTROL } from "../actions/tabmenuControl";

const initialState = {
    tabmenuControl: {
        tabmenuControl: [],
    },
};

const tabmenucontrolReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_TABMENUCONTROL:
            return {
                ...state,
                tabmenuControl: action.payload,
            };
        default:
            return state;
    }
};

export default tabmenucontrolReducer;
