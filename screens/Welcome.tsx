import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '@/components/button';

export default function Welcome(){
    return(
        <View className='flex items-center font-mono px-10 py-10'>
        
        <Text className='h-1/3 text-center text-black  text-base font-bold  tracking-tighter'>Bem vindo ao seu sistema de gerenciamento</Text>
      

        
        <Text className='text-center text-sm'>Potencialize sua gestão: nosso app simplifica
        processos e eleva a produtividade da sua equipe</Text>
        <Button title="INCIAR"></Button>        
        
        
        </View>
    )
}