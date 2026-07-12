// This file defines all valid screen names and the parameters they accept.
export type RootStackParamList = {
  // TransportPage does not require any parameters
  TransportPage: undefined; 
  
  // LiveLocation requires an object with a busId property (string)
  LiveLocation: { busId: string }; 

  // Add all other screens in your stack here
};