import { View, Text } from 'react-native'


const LoaderScreen = () => {

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{"Hello World"}</Text>
        </View>
    )

}

export default LoaderScreen