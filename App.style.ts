import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  scrollview: {
    marginBottom: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingHorizontal: 24,
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
  listItem: {
    width: '100%',
  },
  searchBar: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 5,
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
  cardContentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  item: {
    aspectRatio: 1,
    width: '100%',
    height: '100%',
    flex: 1,
  },
  name: {
    fontSize: 16,
    marginTop: 5,
  },
  divider: {
    marginTop: 10,
  },
});
