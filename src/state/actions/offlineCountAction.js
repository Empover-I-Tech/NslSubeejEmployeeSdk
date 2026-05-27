export const UPDATE_OFFLINE_COUNT = 'UPDATE_OFFLINE_COUNT';

export const setOfflineCount = (offlineCount) => ({
    type: UPDATE_OFFLINE_COUNT,
    payload: offlineCount,
});
