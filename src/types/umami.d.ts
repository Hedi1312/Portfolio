interface UmamiTracker {
  track(event?: string | object, data?: object): void;
  identify(data: string | object, sessionData?: object): void;
}

interface Window {
  umami?: UmamiTracker;
}
