import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';

const licenseText = `Copyright (c) 2026 Tempo contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

export default function LicensesScreen() {
  const { isDark } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#0B1929' : '#F4F6F8' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="w-full max-w-md self-center">
          <View className="mb-7 flex-row items-center gap-3">
            <Pressable
              accessibilityLabel="Back"
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-[#132338]"
            >
              <Feather accessible={false} aria-hidden name="arrow-left" size={20} color={isDark ? '#8B9CAF' : '#526276'} />
            </Pressable>
            <Text className="text-2xl font-bold text-[#102033] dark:text-white">Licenses</Text>
          </View>

          <View className="rounded-3xl border border-[#DDE4EA] bg-white p-5 dark:border-[#1B2D42] dark:bg-[#0D1724]">
            <Text className="text-lg font-bold text-[#102033] dark:text-white">Tempo</Text>
            <Text className="mt-1 text-sm font-semibold text-[#2F7BFF]">MIT License</Text>
            <Text className="mt-5 text-sm leading-6 text-[#526276] dark:text-[#A8B5C4]">{licenseText}</Text>
          </View>

          <Text className="mt-5 text-xs leading-5 text-[#738294] dark:text-[#60758C]">
            Third-party packages included with Tempo remain subject to their respective open-source licenses.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
