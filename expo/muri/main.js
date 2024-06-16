
import React, { useState, useRef } from 'react';
import { View, Image, FlatList, Text, TextInput, Button, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // تأكد من تثبيت مكتبة @expo/vector-icons

// بيانات الصفحات (مثال)
const exampleSowar = [
  {
    page: 1,
    ayat: ["بسم الله الرحمن الرحيم", "الحمد لله رب العالمين"],
    tafssir: ["تفسير البسملة ..", "تفسير الحمدلة .."],
    position: [
      { top: 10, left: 5, width: 90, height: 5 },
      { top: 20, left: 5, width: 90, height: 5 }
    ]
  },
  {
    page: 2,
    ayat: ["مالك يوم الدين", "إياك نعبد وإياك نستعين"],
    tafssir: ["تفسير مالك يوم الدين ..", "تفسير إياك نعبد .."],
    position: [
      { top: 30, left: 5, width: 90, height: 5 },
      { top: 40, left: 5, width: 90, height: 5 }
    ]
  },
  {
    page: 3,
    ayat: ["اهدنا الصراط المستقيم", "صراط الذين أنعمت عليهم"],
    tafssir: ["تفسير اهدنا الصراط ..", "تفسير صراط الذين .."],
    position: [
      { top: 50, left: 5, width: 90, height: 5 },
      { top: 60, left: 5, width: 90, height: 5 }
    ]
  },
  // المزيد من الصفحات...
];

// تكرار البيانات 600 مرة
const sowar = Array.from({ length: 600 }, (_, i) => ({
  ...exampleSowar[i % exampleSowar.length],
  page: i + 1
}));

// عنوان URL الأساسي للصور
const baseUrl = "https://raw.githubusercontent.com/Zizwar/mushaf-mauri/main/assets/pages/muhammadi/page";

const App = () => {
  const [loadedPages, setLoadedPages] = useState(sowar.slice(0, 10)); // بدءاً بأول 10 صفحات
  const [pageNumber, setPageNumber] = useState('');
  const [ayahNumber, setAyahNumber] = useState('');
  const [selectedAyah, setSelectedAyah] = useState(null); // لإظهار البيانات المتعلقة بالآية
  const [isDarkMode, setIsDarkMode] = useState(false); // حالة الوضع المظلم
  const flatListRef = useRef(null);

  const handleLoadMore = () => {
    if (loadedPages.length < sowar.length) {
      const nextPages = sowar.slice(loadedPages.length, loadedPages.length + 10);
      setLoadedPages([...loadedPages, ...nextPages]);
    }
  };

  const handleLoadPrevious = () => {
    if (loadedPages.length < sowar.length) {
      const previousPages = sowar.slice(Math.max(0, loadedPages.length - 20), loadedPages.length - 10);
      setLoadedPages([...previousPages, ...loadedPages]);
    }
  };

  const handleGoToPage = () => {
    const page = parseInt(pageNumber, 10);
    const ayah = parseInt(ayahNumber, 10);
    if (!isNaN(page) && page > 0 && page <= sowar.length) {
      const targetIndex = sowar.findIndex(item => item.page === page);
      if (targetIndex !== -1) {
        const start = Math.max(0, targetIndex - 10);
        const end = targetIndex + 10;
        setLoadedPages(sowar.slice(start, end));
        setTimeout(() => {
          flatListRef.current.scrollToIndex({ index: targetIndex - start, animated: true });
          if (!isNaN(ayah) && ayah > 0 && ayah <= sowar[targetIndex].ayat.length) {
            setSelectedAyah({ page, ayah });
          } else {
            setSelectedAyah(null);
          }
        }, 100); // تأخير بسيط للتأكد من تحديث الحالة
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.pageContainer}>
      <Text style={[styles.pageNumber, isDarkMode && styles.darkText]}>صفحة {item.page}</Text>
      <Image
        source={{ uri: `${baseUrl}${item.page}.png` }}
        style={[styles.pageImage, isDarkMode && styles.invertedImage]} // تطبيق الفلتر للوضع المظلم
        resizeMode="contain"
        onError={(error) => console.log('Image Load Error: ', error.nativeEvent.error)}
      />
      {item.position && item.position.map((pos, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.ayahButton,
            {
              top: pos.top + '%',
              left: pos.left + '%',
              width: pos.width + '%',
              height: pos.height + '%',
              backgroundColor:
                selectedAyah && selectedAyah.page === item.page && selectedAyah.ayah - 1 === index
                  ? 'rgba(255, 255, 0, 0.5)' // خلفية صفراء شفافة عند التحديد
                  : 'rgba(255, 255, 255, 0.0)', // خلفية شفافة
            },
          ]}
          onPress={() => setSelectedAyah({ page: item.page, ayah: index + 1 })}
        />
      ))}
      {selectedAyah && selectedAyah.page === item.page && selectedAyah.ayah - 1 < item.ayat.length && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>آية: {item.ayat[selectedAyah.ayah - 1]}</Text>
          <Text style={styles.infoText}>تفسير: {item.tafssir[selectedAyah.ayah - 1]}</Text>
          <Button title="إغلاق" onPress={() => setSelectedAyah(null)} />
        </View>
      )}
    </View>
  );

  const getItemLayout = (data, index) => ({
    length: Dimensions.get('window').width,
    offset: Dimensions.get('window').width * index,
    index
  });

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>تطبيق المصحف الكريم</Text>
        <TouchableOpacity onPress={() => setIsDarkMode(!isDarkMode)}>
          <Ionicons name={isDarkMode ? "md-sunny" : "md-moon"} size={24} color={isDarkMode ? "white" : "black"} />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="أدخل رقم الصفحة"
          keyboardType="numeric"
          value={pageNumber}
          onChangeText={setPageNumber}
          placeholderTextColor={isDarkMode ? "#999" : "#ccc"}
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          placeholder="أدخل رقم الآية"
          keyboardType="numeric"
          value={ayahNumber}
          onChangeText={setAyahNumber}
          placeholderTextColor={isDarkMode ? "#999" : "#ccc"}
        />
        <Button title="اذهب" onPress={handleGoToPage} />
      </View>
      <FlatList
        ref={flatListRef}
        data={loadedPages}
        keyExtractor={item => item.page.toString()}
        renderItem={renderItem}
        horizontal={true}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.x <= 0) {
            handleLoadPrevious();
          }
        }}
        snapToInterval={Dimensions.get('window').width}
        getItemLayout={getItemLayout}
        decelerationRate="fast"
        pagingEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  darkContainer: {
    backgroundColor: '#000'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  darkText: {
    color: '#fff'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f5f5f5'
  },
    input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
    color: '#000' // تأكد من أن النص داخل حقل الإدخال يظهر باللون الأسود
  },
  darkInput: {
    borderColor: '#999',
    color: '#fff' // تأكد من أن النص داخل حقل الإدخال يظهر باللون الأبيض في الوضع المظلم
  },
  pageContainer: {
    flex: 1,
    alignItems: 'center',
    marginVertical: 10
  },
  pageNumber: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000'
  },
  pageImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 150, // اجعل الصورة تملأ الشاشة مع استثناء المساحة الخاصة بالأزرار والآيات
    backgroundColor: '#ccc' // خلفية رمادية للتأكد من تحميل الصورة
  },
  invertedImage: {
    filter: 'invert(1)' // عكس الألوان في الوضع المظلم
  },
  ayahButton: {
    position: 'absolute'
  },
  infoContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5
  },
  infoText: {
    color: '#fff',
    marginBottom: 5
  }
});

export default App;
