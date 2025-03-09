const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Configuração padrão do Expo
const defaultConfig = getDefaultConfig(__dirname);

// Adicionar suporte a SVGs
defaultConfig.transformer = {
  ...defaultConfig.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

defaultConfig.resolver = {
  ...defaultConfig.resolver,
  assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'), // Remove SVG da lista de extensões de assets
  sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'], // Adiciona SVG à lista de extensões de código-fonte
};

// Ignorar o módulo @lottiefiles/dotlottie-react
defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  '@lottiefiles/dotlottie-react': require.resolve('lottie-react-native'),
};

// Aplicar a configuração do NativeWind
module.exports = withNativeWind(defaultConfig, { input: './global.css' });