import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import HomeScreen from '../screens/HomeScreen';
// import LoginScreen from '../screens/LoginScreen';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnBoardingScreen';
import Agronomy from '../screens/Agronomy';
// import OtpScreen from '../screens/OtpScreen';
// import LanguageScreen from '../screens/LanguageScreen';
// import NewsScreen from '../screens/NewsScreen';
// import Registration from '../screens/Registration';
// import VideosScreen from '../screens/VideosScreen';
// import CropsGraphScreen from '../screens/CropsGraphScreen';
// import CabbageQuintaGraph from '../screens/CabbageQuintaGraph';
import CropDetailsScreen from '../screens/CropDetailsScreen';
import MandiPricesScreen from '../screens/MandiPrices/MandiPricesScreen';
// import MandiPricesSecondScreen from '../screens/MandiPricesSecondScreen';
import WeatherScreen from '../screens/Weather/WeatherScreen';
// import YieldCalculatorScreen from '../screens/YieldCalculatorScreen';
// import MoreScreen from '../screens/MoreScreen';
import MapScreen from '../components/MapScreen';
import RewardsScreen from '../screens/RewardsScreen';
// import KnowledgeCenter from '../screens/KnowledgeCenter';
import QRScanner from '../screens/QRScanner';
// import ScanScreen from '../screens/ScanScreen';
import NearByScreen from '../screens/NearByScreen';
// import FarmerSupport from '../screens/FarmerSupport';
// import RaiseTicketsScreen from '../screens/RaiseTicketsScreen';
// import FABDetails from '../screens/FABDetails';
// import ViewTicketsScreen from '../screens/ViewTicketsScreen';
// import FaqsScreen from '../screens/FaqsScreen';
// import EmailScreen from '../screens/EmailScreen';
// import FarmerBooking from '../screens/FarmerBooking';
// import RequesterScreen from '../screens/RequesterScreen';
// import AddEquipmentScreen from '../screens/AddEquipmentScreen';
// import RequesterFilterScreen from '../screens/RequesterFilterScreen';
// import SelectCompanyScreen from '../screens/SelectCompanyScreen';
import NearByRetailersScreen from '../screens/NearByRetailersScreen';
// import PostLoginLanguageScreen from '../screens/PostLoginLanguageScreen';
import PreLoginCustomLoader from '../components/PreLoginCustomLoader';
import ProfileScreen from '../screens/ProfileScreen';
import ReferralScreen from '../screens/ReferralScreen';
import GeoTaggingScreen from '../screens/GeoTaggingScreen';
import GeoTaggingViewScreen from '../screens/GeoTaggingViewScreen';
// import AgronomyScreen from '../screens/AgronomyScreen';
import BookSeeds from '../screens/BooksSeeds';
import BookingHistory from '../screens/BookingHistory';
import SampleFeedBack from '../screens/SampleFeedBack';
import MeetFellowFarmer from '../screens/MeetFellowFarmers';
import AddressScreen from '../screens/AddressScreen';
import SamadhanScreen from '../screens/SamadhanScreen';
import RegistrationRn from '../screens/RegistrationRn';
import SeedCalculator from '../screens/SeedsCalculator';
// import CropDiagnosticScreen from '../screens/CropDiagnosticScreen';
// import DipsticSurveys from '../screens/DipsticSurveys';
import FertilizerCalculator from '../screens/FertilizerSeeds';
import KnowledgeCenterRn from '../screens/KnowledgeCenterRn';
import HomeScreenRn from '../screens/HomeScreenRn';
// import ProductInfo from '../screens/ProductInfo';
// import AgronomyTranplantingScreen from '../screens/AgronomyTranplantingScreen';
import SelectCompanyScreenRn from '../screens/SelectedCompanyScreenRn';
import YieldCalculator from '../screens/YieldCalculator';
import LanguageScreenRn from '../screens/LanguageScreenRn';
import QRScannerRn from '../screens/QRScannerRn';
import LoginScreenRn from '../screens/LoginScreenRN';
import IntialLanguageScreenRn from '../screens/IntialLanguageScreen';
import MoreScreenRn from '../screens/MoreScreenRn';
import DipstickSurveyRn from '../screens/DipsticksRn';
import InviteFarmerMeeting from '../screens/InviteFarmarMeeting';
import OtpNewScreen from '../screens/otpNewScreen';
import Location from '../components/Location';
import FaqsScreen from '../screens/FaqsScreen';
import RaiseComplaintScreen from '../screens/RaiseComplaintScreen';
import CropDesiesDetection from '../screens/CropDiagnostics/CropDesiesDetection';
import CropDiagonstic from '../screens/CropDiagnostics/CropDiagonstic';
import CustomGalleryPopup from '../components/CustomGalleryPopup';
import Remedyrecommendation from '../screens/Remedyrecommendation';
import AccountCloser from '../screens/AccountCloser';
import BottomTabsNavigator from './BottomTabs';
import AdvancedKnowledgeCenter from '../screens/AdvancedKnowledgeCenter';
import KnowledgeCenterPDFView from '../screens/KnowledgeCenterPDFView';
import CashBackScan from '../screens/CashbackProgram/CashbackScan';
import CashFreeTransactionsActivity from '../screens/CashbackProgram/CashFreeTransactionsActivity';
import PaymentOptionsActivity from '../screens/CashbackProgram/PaymentOptionsActivity';
import SelectedPaymentOptionActivity from '../screens/CashbackProgram/SelectedPaymentOptionActivity';
import CompletedPaymentActivity from '../screens/CashbackProgram/CompletedPaymentActivity';
import TransactionDetailsActivity from '../screens/CashbackProgram/TransactionDetailsActivity';
import BottomTabsNavigatorEmp from './BottomTabsEmp';
import KnowledgeCenterDocsList from '../screens/KnowledgeCenterDocsList';


const Stack = createStackNavigator();

const StackNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MainTabs" component={BottomTabsNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="OnBoard" component={OnboardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="InviteFarmerMeeting" component={InviteFarmerMeeting} options={{ headerShown: false }} />
            <Stack.Screen name="OtpNewScreen" component={OtpNewScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Remedyrecommendation" component={Remedyrecommendation} options={{ headerShown: false }} />
            {/* <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name="LoginScreenRn" component={LoginScreenRn} options={{ headerShown: false }} />
            <Stack.Screen name="Agronomy" component={Agronomy} options={{ headerShown: false }} />
            <Stack.Screen name="AdvancedKnowledgeCenter" component={AdvancedKnowledgeCenter} options={{ headerShown: false }} />
            <Stack.Screen name="KnowledgeCenterDocsList" component={KnowledgeCenterDocsList} options={{ headerShown: false }} />
            <Stack.Screen name="KnowledgeCenterPDFView" component={KnowledgeCenterPDFView} options={{ headerShown: false }} />
            {/* <Stack.Screen name="OtpScreen" component={OtpScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="LanguageScreen" component={LanguageScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='NewsScreen' component={NewsScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='VideosScreen' component={VideosScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name='WeatherScreen' component={WeatherScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name='SignUp' component={Registration} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="CropsGraphScreen" component={CropsGraphScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="CabbageQuintaGraph" component={CabbageQuintaGraph} options={{ headerShown: false }} /> */}
            <Stack.Screen name="CropDetailsScreen" component={CropDetailsScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name="MandiPricesScreen" component={MandiPricesScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="MandiPricesSecondScreen" component={MandiPricesSecondScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="YieldCalculatorScreen" component={YieldCalculatorScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='MoreScreen' component={MoreScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name='MapScreen' component={MapScreen} options={{ headerShown: false }} />
            <Stack.Screen name='RewardsScreen' component={RewardsScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name='KnowledgeCenter' component={KnowledgeCenter} options={{ headerShown: false }} /> */}
            <Stack.Screen name='QRScanner' component={QRScanner} options={{ headerShown: false }} />
            {/* QRScanner */}
            {/* <Stack.Screen name='ScanScreen' component={ScanScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name='NearByScreen' component={NearByScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name='FarmerSupport' component={FarmerSupport} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='RaiseTicketsScreen' component={RaiseTicketsScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='FABDetails' component={FABDetails} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='ViewTicketsScreen' component={ViewTicketsScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='FaqsScreen' component={FaqsScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='EmailScreen' component={EmailScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='FarmerBooking' component={FarmerBooking} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='RequesterScreen' component={RequesterScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='AddEquipmentScreen' component={AddEquipmentScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='RequesterFilterScreen' component={RequesterFilterScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='SelectCompanyScreen' component={SelectCompanyScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name='NearByRetailersScreen' component={NearByRetailersScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name='PostLoginLanguageScreen' component={PostLoginLanguageScreen} options={{ headerShown: false }} /> */}
            <Stack.Screen name='PreLoginCustomLoader' component={PreLoginCustomLoader} options={{ headerShown: false }} />
            <Stack.Screen name='CustomGalleryPopup' component={CustomGalleryPopup} options={{ headerShown: false }} />
            <Stack.Screen name='ProfileScreen' component={ProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name='ReferralScreen' component={ReferralScreen} options={{ headerShown: false }} />
            <Stack.Screen name='GeoTaggingScreen' component={GeoTaggingScreen} options={{ headerShown: false }} />
            <Stack.Screen name='GeoTaggingViewScreen' component={GeoTaggingViewScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name='AgronomyScreen' component={AgronomyScreen} options={{ headerShown: false }} /> */}


            <Stack.Screen name='BookSeeds' component={BookSeeds} options={{ headerShown: false }} />
            <Stack.Screen name='BookingHistory' component={BookingHistory} options={{ headerShown: false }} />
            <Stack.Screen name='SampleFeedBack' component={SampleFeedBack} options={{ headerShown: false }} />
            <Stack.Screen name='MeetFellowFarmer' component={MeetFellowFarmer} options={{ headerShown: false }} />
            <Stack.Screen name='AddressScreen' component={AddressScreen} options={{ headerShown: false }} />

            <Stack.Screen name='SamadhanScreen' component={SamadhanScreen} options={{ headerShown: false }} />
            <Stack.Screen name='RegistrationRn' component={RegistrationRn} options={{ headerShown: false }} />
            <Stack.Screen name='RaiseComplaintScreen' component={RaiseComplaintScreen} options={{ headerShown: false }} />
            <Stack.Screen name='SeedCalculator' component={SeedCalculator} options={{ headerShown: false }} />
            {/* <Stack.Screen name='CropDiagnosticScreen' component={CropDiagnosticScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name='DipsticSurveys' component={DipsticSurveys} options={{ headerShown: false }} /> */}
            <Stack.Screen name='MandiPricesScreen' component={MandiPricesScreen} options={{ headerShown: false }} />
            <Stack.Screen name='FertilizerCalculator' component={FertilizerCalculator} options={{ headerShown: false }} />
            <Stack.Screen name='KnowledgeCenterRn' component={KnowledgeCenterRn} options={{ headerShown: false }} />
            <Stack.Screen name="HomeScreenRn" component={HomeScreenRn} options={{ headerShown: false }} />
            {/* <Stack.Screen name="AgronomyTranplantingScreen" component={AgronomyTranplantingScreen} options={{ headerShown: false }} /> */}
            {/* <Stack.Screen name="ProductInfo" component={ProductInfo} options={{ headerShown: false }} /> */}
            <Stack.Screen name="SelectCompanyScreenRn" component={SelectCompanyScreenRn} options={{ headerShown: false }} />
            <Stack.Screen name="YieldCalculator" component={YieldCalculator} options={{ headerShown: false }} />
            <Stack.Screen name="LanguageScreenRn" component={LanguageScreenRn} options={{ headerShown: false }} />
            <Stack.Screen name="QRScannerRn" component={QRScannerRn} options={{ headerShown: false }} />
            <Stack.Screen name="IntialLanguageScreenRn" component={IntialLanguageScreenRn} options={{ headerShown: false }} />
            <Stack.Screen name="MoreScreenRn" component={MoreScreenRn} options={{ headerShown: false }} />
            <Stack.Screen name="DipstickSurveyRn" component={DipstickSurveyRn} options={{ headerShown: false }} />
            <Stack.Screen name="Location" component={Location} options={{ headerShown: false }} />

            <Stack.Screen name='FaqsScreen' component={FaqsScreen} options={{ headerShown: false }} />
            <Stack.Screen name='CropDiagonstic' component={CropDiagonstic} options={{ headerShown: false }} />
            <Stack.Screen name='CropDesiesDetection' component={CropDesiesDetection} options={{ headerShown: false }} />
            <Stack.Screen name="AccountCloser" component={AccountCloser} options={{ headerShown: false }} />

            <Stack.Screen name="CashBackScan" component={CashBackScan} options={{ headerShown: false }} />
            <Stack.Screen name='CashFreeTransactionsActivity' component={CashFreeTransactionsActivity} options={{ headerShown: false }} />
            <Stack.Screen name='PaymentOptionsActivity' component={PaymentOptionsActivity} options={{ headerShown: false }} />
            <Stack.Screen name='SelectedPaymentOptionActivity' component={SelectedPaymentOptionActivity} options={{ headerShown: false }} />
            <Stack.Screen name='CompletedPaymentActivity' component={CompletedPaymentActivity} options={{ headerShown: false }} />
            <Stack.Screen name='TransactionDetailsActivity' component={TransactionDetailsActivity} options={{ headerShown: false }} />
            <Stack.Screen name='BottomTabsNavigatorEmp' component={BottomTabsNavigatorEmp} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

export default StackNavigator;
