import { CASHBACK_SUCCESS_MODAL } from "../actions/cashBackSuccessModal";

const initialState = {
    cashBackSuccessScan: false,
};

const cashBackSuccessModalReducer = (state = initialState, action) => {
    switch (action.type) {
        case CASHBACK_SUCCESS_MODAL:
            return {
                cashBackSuccessScan: action.payload,
            };
        default:
            return state;
    }
};

export default cashBackSuccessModalReducer;