"use client";
import { useState, useEffect } from "react";

export type DeviceInfo = {
  isIOS: boolean;
  isAndroid: boolean;
  isWindows: boolean;
  isMac: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  canUseBiometrics: boolean;
  canUseCamera: boolean;
};

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    isWindows: false,
    isMac: false,
    isMobile: false,
    isDesktop: true,
    canUseBiometrics: false,
    canUseCamera: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    
    // OS Detection
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isWindows = /windows/.test(userAgent);
    const isMac = /macintosh|mac os x/.test(userAgent);
    
    // Form Factor
    const isMobile = isIOS || isAndroid || /windows phone/.test(userAgent);
    const isDesktop = !isMobile;

    // Feature Detection
    // WebAuthn is the standard for fingerprint / FaceID via web
    const canUseBiometrics = typeof window.PublicKeyCredential !== "undefined";
    
    // MediaDevices check for Camera access
    const canUseCamera = !!(window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia);

    setDeviceInfo({
      isIOS,
      isAndroid,
      isWindows,
      isMac,
      isMobile,
      isDesktop,
      canUseBiometrics,
      canUseCamera,
    });
  }, []);

  return deviceInfo;
}
