import { useEffect, useState } from 'react';

import NoInternetOverlay from '../screens/NoInternetOverlay';
import { getNetworkStatus } from '../api/NetworkUtils';

const SDKNetworkHandler = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkNetwork = async () => {
      const status = await getNetworkStatus();
      setIsConnected(status);
    };

    checkNetwork();

    const interval = setInterval(checkNetwork, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NoInternetOverlay visible={!isConnected} />
  );
};

export default SDKNetworkHandler;