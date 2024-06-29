/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {Text, Card, ListItem, SearchBar} from '@rneui/themed';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import GetLocation, {Location} from 'react-native-get-location';

interface WeatherListItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: Array<any>;
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  rain: {
    '3h': number;
  };
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: Array<WeatherListItem>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [location, setLocation] = useState<Location | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [metric, setMetric] = useState('metric');
  const today = new Date();
  useEffect(() => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(loc => {
        setLocation(loc);
      })
      .catch(error => {
        const {code, message} = error;
        console.warn(code, message);
      });
  }, []);

  useEffect(() => {
    if (location) {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&units=${metric}&appid=${process.env.TOKEN}`;
      fetch(url)
        .then(res => res.json())
        .then((data: WeatherData) => {
          setWeatherData(data);
        });
    }
  }, [location, metric]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <SearchBar
        placeholder="Type city name"
        // onChangeText={updateSearch}
        value={null || weatherData?.city.name}
        lightTheme={true}
      />
      <ScrollView style={{marginBottom: 80}}>
        <View style={styles.container}>
          <Card>
            <Card.Title>
              {weatherData?.city.name} - {today.getDate()}/{today.getMonth()}
            </Card.Title>
            <Card.Divider />
            <Text style={styles.fonts}>
              {weatherData?.list[0].weather[0].description}
            </Text>
            <Text style={styles.fonts}>{weatherData?.list[0].main.temp}°</Text>
          </Card>
          <Card>
            <Card.Title>{weatherData?.city.name} - Next 5 days</Card.Title>
            <Card.Divider />
            <ListItem>
              <ListItem.Content>
                {weatherData?.list
                  .filter(item => item.dt > today.getDate())
                  .slice(0, 5)
                  .map((item, index) => {
                    const date = new Date(item.dt * 1000);
                    return (
                      <View
                        key={index}
                        style={{
                          flexDirection: 'column',
                          width: '100%',
                          padding: 5,
                        }}>
                        <ListItem.Title>
                          {date.getDate()}/{date.getMonth()}
                        </ListItem.Title>
                        <ListItem.Subtitle>
                          <Text style={styles.fonts}>
                            {item.weather[0].description}
                          </Text>
                          <Text style={styles.fonts}>
                            {item.main.temp}° {metric === 'metric' ? 'C' : 'F'}
                          </Text>
                        </ListItem.Subtitle>
                        <Card.Divider style={{marginTop: 10}} />
                      </View>
                    );
                  })}
              </ListItem.Content>
            </ListItem>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  fonts: {
    marginBottom: 8,
  },
  user: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  image: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default App;
