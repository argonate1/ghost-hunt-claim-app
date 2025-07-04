import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import { polyfillWebCrypto } from "expo-standard-web-crypto";
import { randomUUID } from "expo-crypto";

// Polyfill crypto for React Native
polyfillWebCrypto();

// Polyfill crypto.randomUUID
if (!crypto.randomUUID) {
  crypto.randomUUID = randomUUID;
}

// Polyfill global.Buffer if needed
if (typeof global.Buffer === "undefined") {
  global.Buffer = require("buffer").Buffer;
} 