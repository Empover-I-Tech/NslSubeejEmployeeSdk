import { CASHBACK_MODAL } from "../actions/cashBackModal";

const initialState = {
    cashBackScan: false,
};

const cashBackModalReducer = (state = initialState, action) => {
    switch (action.type) {
        case CASHBACK_MODAL:
            return {
                cashBackScan: action.payload,
            };
        default:
            return state;
    }
};

export default cashBackModalReducer;