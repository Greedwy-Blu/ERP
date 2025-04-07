import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';



export default function Carregamento(){
    return(
        <View className=' flex-auto w-[240] h-[210] m-4'>
        <Text className='w-[50] h-[50]'> <ImageBackground source={require('@/assets/images/solorium-logo.png')} className='mt-12'  style={{ width: 50, height: 50 }} resizeMode="cover"/></Text> 
            
        </View>
    )
}
