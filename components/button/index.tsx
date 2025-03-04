import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function Button({title}) {
  return (
    <TouchableOpacity
      className="bg-teal-950 px-2 py-2 w-28 h-8 rounded-sm items-center"
    >
      <Text className="text-white font-bold text-sm">{title}</Text>
    </TouchableOpacity>
  );

}