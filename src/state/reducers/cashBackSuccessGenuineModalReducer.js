import { CASHBACK_SUCCESS_GENUINE_MODAL } from "../actions/cashBackSuccessGenuineModal";

const initialState = {
    cashBackGenuineSuccessScan: false,
};

const cashBackSuccessGenuineModalReducer = (state = initialState, action) => {
    switch (action.type) {
        case CASHBACK_SUCCESS_GENUINE_MODAL:
            return {
                cashBackGenuineSuccessScan: action.payload,
            };
        default:
            return state;
    }
};

export default cashBackSuccessGenuineModalReducer;