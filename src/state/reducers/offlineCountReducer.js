import { UPDATE_OFFLINE_COUNT } from "../actions/offlineCountAction";


const initialState = {
    offlineCount: 0,
};

const offlineCountReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_OFFLINE_COUNT:
            return {
                ...state,
                offlineCount: action.payload,
            };
        default:
            return state;
    }
};

export default offlineCountReducer;
