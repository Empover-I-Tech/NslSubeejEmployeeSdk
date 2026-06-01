import { View, Text } from 'react-native'


const LoaderScreen = ({route}) => {
    console.log("LoaderScreen route params:", route?.params);
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{route?.params?.navigateItem || "Hello World"}</Text>
        </View>
    )

}

export default LoaderScreen