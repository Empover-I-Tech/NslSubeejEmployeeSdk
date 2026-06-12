import { createStackNavigator } from '@react-navigation/stack';
import Agronomy from '../screens/Agronomy';
import MandiPricesScreen from '../screens/MandiPrices/MandiPricesScreen';
import WeatherScreen from '../screens/Weather/WeatherScreen';
import NearByScreen from '../screens/NearByScreen';
import NearByRetailersScreen from '../screens/NearByRetailersScreen';
import SamadhanScreen from '../screens/SamadhanScreen';
import SeedsCalculator from '../screens/SeedsCalculator';
import FertilizerSeeds from '../screens/FertilizerSeeds';
import KnowledgeCenterRn from '../screens/KnowledgeCenterRn';
import YieldCalculator from '../screens/YieldCalculator';
import QRScannerRn from '../screens/QRScannerRn';
import Location from '../components/Location';
import RaiseComplaintScreen from '../screens/RaiseComplaintScreen';
import CropDesiesDetection from '../screens/CropDiagnostics/CropDesiesDetection';
import CropDiagonstic from '../screens/CropDiagnostics/CropDiagonstic';
import Remedyrecommendation from '../screens/Remedyrecommendation';
import AdvancedKnowledgeCenter from '../screens/AdvancedKnowledgeCenter';
import KnowledgeCenterPDFView from '../screens/KnowledgeCenterPDFView';
import CashBackScan from '../screens/CashbackProgram/CashbackScan';
import BottomTabsNavigatorEmp from './BottomTabsEmp';
import KnowledgeCenterDocsList from '../screens/KnowledgeCenterDocsList';

const Stack = createStackNavigator();

const StackNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Splash">
            

            <Stack.Screen name="Location" component={Location} options={{ headerShown: false }} />
            <Stack.Screen name="AdvancedKnowledgeCenter" component={AdvancedKnowledgeCenter} options={{ headerShown: false }} />
            <Stack.Screen name="KnowledgeCenterDocsList" component={KnowledgeCenterDocsList} options={{ headerShown: false }} />
            <Stack.Screen name="KnowledgeCenterPDFView" component={KnowledgeCenterPDFView} options={{ headerShown: false }} />
            <Stack.Screen name="Remedyrecommendation" component={Remedyrecommendation} options={{ headerShown: false }} />
            <Stack.Screen name='WeatherScreen' component={WeatherScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Agronomy" component={Agronomy} options={{ headerShown: false }} />
            <Stack.Screen name='CropDiagonstic' component={CropDiagonstic} options={{ headerShown: false }} />
            <Stack.Screen name='CropDesiesDetection' component={CropDesiesDetection} options={{ headerShown: false }} />
            <Stack.Screen name='KnowledgeCenterRn' component={KnowledgeCenterRn} options={{ headerShown: false }} />
            <Stack.Screen name='NearByScreen' component={NearByScreen} options={{ headerShown: false }} />
            <Stack.Screen name='NearByRetailersScreen' component={NearByRetailersScreen} options={{ headerShown: false }} />
            <Stack.Screen name="QRScannerRn" component={QRScannerRn} options={{ headerShown: false }} />
            <Stack.Screen name='SamadhanScreen' component={SamadhanScreen} options={{ headerShown: false }} />
            <Stack.Screen name='RaiseComplaintScreen' component={RaiseComplaintScreen} options={{ headerShown: false }} />
            <Stack.Screen name='SeedsCalculator' component={SeedsCalculator} options={{ headerShown: false }} />
            <Stack.Screen name="YieldCalculator" component={YieldCalculator} options={{ headerShown: false }} />
            <Stack.Screen name='FertilizerSeeds' component={FertilizerSeeds} options={{ headerShown: false }} />
            <Stack.Screen name='MandiPricesScreen' component={MandiPricesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CashBackScan" component={CashBackScan} options={{ headerShown: false }} />
            <Stack.Screen name='BottomTabsNavigatorEmp' component={BottomTabsNavigatorEmp} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

export default StackNavigator;
