import { SET_IS_EMPLOYEE } from '../actions/employeeActions';

const initialState = { isEmployee: false };

const employeeReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_IS_EMPLOYEE:
            return { ...state, isEmployee: action.payload };
        default:
            return state;
    }
};

export default employeeReducer;
