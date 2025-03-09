import React from 'react';
import { View, Text, Dimensions, TouchableOpacity, Image, ImageBackground } from 'react-native';
import Animated, { useSharedValue, withSpring, useAnimatedStyle, runOnJS } from 'react-native-reanimated';

import { useRouter } from 'expo-router';
import Header from "@/components/header/index";
import HexagonMask from "@/components/hexagono/HexagonContainer";

const { width, height } = Dimensions.get('window');

export default function Welcome() {
  
  const router = useRouter();
  const translateX = useSharedValue(0); // Controla o movimento horizontal do texto do botão
  const opacity = useSharedValue(1); // Controla a opacidade do texto do botão
  const buttonScaleX = useSharedValue(1); // Controla a expansão horizontal do botão
  const buttonScaleY = useSharedValue(1); // Controla a expansão vertical do botão (para cobrir a tela)

  // Estilo animado para o texto do botão
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }], // Move o texto para o lado esquerdo
      opacity: opacity.value, // Controla a visibilidade do texto
    };
  });

  // Estilo animado para o botão (expansão horizontal e vertical)
  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scaleX: buttonScaleX.value }, // Expande horizontalmente
        { scaleY: buttonScaleY.value }, // Expande verticalmente
      ],
    };
  });

  const handleAnimation = () => {
    // 1ª etapa: texto do botão se move para o lado esquerdo e desaparece
    translateX.value = withSpring(-width, { damping: 5, stiffness: 100 }); // Mais rápido
    opacity.value = withSpring(0, { damping: 5, stiffness: 100 }); // Mais rápido

    // 2ª etapa: botão expande horizontalmente
    buttonScaleX.value = withSpring(width / 50, { damping: 5, stiffness: 100 }, () => {
      // 3ª etapa: botão se divide e cobre a tela toda (expansão vertical)
      buttonScaleY.value = withSpring(height / 10, { damping: 5, stiffness: 250 }, () => {
        // Navega para a próxima tela após a animação
        runOnJS(router.push)('/carregamento');
      });
    });
  };

  return (
    <View className="flex items-center md:px-24 md:py-24 px-20 py-20 bg-slate-50 w-auto h-auto">

      <Text className='flex text-center w-80 '>
      <Text className="  text-teal-900 text-base font-[1000] tracking-tighter py-16 not-italic "> BEM VINDO AO SOLARIUM </Text>
      <Text className='w-[50] h-[50]'> <ImageBackground source={require('@/assets/images/logo-icon.png')} className='mt-12'  style={{ width: 50, height: 50 }} resizeMode="cover"/></Text> 
      <Text className=" pt-24    text-teal-950 text-base font-[1000] tracking-tighter  not-italic ">O SEU SISTEMA DE GERENCIAMENTO</Text>    
      </Text>



      <Header>
        <HexagonMask />
      </Header>
      <Text className="text-center text-sm font-semibold not-italic">
        Potencialize sua gestão: nosso app simplifica processos e eleva a produtividade da sua equipe
      </Text>

      {/* Botão com expansão horizontal/vertical e texto animado */}
      <TouchableOpacity onPress={handleAnimation}>
        <Animated.View
          style={[
            animatedButtonStyle,
            {
              backgroundColor: '#4FD1C5',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
              width: 100, // Largura inicial do botão
            },
          ]}
        >
          {/* Texto do botão com animação */}
          <Animated.Text style={[animatedTextStyle, { color: 'white', fontWeight: 'bold', fontSize: 14 }]}>
            INICIAR
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}