import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeaderProps {
    children?: React.ReactNode; // Aceita children
    title?: string; // Prop opcional para o título
  }

export default function Header({ children, title }: HeaderProps){
    return(
        <View className=' flex-auto w-[240] h-[210] m-4'>
        {title && <Text className="text-white text-xl font-bold">{title}</Text>}
        {children} {/* Renderiza os filhos */}
        </View>
    )
}